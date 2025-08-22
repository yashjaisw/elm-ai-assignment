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
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: { xs: 'center', md: 'space-between' }, 
          alignItems: { xs: 'center', md: 'center' }, 
          mb: 4,
          gap: { xs: 2, md: 0 }
        }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={300} height={24} />
          </Box>
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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: { xs: 'center', md: 'space-between' }, 
        alignItems: { xs: 'center', md: 'center' }, 
        mb: 4,
        gap: { xs: 2, md: 0 }
      }}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, width: '100%' }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight={700}
          >
            Posts
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: { xs: 'center', md: 'left' } }} // Responsive alignment
          >
            Discover and manage posts from the community
          </Typography>
        </Box>
      </Box>

      {/* Search and Create Post */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
          <TextField
            fullWidth
            placeholder="Search posts..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              width: { xs: '100%', md: '85%' } // 100% on mobile, 85% on desktop
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreatePost}
            sx={{ 
              px: 3, 
              py: 1.5,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 140 }
            }}
          >
            Create New Post
          </Button>
        </Box>
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

                {/* Card Actions - Only show for user's own posts */}
                {currentUser?._id === post.author?._id && (
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
                            handleDeletePost(post._id);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                )}
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