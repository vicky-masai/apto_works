const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log("getDashboardStats");
    const [
      totalUsers,
      totalTasks,
      totalTransactions,
      pendingWithdrawals,
      recentTransactions,
      systemStatus
    ] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'Add' }
      }),
      prisma.transaction.count({
        where: { 
          type: 'Withdraw',
          status: 'Pending' 
        }
      }),
      prisma.transaction.findMany({
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
      totalRevenue: totalTransactions._sum.amount || 0,
      pendingWithdrawals,
      recentActivities: recentTransactions,
      systemStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Management
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', searchBy = 'name', role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log("Query params:", { page, limit, search, searchBy, role, status, sortBy, sortOrder });

    const whereClause = {};
    
    // Add OR filters for search
    if (search) {
      whereClause.OR = [];
      
      // Handle different search fields
      if (searchBy === 'name') {
        whereClause.OR.push({ name: { contains: search, mode: 'insensitive' } });
      } else if (searchBy === 'email') {
        whereClause.OR.push({ email: { contains: search, mode: 'insensitive' } });
      } else if (searchBy === 'role') {
        whereClause.OR.push({ role: { contains: search, mode: 'insensitive' } });
      } else {
        // Default fallback - search in name and email
        whereClause.OR.push({ name: { contains: search, mode: 'insensitive' } });
        whereClause.OR.push({ email: { contains: search, mode: 'insensitive' } });
      }
    }

    // Add explicit role filter - separate from search
    if (role) {
      // If we already have search conditions, we need to add role as a separate AND condition
      if (whereClause.OR) {
        whereClause.role = role;
      } else {
        whereClause.role = role;
      }
    }

    if (status) {
      whereClause.status = status;
    }

    // Map frontend sorting fields to database fields
    const sortingField = sortBy === 'role' ? 'role' : 
                         sortBy === 'joinDate' ? 'createdAt' : 
                         sortBy;

    console.log("Final whereClause:", JSON.stringify(whereClause, null, 2));

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { [sortingField]: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where: whereClause })
    ]);

    if (users.length > 0) {
      console.log("Sample user:", JSON.stringify(users[0], null, 2));
    }

    res.json({
      users: users,
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
    const { name, email,balance } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { 
        name, 
        email, 
        balance:parseFloat(balance)

      }
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Instead of deleting, mark as deleted
    await prisma.user.update({ 
      where: { id },
      data: { status: 'Deleted' }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Task Management
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10000, search = '', status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { taskTitle: { contains: search, mode: 'insensitive' } },
        { taskDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      whereClause.taskStatus = status;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.task.count({ where: whereClause })
    ]);
    
    res.json({
      tasks,
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
    const { taskTitle, taskDescription, taskStatus, category, price, estimatedTime, rejectedReason } = req.body;
    
    const task = await prisma.task.update({
      where: { id },
      data: {
        taskTitle,
        taskDescription,
        taskStatus,
        category,
        price,
        estimatedTime,
        rejectedReason: rejectedReason || "No Reason"
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
    const { page = 1, limit = 10000, search = '', type, status } = req.query;
    console.log(search);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    
    if (search) {
      whereClause.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where: whereClause })
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
      type: 'Withdraw'
    };

    if (search) {
      whereClause.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const [withdrawals, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where: whereClause })
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

const updateTransactionsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    // Get transaction before update to get amount and userId
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });
    
    // Update transaction status
    const withdrawal = await prisma.transaction.update({
      where: { id },
      data: { 
        status,
        rejectedReason: status === 'Rejected' ? rejectionReason : null
      }
    });
    
    // If approved, update user's balance
    if (status === 'Approved' && transaction.type === 'Withdraw') {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            decrement: transaction.amount
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
  updateTransactionsStatus
}; 