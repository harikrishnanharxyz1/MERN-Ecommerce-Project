const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getJwtSecret = require('../utils/jwtSecret');
const { getAdminConfig } = require('../config/adminConfig');

const getAdminCookieToken = (req) => {
  const cookies = req.headers.cookie || '';
  const adminCookie = cookies
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('fastbuy-admin-token='));
  if (!adminCookie) return '';
  try {
    return decodeURIComponent(adminCookie.slice('fastbuy-admin-token='.length));
  } catch {
    return '';
  }
};

const getRequestToken = (req) =>
  getAdminCookieToken(req) ||
  (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.slice('Bearer '.length)
    : '');

const protect = async (req, res, next) => {
  const token = getRequestToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found or token invalid' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

const optionalProtect = async (req, res, next) => {
  const token = getRequestToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

const admin = (req, res, next) => {
  const { email: configuredEmail, password: configuredPassword } = getAdminConfig();
  if (!configuredEmail || !configuredPassword || configuredPassword.length < 12) {
    return res.status(503).json({ message: 'Admin access is not configured' });
  }
  if (
    req.user &&
    req.user.role === 'admin' &&
    req.user.email.toLowerCase() === configuredEmail
  ) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, optionalProtect, admin };
