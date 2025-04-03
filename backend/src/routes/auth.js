const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Task Provider routes
router.post('/task-provider/register', authController.registerTaskProvider);
router.post('/task-provider/login', authController.loginTaskProvider);
router.post('/task-provider/verify-otp', authController.verifyTaskProviderOTP);
router.post('/task-provider/forgot-password', authController.forgotPasswordTaskProvider);
router.post('/task-provider/reset-password', authController.resetPasswordTaskProvider);
router.post('/task-provider/resend-otp', authController.resendTaskProviderOtp);

// Worker routes
router.post('/worker/register', authController.registerWorker);
router.post('/worker/login', authController.loginWorker);
router.post('/worker/verify-otp', authController.verifyWorkerOTP);
router.post('/worker/forgot-password', authController.forgotPasswordWorker);
router.post('/worker/reset-password', authController.resetPasswordWorker);
router.post('/worker/resend-otp', authController.resendVerifyWorkerOtp);

module.exports = router; 