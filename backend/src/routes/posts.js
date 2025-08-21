const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  addComment,
  toggleLike,
  postValidation
} = require('../controllers/postsController');

const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadSingle, cleanupOnError } = require('../middleware/upload');

// GET /api/posts - Get all posts (public, with optional auth for personalization)
router.get('/', optionalAuth, getAllPosts);

// GET /api/posts/my - Get current user's posts (requires auth)
router.get('/my', authenticate, getMyPosts);

// GET /api/posts/:id - Get single post by ID (public, with optional auth)
router.get('/:id', optionalAuth, getPostById);

// POST /api/posts - Create new post (requires auth, with file upload)
router.post('/',
  authenticate,
  uploadSingle('attachment'), // Handle file upload
  cleanupOnError, // Cleanup files on error
  postValidation, // Validation
  createPost
);

// PUT /api/posts/:id - Update post (requires auth and ownership)
router.put('/:id',
  authenticate,
  uploadSingle('attachment'), // Handle optional new file
  cleanupOnError,
  postValidation,
  updatePost
);

// DELETE /api/posts/:id - Delete post (requires auth and ownership)
router.delete('/:id', authenticate, deletePost);

// POST /api/posts/:id/comments - Add comment to post (requires auth)
router.post('/:id/comments', authenticate, addComment);

// POST /api/posts/:id/like - Toggle like on post (requires auth)
router.post('/:id/like', authenticate, toggleLike);

module.exports = router;