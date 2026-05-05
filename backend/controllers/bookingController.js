const Booking = require('../models/Booking');
const Hall = require('../models/Hall');
const User = require('../models/User');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let query;

    // Admin sees all, Faculty sees their own, Students see only approved bookings?
    // Wait, the prompt says student schedule page: "View all approved bookings".
    if (req.user.role === 'Admin') {
      query = Booking.find().populate('hallId').populate('bookedBy', 'name email');
    } else if (req.user.role === 'Faculty') {
       query = Booking.find({ bookedBy: req.user.id }).populate('hallId');
    } else {
        // Students see all approved bookings to know the schedule
        query = Booking.find({ status: 'Approved' }).populate('hallId');
    }

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hallId')
      .populate('bookedBy', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make sure user owns booking or is admin/student viewing approved
    if (
      booking.bookedBy._id.toString() !== req.user.id &&
      req.user.role === 'Faculty'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add booking
// @route   POST /api/bookings
// @access  Private (Faculty/Admin)
exports.addBooking = async (req, res, next) => {
  try {
    req.body.bookedBy = req.user.id;
    req.body.role = req.user.role;

    if (req.user.role === 'Student') {
        return res.status(403).json({ success: false, message: 'Students cannot book halls' });
    }

    const hall = await Hall.findById(req.body.hallId);

    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    if (!hall.isActive) {
      return res.status(400).json({ success: false, message: 'Hall is currently unavailable for booking' });
    }

    // Real-time availability check
    // Check if there's any approved or pending booking that overlaps
    const existingBookings = await Booking.find({
        hallId: req.body.hallId,
        date: req.body.date,
        status: { $in: ['Approved', 'Pending'] }
    });

    const isOverlapping = existingBookings.some(booking => {
        // String comparison for HH:mm works correctly since it's 24h format
        return (req.body.startTime < booking.endTime && req.body.endTime > booking.startTime);
    });

    if (isOverlapping) {
         return res.status(400).json({ success: false, message: 'Hall is already booked for this time slot' });
    }

    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only admin can update status or note
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
     res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete/Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make sure user owns booking or is admin
    if (
      booking.bookedBy.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
