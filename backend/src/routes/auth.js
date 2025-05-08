const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Registration
router.post('/register', authController.register);
router.post('/admin-register', authController.adminRegister);

// Login
router.post('/login', authController.login);

// Email Verification
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// User Profile
router.get('/profile',auth ,authController.getUserProfile);
router.get('/notifications',auth ,authController.getUserNotifications);
router.delete('/notifications', auth, authController.clearAllNotifications);

module.exports = router; 