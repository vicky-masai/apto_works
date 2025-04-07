const prisma = require('../config/database');

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
        taskStatus: 'NotPublished'
      }
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
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        acceptedUsers: {
          include: {
            user: true
          }
        }
      }
    });

    res.json(tasks);
  } catch (error) {
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
    const { filter, sortBy = 'createdAt', sortOrder = 'desc', page = 1, status = 'Published' } = req.query;

    let where = {
      taskStatus: status
    };

    let orderBy = {};

    if (filter === 'HighPaying') {
      // Set minimum price for high paying tasks and sort by price
      where.price = {
        ...where.price,
        gte: 50 // Minimum price for high paying tasks
      };
      orderBy = {
        price: 'desc'
      };
    } else {
      // Default sorting
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

    // Calculate pagination
    const pageSize = 10;
    const skip = (parseInt(page) - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.task.count({ where });
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get tasks with filters, sorting and pagination
    const tasks = await prisma.task.findMany({
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
      orderBy,
      skip,
      take: pageSize
    });

    // If filter is Popular, sort by accepted users count in memory
    let formattedTasks = tasks.map(task => ({
      ...task,
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
        status: status || 'Published'
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

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: {
          select: {
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

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

const acceptTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task || task.taskStatus !== 'Published') {
      return res.status(400).json({ error: 'Task not available' });
    }

    // Check if task has available slots (numWorkersNeeded >= 1)
    if (task.numWorkersNeeded < 1) {
      return res.status(400).json({ error: 'No more workers needed for this task' });
    }

    // Check if worker has already accepted this task
    const existingAcceptance = await prisma.acceptedTask.findFirst({
      where: {
        userId: req.user.id,
        taskId
      }
    });

    if (existingAcceptance) {
      return res.status(400).json({ error: 'You have already accepted this task' });
    }

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // Create accepted task
      const acceptedTask = await prisma.acceptedTask.create({
        data: {
          userId: req.user.id,
          taskId,
          status: 'Active'
        }
      });

      // Update user's inProgress count
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          inProgress: {
            increment: 1
          }
        }
      });

      // Reduce the number of workers needed for the task
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

    res.status(201).json(result);
  } catch (error) {
    console.error('Accept Task Error:', error);
    res.status(500).json({ error: 'Failed to accept task' });
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
    const { proof } = req.body;

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
      return res.status(403).json({ error: 'Unauthorized to submit proof for this task' });
    }

    const updatedTask = await prisma.acceptedTask.update({
      where: { id: acceptedTaskId },
      data: {
        proof,
        status: 'PENDING_REVIEW'
      }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit proof' });
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
  submitProof
}; 