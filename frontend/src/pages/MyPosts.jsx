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
      sortOrder: 'desc', // Always desc for newest first
    };
    dispatch(fetchMyPosts(params));
  }, [dispatch, page, limit, searchTerm, statusFilter, categoryFilter, sortBy]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      default:
        break;
    }
    setPage(1); // Reset to first page when filtering
  };

  // Handle post actions
  const handleCreatePost = () => {
    setEditingPost(null);
    setPostDialogOpen(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostDialogOpen(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      await dispatch(deletePost(postId)).unwrap();
      enqueueSnackbar('Post deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      enqueueSnackbar('Failed to delete post', { variant: 'error' });
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

  // Loading state
  if (loading && (!myPosts || myPosts.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: { xs: 'center', md: 'space-between' }, 
        alignItems: { xs: 'center', md: 'center' }, 
        mb: 4,
        gap: { xs: 2, md: 0 }
      }}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            My Posts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and organize your published content
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search your posts..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* Filter Icon */}
          <Grid item xs={12} md={.5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <FilterList color="action" />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Category Filter */}
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="lifestyle">Lifestyle</MenuItem>
                <MenuItem value="education">Education</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="updatedAt">Last Updated</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="views">Views</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Create New Post Button */}
          <Grid item xs={12} md={1.5}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreatePost}
              fullWidth
              sx={{ 
                px: 2, 
                py: 1.5,
                height: 40
              }}
            >
              New Post
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Posts Grid */}
      {myPosts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Start creating your first post to share your thoughts with the community"
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreatePost}
              sx={{ mt: 2 }}
            >
              Create Your First Post
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {myPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'grey.50',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={() => handleViewPost(post._id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Post Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {post.author?.firstName?.[0] || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {post.author?.firstName} {post.author?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Post Content */}
                  <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    {post.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.content}
                  </Typography>

                  {/* Status and Tags */}
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip
                      label={post.status || 'draft'}
                      size="small"
                      color={post.status === 'published' ? 'success' : 'default'}
                      variant="outlined"
                    />
                    {post.tags && post.tags.slice(0, 2).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                </CardContent>

                {/* Card Actions */}
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit Post">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPost(post);
                        }}
                        sx={{ color: 'secondary.main' }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Post">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPostToDelete(post);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Post Dialog */}
      <PostDialog
        open={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        post={editingPost}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleDeletePost(postToDelete?._id)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyPosts;