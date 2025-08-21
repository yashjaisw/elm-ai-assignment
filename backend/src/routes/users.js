const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
  getProfile,
  updateProfile,
  getUserStats,
  deleteAccount,
  changePassword,
  updateProfileValidation
} = require('../controllers/usersController');

const { authenticate, sensitiveOpRateLimit } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

// GET /api/users/profile - Get current user profile
router.get('/profile', getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', 
  updateProfileValidation, // Validation middleware
  updateProfile
);

// GET /api/users/stats - Get user statistics
router.get('/stats', getUserStats);

// POST /api/users/change-password - Change password
router.post('/change-password',
  sensitiveOpRateLimit, // Rate limit for security
  changePassword
);

// DELETE /api/users/account - Delete user account (soft delete)
router.delete('/account',
  sensitiveOpRateLimit, // Rate limit for security
  deleteAccount
);

module.exports = router;