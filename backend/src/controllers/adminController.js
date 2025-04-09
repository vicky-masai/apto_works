const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log("getDashboardStats");
    const [
      totalUsers,
      totalTasks,
      totalRevenue,
      pendingWithdrawals,
      recentActivities,
      systemStatus
    ] = await Promise.all([
      prisma.user.count(),
      prisma.adminTask.count(),
      prisma.moneyTransaction.aggregate({
        _sum: { amount: true }
      }),
      prisma.withdrawalRequest.count({
        where: { status: 'Pending' }
      }),
      prisma.moneyTransaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      }),
      // Simulated system status - in production, you'd get this from monitoring services
      {
        serverLoad: Math.floor(Math.random() * 100),
        database: Math.floor(Math.random() * 100),
        apiRequests: Math.floor(Math.random() * 100)
      }
    ]);

    res.json({
      totalUsers,
      totalTasks,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingWithdrawals,
      recentActivities,
      systemStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Management
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role, status }
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Task Management
const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.adminTask.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    
    const task = await prisma.adminTask.create({
      data: {
        title,
        description,
        priority,
        dueDate: new Date(dueDate),
        assignedTo
      }
    });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    
    const task = await prisma.adminTask.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: new Date(dueDate),
        assignedTo
      }
    });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Money Management
const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.moneyTransaction.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawalRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const withdrawal = await prisma.withdrawalRequest.update({
      where: { id },
      data: { status }
    });
    
    // If approved, update user's balance
    if (status === 'Approved') {
      const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
        where: { id }
      });
      
      await prisma.user.update({
        where: { id: withdrawalRequest.userId },
        data: {
          balance: {
            decrement: withdrawalRequest.amount
          }
        }
      });
    }
    
    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getTasks,
  createTask,
  updateTask,
  getTransactions,
  getWithdrawals,
  updateWithdrawalStatus
}; 