const prisma = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
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

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, organizationType } = req.body;

    const user = await prisma.user.update({
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

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getBalance = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        balance: true,
        currentAssignedBalance: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

const getWorkers = async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
      where: {
        userType: 'Worker',
        acceptedTasks: {
          some: {
            task: {
              userId: req.user.id
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
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

    // Fetch the accepted task along with its task details
    const acceptedTask = await prisma.acceptedTask.findUnique({
      where: { 
        id: taskId,
        userId: workerId
      },
      include: {
        task: true,
        user: true
      }
    });

    if (!acceptedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ensure the task belongs to the currently authenticated provider
    if (acceptedTask.task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to verify this task' });
    }

    if (acceptedTask.status !== 'Review') {

      return res.status(400).json({ error: 'Task is not in review status' });
    }

    const updatedTask = await prisma.acceptedTask.update({
      where: { id: taskId },
      data: {
        status: isApproved ? 'Completed' : 'Rejected'
      },
      include: {
        task: true,
        user: true
      }
    });

    if (isApproved) {
      // Transfer payment to worker
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.user.id },
          data: {
            balance: {
              decrement: updatedTask.task.price
            }
          }
        }),
        prisma.user.update({
          where: { id: workerId },
          data: {
            balance: {
              increment: updatedTask.task.price*0.9
            },
            totalEarnings: {
              increment: updatedTask.task.price*0.9
            },
            completedTasks: {
              increment: 1
            },
            inProgress: {
              decrement: 1
            }
          }
        })
      ]);
    }

    res.json(updatedTask);
  } catch (error) {
    console.log(error.message);
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