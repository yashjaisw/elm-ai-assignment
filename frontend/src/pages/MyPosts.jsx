import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  ThumbUp,
  Comment,
  Search,
  FilterList,
  Drafts,
  Publish,
  Archive,
} from '@mui/icons-material';
import { format } from 'date-fns';

import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsLoading,
  selectMyPostsError,
  selectMyPostsPagination,
  deletePost,
} from '../store/slices/postsSlice';
import { selectUser } from '../store/slices/authSlice';
import PostDialog from '../components/posts/PostDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

function MyPosts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const myPosts = useSelector(selectMyPosts);
  const loading = useSelector(selectMyPostsLoading);
  const error = useSelector(selectMyPostsError);
  const pagination = useSelector(selectMyPostsPagination);
  const currentUser = useSelector(selectUser);

  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Cards per page

  // Menu state for post actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch posts on component mount and when filters change
  useEffect(() => {
    const params = {
      page,
      limit,
      search: searchTerm,
      status: statusFilter,
      category: categoryFilter,
      sortBy,
      sortOrder,
    };
    
    // Remove empty parameters
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });

    dispatch(fetchMyPosts(params));
  }, [dispatch, page, limit, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle post actions
  const handleCreatePost = () => {
    setEditingPost(null);
    setPostDialogOpen(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostDialogOpen(true);
    handleMenuClose();
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await dispatch(deletePost(postToDelete._id)).unwrap();
      enqueueSnackbar('Post deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      enqueueSnackbar(error || 'Failed to delete post', { variant: 'error' });
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/posts/${postId}`);
  };

  // Menu handlers
  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'Drafts':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <Publish fontSize="small" />;
      case 'Drafts':
        return <Drafts fontSize="small" />;
      case 'archived':
        return <Archive fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading && (!myPosts || myPosts.length === 0)) {
    return <LoadingSpinner message="Loading your posts..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Posts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreatePost}
        >
          Create New Post
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterList color="action" />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              placeholder="Search your posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="Drafts">Drafts</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="lifestyle">Lifestyle</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="updatedAt">Last Modified</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="views">Views</MenuItem>
                <MenuItem value="likesCount">Likes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Posts Grid */}
      {myPosts && myPosts.length > 0 ? (
        <Grid container spacing={3}>
          {myPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Post Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Chip
                      icon={getStatusIcon(post.status)}
                      label={post.status}
                      color={getStatusColor(post.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, post)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Post Title */}
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                    }}
                    onClick={() => handleViewPost(post._id)}
                  >
                    {post.title}
                  </Typography>

                  {/* Post Excerpt */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}
                  >
                    {post.excerpt}
                  </Typography>

                  {/* Category */}
                  <Chip
                    label={post.category}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize', mb: 1 }}
                  />

                  <Divider sx={{ my: 1 }} />

                  {/* Post Stats */}
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="caption">{post.views || 0}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ThumbUp fontSize="small" color="action" />
                        <Typography variant="caption">{post.likesCount || 0}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Comment fontSize="small" color="action" />
                        <Typography variant="caption">{post.commentsCount || 0}</Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewPost(post._id)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditPost(post)}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title="No posts yet"
          description="You haven't created any posts yet. Create your first post to get started!"
          actionLabel="Create Post"
          onAction={handleCreatePost}
          icon={<Add sx={{ fontSize: 48 }} />}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          
          <Typography variant="body2" sx={{ mx: 2, alignSelf: 'center' }}>
            Page {page} of {pagination.totalPages}
          </Typography>
          
          <Button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            sx={{ ml: 1 }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Post Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewPost(selectedPost?._id)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Post</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleEditPost(selectedPost)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Post</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleDeletePost(selectedPost)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Post</ListItemText>
        </MenuItem>
      </Menu>

      {/* Post Dialog */}
      <PostDialog
        open={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        post={editingPost}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeletePost} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyPosts;