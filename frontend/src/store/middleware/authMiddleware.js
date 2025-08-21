import { createListenerMiddleware } from '@reduxjs/toolkit';
import { logoutUser, forceLogout } from '../slices/authSlice';
import { resetUserState } from '../slices/userSlice';

// Create listener middleware for side effects
export const authMiddleware = createListenerMiddleware();

// Listen for logout actions and clean up state
authMiddleware.startListening({
  actionCreator: logoutUser.fulfilled,
  effect: (action, listenerApi) => {
    // Clear user state on logout
    listenerApi.dispatch(resetUserState());
    
    // Clear any cached data in localStorage
    try {
      localStorage.removeItem('authState');
      localStorage.removeItem('userPreferences');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    console.log('🧹 User state cleaned up after logout');
  },
});

// Listen for force logout and clean up state
authMiddleware.startListening({
  actionCreator: forceLogout,
  effect: (action, listenerApi) => {
    // Clear user state on force logout
    listenerApi.dispatch(resetUserState());
    
    // Clear any cached data
    try {
      localStorage.removeItem('authState');
      localStorage.removeItem('userPreferences');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    console.log('🧹 User state cleaned up after force logout');
  },
});

// Listen for any rejected auth actions that might indicate token issues
authMiddleware.startListening({
  predicate: (action) => {
    return action.type.includes('auth/') && action.type.includes('rejected');
  },
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();
    
    // If we get a 401 error and user was authenticated, force logout
    if (action.payload?.includes('401') || 
        action.payload?.includes('Unauthorized') ||
        action.payload?.includes('Invalid token')) {
      
      if (state.auth.isAuthenticated) {
        console.log('🔒 Token validation failed, forcing logout');
        listenerApi.dispatch(forceLogout());
      }
    }
  },
});

export default authMiddleware;