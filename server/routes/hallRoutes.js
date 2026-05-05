const express = require('express');
const {
  getHalls,
  getHall,
  createHall,
  updateHall,
  deleteHall,
  toggleHallStatus,
  getHallBookings,
} = require('../controllers/hallController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

// Base routes
router
  .route('/')
  .get(getHalls)
  .post(protect, authorize('Admin'), createHall);

// Single hall routes
router
  .route('/:id')
  .get(getHall)
  .put(protect, authorize('Admin'), updateHall)
  .delete(protect, authorize('Admin'), deleteHall);

// Extra features
router.patch('/:id/status', protect, authorize('Admin'), toggleHallStatus);
router.get('/:id/bookings', protect, getHallBookings);

module.exports = router;