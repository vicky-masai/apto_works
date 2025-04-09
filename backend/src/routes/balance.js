const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { auth, isAdmin } = require('../middleware/auth');

// Balance routes
router.post('/add', auth, balanceController.addBalance);
router.post('/withdraw', auth, balanceController.withdrawBalance);
router.get('/history', auth, balanceController.getBalanceHistory);
router.get('/', auth, balanceController.getBalance);

// Withdrawal request routes
router.post('/withdrawal-request', auth, balanceController.createWithdrawalRequest);
router.get('/withdrawal-requests', auth, isAdmin, balanceController.getAllWithdrawalRequests);
router.get('/withdrawal-requests/user', auth, balanceController.getUserWithdrawalRequests);
router.patch('/withdrawal-requests/:id/status', auth, isAdmin, balanceController.updateWithdrawalStatus);

module.exports = router; 