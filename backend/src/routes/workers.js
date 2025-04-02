const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { workerAuth } = require('../middleware/auth');

// Worker profile routes
router.get('/profile', workerAuth, workerController.getProfile);
router.put('/profile', workerAuth, workerController.updateProfile);
router.get('/accepted-tasks', workerAuth, workerController.getAcceptedTasks);
router.get('/balance', workerAuth, workerController.getBalance);

module.exports = router; 