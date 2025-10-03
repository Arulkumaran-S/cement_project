const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    token = token.split(' ')[1]; // Bearer token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token failed' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admins only' });
  next();
};

exports.managerOnly = (req, res, next) => {
  if (req.user.role !== 'manager') return res.status(403).json({ msg: 'Managers only' });
  next();
};

exports.stackOnly = (req, res, next) => {
  if (req.user.role !== 'stack') return res.status(403).json({ msg: 'Stack Managers only' });
  next();
};
