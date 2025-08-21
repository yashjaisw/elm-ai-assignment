const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the random string
 * @param {string} charset - Character set to use
 * @returns {string} - Random string
 */
const generateRandomString = (length = 32, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the random string
 * @returns {string} - Secure random string
 */
const generateSecureRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Create a hash of the given string
 * @param {string} input - String to hash
 * @param {string} algorithm - Hashing algorithm (default: sha256)
 * @returns {string} - Hashed string
 */
const createHash = (input, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(input).digest('hex');
};

/**
 * Generate a slug from text
 * @param {string} text - Text to convert to slug
 * @param {number} maxLength - Maximum length of slug
 * @returns {string} - URL-friendly slug
 */
const generateSlug = (text, maxLength = 60) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, maxLength);
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert text to title case
 * @param {string} str - String to convert
 * @returns {string} - Title case string
 */
const toTitleCase = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalizeFirst(word)).join(' ');
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} - Truncated text
 */
const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
};

/**
 * Calculate reading time for text content
 * @param {string} content - Text content
 * @param {number} wordsPerMinute - Average reading speed
 * @returns {number} - Reading time in minutes
 */
const calculateReadingTime = (content, wordsPerMinute = 200) => {
  if (!content) return 1;
  
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(readingTime, 1); // Minimum 1 minute
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Generate a unique filename to avoid conflicts
 * @param {string} originalName - Original filename
 * @param {string} directory - Target directory
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = async (originalName, directory = '') => {
  const timestamp = Date.now();
  const randomString = generateRandomString(8);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  // Clean the base name
  const cleanBaseName = baseName
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  
  const uniqueName = `${cleanBaseName}_${timestamp}_${randomString}${extension}`;
  
  // Check if file exists and generate a new name if it does
  if (directory) {
    const fullPath = path.join(directory, uniqueName);
    try {
      await fs.access(fullPath);
      // File exists, recursively generate a new name
      return generateUniqueFilename(originalName, directory);
    } catch (error) {
      // File doesn't exist, we can use this name
      return uniqueName;
    }
  }
  
  return uniqueName;
};

/**
 * Delete file safely
 * @param {string} filePath - Path to file to delete
 * @returns {boolean} - Success status
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log(`File deleted: ${filePath}`);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting file ${filePath}:`, error);
    }
    return false;
  }
};

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path
 * @returns {boolean} - Success status
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    return false;
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} - Is valid ObjectId
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Sanitize text content to prevent XSS
 * @param {string} input - Input text
 * @returns {string} - Sanitized text
 */
const sanitizeText = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Extract metadata from uploaded file
 * @param {Object} file - Multer file object
 * @returns {Object} - File metadata
 */
const extractFileMetadata = (file) => {
  if (!file) return null;
  
  return {
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    filePath: file.path,
    uploadedAt: new Date(),
    extension: path.extname(file.originalname).toLowerCase(),
    isImage: file.mimetype.startsWith('image/'),
    isPDF: file.mimetype === 'application/pdf',
    isDocument: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ].includes(file.mimetype)
  };
};

/**
 * Create a standardized API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @param {*} errors - Error details
 * @returns {Object} - Standardized response
 */
const createAPIResponse = (success, message, data = null, errors = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (errors !== null) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Create pagination metadata
 * @param {number} totalItems - Total number of items
 * @param {number} currentPage - Current page number
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} - Pagination metadata
 */
const createPaginationMetadata = (totalItems, currentPage, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    currentPage: parseInt(currentPage),
    totalPages,
    totalItems: parseInt(totalItems),
    itemsPerPage: parseInt(itemsPerPage),
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    previousPage: currentPage > 1 ? currentPage - 1 : null
  };
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} - Cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
};

/**
 * Remove undefined and null values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} - Cleaned object
 */
const removeEmptyValues = (obj) => {
  const cleaned = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedNested = removeEmptyValues(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
  }
  
  return cleaned;
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {*} - Function result
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - Is empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Escape special characters for use in regex
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Environment helpers
const isDevelopment = () => process.env.NODE_ENV === 'development';
const isProduction = () => process.env.NODE_ENV === 'production';
const isTest = () => process.env.NODE_ENV === 'test';

// Logging helpers
const logInfo = (...args) => {
  if (!isTest()) {
    console.log(`[${new Date().toISOString()}] INFO:`, ...args);
  }
};

const logError = (...args) => {
  if (!isTest()) {
    console.error(`[${new Date().toISOString()}] ERROR:`, ...args);
  }
};

const logWarning = (...args) => {
  if (!isTest()) {
    console.warn(`[${new Date().toISOString()}] WARNING:`, ...args);
  }
};

const logDebug = (...args) => {
  if (isDevelopment()) {
    console.debug(`[${new Date().toISOString()}] DEBUG:`, ...args);
  }
};

module.exports = {
  generateRandomString,
  generateSecureRandomString,
  createHash,
  generateSlug,
  capitalizeFirst,
  toTitleCase,
  truncateText,
  calculateReadingTime,
  formatFileSize,
  generateUniqueFilename,
  deleteFile,
  ensureDirectoryExists,
  isValidEmail,
  isValidObjectId,
  sanitizeText,
  extractFileMetadata,
  createAPIResponse,
  createPaginationMetadata,
  deepClone,
  removeEmptyValues,
  retryWithBackoff,
  isEmpty,
  escapeRegex,
  isDevelopment,
  isProduction,
  isTest,
  logInfo,
  logError,
  logWarning,
  logDebug
};