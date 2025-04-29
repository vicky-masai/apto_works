const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendNotification } = require('../utils/notificationService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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

    await sendNotification({
      receiverId: task.userId,
      heading: `Task ${task.taskTitle} ${task.taskStatus}`,
      message: task.rejectedReason,
      senderId: req.user.id
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
    console.log('Query params:', { page, limit, search, type, status });
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Initialize where clause
    let whereClause = {};
    
    // Add search conditions for user
    if (search) {
      whereClause = {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      };
    }

    // Add type and status conditions
    if (type) {
      whereClause = {
        ...whereClause,
        type: type
      };
    }

    if (status) {
      whereClause = {
        ...whereClause,
        status: status
      };
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2));

    // First get transactions without problematic relations
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: { 
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          proofImages: {
            select: {
              id: true,
              imageUrl: true,
              fileName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    console.log('Found transactions:', transactions.length);

    // Get the base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // For debugging: Check if files exist
    const fs = require('fs');

    // Get payment methods and admin UPIs separately to handle invalid ObjectIDs
    const formattedTransactions = await Promise.all(transactions.map(async transaction => {
      try {
        let paymentMethod = null;
        let adminUpi = null;

        // Only try to fetch payment method if the ID looks valid
        if (transaction.paymentMethodId && /^[0-9a-fA-F]{24}$/.test(transaction.paymentMethodId)) {
          try {
            paymentMethod = await prisma.userPaymentMethod.findUnique({
              where: { id: transaction.paymentMethodId },
              select: {
                id: true,
                upiId: true,
                methodType: true
              }
            });
          } catch (err) {
            console.log(`Failed to fetch payment method for transaction ${transaction.id}:`, err.message);
          }
        }

        // Only try to fetch admin UPI if the ID looks valid
        if (transaction.adminUpiId && /^[0-9a-fA-F]{24}$/.test(transaction.adminUpiId)) {
          try {
            adminUpi = await prisma.adminUPI.findUnique({
              where: { id: transaction.adminUpiId },
              select: {
                id: true,
                upiId: true,
                name: true
              }
            });
          } catch (err) {
            console.log(`Failed to fetch admin UPI for transaction ${transaction.id}:`, err.message);
          }
        }

        const formattedProofImages = (transaction.proofImages || []).map(image => {
          const fullImagePath = path.join(process.cwd(), image.imageUrl);
          const fileExists = fs.existsSync(fullImagePath);
          console.log(`Image path check:
            URL in DB: ${image.imageUrl}
            Full path: ${fullImagePath}
            File exists: ${fileExists}
          `);

          return {
            id: image.id || '',
            imageUrl: image.imageUrl ? `${baseUrl}/${image.imageUrl}` : '',
            fileName: image.fileName || '',
            exists: fileExists
          };
        });

        // Enhanced payment details formatting
        const paymentDetails = {
          upiRefNumber: transaction.upiRefNumber || '',
          userUpiId: paymentMethod?.upiId || '',
          userPaymentMethod: paymentMethod?.methodType || '',
          adminUpiId: adminUpi?.upiId || transaction.adminUpiId || '',
          adminName: adminUpi?.name || ''
        };

        return {
          id: transaction.id || '',
          amount: transaction.amount || 0,
          type: transaction.type || '',
          status: transaction.status || '',
          createdAt: transaction.createdAt || new Date(),
          user: transaction.user ? {
            id: transaction.user.id || '',
            name: transaction.user.name || '',
            email: transaction.user.email || ''
          } : null,
          paymentDetails,
          proofImages: formattedProofImages
        };
      } catch (err) {
        console.error('Error formatting transaction:', err, transaction);
        return {
          id: transaction.id || '',
          amount: transaction.amount || 0,
          type: transaction.type || '',
          status: transaction.status || '',
          createdAt: transaction.createdAt || new Date(),
          user: null,
          paymentDetails: {
            upiRefNumber: transaction.upiRefNumber || '',
            userUpiId: '',
            userPaymentMethod: '',
            adminUpiId: transaction.adminUpiId || '',
            adminName: ''
          },
          proofImages: []
        };
      }
    }));

    console.log('Formatted transactions:', formattedTransactions.length);

    res.json({
      transactions: formattedTransactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: error.message 
    });
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

// Modify approveTransactionWithProof to use Promises for file operations and ensure a single response is sent.
const approveTransactionWithProof = async (req, res) => {
  const { base64Data, fileName } = req.body.proofImage[0];
  const { upiReference, status } = req.body;
  const upiReferenceNumber = upiReference;
  const buffer = Buffer.from(base64Data, 'base64');

  if (!upiReferenceNumber || !base64Data) {
    return res.status(400).send('UPI reference number and proof image are required for approval');
  }

  // Define the directory and file path
  const dirPath = path.join(__dirname, 'path/to/save');
  const transactionFilePath = path.join(dirPath, fileName);

  try {
    // Create the directory if it doesn't exist
    await fs.promises.mkdir(dirPath, { recursive: true });

    // Save the file
    await fs.promises.writeFile(transactionFilePath, buffer);

    // Fetch the transaction details
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
    });

    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }

    // Update the transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: status, upiRefNumber: upiReferenceNumber },
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error in transaction approval:', error);
    res.status(500).send('Error in transaction approval');
  }
};

// Modify updateTransactionsStatus to use approveTransactionWithProof
const updateTransactionsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    // Get transaction before update to get amount and userId
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If trying to approve, check if UPI reference is unique
    if (status === 'Approved' && transaction.type === 'Add') {
      // Check if this UPI reference number has been used in any other approved transaction
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id: { not: id }, // Exclude current transaction
          upiRefNumber: transaction.upiRefNumber,
          type: 'Add',
          status: 'Approved'
        }
      });

      if (existingTransaction) {
        return res.status(400).json({ 
          error: 'Invalid UPI reference number. This reference has already been used in another transaction.' 
        });
      }

      if (!transaction.upiRefNumber) {
        return res.status(400).json({ 
          error: 'UPI reference number is required for approval' 
        });
      }
    }
    
    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { 
        status
      }
    });
    
    // Handle balance updates based on transaction type and status
    console.log("transaction",status,transaction.type);
    if (status === 'Approved') {
      if (transaction.type === 'Add') {
        // For Add money, increment balance when approved
        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              increment: transaction.amount
            }
          }
        });
      }
    } else if (status === 'Rejected' && transaction.type === 'Withdraw') {
      // For Withdraw, increment balance when rejected
   
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            increment: transaction.amount
          }
        }
      });
    }

    // Send appropriate notification
    let notificationMessage = '';
    if (status === 'Approved') {
      notificationMessage = `Your ${transaction.type.toLowerCase()} request of ₹${transaction.amount} has been approved.`;
    } else if (status === 'Rejected') {
      notificationMessage = `Your ${transaction.type.toLowerCase()} request of ₹${transaction.amount} was rejected. ${rejectionReason || ''}`;
    }

    await sendNotification({
      receiverId: transaction.userId,
      heading: `Transaction ${status}`,
      message: notificationMessage,
      senderId: req.user.id
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error in updateTransactionsStatus:', error);
    res.status(500).json({ error: error.message });
  }
};

const addProfitPercent = async (req, res) => {
  try {
    const { profitPercent } = req.body;

    // Check if a SuperAdmin entry with the same profitPercent already exists
    const existingEntry = await prisma.SuperAdmin.findMany();

    if (existingEntry.length > 0) {
      // Update the existing entry
      const task = await prisma.SuperAdmin.update({
        where: { id: existingEntry[0].id },
        data: { profitPercent }
      });
      res.json(task);
    } else {
      // Create a new entry
      const newTask = await prisma.SuperAdmin.create({
        data: { profitPercent }
      });
      res.json(newTask);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await prisma.SuperAdmin.findMany();
    res.json(superAdmins);
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
  approveTransactionWithProof,
  getWithdrawals,
  updateTransactionsStatus,
  addProfitPercent,
  getSuperAdmins
}; 