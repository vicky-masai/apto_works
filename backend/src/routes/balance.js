const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { auth, isAdmin } = require('../middleware/auth');

const { 
    addPaymentMethod, 
    getAllPaymentMethods, 
    getPaymentMethodById, 
    updatePaymentMethod 
  } = require('../controllers/balanceController');

// Balance routes
router.post('/add', auth, balanceController.addBalance);
router.post('/withdraw', auth, balanceController.withdrawBalance);
router.get('/history', auth, balanceController.getBalanceHistory);
router.get('/', auth, balanceController.getBalance);
router.get('/user', auth, balanceController.getUserBalance);


// Withdrawal request routes
router.post('/withdrawal-request', auth, balanceController.createWithdrawalRequest);
router.get('/withdrawal-requests', auth, isAdmin, balanceController.getAllWithdrawalRequests);
router.get('/withdrawal-requests/user', auth, balanceController.getUserWithdrawalRequests);
router.patch('/withdrawal-requests/:id/status', auth, isAdmin, balanceController.updateWithdrawalStatus);

router.post('/payment-methods', auth, addPaymentMethod);

// Route to get all payment methods for a user
router.get('/payment-methods', auth, getAllPaymentMethods);

// Route to get a specific payment method by ID
router.get('/payment-methods/:id', auth, getPaymentMethodById);

// Route to update a payment method
router.put('/payment-methods/:id', auth, updatePaymentMethod);

module.exports = router; 