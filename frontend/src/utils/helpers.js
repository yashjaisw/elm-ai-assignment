import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { VALIDATION, FILE_UPLOAD, DATE_FORMATS } from './constants';

// Date and Time Helpers
export const formatDate = (date, formatType = 'FULL') => {
  if (!date) return '';
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(parsedDate)) {
      return 'Invalid Date';
    }

    switch (formatType) {
      case 'FULL':
        return format(parsedDate, DATE_FORMATS.FULL);
      case 'DATE_ONLY':
        return format(parsedDate, DATE_FORMATS.DATE_ONLY);
      case 'TIME_ONLY':
        return format(parsedDate, DATE_FORMATS.TIME_ONLY);
      case 'SHORT':
        return format(parsedDate, DATE_FORMATS.SHORT);
      case 'RELATIVE':
        return formatDistanceToNow(parsedDate, { addSuffix: true });
      default:
        return format(parsedDate, formatType);
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

// Get relative time (e.g., "2 hours ago", "3 days ago")
export const getRelativeTime = (date) => {
  return formatDate(date, 'RELATIVE');
};

// Validation Helpers
export const validateEmail = (email) => {
  if (!email) return { isValid: false, error: 'Email is required' };
  
  const isValid = VALIDATION.EMAIL.PATTERN.test(email);
  return {
    isValid,
    error: isValid ? null : VALIDATION.EMAIL.ERROR_MESSAGE
  };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, error: 'Password is required' };
  
  if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters long` 
    };
  }
  
  if (password.length > VALIDATION.PASSWORD.MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Password must not exceed ${VALIDATION.PASSWORD.MAX_LENGTH} characters` 
    };
  }

  const hasValidPattern = VALIDATION.PASSWORD.PATTERN.test(password);
  return {
    isValid: hasValidPattern,
    error: hasValidPattern ? null : VALIDATION.PASSWORD.ERROR_MESSAGE
  };
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name) return { isValid: false, error: `${fieldName} is required` };
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < VALIDATION.NAME.MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${VALIDATION.NAME.MIN_LENGTH} characters long` 
    };
  }
  
  if (trimmedName.length > VALIDATION.NAME.MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `${fieldName} must not exceed ${VALIDATION.NAME.MAX_LENGTH} characters` 
    };
  }

  const hasValidPattern = VALIDATION.NAME.PATTERN.test(trimmedName);
  return {
    isValid: hasValidPattern,
    error: hasValidPattern ? null : VALIDATION.NAME.ERROR_MESSAGE
  };
};

// File Helpers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file) => {
  if (!file) return { isValid: false, error: 'No file selected' };

  // Check file size
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum allowed limit of ${formatFileSize(FILE_UPLOAD.MAX_SIZE)}`
    };
  }

  // Check file type
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported`
    };
  }

  return { isValid: true };
};

export const getFileIcon = (mimeType) => {
  if (!mimeType) return 'description';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'picture_as_pdf';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'description';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'grid_on';
  if (mimeType.includes('text')) return 'text_snippet';
  
  return 'insert_drive_file';
};

// String Helpers
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalizeFirst(word)).join(' ');
};

export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Reading Time Calculation
export const calculateReadingTime = (content) => {
  if (!content) return 1;
  
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(readingTime, 1); // Minimum 1 minute
};

// URL Helpers
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const extractDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return '';
  }
};

// Array Helpers
export const removeDuplicates = (array, key = null) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(array)];
};

export const sortBy = (array, key, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const aVal = key ? a[key] : a;
    const bVal = key ? b[key] : b;
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

// Object Helpers
export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Deep clone error:', error);
    return obj;
  }
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const omitKeys = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const keysToOmit = Array.isArray(keys) ? keys : [keys];
  const result = { ...obj };
  
  keysToOmit.forEach(key => {
    delete result[key];
  });
  
  return result;
};

export const pickKeys = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return {};
  
  const keysToPick = Array.isArray(keys) ? keys : [keys];
  const result = {};
  
  keysToPick.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  
  return result;
};

// Local Storage Helpers
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

// Debounce Helper
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle Helper
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Color Helpers
export const generateAvatarColor = (string) => {
  if (!string) return '#757575';
  
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#607d8b'
  ];
  
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Error Handling
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

// Development Helpers
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

export const log = (...args) => {
  if (isDevelopment()) {
    console.log(...args);
  }
};

export const logError = (...args) => {
  if (isDevelopment()) {
    console.error(...args);
  }
};

// Export all helpers as default object
export default {
  formatDate,
  getRelativeTime,
  validateEmail,
  validatePassword,
  validateName,
  formatFileSize,
  validateFile,
  getFileIcon,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  calculateReadingTime,
  isValidUrl,
  extractDomain,
  removeDuplicates,
  sortBy,
  groupBy,
  deepClone,
  isEmpty,
  omitKeys,
  pickKeys,
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  debounce,
  throttle,
  generateAvatarColor,
  getErrorMessage,
  isDevelopment,
  isProduction,
  log,
  logError,
};