const prisma = require('../config/database');
const { sendNotification } = require('../utils/notificationService');
// Task Provider Methods
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      estimatedTime,
      stepByStepInstructions,
      requiredProof,
      numWorkersNeeded,
      difficulty
    } = req.body;

    const totalAmount = price * numWorkersNeeded;

    const task = await prisma.task.create({
      data: {
        taskTitle: title,
        taskDescription: description,
        category,
        price,
        estimatedTime,
        stepByStepInstructions,
        requiredProof,
        numWorkersNeeded,
        totalAmount,
        difficulty: difficulty || 'Medium',
        userId: req.user.id,
        taskStatus: 'Review'
      }
    });

    await sendNotification({
      receiverId: req.user.id,
      heading: 'Task Created',
      message: 'Your task has been created and is now under review',
      senderId: 'System'
    });

    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const getAllPublishedTasks = async (req, res) => {
  try {
    const publishedTasks = await prisma.task.findMany({
      where: {
        status: "published",
      },
      include: {
        taskProvider: true,
      },
    });

    res.json(publishedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch published tasks" });
  }
};

const getUnPublishedTasks = async (req, res) => {
  try {
    const publishedTasks = await prisma.task.findMany({
      where: {
        status: "unpublished",
      },
      include: {
        taskProvider: true,
      },
    });

    res.json(publishedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch published tasks" });
  }
};

const getAllTask = async (req, res) => {
  try {
    const publishedTasks = await prisma.task.findMany({
      where: {
        status: "published",
      },
      include: {
        taskProvider: true,
      },
    });

    res.json(publishedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch published tasks" });
  }
};

const getProviderTasks = async (req, res) => {
  try {
    const { taskStatus } = req.query;
    
    // Define the base query filter
    let where = {
      userId: req.user.id
    };

    // Add taskStatus filter if provided and valid
    if (taskStatus && ['Published', 'Review', 'Rejected', 'Completed'].includes(taskStatus)) {
      where.taskStatus = taskStatus;
    }

    // Fetch user data
    const userData = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { balance: true }
    });

    // Fetch tasks with necessary fields
    const tasks = await prisma.task.findMany({
      where,
      include: {
        acceptedUsers: {
          include: {
            user: true
          }
        }
      }
    });

    // Calculate showingTaskCount for each task
    let dummyBalance = userData.balance;
    const finalData = tasks.map(task => {
      if (task.taskStatus === 'Published') {
        // Calculate showingTaskCount based on balance divided by price
        let showingTaskCount = Math.floor(dummyBalance / task.price);
        // Cap showingTaskCount at numWorkersNeeded
        showingTaskCount = Math.min(showingTaskCount, task.numWorkersNeeded);
        // Ensure dummyBalance does not go negative
        const totalCost = task.price * showingTaskCount;
        dummyBalance = Math.max(dummyBalance - totalCost, 0);
        return {
          ...task,
          showingTaskCount
        };
      }
      return task;
    });

    res.json(finalData);
  } catch (error) {
    console.error('Error fetching provider tasks:', error.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    // First get the current task details
    const currentTask = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: req.user.id
      }
    });

    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Calculate new total amount if price or numWorkersNeeded is being updated
    let newTotalAmount = currentTask.totalAmount;
    if (updateData.price || updateData.numWorkersNeeded) {
      const newPrice = updateData.price || currentTask.price;
      const newNumWorkers = updateData.numWorkersNeeded || currentTask.numWorkersNeeded;
      newTotalAmount = newPrice * newNumWorkers;
    }

    // If task is published, handle balance adjustments
    if (currentTask.taskStatus === 'Published') {
      const currentTotalAmount = currentTask.price * currentTask.numWorkersNeeded;
      
      if (newTotalAmount > currentTotalAmount) {
        // Need to add more balance
        const additionalAmount = newTotalAmount - currentTotalAmount;
        
        if (req.user.balance < additionalAmount) {
          return res.status(400).json({ 
            error: 'Insufficient balance for update',
            required: additionalAmount,
            current: req.user.balance
          });
        }

        // Use transaction to ensure all operations succeed or fail together
        await prisma.$transaction(async (prisma) => {
          // Update user's balance
          await prisma.user.update({
            where: { id: req.user.id },
            data: {
              balance: {
                decrement: additionalAmount
              },
              currentAssignedBalance: {
                increment: additionalAmount
              }
            }
          });

          // Update task
          await prisma.task.update({
            where: { id: taskId },
            data: {
              ...updateData,
              totalAmount: newTotalAmount,
              difficulty: updateData.difficulty || currentTask.difficulty
            }
          });
        });

        return res.json({ 
          message: 'Task updated successfully',
          additionalAmountDeducted: additionalAmount
        });
      }
    }

    // Update task without balance adjustment
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        totalAmount: newTotalAmount,
        difficulty: updateData.difficulty || currentTask.difficulty
      }
    });

    res.json({ 
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const publishTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.taskStatus === 'Published') {
      return res.status(400).json({ error: 'Task is already published' });
    }

    // Calculate total amount needed (price * number of workers)
    const totalAmountNeeded = task.price * task.numWorkersNeeded;

    if (req.user.balance < totalAmountNeeded) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: totalAmountNeeded,
        current: req.user.balance
      });
    }

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (prisma) => {
      // Update user's balance
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          balance: {
            decrement: totalAmountNeeded
          },
          currentAssignedBalance: {
            increment: totalAmountNeeded
          }
        }
      });

      // Update task status
      await prisma.task.update({
        where: { id: taskId },
        data: { 
          taskStatus: 'Published',
          totalAmount: totalAmountNeeded
        }
      });
    });

    res.json({ 
      message: 'Task published successfully',
      totalAmount: totalAmountNeeded
    });
  } catch (error) {
    console.error('Publish Task Error:', error);
    res.status(500).json({ error: 'Failed to publish task' });
  }
};

const unpublishTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.taskStatus === 'NotPublished') {
      return res.status(400).json({ error: 'Task is already unpublished' });
    }

    // Calculate total amount to refund (price * number of workers)
    const totalAmountToRefund = task.price * task.numWorkersNeeded;

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (prisma) => {
      // Update user's balance
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          balance: {
            increment: totalAmountToRefund
          },
          currentAssignedBalance: {
            decrement: totalAmountToRefund
          }
        }
      });

      // Update task status
      await prisma.task.update({
        where: { id: taskId },
        data: { taskStatus: 'NotPublished' }
      });
    });

    res.json({ 
      message: 'Task unpublished successfully',
      refundedAmount: totalAmountToRefund
    });
  } catch (error) {
    console.error('Unpublish Task Error:', error);
    res.status(500).json({ error: 'Failed to unpublish task' });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const { filter, sortBy = 'createdAt', sortOrder = 'desc', page = 1, status = 'Published', category, minPrice, maxPrice, difficulty, search } = req.query;

    // First get all users
    const users = await prisma.user.findMany({
      where: {
        balance: {
          gt: 0
        }
      }
    });

    let where = {
      taskStatus: status,
      isPaused: false
    };

    if (category) {
      const categories = category.split(',').map(cat => cat.trim());
      where.category = {
        in: categories
      };
    }

    if (minPrice) {
      where.price = {
        ...where.price,
        gte: parseFloat(minPrice)
      };
    }

    where.numWorkersNeeded = {
      ...where.numWorkersNeeded,
      gte: 1
    };

    if (maxPrice) {
      where.price = {
        ...where.price,
        lte: parseFloat(maxPrice)
      };
    }

    if (difficulty) {
      const difficulties = difficulty.split(',').map(diff => diff.trim());
      where.difficulty = {
        in: difficulties
      };
    }

    if (search) {
      where.taskTitle = {
        contains: search,
        mode: 'insensitive'
      };
    }

    let orderBy = {};

    if (filter === 'HighPaying') {
      where.price = {
        ...where.price,
        gte: 50
      };
      orderBy = {
        price: 'desc'
      };
    } else {
      switch (sortBy) {
        case 'price':
          orderBy.price = sortOrder;
          break;
        case 'title':
          orderBy.taskTitle = sortOrder;
          break;
        default:
          orderBy.createdAt = sortOrder;
      }
    }

    const pageSize = 10;
    const skip = (parseInt(page) - 1) * pageSize;

    // Get all tasks first
    const allTasks = await prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            organizationType: true
          }
        },
        _count: {
          select: {
            acceptedUsers: true
          }
        }
      },
      orderBy
    });

    // Group tasks by user and sort by creation date
    const tasksByUser = new Map();
    allTasks.forEach(task => {
      if (!tasksByUser.has(task.userId)) {
        tasksByUser.set(task.userId, []);
      }
      tasksByUser.get(task.userId).push(task);
    });

    // Sort tasks by creation date for each user
    tasksByUser.forEach(tasks => {
      tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    // Process tasks with priority
    const filteredTasks = [];
    users.forEach(user => {
      const userTasks = tasksByUser.get(user.id) || [];
      let dummyBalance = user.balance; // Dummy balance for tracking allocations

      // Process tasks in order
      for (const task of userTasks) {
        if (dummyBalance >= task.price) {
          const availableWorkers = Math.min(
            Math.floor(dummyBalance / task.price),
            task.numWorkersNeeded
          );
          
          if (availableWorkers > 0) {
            const amountToDeduct = task.price * availableWorkers;
            dummyBalance -= amountToDeduct;
            filteredTasks.push({
              ...task,
              availableWorkers,
              originalBalance: user.balance,
              remainingDummyBalance: dummyBalance,
              amountDeducted: amountToDeduct,
              userOtherTasks: userTasks.length - 1
            });
          }
        }
      }
    });


    // Sort tasks by creation date
    filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Apply pagination to filtered tasks
    const totalCount = filteredTasks.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedTasks = filteredTasks.slice(skip, skip + pageSize);

    let formattedTasks = paginatedTasks.map(task => ({
      ...task,
      price: task.price * 0.9,
      acceptedCount: task._count.acceptedUsers,
      _count: undefined
    }));

    if (filter === 'Popular') {
      formattedTasks.sort((a, b) => b.acceptedCount - a.acceptedCount);
    }

    res.json({
      tasks: formattedTasks,
      filters: {
        isPopular: filter === 'Popular',
        isHighPaying: filter === 'HighPaying',
        status: status || 'Published',
        appliedCategories: category ? category.split(',').map(cat => cat.trim()) : [],
        appliedDifficulties: difficulty ? difficulty.split(',').map(diff => diff.trim()) : []
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        pageSize
      }
    });
  } catch (error) {
    console.error('Get All Tasks Error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            organizationType: true
          }
        },
        acceptedUsers: {
          include: {
            user: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Add a flag to indicate if the current user is the task owner
    const response = {
      ...task,
      isOwner: userId === task.user.id,
      canAccept: userId && userId !== task.user.id && task.taskStatus === 'Published' && !task.isPaused
    };

    res.json(response);
  } catch (error) {
    console.error('Get Task By Id Error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

let currentTaskId = 0;

const generateTaskId = () => {
    if (currentTaskId >= 10000) {
        throw new Error("Max task limit reached");
    }
    return ++currentTaskId;
};

const acceptTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Get task with user information
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    });

    // Comprehensive validation checks
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is trying to accept their own task
    if (task.user.id === userId) {
      return res.status(403).json({ 
        error: 'Cannot accept your own task',
        code: 'SELF_TASK_ACCEPT'
      });
    }

    // Check task status
    if (task.taskStatus !== 'Published') {
      return res.status(400).json({ 
        error: 'Task is not available for acceptance',
        code: 'INVALID_TASK_STATUS'
      });
    }

    // Check if task is paused
    if (task.isPaused) {
      return res.status(400).json({ 
        error: 'Task is currently paused',
        code: 'TASK_PAUSED'
      });
    }

    // Check available slots
    if (task.numWorkersNeeded < 1) {
      return res.status(400).json({ 
        error: 'No more slots available for this task',
        code: 'NO_SLOTS_AVAILABLE'
      });
    }

    // Check if worker has already accepted this task
    const existingAcceptance = await prisma.acceptedTask.findFirst({
      where: {
        userId: userId,
        taskId,
        status: {
          in: ['Active', 'Review', 'Completed']
        }
      }
    });

    if (existingAcceptance) {
      return res.status(400).json({ 
        error: 'You have already accepted this task',
        code: 'ALREADY_ACCEPTED'
      });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Create accepted task
      const acceptedTask = await prisma.acceptedTask.create({
        data: {
          userId: userId,
          taskId,
          status: 'Active'
        },
        include: {
          task: {
            select: {
              taskTitle: true,
              price: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Update user's inProgress count
      await prisma.user.update({
        where: { id: userId },
        data: {
          inProgress: {
            increment: 1
          }
        }
      });

      // Update task's available slots
      await prisma.task.update({
        where: { id: taskId },
        data: {
          numWorkersNeeded: {
            decrement: 1
          }
        }
      });

      return acceptedTask;
    });

    // Send notification to task owner
    await sendNotification({
      receiverId: task.user.id,
      heading: 'Task Accepted',
      message: `Your task has been accepted by ${req.user.name}`,
      senderId: userId
    });

    res.status(201).json({
      message: 'Task accepted successfully',
      data: result
    });
  } catch (error) {
    console.error('Accept Task Error:', error);
    res.status(500).json({ 
      error: 'Failed to accept task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { acceptedTaskId } = req.params;
    const { status } = req.body;

    const acceptedTask = await prisma.acceptedTask.findUnique({
      where: { id: acceptedTaskId },
      include: {
        task: true
      }
    });

    if (!acceptedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ensure the task belongs to the current user
    if (acceptedTask.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }

    const updatedTask = await prisma.acceptedTask.update({
      where: { id: acceptedTaskId },
      data: { status }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

const submitProof = async (req, res) => {
  try {
    const { acceptedTaskId } = req.params;
    const { describe } = req.body;
    const files = req.files;

    console.log('Request body:', req.body);
    console.log('Files:', files);
    console.log('AcceptedTaskId:', acceptedTaskId);
    console.log('User ID:', req.user.id);

    const acceptedTask = await prisma.acceptedTask.findUnique({
      where: { 
        id: acceptedTaskId,
        userId: req.user.id
      },
      include: {
        task: true
      }
    });

    if (!acceptedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ensure the task belongs to the current user
    if (acceptedTask.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to submit proof for this task' });
    }

    // Construct file URLs if files exist
    const fileUrls = files ? files.map(file => `${process.env.BACKEND_URL}/uploads/${file.filename}`) : [];

    const updatedTask = await prisma.acceptedTask.update({
      where: { 
        id: acceptedTaskId,
        userId: req.user.id
      },
      data: {
        describe,
        proof: fileUrls,
        status: 'Review'
      }
    });

    res.json({
      data: {
        ...updatedTask,
        fileUrls
      },
      message: "Proof submitted successfully"
    });
  } catch (error) {
    console.error('Submit Proof Error:', error);
    res.status(500).json({ error: 'Failed to submit proof' });
  }
};

const getAcceptedTaskById = async (req, res) => {
  try {
    const { acceptedTaskId } = req.params;

    // Trim any whitespace from the ID
    const trimmedId = acceptedTaskId.trim();

    const acceptedTask = await prisma.acceptedTask.findUnique({
      where: { 
        id: trimmedId,
        userId: req.user.id
      },
      include: {
        task: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!acceptedTask) {
      return res.status(404).json({ error: 'Accepted task not found' });
    }

    res.json(acceptedTask);
  } catch (error) {
    console.error('Get Accepted Task Error:', error);
    res.status(500).json({ error: 'Failed to fetch accepted task' });
  }
};

const toggleTaskPause = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Find the task
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user owns the task
    if (task.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to modify this task" });
    }

    // Check if task is approved and published
    if (task.taskStatus !== "Published") {
      return res.status(400).json({ message: "Only published tasks can be paused/unpaused" });
    }

    // Update the task with toggled isPaused status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { isPaused: !task.isPaused }
    });

    res.status(200).json({
      message: updatedTask.isPaused ? "Task paused successfully" : "Task activated successfully",
      isPaused: updatedTask.isPaused
    });
  } catch (error) {
    console.error('Error toggling task pause status:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createTask,
  getAllPublishedTasks,
  getUnPublishedTasks,
  getAllTask,
  getProviderTasks,
  updateTask,
  publishTask,
  unpublishTask,
  getAllTasks,
  getTaskById,
  acceptTask,
  updateTaskStatus,
  submitProof,
  getAcceptedTaskById,
  toggleTaskPause
}; 