const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { auth } = require('../middleware/auth');

// Balance routes
router.post('/add', auth, balanceController.addBalance);
router.post('/withdraw', auth, balanceController.withdrawBalance);
router.get('/history', auth, balanceController.getBalanceHistory);
router.get('/', auth, balanceController.getBalance);

module.exports = router; 