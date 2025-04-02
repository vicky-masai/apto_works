const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { taskProviderAuth, workerAuth } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

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