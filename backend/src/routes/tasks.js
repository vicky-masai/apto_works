const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
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
router.post('/', auth, taskController.createTask);
router.get('/provider', auth, taskController.getProviderTasks);
router.put('/:taskId', auth, taskController.updateTask);
router.post('/:taskId/publish', auth, taskController.publishTask);
router.post('/:taskId/unpublish', auth, taskController.unpublishTask);

// Worker routes
router.get('/', taskController.getAllTasks);
router.get('/:taskId', auth, taskController.getTaskById);
router.post('/:taskId/accept', auth, taskController.acceptTask);
router.put('/:taskId/status', auth, taskController.updateTaskStatus);
router.post('/:taskId/proof', auth, upload.single('proof'), taskController.submitProof);

module.exports = router; 