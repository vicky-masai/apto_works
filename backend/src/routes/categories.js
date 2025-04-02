const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { taskProviderAuth } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAllCategories);

// Admin routes (protected)
router.post('/', taskProviderAuth, categoryController.createCategory);
router.put('/:categoryId', taskProviderAuth, categoryController.updateCategory);
router.delete('/:categoryId', taskProviderAuth, categoryController.deleteCategory);

module.exports = router; 