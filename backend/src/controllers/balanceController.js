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

module.exports = {
  addBalance,
  withdrawBalance,
  getBalanceHistory,
  getBalance
}; 