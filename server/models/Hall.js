const mongoose = require('mongoose');

const HallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hall name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters'],
  },

  location: {
    building: String,
    floor: String,
    roomNumber: String,
  },

  capacity: {
    type: Number,
    required: [true, 'Please add the hall capacity'],
  },

  amenities: [
    {
      type: String,
      enum: [
        'Projector',
        'Whiteboard',
        'Air Conditioning',
        'Microphone',
        'Sound System',
        'WiFi',
        'Podium',
        'Video Conferencing',
      ],
    },
  ],

  status: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available',
  },

  photos: [
    {
      type: String,
      default: 'no-photo.jpg',
    },
  ],

  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters'],
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Hall', HallSchema);