const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Generate JWT ─────────────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ─── @route  POST /api/auth/signup ────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role: role || 'Member' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ─── @route  GET /api/auth/users (Admin only) ─────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
