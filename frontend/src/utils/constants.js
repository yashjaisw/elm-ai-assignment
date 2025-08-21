// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Authentication
export const AUTH_TOKEN_KEY = 'authToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_DATA_KEY = 'userData';

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_STATE: 'authState',
  THEME_PREFERENCE: 'themePreference',
  LANGUAGE_PREFERENCE: 'languagePreference',
  POSTS_FILTER: 'postsFilter',
  DASHBOARD_LAYOUT: 'dashboardLayout',
};

// Post Categories
export const POST_CATEGORIES = [
  { value: 'general', label: 'General', color: '#757575' },
  { value: 'technology', label: 'Technology', color: '#2196f3' },
  { value: 'business', label: 'Business', color: '#ff9800' },
  { value: 'lifestyle', label: 'Lifestyle', color: '#e91e63' },
  { value: 'education', label: 'Education', color: '#4caf50' },
  { value: 'other', label: 'Other', color: '#9c27b0' },
];

// Post Statuses
export const POST_STATUSES = [
  { value: 'draft', label: 'Draft', color: '#ff9800' },
  { value: 'published', label: 'Published', color: '#4caf50' },
  { value: 'archived', label: 'Archived', color: '#757575' },
];

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
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
  ],
  ACCEPTED_EXTENSIONS: {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// Date Formats
export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy • h:mm a',
  DATE_ONLY: 'MMMM dd, yyyy',
  TIME_ONLY: 'h:mm a',
  SHORT: 'MMM dd, yyyy',
  RELATIVE: 'relative', // for date-fns formatDistanceToNow
};

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    ERROR_MESSAGE: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR_MESSAGE: 'Please enter a valid email address'
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
    ERROR_MESSAGE: 'Name can only contain letters, spaces, hyphens, and apostrophes'
  },
  POST: {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 200,
    },
    CONTENT: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 5000,
    },
    EXCERPT: {
      MAX_LENGTH: 300,
    },
    META_DESCRIPTION: {
      MAX_LENGTH: 160,
    },
    TAGS: {
      MAX_COUNT: 5,
      MAX_TAG_LENGTH: 30,
    },
  },
  BIO: {
    MAX_LENGTH: 500,
  },
  COMMENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000,
  },
};

// UI Constants
export const UI = {
  DRAWER_WIDTH: 240,
  APP_BAR_HEIGHT: 64,
  CARD_BORDER_RADIUS: 12,
  BUTTON_BORDER_RADIUS: 8,
};

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  FILE_TYPE_NOT_SUPPORTED: 'File type is not supported.',
  GENERIC: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back! You have been logged in successfully.',
  REGISTER: 'Account created successfully! Welcome to the dashboard.',
  LOGOUT: 'You have been logged out successfully.',
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  LIKE_ADDED: 'Post liked!',
  LIKE_REMOVED: 'Post unliked!',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  POSTS: '/posts',
  POST_DETAIL: '/posts/:postId',
  POST_COMMENT: '/posts/:postId/comments/:commentId',
  MY_POSTS: '/my_posts',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ABOUT: '/about',
  HELP: '/help',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  POSTS: {
    GET_ALL: '/posts',
    GET_BY_ID: (id) => `/posts/${id}`,
    CREATE: '/posts',
    UPDATE: (id) => `/posts/${id}`,
    DELETE: (id) => `/posts/${id}`,
    GET_MY_POSTS: '/posts/my',
    LIKE: (id) => `/posts/${id}/like`,
    ADD_COMMENT: (id) => `/posts/${id}/comments`,
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
};

// Social Media Sharing
export const SOCIAL_SHARE = {
  TWITTER: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  FACEBOOK: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  LINKEDIN: (title, url, summary) => 
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`,
  REDDIT: (title, url) => `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
};

// Time Constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};

// Debounce Delays
export const DEBOUNCE_DELAYS = {
  SEARCH: 500,
  AUTO_SAVE: 2000,
  RESIZE: 250,
  SCROLL: 100,
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (matching Material-UI)
export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 900,
  LG: 1200,
  XL: 1536,
};

// Z-Index Values
export const Z_INDEX = {
  DRAWER: 1200,
  APP_BAR: 1100,
  MODAL: 1300,
  SNACKBAR: 1400,
  TOOLTIP: 1500,
};

// Feature Flags (for conditional features)
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_POST_ANALYTICS: true,
  ENABLE_REAL_TIME_UPDATES: false,
};

// External Links
export const EXTERNAL_LINKS = {
  DOCUMENTATION: 'https://docs.example.com',
  SUPPORT: 'https://support.example.com',
  PRIVACY_POLICY: 'https://example.com/privacy',
  TERMS_OF_SERVICE: 'https://example.com/terms',
  GITHUB: 'https://github.com/example/dashboard',
};

export default {
  API_BASE_URL,
  STORAGE_KEYS,
  POST_CATEGORIES,
  POST_STATUSES,
  USER_ROLES,
  FILE_UPLOAD,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION,
  UI,
  THEME,
  NOTIFICATION_TYPES,
  LOADING_STATES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  API_ENDPOINTS,
  SOCIAL_SHARE,
  TIME,
  DEBOUNCE_DELAYS,
  ANIMATION,
  BREAKPOINTS,
  Z_INDEX,
  FEATURE_FLAGS,
  EXTERNAL_LINKS,
};