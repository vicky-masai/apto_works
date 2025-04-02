const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { taskProviderAuth } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAllCategories);

// Admin routes (protected)
router.post('/', categoryController.createCategory);
router.put('/:categoryId', categoryController.updateCategory);
router.delete('/:categoryId', categoryController.deleteCategory);

module.exports = router; 