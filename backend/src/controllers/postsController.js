const Post = require('../models/Post');
const { body, validationResult, query } = require('express-validator');
const { getFromCache, setCache, deleteFromCache } = require('../config/redis');

// Validation rules for creating/updating posts
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'technology', 'business', 'lifestyle', 'education', 'other'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag must be maximum 30 characters')
];

// Get all posts with pagination and filtering
const getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status = 'published',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build cache key for this specific query
    const cacheKey = `posts_${JSON.stringify(req.query)}`;
    
    // Try to get from cache first
    const cachedPosts = await getFromCache(cacheKey);
    if (cachedPosts) {
      console.log('📦 Serving posts from cache');
      return res.json(cachedPosts);
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build query
    let query = { status };
    
    if (category) {
      query.category = category;
    }

    // Text search if search query provided
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .populate('author', 'firstName lastName email')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        .lean(), // Use lean() for better performance
      Post.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalPosts / limitNumber);

    const result = {
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalPosts,
          postsPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1
        }
      }
    };

    // Cache the result for 5 minutes
    await setCache(cacheKey, result, 300);

    console.log(`📄 Retrieved ${posts.length} posts (page ${pageNumber}/${totalPages})`);
    res.json(result);

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve posts'
    });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `post_${id}`;

    // Try cache first
    const cachedPost = await getFromCache(cacheKey);
    if (cachedPost) {
      console.log('📦 Serving post from cache');
      return res.json(cachedPost);
    }

    const post = await Post.findById(id)
      .populate('author', 'firstName lastName email profilePicture')
      .populate('comments.author', 'firstName lastName')
      .populate('comments.replies.author', 'firstName lastName');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count (don't await to avoid blocking response)
    post.incrementViews().catch(err => {
      console.error('Error incrementing views:', err);
    });

    const result = {
      success: true,
      data: { post }
    };

    // Cache for 10 minutes
    await setCache(cacheKey, result, 600);

    res.json(result);

  } catch (error) {
    console.error('Get post error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve post'
    });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, category, status, tags, metaDescription } = req.body;
    const author = req.user._id;

    // Create post object
    const postData = {
      title,
      content,
      author,
      category: category || 'general',
      status: status || 'published',
      tags: tags || [],
      metaDescription
    };

    // Add file attachment if uploaded
    if (req.fileMetadata) {
      postData.attachments = [req.fileMetadata];
      console.log('📎 File attached to post:', req.fileMetadata.originalName);
    }

    const post = new Post(postData);
    await post.save();

    // Populate author info for response
    await post.populate('author', 'firstName lastName email');

    // Clear related caches
    await deleteFromCache('posts_*'); // Clear all posts caches

    console.log(`✅ New post created: "${title}" by ${req.user.fullName}`);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, content, category, status, tags, metaDescription } = req.body;

    // Find post and check ownership
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }

    // Update fields
    const updateData = {
      title,
      content,
      category,
      status,
      tags,
      metaDescription
    };

    // Add new file if uploaded
    if (req.fileMetadata) {
      post.attachments.push(req.fileMetadata);
      console.log('📎 New file attached to post:', req.fileMetadata.originalName);
    }

    Object.assign(post, updateData);
    await post.save();

    // Populate for response
    await post.populate('author', 'firstName lastName email');

    // Clear caches
    await Promise.all([
      deleteFromCache(`post_${id}`),
      deleteFromCache('posts_*')
    ]);

    console.log(`✏️ Post updated: "${title}" by ${req.user.fullName}`);

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Update post error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await Post.findByIdAndDelete(id);

    // Clear caches
    await Promise.all([
      deleteFromCache(`post_${id}`),
      deleteFromCache('posts_*')
    ]);

    console.log(`🗑️ Post deleted: "${post.title}" by ${req.user.fullName}`);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Get user's own posts
const getMyPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build query for user's posts
    let query = { author: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Post.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalPosts / limitNumber);

    console.log(`📄 Retrieved ${posts.length} posts for user ${req.user.fullName}`);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalPosts,
          postsPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1
        }
      }
    });

  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your posts'
    });
  }
};

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      author: req.user._id,
      content: content.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment for response
    await post.populate('comments.author', 'firstName lastName');

    // Clear post cache
    await deleteFromCache(`post_${id}`);

    const newComment = post.comments[post.comments.length - 1];

    console.log(`💬 Comment added to post "${post.title}" by ${req.user.fullName}`);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// Like/Unlike post
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(
      like => like.user.toString() === userId.toString()
    );

    let action;
    if (existingLike) {
      await post.removeLike(userId);
      action = 'unliked';
    } else {
      await post.addLike(userId);
      action = 'liked';
    }

    // Clear post cache
    await deleteFromCache(`post_${id}`);

    console.log(`❤️ Post ${action} by ${req.user.fullName}`);

    res.json({
      success: true,
      message: `Post ${action} successfully`,
      data: {
        liked: action === 'liked',
        likesCount: post.likes.length
      }
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  addComment,
  toggleLike,
  postValidation
};