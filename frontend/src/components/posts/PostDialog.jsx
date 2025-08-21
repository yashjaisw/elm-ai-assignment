import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close, CloudUpload } from '@mui/icons-material';

import { createPost, updatePost } from '../../store/slices/postsSlice';
import FileUploader from './FileUploader';

const POST_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const POST_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

function PostDialog({ open, onClose, post = null }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const { createPostLoading, updatePostLoading } = useSelector(state => state.posts);
  const isLoading = createPostLoading || updatePostLoading;
  const isEditing = !!post;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    status: 'published',
    tags: [],
    metaDescription: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Initialize form data when post changes
  useEffect(() => {
    if (isEditing && post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        category: post.category || 'general',
        status: post.status || 'published',
        tags: post.tags || [],
        metaDescription: post.metaDescription || '',
      });
    } else {
      // Reset form for new post
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'general',
        status: 'published',
        tags: [],
        metaDescription: '',
      });
    }
    setTagInput('');
    setUploadedFile(null);
    setFormErrors({});
  }, [post, isEditing, open]);

  // Handle form field changes
  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle tag input
  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title must not exceed 200 characters';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.trim().length < 10) {
      errors.content = 'Content must be at least 10 characters';
    } else if (formData.content.trim().length > 5000) {
      errors.content = 'Content must not exceed 5000 characters';
    }

    if (formData.excerpt && formData.excerpt.length > 300) {
      errors.excerpt = 'Excerpt must not exceed 300 characters';
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      errors.metaDescription = 'Meta description must not exceed 160 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      enqueueSnackbar('Please fix the errors in the form', { variant: 'error' });
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          (Array.isArray(value) ? value : []).forEach(t => submitData.append('tags', t));
        } else {
          submitData.append(key, value);
        }
      });

      // Add file if uploaded
      if (uploadedFile) {
        submitData.append('attachment', uploadedFile);
      }

      if (isEditing) {
        await dispatch(updatePost({ id: post._id, postData: submitData })).unwrap();
        enqueueSnackbar('Post updated successfully!', { variant: 'success' });
      } else {
        await dispatch(createPost(submitData)).unwrap();
        enqueueSnackbar('Post created successfully!', { variant: 'success' });
      }

      onClose();
    } catch (error) {
      console.error('Post save error:', error);
      enqueueSnackbar(error || 'Failed to save post', { variant: 'error' });
    }
  };

  // Calculate reading time
  const getReadingTime = () => {
    const wordCount = formData.content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    return readingTime || 1;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </Typography>
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {/* Title */}
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={handleChange('title')}
            error={!!formErrors.title}
            helperText={formErrors.title || `${formData.title.length}/200 characters`}
            margin="normal"
            required
          />

          {/* Content */}
          <TextField
            fullWidth
            label="Content"
            value={formData.content}
            onChange={handleChange('content')}
            error={!!formErrors.content}
            helperText={formErrors.content || `${formData.content.length}/5000 characters • ~${getReadingTime()} min read`}
            margin="normal"
            multiline
            rows={8}
            required
          />

          {/* Excerpt */}
          <TextField
            fullWidth
            label="Excerpt (Optional)"
            value={formData.excerpt}
            onChange={handleChange('excerpt')}
            error={!!formErrors.excerpt}
            helperText={formErrors.excerpt || 'Brief description of the post for previews'}
            margin="normal"
            multiline
            rows={2}
          />

          {/* Category and Status */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleChange('category')}
                label="Category"
              >
                {POST_CATEGORIES.map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleChange('status')}
                label="Status"
              >
                {POST_STATUSES.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Tags */}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              helperText="Press Enter or comma to add tags (max 5)"
              margin="normal"
            />
            
            {formData.tags.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Meta Description */}
          <TextField
            fullWidth
            label="Meta Description (SEO)"
            value={formData.metaDescription}
            onChange={handleChange('metaDescription')}
            error={!!formErrors.metaDescription}
            helperText={formErrors.metaDescription || 'Description for search engines'}
            margin="normal"
            multiline
            rows={2}
          />

          {/* File Upload */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Attachment (Optional)
            </Typography>
            <FileUploader
              onFileSelect={setUploadedFile}
              selectedFile={uploadedFile}
            />
          </Box>

          {/* Existing attachments for editing */}
          {isEditing && post?.attachments && post.attachments.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Attachments
              </Typography>
              {post.attachments.map((attachment, index) => (
                <Alert key={index} severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>{attachment.originalName}</strong> ({(attachment.size / 1024).toFixed(1)} KB)
                  </Typography>
                </Alert>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Post' : 'Create Post')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default PostDialog;