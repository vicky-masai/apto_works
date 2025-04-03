const prisma = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        skills: true,
        balance: true,
        createdAt: true,
        totalEarnings:true,
        inProgress:true,
        completedTasks:true
      }
    });

    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, skills } = req.body;

    const updatedWorker = await prisma.worker.update({
      where: { id: req.user.id },
      data: {
        fullName,
        skills
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        skills: true,
        balance: true,
        createdAt: true
      }
    });

    res.json(updatedWorker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getAcceptedTasks = async (req, res) => {
  try {
    const acceptedTasks = await prisma.acceptedTask.findMany({
      where: { workerId: req.user.id },
      include: {
        task: {
          include: {
            taskProvider: {
              select: {
                name: true,
                organizationType: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(acceptedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accepted tasks' });
  }
};

const getBalance = async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: req.user.id },
      select: {
        balance: true
      }
    });

    res.json({ balance: worker.balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAcceptedTasks,
  getBalance
}; 