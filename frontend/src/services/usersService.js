import api from './api';

const usersService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },

  // Delete user account (soft delete)
  deleteAccount: async (password) => {
    const response = await api.delete('/users/account', {
      data: { password }
    });
    return response.data;
  },
};

export default usersService;