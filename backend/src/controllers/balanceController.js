const prisma = require('../config/database');

const addBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Update user's balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance + amount
      }
    });

    // Create balance history record
    await prisma.balanceHistory.create({
      data: {
        userId: user.id,
        amount,
        type: 'Add'
      }
    });

    res.json({ message: 'Balance added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add balance' });
  }
};

const withdrawBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update user's balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance - amount
      }
    });

    // Create balance history record
    await prisma.balanceHistory.create({
      data: {
        userId: user.id,
        amount,
        type: 'Withdraw'
      }
    });

    res.json({ message: 'Balance withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to withdraw balance' });
  }
};

const getBalanceHistory = async (req, res) => {
  try {
    const history = await prisma.balanceHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance history' });
  }
};

const getBalance = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({ 
      balance: user.balance,
      userId: user.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

// Create a new withdrawal request
const createWithdrawalRequest = async (req, res) => {
  try {
    const { amount, method, accountDetails } = req.body;
    const user = req.user;

    // Validate required fields
    if (!amount || !method || !accountDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Validate payment method
    if (!['BankTransfer', 'PayPal', 'CreditCard'].includes(method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal request with all required fields
    const withdrawalRequest = await prisma.withdrawalRequest.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        method: method,
        accountDetails: accountDetails,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            balance: true
          }
        }
      }
    });

    // Update user's balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance - amount,
      },
    });

    res.status(201).json(withdrawalRequest);
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all withdrawal requests (for admin)
const getAllWithdrawalRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            balance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(withdrawalRequests);
  } catch (error) {
    console.error('Error getting withdrawal requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get withdrawal requests for a specific user
const getUserWithdrawalRequests = async (req, res) => {
  try {
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            balance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(withdrawalRequests);
  } catch (error) {
    console.error('Error getting user withdrawal requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update withdrawal request status (for admin)
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { 
        user: {
          select: {
            id: true,
            balance: true
          }
        }
      }
    });

    if (!withdrawalRequest) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    // If request is being rejected, return the amount to user's balance
    if (status === 'Rejected' && withdrawalRequest.status === 'Pending') {
      await prisma.user.update({
        where: { id: withdrawalRequest.userId },
        data: {
          balance: {
            increment: withdrawalRequest.amount,
          },
        },
      });
    }

    const updatedRequest = await prisma.withdrawalRequest.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            balance: true
          }
        }
      }
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserBalance = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        balance: true,
        totalEarnings: true,
        acceptedTasks: {
          select: {
            acceptedId: true,
            status: true,
            task: {
              select: {

                taskTitle: true,
                createdAt: true,
                price: true,
                taskStatus: true
              }
            }
          }
        }
      }
    });

    console.log(user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const earningsHistory = user.acceptedTasks.map(task => ({
      taskName: task.task.taskTitle,
      date: task.task.createdAt,
      amount: task.task.price,
      status: task.status,
      taskId: task.acceptedId
    }));

    res.json({
      userId: user.id,
      availableBalance: user.balance,
      totalEarnings: user.totalEarnings,
      pending: user.acceptedTasks.filter(task => task.task.taskStatus === 'Pending').length,
      earningsHistory
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
}

module.exports = {
  getUserBalance,
  addBalance,
  withdrawBalance,
  getBalanceHistory,
  getBalance,
  createWithdrawalRequest,
  getAllWithdrawalRequests,
  getUserWithdrawalRequests,
  updateWithdrawalStatus,
}; 