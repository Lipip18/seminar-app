const User = require("../models/User");

// ==============================
// SEND TOKEN RESPONSE
// ==============================
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_EXPIRE) *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        department: user.department,
        profilePhoto: user.profilePhoto,
      },
    });
};

// ==============================
// REGISTER USER
// ==============================
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      phone,
    } = req.body;

    // normalize role
    const normalizedRole = role
      ? role.toLowerCase()
      : "student";

    // prevent admin registration
    if (normalizedRole === "admin") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot register as Admin",
      });
    }

    // check existing user
    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists",
      });
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      department,
      phone,
    });

    sendTokenResponse(
      user,
      201,
      res
    );
  } catch (err) {
    console.error(
      "REGISTER ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// LOGIN USER
// ==============================
exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
    } = req.body;

    // validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide email and password",
      });
    }

    // find user
    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    // compare password
    const isMatch =
      await user.matchPassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    // normalize role
    const normalizedRole = role
      ? role.toLowerCase()
      : null;

    // role check
    if (
      normalizedRole &&
      user.role.toLowerCase() !==
        normalizedRole
    ) {
      return res.status(401).json({
        success: false,
        message: `Account is not registered as ${normalizedRole}`,
      });
    }

    sendTokenResponse(
      user,
      200,
      res
    );
  } catch (err) {
    console.error(
      "LOGIN ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET CURRENT USER
// ==============================
exports.getMe = async (req, res) => {
  try {
    // IMPORTANT FIX
    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role:
          user.role.toLowerCase(),
        department:
          user.department,
        profilePhoto:
          user.profilePhoto,
      },
    });
  } catch (err) {
    console.error(
      "GET ME ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// LOGOUT USER
// ==============================
exports.logout = async (
  req,
  res
) => {
  res.cookie("token", "none", {
    expires: new Date(
      Date.now() + 10 * 1000
    ),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};