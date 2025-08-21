const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  me,
  registerValidation,
  loginValidation
} = require('../controllers/authController');

const { authenticate, sensitiveOpRateLimit } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', 
  sensitiveOpRateLimit, // Rate limit for security
  registerValidation, // Validation middleware
  register
);

// POST /api/auth/login - User login
router.post('/login',
  sensitiveOpRateLimit, // Rate limit for security
  loginValidation, // Validation middleware
  login
);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken);

// POST /api/auth/logout - Logout user (requires auth)
router.post('/logout', authenticate, logout);

// POST /api/auth/logout-all - Logout from all devices (requires auth)
router.post('/logout-all', authenticate, logoutAll);

// GET /api/auth/me - Get current user info (requires auth)
router.get('/me', authenticate, me);

module.exports = router;