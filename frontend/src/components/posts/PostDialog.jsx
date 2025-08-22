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
  Grid,
  IconButton,
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
        sx: {
          width: { xs: '95%', sm: '80%', md: '70%' },
          maxWidth: 800,
          maxHeight: { xs: '95vh', sm: '90vh' },
          m: { xs: 1, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, flexShrink: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent style={{ paddingTop: 5 }} sx={{ pb: 2, paddingTop: 24, flex: 1, overflow: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Post Title"
                value={formData.title}
                onChange={handleChange('title')}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
                variant="outlined"
              />
            </Grid>

            {/* Category and Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  label="Category"
                >
                  {POST_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange('status')}
                  label="Status"
                >
                  {POST_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Content */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Post Content"
                value={formData.content}
                onChange={handleChange('content')}
                error={!!formErrors.content}
                helperText={formErrors.content}
                required
                multiline
                rows={6}
                variant="outlined"
                placeholder="Write your post content here..."
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (press Enter to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyDown}
                variant="outlined"
                helperText="Add tags to help others find your post"
              />
              {formData.tags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <FileUploader
                onFileUpload={setUploadedFile}
                uploadedFile={uploadedFile}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        pb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 },
        flexShrink: 0
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={false}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            order: { xs: 1, sm: 1 }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          fullWidth={false}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            order: { xs: 2, sm: 2 }
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            isEditing ? 'Update Post' : 'Create Post'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PostDialog;