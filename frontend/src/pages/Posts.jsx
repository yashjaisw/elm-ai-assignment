import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Skeleton,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';

import {
  fetchPosts,
  selectPosts,
  selectPostsLoading,
  selectPostsError,
  deletePost,
} from '../store/slices/postsSlice';
import { selectUser } from '../store/slices/authSlice';
import PostDialog from '../components/posts/PostDialog';

function Posts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const posts = useSelector(selectPosts);
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);
  const currentUser = useSelector(selectUser);

  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch posts on component mount
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    } catch (error) {
      enqueueSnackbar('Failed to delete post', { variant: 'error' });
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/posts/${postId}`);
  };

  // Loading skeleton
  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="100%" height={60} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            Posts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and manage posts from the community
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreatePost}
          sx={{ px: 3, py: 1.5 }}
        >
          Create Post
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Search posts..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ maxWidth: 400 }}
        />
      </Paper>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No posts found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a post!'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
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

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>

                {/* Card Actions */}
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Post">
                        <IconButton
                          size="small"
                          onClick={() => handleViewPost(post._id)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {currentUser?._id === post.author?._id && (
                        <>
                          <Tooltip title="Edit Post">
                            <IconButton
                              size="small"
                              onClick={() => handleEditPost(post)}
                              sx={{ color: 'secondary.main' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Post">
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePost(post._id)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
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
    </Box>
  );
}

export default Posts;