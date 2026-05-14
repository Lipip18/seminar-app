const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==============================
// PROTECT ROUTES
// ==============================
exports.protect = async (req, res, next) => {
  let token;

  // ==============================
  // CHECK TOKEN IN COOKIE
  // ==============================
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // ==============================
  // CHECK TOKEN IN HEADER
  // ==============================
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // ==============================
  // TOKEN NOT FOUND
  // ==============================
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized (no token)",
    });
  }

  try {
    // ==============================
    // VERIFY JWT TOKEN
    // ==============================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED TOKEN =>", decoded);

    // ==============================
    // FIND USER FROM DATABASE
    // ==============================
    const user = await User.findById(decoded.id);

    console.log("DATABASE USER =>", user);

    // ==============================
    // USER NOT FOUND
    // ==============================
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ==============================
    // ATTACH USER TO REQUEST
    // ==============================
    req.user = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log("REQ.USER =>", req.user);

    next();

  } catch (err) {
    console.error("AUTH ERROR =>", err);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// ==============================
// AUTHORIZE ROLES
// ==============================
exports.authorize = (...roles) => {
  return (req, res, next) => {

    // ==============================
    // CHECK USER EXISTS
    // ==============================
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ==============================
    // CHECK USER ROLE EXISTS
    // ==============================
    if (!req.user.role) {
      return res.status(401).json({
        success: false,
        message: "User role missing",
      });
    }

    const userRole =
      req.user.role.toLowerCase();

    const allowedRoles =
      roles.map((role) =>
        role.toLowerCase()
      );

    // ==============================
    // ROLE NOT ALLOWED
    // ==============================
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' not authorized`,
      });
    }

    next();
  };
};