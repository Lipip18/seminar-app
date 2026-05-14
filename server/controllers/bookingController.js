const Booking = require("../models/Booking");
const Hall = require("../models/Hall");

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

    let bookings;

    // ADMIN -> ALL BOOKINGS
    if (role === "admin") {
      bookings = await Booking.find()
        .populate("hallId", "name")
        .populate("bookedBy", "name email");
    }

    // FACULTY -> ONLY OWN BOOKINGS
    else if (role === "faculty") {
      bookings = await Booking.find({
        bookedBy: req.user._id,
      })
        .populate("hallId", "name")
        .populate("bookedBy", "name");
    }

    // STUDENT -> ONLY APPROVED BOOKINGS
    else {
      bookings = await Booking.find({
        status: "Approved",
      })
        .populate("hallId", "name")
        .populate("bookedBy", "name");
    }

    const formatted = bookings.map((b) => ({
      _id: b._id,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,

      hall: {
        name: b.hallId?.name || "Hall",
      },

      user: {
        name: b.bookedBy?.name || "User",
      },
    }));

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
    console.log("REQ.USER =>", req.user);
    console.log("REQ.BODY =>", req.body);

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
    const {
      hallId,
      date,
      startTime,
      endTime,
      purpose,
    } = req.body;

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
    if (hall.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Hall is disabled by admin",
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

    const isOverlap = existingBookings.some((booking) => {
      return (
        startTime < booking.endTime &&
        endTime > booking.startTime
      );
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
      startTime,
      endTime,
      purpose,
      status: "Pending",
    });

    console.log("BOOKING CREATED =>", booking);

    res.status(201).json({
      success: true,
      data: booking,
    });

  } catch (err) {
    console.error("ADD BOOKING ERROR =>", err);

    if (err.errors) {
      console.log("MONGOOSE VALIDATION =>", err.errors);
    }

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