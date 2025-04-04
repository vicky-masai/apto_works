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
      numWorkersNeeded
    } = req.body;

    const totalAmount = price * numWorkersNeeded;

    const task = await prisma.task.create({
      data: {
        taskTitle :title,
        taskDescription:description,
        category,
        price,
        estimatedTime,
        stepByStepInstructions,
        requiredProof,
        numWorkersNeeded,
        totalAmount,
        taskProviderId: req.user.id,
        taskStatus: 'NotPublished'
      }
    });

    res.status(201).json({ task, message: 'Task created successfully' });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
};


const getAllPublishedTasks = async (req, res) => {
  try {
    const publishedTasks = await prisma.task.findMany({
      where: {
        status: "published", // Only fetch published tasks
      },
      include: {
        taskProvider: true, // Include task provider details (optional)
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
        status: "unpublished", // Only fetch published tasks
      },
      include: {
        taskProvider: true, // Include task provider details (optional)
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
        status: "published", // Only fetch published tasks
      },
      include: {
        taskProvider: true, // Include task provider details (optional)
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
        taskProviderId: req.user.id
      },
      include: {
        acceptedWorkers: {
          include: {
            worker: true
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

    if (updateData.price && updateData.numWorkersNeeded) {
      updateData.totalAmount = updateData.price * updateData.numWorkersNeeded;
    }

    const task = await prisma.task.update({
      where: {
        id: taskId,
        taskProviderId: req.user.id
      },
      data: updateData
    });

    res.json(task);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const publishTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        taskProviderId: req.user.id
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
      // Update task provider's balance
      await prisma.taskProvider.update({
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
        taskProviderId: req.user.id
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
      // Update task provider's balance
      await prisma.taskProvider.update({
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

// Worker Methods
const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        taskStatus: 'Published'
      },
      include: {
        taskProvider: {
          select: {
            name: true,
            organizationType: true
          }
        }
      }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        taskProvider: {
          select: {
            name: true,
            organizationType: true
          }
        },
        acceptedWorkers: {
          include: {
            worker: true
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

    // Check if worker has already accepted this task
    const existingAcceptance = await prisma.acceptedTask.findFirst({
      where: {
        workerId: req.user.id,
        taskId
      }
    });

    if (existingAcceptance) {
      return res.status(400).json({ error: 'You have already accepted this task' });
    }

    // Check if task has available slots
    const acceptedCount = await prisma.acceptedTask.count({
      where: {
        taskId,
        status: { not: 'Cancelled' }
      }
    });

    if (acceptedCount >= task.numWorkersNeeded) {
      return res.status(400).json({ error: 'Task is full' });
    }

    // Use transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // Create accepted task
      const acceptedTask = await prisma.acceptedTask.create({
        data: {
          workerId: req.user.id,
          taskId,
          status: 'Active'
        }
      });

      // Update worker's inProgress count
      await prisma.worker.update({
        where: { id: req.user.id },
        data: {
          inProgress: {
            increment: 1
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
    const { taskId } = req.params;
    const { status } = req.body;

    const acceptedTask = await prisma.acceptedTask.findFirst({
      where: {
        workerId: req.user.id,
        taskId
      }
    });

    if (!acceptedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.acceptedTask.update({
      where: { id: acceptedTask.id },
      data: { status }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

const submitProof = async (req, res) => {
  try {
    const { taskId } = req.params;
    const proofFile = req.file;

    if (!proofFile) {
      return res.status(400).json({ error: 'No proof file uploaded' });
    }

    // Find the accepted task
    const acceptedTask = await prisma.acceptedTask.findFirst({
      where: {
        workerId: req.user.id,
        taskId
      }
    });

    if (!acceptedTask) {
      return res.status(404).json({ error: 'Task not found or not accepted by you' });
    }

    // Store the relative path to the file
    const filePath = `/uploads/${proofFile.filename}`;

    // Update the task with proof and change status to Review
    const updatedTask = await prisma.acceptedTask.update({
      where: { id: acceptedTask.id },
      data: {
        submittedProof: filePath,
        status: 'Review'
      }
    });

    // Generate the full URL for the response
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const fullUrl = `${baseUrl}${filePath}`;

    res.json({
      message: 'Proof submitted successfully',
      task: updatedTask,
      proofUrl: fullUrl
    });
  } catch (error) {
    console.error('Submit Proof Error:', error);
    res.status(500).json({ error: 'Failed to submit proof' });
  }
};

// Public Methods
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
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
  getCategories
}; 