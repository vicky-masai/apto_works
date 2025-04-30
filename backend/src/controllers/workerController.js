const prisma = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        balance: true,
        createdAt: true,
        totalEarnings: true,
        inProgress: true,
        completedTasks: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, skills } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        skills
      },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        balance: true,
        createdAt: true,
        totalEarnings: true,
        inProgress: true,
        completedTasks: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getAcceptedTasks = async (req, res) => {
  try {
    const acceptedTasks = await prisma.acceptedTask.findMany({
      where: { userId: req.user.id },
      include: {
        task: {
          include: {
            user: {
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

    const superAdmins = await prisma.SuperAdmin.findMany();
    const profitPercent = superAdmins[0].profitPercent;

    const modifiedTasks = acceptedTasks.map(task => {
      task.price = task.task.price * (1 - profitPercent / 100);
      return task;
    });

    res.json(modifiedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accepted tasks' });
  }
};

const getBalance = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        balance: true,
        totalEarnings: true
      }
    });

    res.json(user);
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