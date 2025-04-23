const prisma = require('../config/database');

// Create a new admin UPI
const createAdminUPI = async (req, res) => {
  try {
    const { upiId, name, isActive = true } = req.body;

    if (!upiId || !name) {
      return res.status(400).json({ error: 'UPI ID and name are required' });
    }

    const existingUPI = await prisma.adminUPI.findUnique({
      where: { upiId }
    });

    if (existingUPI) {
      return res.status(400).json({ error: 'UPI ID already exists' });
    }

    const adminUPI = await prisma.adminUPI.create({
      data: {
        upiId,
        name,
        isActive
      }
    });

    res.status(201).json(adminUPI);
  } catch (error) {
    console.error('Error creating admin UPI:', error);
    res.status(500).json({ error: 'Failed to create admin UPI' });
  }
};

// Get all admin UPIs with transaction statistics
const getAllAdminUPIs = async (req, res) => {
  try {
    const adminUPIs = await prisma.adminUPI.findMany({
      include: {
        _count: {
          select: { transactions: true }
        },
        transactions: {
          where: {
            status: 'Completed'
          },
          select: {
            amount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total received amount for each UPI
    const formattedUPIs = adminUPIs.map(upi => ({
      id: upi.id,
      upiId: upi.upiId,
      name: upi.name,
      isActive: upi.isActive,
      totalTransactions: upi._count.transactions,
      totalReceived: upi.transactions.reduce((sum, tx) => sum + tx.amount, 0),
      createdAt: upi.createdAt,
      updatedAt: upi.updatedAt
    }));

    res.json(formattedUPIs);
  } catch (error) {
    console.error('Error fetching admin UPIs:', error);
    res.status(500).json({ error: 'Failed to fetch admin UPIs' });
  }
};

// Get active admin UPIs for users
const getActiveAdminUPIs = async (req, res) => {
  try {
    const adminUPIs = await prisma.adminUPI.findMany({
      where: { isActive: true },
      select: {
        id: true,
        upiId: true,
        name: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(adminUPIs);
  } catch (error) {
    console.error('Error fetching active admin UPIs:', error);
    res.status(500).json({ error: 'Failed to fetch active admin UPIs' });
  }
};

// Update admin UPI
const updateAdminUPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { upiId, name, isActive } = req.body;

    if (!upiId || !name) {
      return res.status(400).json({ error: 'UPI ID and name are required' });
    }

    // Check if the new UPI ID already exists (excluding the current UPI)
    const existingUPI = await prisma.adminUPI.findFirst({
      where: {
        upiId,
        NOT: {
          id
        }
      }
    });

    if (existingUPI) {
      return res.status(400).json({ error: 'UPI ID already exists' });
    }

    const adminUPI = await prisma.adminUPI.update({
      where: { id },
      data: {
        upiId,
        name,
        isActive
      }
    });

    res.json(adminUPI);
  } catch (error) {
    console.error('Error updating admin UPI:', error);
    res.status(500).json({ error: 'Failed to update admin UPI' });
  }
};

// Delete admin UPI
const deleteAdminUPI = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there are any transactions using this UPI
    const transactionCount = await prisma.transaction.count({
      where: { adminUpiId: id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete UPI ID with existing transactions. Consider deactivating it instead.' 
      });
    }

    await prisma.adminUPI.delete({
      where: { id }
    });

    res.json({ message: 'Admin UPI deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin UPI:', error);
    res.status(500).json({ error: 'Failed to delete admin UPI' });
  }
};

// Get UPI statistics
const getUPIStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const statistics = await prisma.adminUPI.findUnique({
      where: { id },
      include: {
        transactions: {
          where: {
            status: 'Completed'
          },
          select: {
            amount: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    if (!statistics) {
      return res.status(404).json({ error: 'Admin UPI not found' });
    }

    // Calculate total received amount
    const totalReceived = statistics.transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Group transactions by month
    const monthlyStats = statistics.transactions.reduce((acc, tx) => {
      const month = new Date(tx.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += tx.amount;
      acc[month].count += 1;
      return acc;
    }, {});

    res.json({
      id: statistics.id,
      upiId: statistics.upiId,
      name: statistics.name,
      isActive: statistics.isActive,
      totalReceived,
      totalTransactions: statistics._count.transactions,
      monthlyStats,
      createdAt: statistics.createdAt,
      updatedAt: statistics.updatedAt
    });
  } catch (error) {
    console.error('Error fetching UPI statistics:', error);
    res.status(500).json({ error: 'Failed to fetch UPI statistics' });
  }
};

module.exports = {
  createAdminUPI,
  getAllAdminUPIs,
  getActiveAdminUPIs,
  updateAdminUPI,
  deleteAdminUPI,
  getUPIStatistics
}; 