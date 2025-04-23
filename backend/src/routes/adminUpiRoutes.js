const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const {
  createAdminUPI,
  getAllAdminUPIs,
  getActiveAdminUPIs,
  updateAdminUPI,
  deleteAdminUPI,
  getUPIStatistics
} = require('../controllers/adminUpiController');

// Admin-only routes
router.post('/', isAdmin, createAdminUPI);
router.get('/all', isAdmin, getAllAdminUPIs);
router.get('/active', getActiveAdminUPIs); // Public route for active UPIs
router.put('/:id', isAdmin, updateAdminUPI);
router.delete('/:id', isAdmin, deleteAdminUPI);
router.get('/statistics/:id', isAdmin, getUPIStatistics);

module.exports = router;