const express = require('express');
const router = express.Router();

const adminAuth = require('../middleware/adminAuth');
const {
  createAdminUPI,
  getAllAdminUPIs,
  getActiveAdminUPIs,
  updateAdminUPI,
  deleteAdminUPI,
  getUPIStatistics
} = require('../controllers/adminUpiController');

router.use(adminAuth);
// Admin-only routes
router.post('/',createAdminUPI);
router.get('/all',  getAllAdminUPIs);
router.get('/active',  getActiveAdminUPIs); // Public route for active UPIs
router.put('/:id',  updateAdminUPI);
router.delete('/:id',  deleteAdminUPI);
router.get('/statistics/:id',  getUPIStatistics);

module.exports = router;