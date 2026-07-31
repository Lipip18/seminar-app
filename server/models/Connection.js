const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  faculty: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    maxlength: 100,
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['Pending', 'Responded'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Connection', ConnectionSchema);