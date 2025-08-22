const User = require('../models/User');
const Post = require('../models/Post'); // Add this at the top
const { body, validationResult } = require('express-validator');
const { deleteFromCache } = require('../config/redis');

// Validation rules for profile update
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
];

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user; // From auth middleware
    
    // We could also fetch fresh data from database
    // const user = await User.findById(req.user._id);
    
    console.log(`📋 Profile requested by user: ${user.fullName}`);
    
    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { firstName, lastName, email, bio, profilePicture } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run model validations
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear any cached user data
    await deleteFromCache(`user_${userId}`);

    console.log(`✏️ Profile updated for user: ${updatedUser.fullName}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email is already taken'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Get user statistics (for potential dashboard widgets)
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // We could expand this to include post counts, likes received, etc.
    const user = await User.findById(userId).select('loginCount lastLoginAt createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate days since joining
    const daysSinceJoining = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
    
    const totalPosts = await Post.countDocuments({ author: userId });
    const totalLikes = await Post.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, likes: { $sum: "$likes" } } }
    ]);
    const stats = {
      loginCount: user.loginCount || 0,
      lastLoginAt: user.lastLoginAt,
      memberSince: user.createdAt,
      daysSinceJoining,
      totalPosts,
      totalLikes: totalLikes[0]?.likes || 0,
      totalComments: 0 // You can add comment counting logic if needed
    };

    console.log(`📊 Stats requested by user: ${req.user.fullName}`);

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics'
    });
  }
};

// Delete user account (soft delete)
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    // Verify password before deletion
    const user = await User.findByEmailWithPassword(req.user.email);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Soft delete - set isActive to false instead of actually deleting
    await User.findByIdAndUpdate(userId, { 
      isActive: false,
      // Clear sensitive data
      refreshTokens: []
    });

    console.log(`🗑️ Account deactivated for user: ${user.fullName}`);

    res.json({
      success: true,
      message: 'Account has been deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findByEmailWithPassword(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    console.log(`🔐 Password changed for user: ${user.fullName}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserStats,
  deleteAccount,
  changePassword,
  updateProfileValidation
};