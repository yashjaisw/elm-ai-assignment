import api from './api';

const authService = {
  // User login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // User registration
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // User logout
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  // Logout from all devices
  logoutAll: async () => {
    const response = await api.post('/auth/logout-all');
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;