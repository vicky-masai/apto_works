const prisma = require('../config/database');
const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

const addBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Create a transaction record with Pending status
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'Add',
        status: 'Pending'
      }
    });

    res.json({ message: 'Transaction created successfully and is pending approval' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
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

    // Create a transaction record with Pending status
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'Withdraw',
        status: 'Pending'
      }
    });

    res.json({ message: 'Transaction created successfully and is pending approval' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
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

const addPaymentMethod = async (req, res) => {
  try {
    const { upiId, methodType, isDefault } = req.body;
    const user = req.user;

    // Validate required fields
    if (!upiId || !methodType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a new payment method
    const paymentMethod = await prisma.userPaymentMethod.create({
      data: {
        userId: user.id,
        upiId,
        methodType,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json(paymentMethod);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
};

const getAllPaymentMethods = async (req, res) => {
  try {
    const user = req.user;

    const paymentMethods = await prisma.userPaymentMethod.findMany({
      where: { userId: user.id },
    });

    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
};

const getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const paymentMethod = await prisma.userPaymentMethod.findUnique({
      where: { id, userId: user.id },
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment method' });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { upiId, methodType, isDefault } = req.body;
    const user = req.user;

    // Validate required fields
    if (!upiId && !methodType && isDefault === undefined) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const paymentMethod = await prisma.userPaymentMethod.findUnique({
      where: { id, userId: user.id },
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    const updatedPaymentMethod = await prisma.userPaymentMethod.update({
      where: { id },
      data: {
        upiId: upiId || paymentMethod.upiId,
        methodType: methodType || paymentMethod.methodType,
        isDefault: isDefault !== undefined ? isDefault : paymentMethod.isDefault,
      },
    });

    res.json(updatedPaymentMethod);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment method' });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check if the payment method exists
    const paymentMethod = await prisma.userPaymentMethod.findUnique({
      where: { id, userId: user.id },
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    // Delete the payment method
    await prisma.userPaymentMethod.delete({
      where: { id },
    });

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
};

async function processPendingTransactions() {
  // Fetch all pending transactions
  const pendingTransactions = await prismaClient.transaction.findMany({
    where: {
      status: 'Pending',
    },
  });

  for (const transaction of pendingTransactions) {
    try {
      if (transaction.type === 'Add') {
        // Add balance to the user's account
        await prismaClient.user.update({
          where: { id: transaction.userId },
          data: { balance: { increment: transaction.amount } },
        });
      } else if (transaction.type === 'Withdraw') {
        // Withdraw balance from the user's account
        await prismaClient.user.update({
          where: { id: transaction.userId },
          data: { balance: { decrement: transaction.amount } },
        });
      }

      // Update transaction status to Completed
      await prismaClient.transaction.update({
        where: { id: transaction.id },
        data: { status: 'Completed' },
      });
    } catch (error) {
      console.error(`Failed to process transaction ${transaction.id}:`, error);

      // Optionally update transaction status to Rejected
      await prismaClient.transaction.update({
        where: { id: transaction.id },
        data: { status: 'Rejected', rejectedReason: error.message },
      });
    }
  }
}

// Call the function to process transactions
processPendingTransactions()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });

const getAllTransaction = async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const getAllWithdrawalRequest = async (req, res) => {
  try {
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawalRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch withdrawal requests' });
  }
};

const getAllAddMoneyRequest = async (req, res) => {
  try {
    const addMoneyRequests = await prisma.transaction.findMany({
      where: { type: 'Add' },
      orderBy: { createdAt: 'desc' }
    });

    res.json(addMoneyRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch add money requests' });
  }
};

const getAllTransactionsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query;
    const where = { userId };

    if (status) where.status = status;
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
};

const getAllWithdrawalRequestsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawalRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user withdrawal requests' });
  }
};

const getAllAddMoneyRequestsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const addMoneyRequests = await prisma.transaction.findMany({
      where: { userId, type: 'Add' },
      orderBy: { createdAt: 'desc' }
    });

    res.json(addMoneyRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user add money requests' });
  }
};

module.exports = {
  getUserBalance,
  addBalance,
  withdrawBalance,
  getBalanceHistory,
  getBalance,
  addPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
  getAllTransaction,
  getAllWithdrawalRequest,
  getAllAddMoneyRequest,
  getAllTransactionsForUser,
  getAllWithdrawalRequestsForUser,
  getAllAddMoneyRequestsForUser
}; 