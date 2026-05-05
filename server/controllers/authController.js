const User = require('../models/User');

// 🔐 Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(), // ✅ FIX
        department: user.department,
        profilePhoto: user.profilePhoto,
      },
    });
};

// ================= REGISTER =================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    // ✅ Normalize role
    const normalizedRole = role ? role.toLowerCase() : 'student';

    // ❌ Prevent admin registration
    if (normalizedRole === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register as Admin',
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: normalizedRole, // ✅ FIX
      department,
      phone,
    });

    sendTokenResponse(user, 201, res);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
      });
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // ✅ Normalize role before checking
    const normalizedRole = role ? role.toLowerCase() : null;

    if (normalizedRole && user.role.toLowerCase() !== normalizedRole) {
      return res.status(401).json({
        success: false,
        message: `Account is not registered as ${normalizedRole}`,
      });
    }

    sendTokenResponse(user, 200, res);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= GET ME =================
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        ...user._doc,
        role: user.role.toLowerCase(), // ✅ FIX
      },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};