const Booking = require("../models/Booking");
const Hall = require("../models/Hall");
const { formatBookingForResponse } = require("../utils/bookingFormatter");

// ==============================
// GET ALL BOOKINGS
// ==============================
exports.getBookings = async (req, res) => {
  try {
    const role = req.user?.role?.toLowerCase();

    if (!role) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const filter = {};

    if (req.query.hallId) {
      filter.hallId = req.query.hallId;
    }

    let bookings;

    // ADMIN -> ALL BOOKINGS
    if (role === "admin") {
      bookings = await Booking.find(filter)
        .populate("hallId", "name")
        .populate("bookedBy", "name email");
    }

    // FACULTY -> ONLY OWN BOOKINGS
    else if (role === "faculty") {
      bookings = await Booking.find({
        ...filter,
        bookedBy: req.user._id,
      })
        .populate("hallId", "name")
        .populate("bookedBy", "name");
    }

    // STUDENT -> ONLY APPROVED BOOKINGS
    else {
      bookings = await Booking.find({
        ...filter,
        status: "Approved",
      })
        .populate("hallId", "name")
        .populate("bookedBy", "name");
    }
    const formatted = bookings.map((b) => formatBookingForResponse(b));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET SINGLE BOOKING
// ==============================
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("hallId", "name")
      .populate("bookedBy", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("GET BOOKING ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// ADD BOOKING
// ==============================
exports.addBooking = async (req, res) => {
  try {
    // ==============================
    // CHECK USER
    // ==============================
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const role = req.user.role?.toLowerCase();

    if (!role) {
      return res.status(401).json({
        success: false,
        message: "User role missing",
      });
    }

    const {
      hallId,
      date,
      startTime,
      endTime,
      purpose,
    } = req.body;

    const bookingDate = new Date(date);
    const now = new Date();

    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid booking date",
      });
    }

    if (bookingDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
      });
    }

    // ==============================
    // STUDENT NOT ALLOWED
    // ==============================
    if (role === "student") {
      return res.status(403).json({
        success: false,
        message: "Students are not allowed to book halls",
      });
    }

    // ==============================
    // VALIDATE REQUIRED FIELDS
    // ==============================
    if (
      !hallId ||
      !date ||
      !startTime ||
      !endTime ||
      !purpose
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedStart = startTime?.trim();
    const normalizedEnd = endTime?.trim();
    const normalizedPurpose = purpose?.trim();

    if (!normalizedStart || !normalizedEnd || !normalizedPurpose) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (normalizedStart >= normalizedEnd) {
      return res.status(400).json({
        success: false,
        message: "Start time must be earlier than end time",
      });
    }

    // ==============================
    // CHECK HALL EXISTS
    // ==============================
    const hall = await Hall.findById(hallId);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found",
      });
    }

    // ==============================
    // CHECK HALL ACTIVE
    // ==============================
    // ==============================
    // CHECK HALL ACTIVE / AVAILABLE
    // ==============================
    if (hall.isActive === false || hall.status === "Unavailable") {
      return res.status(400).json({
        success: false,
        message: "This hall is currently unavailable for booking",
      });
    }

    // ==============================
    // CHECK SLOT OVERLAP
    // ==============================
    const existingBookings = await Booking.find({
      hallId,
      date,
      status: {
        $in: ["Pending", "Approved"],
      },
    });

    const parseTimeToMinutes = (value) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = parseTimeToMinutes(normalizedStart);
    const endMinutes = parseTimeToMinutes(normalizedEnd);

    const isOverlap = existingBookings.some((booking) => {
      const existingStart = parseTimeToMinutes(booking.startTime);
      const existingEnd = parseTimeToMinutes(booking.endTime);

      return startMinutes < existingEnd && endMinutes > existingStart;
    });

    if (isOverlap) {
      return res.status(400).json({
        success: false,
        message: "Hall already booked for this slot",
      });
    }

    // ==============================
    // CREATE BOOKING
    // ==============================
    const booking = await Booking.create({
      hallId,
      bookedBy: req.user._id,
      role: role,
      date,
      startTime: normalizedStart,
      endTime: normalizedEnd,
      purpose: normalizedPurpose,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      data: booking,
    });

  } catch (err) {
    console.error("ADD BOOKING ERROR =>", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// UPDATE BOOKING
// ==============================
exports.updateBooking = async (req, res) => {
  try {
    const role = req.user?.role?.toLowerCase();

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update bookings",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("UPDATE BOOKING ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// DELETE BOOKING
// ==============================
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const role = req.user?.role?.toLowerCase();

    if (
      booking.bookedBy.toString() !==
      req.user._id.toString() &&
      role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};