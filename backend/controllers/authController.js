const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getAdminConfig } = require('../config/adminConfig');

const normalizeIdentifier = (body = {}) => {
  const value = body.email || body.username || body.id || '';
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
};

const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const clearAdminCookie = (res) => {
  const options = { ...adminCookieOptions };
  delete options.maxAge;
  res.clearCookie('fastbuy-admin-token', {
    ...options,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    clearAdminCookie(res);
    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
      message: 'Account created successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    if (error.name === 'ValidationError') {
      const validationError = Object.values(error.errors)[0];
      return res.status(400).json({
        message: validationError ? validationError.message : 'Please provide valid account details',
      });
    }
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a customer & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { password } = req.body || {};
    const identifier = normalizeIdentifier(req.body);

    if (!identifier || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Please provide email/admin ID and password' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (user && user.role !== 'admin' && (await user.matchPassword(password))) {
      clearAdminCookie(res);
      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          username: user.username || null,
          email: user.email,
          role: user.role,
        },
        token: generateToken(user._id),
        message: 'Signed in successfully',
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error during sign in' });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { password } = req.body || {};
    const identifier = normalizeIdentifier(req.body);
    const {
      email: configuredEmail,
      username: configuredUsername,
      password: configuredPassword,
    } = getAdminConfig();

    if (!configuredEmail || !configuredPassword || configuredPassword.length < 12) {
      return res.status(503).json({ message: 'Admin authentication is not configured' });
    }
    if (!identifier || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Please provide administrator credentials' });
    }
    if (identifier !== configuredEmail && identifier !== configuredUsername) {
      return res.status(401).json({ message: 'Invalid administrator credentials' });
    }

    const user = await User.findOne({ email: configuredEmail }).select('+password');
    if (!user || user.role !== 'admin' || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid administrator credentials' });
    }

    res.cookie('fastbuy-admin-token', generateToken(user._id), adminCookieOptions);
    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
      message: 'Administrator signed in successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during administrator sign in' });
  }
};

const logoutAdmin = (req, res) => {
  clearAdminCookie(res);
  return res.json({ message: 'Administrator session ended' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      if (user.role === 'admin') {
        return res.json({ _id: user._id, name: user.name, role: user.role });
      }
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Could not load user profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email ? req.body.email.toLowerCase() : user.email;

      if (req.body.password) {
        if (req.body.password.length < 8) {
          return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      return res.json({
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
        token: generateToken(updatedUser._id),
        message: 'Profile updated successfully',
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  logoutAdmin,
  getUserProfile,
  updateUserProfile,
};
