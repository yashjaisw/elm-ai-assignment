const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    minlength: [3, 'Title must be at least 3 characters long']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters'],
    minlength: [10, 'Content must be at least 10 characters long']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  category: {
    type: String,
    enum: ['general', 'technology', 'business', 'lifestyle', 'education', 'other'],
    default: 'general'
  },
  // File upload metadata
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    // In a real app, you'd store the cloud URL here
    filePath: {
      type: String,
      required: true
    }
  }],
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Comments embedded for simplicity (in production, might be separate collection)
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // Simple nested replies support
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Reply cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  // SEO fields
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual fields
postSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

postSchema.virtual('commentsCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

postSchema.virtual('readingTime').get(function() {
  // Estimate reading time based on word count (average 200 words per minute)
  const wordCount = this.content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);
  return readingTime || 1;
});

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' }); // Text search
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });

// Pre-save middleware to generate slug and excerpt
postSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 60); // Limit length
      
    // Add timestamp to ensure uniqueness
    if (this.isNew) {
      this.slug += '-' + Date.now();
    }
  }

  // Generate excerpt if not provided
  if (!this.excerpt) {
    // Create excerpt from first 150 characters of content
    this.excerpt = this.content.length > 150 
      ? this.content.substring(0, 150) + '...'
      : this.content;
  }

  next();
});

// Instance method to increment views
postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to add like
postSchema.methods.addLike = function(userId) {
  // Check if user already liked
  const existingLike = this.likes.find(
    like => like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(
    like => like.user.toString() !== userId.toString()
  );
  return this.save();
};

// Static method to get popular posts
postSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .populate('author', 'firstName lastName')
    .sort({ views: -1, likesCount: -1 })
    .limit(limit);
};

// Static method to get recent posts
postSchema.statics.getRecent = function(limit = 10) {
  return this.find({ status: 'published' })
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method for full-text search
postSchema.statics.searchPosts = function(query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    category,
    author,
    status = 'published'
  } = options;

  const searchQuery = {
    $text: { $search: query },
    status
  };

  if (category) searchQuery.category = category;
  if (author) searchQuery.author = author;

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .populate('author', 'firstName lastName')
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Post', postSchema);