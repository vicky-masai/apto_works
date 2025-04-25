const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
  createAdminUPI,
  getAllAdminUPIs,
  getActiveAdminUPIs,
  updateAdminUPI,
  deleteAdminUPI,
  getUPIStatistics
} = require('../controllers/adminUpiController');

// Admin-only routes
router.post('/', auth, isAdmin, createAdminUPI);
router.get('/all', auth, isAdmin, getAllAdminUPIs);
router.get('/active', auth, getActiveAdminUPIs); // Public route for active UPIs
router.put('/:id', auth, isAdmin, updateAdminUPI);
router.delete('/:id', auth, isAdmin, deleteAdminUPI);
router.get('/statistics/:id', auth, isAdmin, getUPIStatistics);

module.exports = router;