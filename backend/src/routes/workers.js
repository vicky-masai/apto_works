const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { auth } = require('../middleware/auth');

// Worker profile routes
router.get('/profile', auth, workerController.getProfile);
router.put('/profile', auth, workerController.updateProfile);
router.get('/accepted-tasks', auth, workerController.getAcceptedTasks);
router.get('/balance', auth, workerController.getBalance);

module.exports = router; 