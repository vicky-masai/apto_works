const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Task Provider routes
router.post('/', auth, taskController.createTask);
router.get('/provider', auth, taskController.getProviderTasks);
router.put('/:taskId', auth, taskController.updateTask);
router.post('/:taskId/publish', auth, taskController.publishTask);
router.post('/:taskId/unpublish', auth, taskController.unpublishTask);
router.post('/:taskId/toggle-pause', auth, taskController.toggleTaskPause);

// Worker routes
router.get('/', taskController.getAllTasks);
router.get('/:taskId', auth, taskController.getTaskById);
router.post('/:taskId/accept', auth, taskController.acceptTask);
router.put('/:taskId/status', auth, taskController.updateTaskStatus);
router.post('/:acceptedTaskId/proof', auth, taskController.submitProof);
router.get('/accepted/:acceptedTaskId', auth, taskController.getAcceptedTaskById);

module.exports = router; 