const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Email Verification
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router; 