const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Task Management
router.get('/tasks', adminController.getTasks);
router.post('/tasks', adminController.createTask);
router.put('/tasks/:id', adminController.updateTask);

// Money Management
router.get('/transactions', adminController.getTransactions);
router.get('/withdrawals', adminController.getWithdrawals);
router.put('/transactions/:id', adminController.updateTransactionsStatus);
router.post('/profit-percent', adminController.addProfitPercent);
router.get('/profit-percent', adminController.getSuperAdmins);
router.post('/transactions/:id/approve', async (req, res) => {
  const { base64Data, fileName } = req.body.proofImage[0];
  const { upiReference } = req.body;
  const upiReferenceNumber = upiReference;
  const buffer = Buffer.from(base64Data, 'base64');

  if (!upiReferenceNumber || !base64Data) {
    return res.status(400).send('UPI reference number and proof image are required for approval');
  }

  // Define the directory and file path
  const dirPath = path.join(__dirname, 'path/to/save');
  const filePath = path.join(dirPath, fileName);

  // Create the directory if it doesn't exist
  fs.mkdir(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directory:', err);
      return res.status(500).send('Error creating directory');
    }

    // Save the file
    fs.writeFile(filePath, buffer, async (err) => {
      if (err) {
        console.error('Error saving file:', err);
        return res.status(500).send('Error saving file');
      }

      try {
        // Fetch the transaction details
      

        // Call the controller function with the correct parameters
        const updatedTransaction = await adminController.approveTransactionWithProof(req,res,filePath);
        console.log(updatedTransaction);
        res.json(updatedTransaction);
      } catch (error) {
        console.error('Error in transaction approval:', error);
        res.status(500).send('Error in transaction approval');
      }
    });
  });
});

module.exports = router; 