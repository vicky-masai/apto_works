const express = require('express');
const router = express.Router();
const taskProviderController = require('../controllers/taskProviderController');
const { taskProviderAuth } = require('../middleware/auth');

// Task Provider profile routes
router.get('/profile', taskProviderAuth, taskProviderController.getProfile);
router.put('/profile', taskProviderAuth, taskProviderController.updateProfile);
router.get('/balance', taskProviderAuth, taskProviderController.getBalance);
router.get('/workers', taskProviderAuth, taskProviderController.getWorkers);
router.post('/verify-proof/:taskId/:workerId', taskProviderAuth, taskProviderController.verifyProof);

module.exports = router; 