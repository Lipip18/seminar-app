const express = require('express');
const {
  getBookings,
  getBooking,
  addBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getBookings)
  .post(authorize('Faculty', 'Admin'), addBooking); // Only faculty & admin can book

router
  .route('/:id')
  .get(getBooking)
  .put(authorize('Admin'), updateBooking) // Only admin updates status
  .delete(authorize('Faculty', 'Admin'), deleteBooking); // Faculty can cancel own, admin can cancel any

module.exports = router;
