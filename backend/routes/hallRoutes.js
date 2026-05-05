const express = require('express');
const {
  getHalls,
  getHall,
  createHall,
  updateHall,
  deleteHall,
} = require('../controllers/hallController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getHalls)
  .post(protect, authorize('Admin'), createHall);

router
  .route('/:id')
  .get(getHall)
  .put(protect, authorize('Admin'), updateHall)
  .delete(protect, authorize('Admin'), deleteHall);

module.exports = router;
