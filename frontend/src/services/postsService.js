import api, { createFormData } from './api';

const postsService = {
  // Get all posts with optional parameters
  getAllPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Get single post by ID
  getPostById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // Get current user's posts
  getMyPosts: async (params = {}) => {
    const response = await api.get('/posts/my', { params });
    return response.data;
  },

  // Create new post
  createPost: async (postData) => {
    // Check if we have a file to upload
    const hasFile = postData.attachment instanceof File;
    
    if (hasFile) {
      // Use FormData for file upload
      const formData = createFormData(postData);
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Track upload progress if needed
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      return response.data;
    } else {
      // Regular JSON request
      const response = await api.post('/posts', postData);
      return response.data;
    }
  },

  // Update existing post
  updatePost: async (postId, postData) => {
    // Check if we have a file to upload
    const hasFile = postData.attachment instanceof File;
    
    if (hasFile) {
      // Use FormData for file upload
      const formData = createFormData(postData);
      const response = await api.put(`/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      return response.data;
    } else {
      // Regular JSON request
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    }
  },

  // Delete post
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Toggle like on post
  toggleLike: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Add comment to post
  addComment: async (postId, content) => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },

  // Search posts (using the existing API with search parameter)
  searchPosts: async (query, params = {}) => {
    const searchParams = {
      search: query,
      ...params,
    };
    const response = await api.get('/posts', { params: searchParams });
    return response.data;
  },

  // Get posts by category
  getPostsByCategory: async (category, params = {}) => {
    const categoryParams = {
      category,
      ...params,
    };
    const response = await api.get('/posts', { params: categoryParams });
    return response.data;
  },

  // Get popular posts (could be implemented on backend)
  getPopularPosts: async (limit = 10) => {
    const params = {
      sortBy: 'views',
      sortOrder: 'desc',
      limit,
    };
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Get recent posts
  getRecentPosts: async (limit = 10) => {
    const params = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit,
    };
    const response = await api.get('/posts', { params });
    return response.data;
  },
};

export default postsService;