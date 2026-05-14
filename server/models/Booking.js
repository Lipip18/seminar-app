const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  hallId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hall',
    required: true,
  },

  bookedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },

  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true,
  },

  date: {
    type: Date,
    required: [true, 'Please add a booking date'],
  },

  startTime: {
    type: String,
    required: [true, 'Please add a start time (HH:mm)'],
  },

  endTime: {
    type: String,
    required: [true, 'Please add an end time (HH:mm)'],
  },

  purpose: {
    type: String,
    required: [true, 'Please add a purpose/description for booking'],
    maxlength: 200,
  },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending',
  },

  adminNote: {
    type: String,
    default: '',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);