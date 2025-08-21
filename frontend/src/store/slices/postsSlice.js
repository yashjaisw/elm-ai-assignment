import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postsService from '../../services/postsService';

// Async thunks for posts operations
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postsService.getAllPosts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch posts'
      );
    }
  }
);

export const fetchMyPosts = createAsyncThunk(
  'posts/fetchMyPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postsService.getMyPosts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your posts'
      );
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postsService.getPostById(postId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch post'
      );
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postsService.createPost(postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create post'
      );
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await postsService.updatePost(id, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update post'
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await postsService.deletePost(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete post'
      );
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postsService.toggleLike(postId);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to like post'
      );
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await postsService.addComment(postId, content);
      return { postId, comment: response.data.comment };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add comment'
      );
    }
  }
);

const initialState = {
  // Posts list (for main posts page)
  posts: [],
  postsLoading: false,
  postsError: null,
  postsPagination: null,
  
  // My posts (for user's own posts)
  myPosts: [],
  myPostsLoading: false,
  myPostsError: null,
  myPostsPagination: null,
  
  // Single post (for post detail page)
  currentPost: null,
  currentPostLoading: false,
  currentPostError: null,
  
  // UI state
  createPostLoading: false,
  updatePostLoading: false,
  deletePostLoading: false,
  
  // Filter and search state
  filters: {
    category: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Clear errors
    clearPostsError: (state) => {
      state.postsError = null;
      state.currentPostError = null;
      state.myPostsError = null;
    },
    
    // Update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear current post
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.currentPostError = null;
    },
    
    // Optimistic update for likes (instant UI feedback)
    optimisticLike: (state, action) => {
      const { postId, liked } = action.payload;
      
      // Update in posts array
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        const post = state.posts[postIndex];
        if (liked) {
          post.likesCount = (post.likesCount || 0) + 1;
        } else {
          post.likesCount = Math.max((post.likesCount || 0) - 1, 0);
        }
      }
      
      // Update in my posts array
      const myPostIndex = state.myPosts.findIndex(post => post._id === postId);
      if (myPostIndex !== -1) {
        const post = state.myPosts[myPostIndex];
        if (liked) {
          post.likesCount = (post.likesCount || 0) + 1;
        } else {
          post.likesCount = Math.max((post.likesCount || 0) - 1, 0);
        }
      }
      
      // Update current post if it matches
      if (state.currentPost && state.currentPost._id === postId) {
        if (liked) {
          state.currentPost.likesCount = (state.currentPost.likesCount || 0) + 1;
        } else {
          state.currentPost.likesCount = Math.max((state.currentPost.likesCount || 0) - 1, 0);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts cases
      .addCase(fetchPosts.pending, (state) => {
        state.postsLoading = true;
        state.postsError = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.postsLoading = false;
        state.posts = action.payload.posts;
        state.postsPagination = action.payload.pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.postsLoading = false;
        state.postsError = action.payload;
      })

      // Fetch my posts cases
      .addCase(fetchMyPosts.pending, (state) => {
        state.myPostsLoading = true;
        state.myPostsError = null;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.myPostsLoading = false;
        state.myPosts = action.payload.posts;
        state.myPostsPagination = action.payload.pagination;
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.myPostsLoading = false;
        state.myPostsError = action.payload;
      })

      // Fetch single post cases
      .addCase(fetchPostById.pending, (state) => {
        state.currentPostLoading = true;
        state.currentPostError = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentPostLoading = false;
        state.currentPost = action.payload.post;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.currentPostLoading = false;
        state.currentPostError = action.payload;
      })

      // Create post cases
      .addCase(createPost.pending, (state) => {
        state.createPostLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createPostLoading = false;
        // Add new post to the beginning of posts array
        state.posts.unshift(action.payload.post);
        // Also add to my posts if we're viewing them
        state.myPosts.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state) => {
        state.createPostLoading = false;
      })

      // Update post cases
      .addCase(updatePost.pending, (state) => {
        state.updatePostLoading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.updatePostLoading = false;
        const updatedPost = action.payload.post;
        
        // Update in posts array
        const postIndex = state.posts.findIndex(post => post._id === updatedPost._id);
        if (postIndex !== -1) {
          state.posts[postIndex] = updatedPost;
        }
        
        // Update in my posts array
        const myPostIndex = state.myPosts.findIndex(post => post._id === updatedPost._id);
        if (myPostIndex !== -1) {
          state.myPosts[myPostIndex] = updatedPost;
        }
        
        // Update current post if it matches
        if (state.currentPost && state.currentPost._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })
      .addCase(updatePost.rejected, (state) => {
        state.updatePostLoading = false;
      })

      // Delete post cases
      .addCase(deletePost.pending, (state) => {
        state.deletePostLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.deletePostLoading = false;
        const deletedPostId = action.payload;
        
        // Remove from posts array
        state.posts = state.posts.filter(post => post._id !== deletedPostId);
        
        // Remove from my posts array
        state.myPosts = state.myPosts.filter(post => post._id !== deletedPostId);
        
        // Clear current post if it matches
        if (state.currentPost && state.currentPost._id === deletedPostId) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state) => {
        state.deletePostLoading = false;
      })

      // Like post cases
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, liked, likesCount } = action.payload;
        
        // Update in posts array
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].likesCount = likesCount;
        }
        
        // Update in my posts array
        const myPostIndex = state.myPosts.findIndex(post => post._id === postId);
        if (myPostIndex !== -1) {
          state.myPosts[myPostIndex].likesCount = likesCount;
        }
        
        // Update current post if it matches
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.likesCount = likesCount;
        }
      })

      // Add comment cases
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        
        // Update current post if it matches
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.comments = state.currentPost.comments || [];
          state.currentPost.comments.push(comment);
        }
      });
  },
});

export const { 
  clearPostsError, 
  setFilters, 
  clearCurrentPost, 
  optimisticLike 
} = postsSlice.actions;

// Selectors
export const selectPosts = (state) => state.posts.posts;
export const selectPostsLoading = (state) => state.posts.postsLoading;
export const selectPostsError = (state) => state.posts.postsError;
export const selectPostsPagination = (state) => state.posts.postsPagination;

export const selectMyPosts = (state) => state.posts.myPosts;
export const selectMyPostsLoading = (state) => state.posts.myPostsLoading;
export const selectMyPostsError = (state) => state.posts.myPostsError;
export const selectMyPostsPagination = (state) => state.posts.myPostsPagination;

export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectCurrentPostLoading = (state) => state.posts.currentPostLoading;
export const selectCurrentPostError = (state) => state.posts.currentPostError;

export const selectCreatePostLoading = (state) => state.posts.createPostLoading;
export const selectUpdatePostLoading = (state) => state.posts.updatePostLoading;
export const selectDeletePostLoading = (state) => state.posts.deletePostLoading;

export const selectFilters = (state) => state.posts.filters;

export default postsSlice.reducer;