import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Process the queue of failed requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Get token from localStorage instead of store
const getToken = () => {
  try {
    const authState = localStorage.getItem('authState');
    if (authState) {
      const parsed = JSON.parse(authState);
      return parsed.accessToken;
    }
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
  }
  return null;
};

// Get refresh token from localStorage
const getRefreshToken = () => {
  try {
    const authState = localStorage.getItem('authState');
    if (authState) {
      const parsed = JSON.parse(authState);
      return parsed.refreshToken;
    }
  } catch (error) {
    console.error('Error reading refresh token from localStorage:', error);
  }
  return null;
};

// Update token in localStorage
const updateToken = (newAccessToken) => {
  try {
    const authState = localStorage.getItem('authState');
    if (authState) {
      const parsed = JSON.parse(authState);
      parsed.accessToken = newAccessToken;
      localStorage.setItem('authState', JSON.stringify(parsed));
    }
  } catch (error) {
    console.error('Error updating token in localStorage:', error);
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if it's a token expired error
      const errorCode = error.response?.data?.code;
      
      if (errorCode === 'TOKEN_EXPIRED') {
        // If we're already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return api(originalRequest);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Attempt to refresh token
          const response = await api.post('/auth/refresh', { refreshToken });
          const newToken = response.data.data.accessToken;
          
          // Update token in localStorage
          updateToken(newToken);
          
          // Process queued requests
          processQueue(null, newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // Refresh failed, logout user
          processQueue(refreshError, null);
          
          // Clear localStorage
          localStorage.removeItem('authState');
          
          // Redirect to login page
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Other 401 errors (invalid token, etc.)
        localStorage.removeItem('authState');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to create form data (for file uploads)
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}[${index}]`, item);
        } else {
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        }
      });
    } else if (value !== null && value !== undefined) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  });
  
  return formData;
};

export default api;