const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');

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

// Earnings Management
router.get('/earnings', adminController.getEarnings);
router.get('/earnings-v2', adminController.getEarningsV2);

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

  try {
    // Upload to Vercel Blob
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    // Call the controller function with the blob URL
    const updatedTransaction = await adminController.approveTransactionWithProof(req, res, blob.url);
    console.log(updatedTransaction);
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error in transaction approval:', error);
    res.status(500).send('Error in transaction approval');
  }
});

module.exports = router; 