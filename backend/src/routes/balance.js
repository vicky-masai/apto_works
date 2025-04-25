const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const { 
    addPaymentMethod, 
    getAllPaymentMethods, 
    getPaymentMethodById, 
    updatePaymentMethod,
    deletePaymentMethod,
    requestDeposit,
    requestDepositJson
  } = require('../controllers/balanceController');

// Balance routes
router.post('/add', auth, balanceController.addBalance);
router.post('/withdraw', auth, balanceController.withdrawBalance);
router.get('/transactions', auth, balanceController.getAllAddMoneyRequestsForUser);
router.get('/', auth, balanceController.getBalance);
router.get('/user', auth, balanceController.getUserBalance);
router.get('/history', auth, balanceController.getBalanceHistory);
router.get('/money-history', auth, balanceController.getMoneyHistory);

// Deposit request routes
// router.post('/deposit-request', auth, upload.array('proofImages', 5), requestDeposit); // Form-data version
router.post('/deposit', auth, requestDepositJson); // JSON version

router.get('/add', auth, balanceController.getAllAddMoneyRequestsForUser);
router.get('/withdrawal', auth, balanceController.getAllWithdrawalRequestsForUser);

router.post('/payment-methods', auth, addPaymentMethod);

// Route to get all payment methods for a user
router.get('/payment-methods', auth, getAllPaymentMethods);

// Route to get a specific payment method by ID
router.get('/payment-methods/:id', auth, getPaymentMethodById);

// Route to update a payment method
router.put('/payment-methods/:id', auth, updatePaymentMethod);
router.delete('/payment-methods/:id', auth, deletePaymentMethod);

module.exports = router; 