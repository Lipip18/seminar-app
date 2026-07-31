const Connection = require("../models/Connection");
const User = require("../models/User");

// ==============================
// GET FACULTY LIST (for students to browse)
// ==============================
exports.getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" })
      .select("name email department");

    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty,
    });
  } catch (err) {
    console.error("GET FACULTY LIST ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// SEND CONNECTION REQUEST (student -> faculty)
// ==============================
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { facultyId, subject, message } = req.body;

    if (!facultyId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Faculty, subject and message are required",
      });
    }

    const faculty = await User.findOne({ _id: facultyId, role: "faculty" });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    const connection = await Connection.create({
      student: req.user._id,
      faculty: facultyId,
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      data: connection,
    });
  } catch (err) {
    console.error("SEND CONNECTION ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// GET MY CONNECTIONS (student sees sent, faculty sees received)
// ==============================
exports.getMyConnections = async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();

    const filter =
      role === "faculty"
        ? { faculty: req.user._id }
        : { student: req.user._id };

    const connections = await Connection.find(filter)
      .populate("student", "name email")
      .populate("faculty", "name email department")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections,
    });
  } catch (err) {
    console.error("GET CONNECTIONS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};