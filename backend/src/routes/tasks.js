const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { taskProviderAuth, workerAuth } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and ensure unique name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedFilename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Task Provider routes
router.post('/', taskProviderAuth, taskController.createTask);
router.get('/provider', taskProviderAuth, taskController.getProviderTasks);
router.put('/:taskId', taskProviderAuth, taskController.updateTask);
router.post('/:taskId/publish', taskProviderAuth, taskController.publishTask);
router.post('/:taskId/unpublish', taskProviderAuth, taskController.unpublishTask);

// Worker routes
router.get('/', workerAuth, taskController.getAllTasks);
router.get('/:taskId', workerAuth, taskController.getTaskById);
router.post('/:taskId/accept', workerAuth, taskController.acceptTask);
router.put('/:taskId/status', workerAuth, taskController.updateTaskStatus);
router.post('/:taskId/proof', workerAuth, upload.single('proof'), taskController.submitProof);

// Public routes
router.get('/categories', taskController.getCategories);

module.exports = router; 