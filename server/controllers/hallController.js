const Hall = require('../models/Hall');

// @desc    Get all halls
// @route   GET /api/halls
// @access  Public
exports.getHalls = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    let parsedQuery = JSON.parse(queryStr);

    // 🔍 Search by name
    if (req.query.search) {
      parsedQuery.name = {
        $regex: req.query.search,
        $options: 'i',
      };
    }

    // Finding resource
    query = Hall.find(parsedQuery);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Hall.countDocuments(parsedQuery);

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const halls = await query;

    // Pagination result
    const pagination = {
      total,
      page,
      pages: Math.ceil(total / limit),
    };

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: halls.length,
      pagination,
      data: halls,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get single hall
// @route   GET /api/halls/:id
// @access  Public
exports.getHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hall,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Create new hall
// @route   POST /api/halls
// @access  Private/Admin
exports.createHall = async (req, res) => {
  try {
    const hall = await Hall.create(req.body);

    res.status(201).json({
      success: true,
      data: hall,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Hall already exists',
      });
    }

    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Update hall
// @route   PUT /api/halls/:id
// @access  Private/Admin
exports.updateHall = async (req, res) => {
  try {
    let hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    hall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: hall,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Delete hall
// @route   DELETE /api/halls/:id
// @access  Private/Admin
exports.deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    await Hall.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Toggle hall status
// @route   PATCH /api/halls/:id/status
// @access  Private/Admin
exports.toggleHallStatus = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    hall.status =
      hall.status === 'Available' ? 'Unavailable' : 'Available';

    await hall.save();

    res.status(200).json({
      success: true,
      data: hall,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get bookings for a hall
// @route   GET /api/halls/:id/bookings
// @access  Private
exports.getHallBookings = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id).populate('bookings');

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
      });
    }

    res.status(200).json({
      success: true,
      count: hall.bookings.length,
      data: hall.bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};