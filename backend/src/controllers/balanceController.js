const prisma = require('../config/database');
const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();
const { decryptPayload, encryptPayload } = require('../utils/crypto');

const addBalance = async (req, res) => {
  try {
    console.log("req.body.encryptedData",req.body.encryptedData);
    const { amount, paymentMethodId } = decryptPayload(req.body.encryptedData);
    console.log("amount",amount);
    console.log("paymentMethodId",paymentMethodId);

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
        status: 'Pending',
        paymentMethodId
      }
    });

    res.json(encryptPayload({ message: 'Transaction created successfully and is pending approval' }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

const withdrawBalance = async (req, res) => {
  try {
    const { amount, paymentMethodId } = decryptPayload(req.body.encryptedPayload);
    const user = req.user;

    console.log("amount",amount);

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
        status: 'Pending',
        paymentMethodId
      }
    });

    // Update user's balance immediately
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: amount } }
    });

    res.json(encryptPayload({ message: 'Transaction created successfully and is pending approval' }));
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

    res.json(encryptPayload(history));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance history' });
  }
};

const getMoneyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId,
        OR: [
          { type: 'Add' },
          { type: 'Withdraw' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get user's payment methods
    const paymentMethods = await prisma.userPaymentMethod.findMany({
      where: { userId }
    });

    // Get user's earnings from accepted tasks
    const userWithEarnings = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        acceptedTasks: {
          select: {
            id: true,
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

    // Format transaction history
    const transactionHistory = transactions.map(transaction => {
      const paymentMethod = paymentMethods.find(pm => pm.id === transaction.paymentMethodId);
      return {
        id: transaction.id,
        type: transaction.type === 'Add' ? 'Deposit' : 'Withdraw',
        date: transaction.createdAt,
        amount: transaction.amount,
        status: transaction.status,
        method: paymentMethod ? `${paymentMethod.methodType} (${paymentMethod.upiId})` : 'UPI',
        category: 'transaction'
      };
    });

    // Format earning history
    const earningHistory = userWithEarnings?.acceptedTasks.map(task => ({
      id: task.id,
      type: 'Earning',
      date: task.task.createdAt,
      amount: task.task.price,
      status: task.status,
      taskTitle: task.task.taskTitle,
      category: 'earning'
    })) || [];

    // Combine and sort both histories by date
    const combinedHistory = [...transactionHistory, ...earningHistory]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

      res.json(encryptPayload({
        // transactions: transactionHistory,
        // earnings: earningHistory,
        combinedHistory
      }));
  } catch (error) {
    console.error('Error fetching money history:', error);
    res.status(500).json({ error: 'Failed to fetch money history' });
  }
};

const getBalance = async (req, res) => {
  try {
    const user = req.user;
    
    // Get total deposits
    const totalDeposits = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'Add',
        status: 'Completed'
      },
      _sum: {
        amount: true
      }
    });

    // Get total withdrawals
    const totalWithdrawals = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'Withdraw',
        status: 'Completed'
      },
      _sum: {
        amount: true
      }
    });

      res.json(encryptPayload({ 
        balance: user.balance,
        userId: user.id,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0
      }));
  } catch (error) {
    console.error('Error fetching balance:', error);
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

    res.json(encryptPayload({
      userId: user.id,
      availableBalance: user.balance,
      totalEarnings: user.totalEarnings,
      pending: user.acceptedTasks.filter(task => task.task.taskStatus === 'Pending').length,
      earningsHistory
    }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
}

const addPaymentMethod = async (req, res) => {
  try {
    const { upiId, methodType, isDefault } = decryptPayload(req.body.encryptedPayload);
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

    res.status(201).json(encryptPayload(paymentMethod));
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

    res.json(encryptPayload(paymentMethods));
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

    res.json(encryptPayload(paymentMethod));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment method' });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { upiId, methodType, isDefault } = decryptPayload(req.body.encryptedPayload);
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

    // If setting this payment method as default, set all other payment methods to non-default
    if (isDefault) {
      await prisma.userPaymentMethod.updateMany({
        where: { 
          userId: user.id,
          isDefault: true
        },
        data: { 
          isDefault: false 
        },
      });
    }

    const updatedPaymentMethod = await prisma.userPaymentMethod.update({
      where: { id },
      data: {
        upiId: upiId || paymentMethod.upiId,
        methodType: methodType || paymentMethod.methodType,
        isDefault: isDefault !== undefined ? isDefault : paymentMethod.isDefault,
      },
    });

    res.json(encryptPayload(updatedPaymentMethod));
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

    res.json(encryptPayload({ message: 'Payment method deleted successfully' }));
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

    res.json(encryptPayload(transactions));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const getAllWithdrawalRequest = async (req, res) => {
  try {
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(encryptPayload(withdrawalRequests));
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

    res.json(encryptPayload(addMoneyRequests));
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

    res.json(encryptPayload(transactions));
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

    res.json(encryptPayload(withdrawalRequests));
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

    res.json(encryptPayload(addMoneyRequests));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user add money requests' });
  }
};

const requestDeposit = async (req, res) => {
  try {
    const { amount, upiId, upiRefNumber } = decryptPayload(req.body.encryptedPayload);
    const user = req.user;
    const files = req.files;

    if (!amount || !upiId || !upiRefNumber || !files || files.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide amount, UPI ID, reference number, and at least one proof image.' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Get or create payment method
    let paymentMethod = await prisma.userPaymentMethod.findFirst({
      where: {
        userId: user.id,
        upiId: upiId
      }
    });

    if (!paymentMethod) {
      paymentMethod = await prisma.userPaymentMethod.create({
        data: {
          userId: user.id,
          methodType: 'UPI',
          upiId: upiId,
          isDefault: false
        }
      });
    }

    // Create transaction record with proof images
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        type: 'Add',
        status: 'Pending',
        paymentMethodId: paymentMethod.id,
        upiRefNumber: upiRefNumber,
        proofImages: {
          create: files.map(file => ({
            imageUrl: file.path,
            fileName: file.filename
          }))
        }
      },
      include: {
        proofImages: true
      }
    });

    res.status(201).json(encryptPayload({
      message: 'Deposit request created successfully and is pending approval',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        upiRefNumber: transaction.upiRefNumber,
        proofImages: transaction.proofImages
      }
    }));
  } catch (error) {
    console.error('Error in requestDeposit:', error);
    res.status(500).json({ error: 'Failed to create deposit request' });
  }
};

const requestDepositJson = async (req, res) => {
  try {
    const { amount, upiId, upiRefNumber, adminUpiId, proofImages } = decryptPayload(req.body.encryptedPayload);
    const user = req.user;

    if (!amount || !upiId || !upiRefNumber || !adminUpiId || !proofImages || !Array.isArray(proofImages) || proofImages.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide amount, UPI ID, admin UPI ID, reference number, and at least one proof image.' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Find the AdminUPI record first
    const adminUpi = await prisma.adminUPI.findUnique({
      where: { upiId: adminUpiId }
    });

    if (!adminUpi) {
      return res.status(400).json({ error: 'Invalid admin UPI ID' });
    }

    // Get or create payment method
    let paymentMethod = await prisma.userPaymentMethod.findFirst({
      where: {
        userId: user.id,
        upiId: upiId
      }
    });

    if (!paymentMethod) {
      paymentMethod = await prisma.userPaymentMethod.create({
        data: {
          userId: user.id,
          methodType: 'UPI',
          upiId: upiId,
          isDefault: false
        }
      });
    }

    // Save base64 images to files
    const savedImages = await Promise.all(proofImages.map(async (image) => {
      try {
        // Remove data URI scheme prefix if present
        const base64Data = image.base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `proof-${uniqueSuffix}.jpeg`;
        const filePath = `uploads/payment-proofs/${fileName}`;
        
        // Ensure directory exists
        const fs = require('fs').promises;
        await fs.mkdir('uploads/payment-proofs', { recursive: true });
        
        // Write file
        await fs.writeFile(filePath, buffer);
        
        return {
          imageUrl: filePath,
          fileName: fileName
        };
      } catch (error) {
        console.error('Error saving image:', error);
        throw new Error('Failed to save proof image');
      }
    }));

    // Create transaction record with proof images using adminUpi.id instead of adminUpiId
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        type: 'Add',
        status: 'Pending',
        paymentMethodId: paymentMethod.id,
        upiRefNumber: upiRefNumber,
        adminUpiId: adminUpi.id, // Use the AdminUPI document's ID instead of the UPI ID string
        proofImages: {
          create: savedImages
        }
      },
      include: {
        proofImages: true,
        paymentMethod: true,
        adminUpi: true
      }
    });

    res.status(201).json(encryptPayload({
      message: 'Deposit request created successfully and is pending approval',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        upiRefNumber: transaction.upiRefNumber,
        adminUpiId: transaction.adminUpi.upiId, // Return the UPI ID for display
        userUpiId: transaction.paymentMethod.upiId,
        proofImages: transaction.proofImages
      }
    }));
  } catch (error) {
    console.error('Error in requestDepositJson:', error);
    res.status(500).json({ error: error.message || 'Failed to create deposit request' });
  }
};

module.exports = {
  getUserBalance,
  addBalance,
  withdrawBalance,
  getBalanceHistory,
  getBalance,
  getMoneyHistory,
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
  getAllAddMoneyRequestsForUser,
  requestDeposit,
  requestDepositJson
}; 