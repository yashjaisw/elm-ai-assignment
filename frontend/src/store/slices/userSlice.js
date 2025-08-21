import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import usersService from '../../services/usersService';

// Async thunks for user operations
export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersService.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await usersService.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

export const getUserStats = createAsyncThunk(
  'user/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersService.getUserStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user stats'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await usersService.changePassword(passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password'
      );
    }
  }
);

const initialState = {
  // User profile data (could be different from auth user data)
  profile: null,
  profileLoading: false,
  profileError: null,
  
  // User statistics
  stats: null,
  statsLoading: false,
  statsError: null,
  
  // UI states
  updateLoading: false,
  updateError: null,
  passwordChangeLoading: false,
  passwordChangeError: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear errors
    clearUserError: (state) => {
      state.profileError = null;
      state.updateError = null;
      state.passwordChangeError = null;
      state.statsError = null;
    },
    
    // Reset user state (on logout)
    resetUserState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user profile cases
      .addCase(getUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })

      // Update user profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      // Get user stats cases
      .addCase(getUserStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })

      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.passwordChangeError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordChangeLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = action.payload;
      });
  },
});

export const { clearUserError, resetUserState } = userSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectUserProfileLoading = (state) => state.user.profileLoading;
export const selectUserProfileError = (state) => state.user.profileError;

export const selectUserStats = (state) => state.user.stats;
export const selectUserStatsLoading = (state) => state.user.statsLoading;
export const selectUserStatsError = (state) => state.user.statsError;

export const selectUserUpdateLoading = (state) => state.user.updateLoading;
export const selectUserUpdateError = (state) => state.user.updateError;

export const selectPasswordChangeLoading = (state) => state.user.passwordChangeLoading;
export const selectPasswordChangeError = (state) => state.user.passwordChangeError;

export default userSlice.reducer;