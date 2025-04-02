const prisma = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const taskProvider = await prisma.taskProvider.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        organizationType: true,
        balance: true,
        createdAt: true
      }
    });

    res.json(taskProvider);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, organizationType } = req.body;

    const updatedTaskProvider = await prisma.taskProvider.update({
      where: { id: req.user.id },
      data: {
        name,
        organizationType
      },
      select: {
        id: true,
        name: true,
        email: true,
        organizationType: true,
        balance: true,
        createdAt: true
      }
    });

    res.json(updatedTaskProvider);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getBalance = async (req, res) => {
  try {
    const taskProvider = await prisma.taskProvider.findUnique({
      where: { id: req.user.id },
      select: {
        balance: true
      }
    });

    res.json({ balance: taskProvider.balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

const getWorkers = async (req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      where: {
        acceptedTasks: {
          some: {
            task: {
              taskProviderId: req.user.id
            }
          }
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        skills: true,
        createdAt: true
      }
    });

    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
};

const verifyProof = async (req, res) => {
  try {
    const { taskId, workerId } = req.params;
    const { isApproved } = req.body;

    const acceptedTask = await prisma.acceptedTask.findFirst({
      where: {
        taskId,
        workerId,
        task: {
          taskProviderId: req.user.id
        }
      },
      include: {
        task: true
      }
    });

    if (!acceptedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (acceptedTask.status !== 'PENDING_REVIEW') {
      return res.status(400).json({ error: 'Task is not in review status' });
    }

    const updatedTask = await prisma.acceptedTask.update({
      where: { id: acceptedTask.id },
      data: {
        status: isApproved ? 'COMPLETED' : 'REJECTED'
      },
      include: {
        task: true,
        worker: true
      }
    });

    if (isApproved) {
      // Transfer payment to worker
      await prisma.$transaction([
        prisma.taskProvider.update({
          where: { id: req.user.id },
          data: {
            balance: {
              decrement: updatedTask.task.amount
            }
          }
        }),
        prisma.worker.update({
          where: { id: workerId },
          data: {
            balance: {
              increment: updatedTask.task.amount
            }
          }
        })
      ]);
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify proof' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getBalance,
  getWorkers,
  verifyProof
}; 