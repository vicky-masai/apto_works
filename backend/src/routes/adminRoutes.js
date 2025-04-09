const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

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
router.put('/withdrawals/:id/status', adminController.updateWithdrawalStatus);

module.exports = router; 