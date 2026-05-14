const express = require("express");

const {
  getBookings,
  addBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect);

// =======================
// ROUTES
// =======================

// GET all + POST new booking
router
  .route("/")
  .get(getBookings)
  .post(authorize("faculty", "admin"), addBooking);

// UPDATE + DELETE booking
router
  .route("/:id")
  .put(authorize("admin"), updateBooking)
  .delete(authorize("faculty", "admin"), deleteBooking);

module.exports = router;