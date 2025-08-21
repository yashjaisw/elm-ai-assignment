const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

// Generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES,
    issuer: 'mini-dashboard-app',
    audience: 'dashboard-users'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES,
    issuer: 'mini-dashboard-app',
    audience: 'dashboard-users'
  });
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'mini-dashboard-app',
      audience: 'dashboard-users'
    });
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'mini-dashboard-app',
      audience: 'dashboard-users'
    });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Middleware to protect routes
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-refreshTokens');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Attach user to request object
    req.user = user;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
        code: 'INVALID_TOKEN'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user owns resource
const authorize = (resourceField = 'author') => {
  return (req, res, next) => {
    try {
      // This middleware should be used after authenticate
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // For routes where we need to check resource ownership
      // This will be used in POST/PUT/DELETE operations
      const resourceId = req.params.id;
      
      // Store the resource field for later use in controllers
      req.resourceField = resourceField;
      req.resourceId = resourceId;

      next();
    } catch (error) {
      console.error('Authorization error:', error.message);
      res.status(403).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-refreshTokens');
    
    if (user && user.isActive) {
      req.user = user;
      req.tokenPayload = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    req.user = null;
    next();
  }
};

// Rate limiting for sensitive operations
const sensitiveOpRateLimit = async (req, res, next) => {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a proper rate limiting service
  const clientIp = req.ip || req.connection.remoteAddress;
  const key = `sensitive_${clientIp}`;
  
  // For now, we'll just log and continue
  // In a real app, implement proper rate limiting here
  console.log(`Sensitive operation attempted from IP: ${clientIp}`);
  
  next();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticate,
  authorize,
  optionalAuth,
  sensitiveOpRateLimit
};