const express = require('express');
const router = express.Router();
const taskProviderController = require('../controllers/taskProviderController');
const { auth } = require('../middleware/auth');

// Task Provider profile routes
router.get('/profile', auth, taskProviderController.getProfile);
router.put('/profile', auth, taskProviderController.updateProfile);
router.get('/balance', auth, taskProviderController.getBalance);
router.get('/workers', auth, taskProviderController.getWorkers);
router.post('/verify-proof/:taskId/:workerId', auth, taskProviderController.verifyProof);

module.exports = router; 