const Hall = require("../models/Hall");

// ==============================
// GET ALL HALLS
// ==============================
exports.getHalls = async (req, res) => {
  try {
    const halls = await Hall.find().sort("-createdAt");

    // Format data for frontend
    const formattedHalls = halls.map((hall) => ({
      _id: hall._id,
      name: hall.name,
      description: hall.description || "",
      capacity: hall.capacity || 0,

      // frontend compatibility
      isActive:
        hall.isActive !== undefined
          ? hall.isActive
          : hall.status === "Available",

      status: hall.status,

      location: {
        building:
          hall.location?.building ||
          hall.building ||
          "Main Block",
      },

      facilities: hall.facilities || [],

      createdAt: hall.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedHalls.length,
      data: formattedHalls,
    });
  } catch (err) {
    console.error("GET HALLS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET SINGLE HALL
// ==============================
exports.getHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hall,
    });
  } catch (err) {
    console.error("GET HALL ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// CREATE HALL
// ==============================
exports.createHall = async (req, res) => {
  try {
    const hall = await Hall.create(req.body);

    res.status(201).json({
      success: true,
      data: hall,
    });
  } catch (err) {
    console.error("CREATE HALL ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Hall already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// UPDATE HALL
// ==============================
exports.updateHall = async (req, res) => {
  try {
    let hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found",
      });
    }

    hall = await Hall.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: hall,
    });
  } catch (err) {
    console.error("UPDATE HALL ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// DELETE HALL
// ==============================
exports.deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found",
      });
    }

    await Hall.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error("DELETE HALL ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// TOGGLE HALL STATUS
// ==============================
exports.toggleHallStatus = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found",
      });
    }

    // Toggle both fields
    hall.isActive = !hall.isActive;

    hall.status = hall.isActive
      ? "Available"
      : "Unavailable";

    await hall.save();

    res.status(200).json({
      success: true,
      data: hall,
    });
  } catch (err) {
    console.error("TOGGLE STATUS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET HALL BOOKINGS
// ==============================
exports.getHallBookings = async (req, res) => {
  try {
    const hall = await Hall.findById(
      req.params.id
    ).populate("bookings");

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found",
      });
    }

    res.status(200).json({
      success: true,
      count: hall.bookings?.length || 0,
      data: hall.bookings || [],
    });
  } catch (err) {
    console.error("GET HALL BOOKINGS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};