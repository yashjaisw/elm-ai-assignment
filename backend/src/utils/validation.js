const { body, param, query, validationResult } = require('express-validator');

// Common validation patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  NAME: /^[a-zA-Z\s'-]+$/,
  SLUG: /^[a-z0-9-]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  MONGODB_ID: /^[0-9a-fA-F]{24}$/
};

// Common validation rules
const ValidationRules = {
  // User validation rules
  email: () => 
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 254 })
      .withMessage('Email address is too long'),

  password: (isRequired = true) => {
    const validator = body('password');
    
    if (isRequired) {
      validator.notEmpty().withMessage('Password is required');
    } else {
      validator.optional();
    }
    
    return validator
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters')
      .matches(VALIDATION_PATTERNS.PASSWORD)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');
  },

  confirmPassword: () =>
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),

  firstName: () =>
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(VALIDATION_PATTERNS.NAME)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  lastName: () =>
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(VALIDATION_PATTERNS.NAME)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  bio: () =>
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters'),

  // Post validation rules
  postTitle: () =>
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),

  postContent: () =>
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Content must be between 10 and 5000 characters'),

  postExcerpt: () =>
    body('excerpt')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Excerpt must not exceed 300 characters'),

  postCategory: () =>
    body('category')
      .optional()
      .isIn(['general', 'technology', 'business', 'lifestyle', 'education', 'other'])
      .withMessage('Invalid category'),

  postStatus: () =>
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Invalid status'),

  postTags: () =>
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags.length > 5) {
          throw new Error('Cannot have more than 5 tags');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.length > 30) {
            throw new Error('Each tag must be a string with maximum 30 characters');
          }
        }
        return true;
      }),

  metaDescription: () =>
    body('metaDescription')
      .optional()
      .trim()
      .isLength({ max: 160 })
      .withMessage('Meta description must not exceed 160 characters'),

  // Comment validation rules
  commentContent: () =>
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters'),

  // Parameter validation rules
  mongoId: (paramName = 'id') =>
    param(paramName)
      .matches(VALIDATION_PATTERNS.MONGODB_ID)
      .withMessage(`Invalid ${paramName} format`),

  // Query parameter validation rules
  page: () =>
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),

  limit: () =>
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),

  sortBy: (allowedFields = []) =>
    query('sortBy')
      .optional()
      .isIn(allowedFields)
      .withMessage(`Sort field must be one of: ${allowedFields.join(', ')}`),

  sortOrder: () =>
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be either "asc" or "desc"'),

  search: () =>
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),

  category: () =>
    query('category')
      .optional()
      .isIn(['general', 'technology', 'business', 'lifestyle', 'education', 'other'])
      .withMessage('Invalid category'),

  status: () =>
    query('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Invalid status'),
};

// Validation rule combinations for common scenarios
const ValidationSets = {
  // User authentication
  register: [
    ValidationRules.email(),
    ValidationRules.password(),
    ValidationRules.confirmPassword(),
    ValidationRules.firstName(),
    ValidationRules.lastName(),
    ValidationRules.bio()
  ],

  login: [
    ValidationRules.email(),
    body('password').notEmpty().withMessage('Password is required')
  ],

  updateProfile: [
    ValidationRules.firstName(),
    ValidationRules.lastName(),
    ValidationRules.bio()
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    ValidationRules.password(),
    ValidationRules.confirmPassword()
  ],

  // Post management
  createPost: [
    ValidationRules.postTitle(),
    ValidationRules.postContent(),
    ValidationRules.postExcerpt(),
    ValidationRules.postCategory(),
    ValidationRules.postStatus(),
    ValidationRules.postTags(),
    ValidationRules.metaDescription()
  ],

  updatePost: [
    ValidationRules.mongoId(),
    ValidationRules.postTitle(),
    ValidationRules.postContent(),
    ValidationRules.postExcerpt(),
    ValidationRules.postCategory(),
    ValidationRules.postStatus(),
    ValidationRules.postTags(),
    ValidationRules.metaDescription()
  ],

  getPost: [
    ValidationRules.mongoId()
  ],

  deletePost: [
    ValidationRules.mongoId()
  ],

  // Comment management
  addComment: [
    ValidationRules.mongoId(),
    ValidationRules.commentContent()
  ],

  // Query validation for lists
  getPosts: [
    ValidationRules.page(),
    ValidationRules.limit(),
    ValidationRules.sortBy(['createdAt', 'updatedAt', 'title', 'views', 'likesCount']),
    ValidationRules.sortOrder(),
    ValidationRules.search(),
    ValidationRules.category(),
    ValidationRules.status()
  ],

  getMyPosts: [
    ValidationRules.page(),
    ValidationRules.limit(),
    ValidationRules.sortBy(['createdAt', 'updatedAt', 'title', 'views', 'likesCount']),
    ValidationRules.sortOrder(),
    ValidationRules.status()
  ]
};

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = {};
    
    errors.array().forEach(error => {
      if (!extractedErrors[error.param]) {
        extractedErrors[error.param] = [];
      }
      extractedErrors[error.param].push(error.msg);
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
      details: errors.array()
    });
  }
  
  next();
};

// Custom validation functions
const customValidators = {
  // Check if email is already in use
  isEmailUnique: async (email, { req }) => {
    const User = require('../models/User');
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user?._id } // Exclude current user for updates
    });
    
    if (existingUser) {
      throw new Error('Email is already in use');
    }
    return true;
  },

  // Check if user owns the resource
  isResourceOwner: async (resourceId, { req }) => {
    const Post = require('../models/Post');
    const post = await Post.findById(resourceId);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    if (post.author.toString() !== req.user._id.toString()) {
      throw new Error('You can only modify your own posts');
    }
    
    return true;
  },

  // Validate file upload
  validateFileUpload: (file) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not supported`);
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds the 5MB limit');
    }

    return true;
  }
};

// Utility functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

const validateMongoId = (id) => {
  return VALIDATION_PATTERNS.MONGODB_ID.test(id);
};

const isValidEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

// Export all validation utilities
module.exports = {
  ValidationRules,
  ValidationSets,
  handleValidationErrors,
  customValidators,
  sanitizeInput,
  validateMongoId,
  isValidEnum,
  VALIDATION_PATTERNS
};