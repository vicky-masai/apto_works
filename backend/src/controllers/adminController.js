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
    const { page = 1, limit = 10, search = '', role, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    };

    if (role) {
      whereClause.role = role;
    }

    if (status) {
      whereClause.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
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
    const { page = 1, limit = 10, search = '', type, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      OR: [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    };

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    const [transactions, total] = await Promise.all([
      prisma.moneyTransaction.findMany({
        where: whereClause,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.moneyTransaction.count({ where: whereClause })
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      OR: [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where: whereClause,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.withdrawalRequest.count({ where: whereClause })
    ]);

    res.json({
      withdrawals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
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