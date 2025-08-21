import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import postsSlice from './slices/postsSlice';
import userSlice from './slices/userSlice';
// Remove the problematic middleware import

// Configure the Redux store with all slices
const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postsSlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for file objects in upload
      serializableCheck: {
        ignoredActions: ['posts/uploadFile'],
        ignoredPaths: ['posts.uploadFile'],
      },
    }), // Remove .concat(authMiddleware)
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

export default store;