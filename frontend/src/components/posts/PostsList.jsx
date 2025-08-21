import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Avatar,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  ThumbUp,
  Comment,
  Edit,
  Delete,
  Share,
  BookmarkBorder,
  Schedule,
  Person,
} from '@mui/icons-material';
import { format } from 'date-fns';

function PostsList({ 
  posts = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onLike, 
  currentUser,
  showActions = true,
  variant = 'grid' // 'grid' or 'list'
}) {
  const navigate = useNavigate();

  const handleViewPost = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const handleShare = async (post) => {
    const shareData = {
      title: post.title,
      text: post.excerpt || post.title,
      url: `${window.location.origin}/posts/${post._id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technology': return 'info';
      case 'business': return 'warning';
      case 'lifestyle': return 'secondary';
      case 'education': return 'success';
      default: return 'default';
    }
  };

  const isOwner = (post) => {
    return currentUser && post.author?._id === currentUser._id;
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ width: 60, height: 20, bgcolor: 'grey.300', borderRadius: 1 }} />
                  <Box sx={{ width: 80, height: 20, bgcolor: 'grey.300', borderRadius: 1 }} />
                </Box>
                <Box sx={{ width: '100%', height: 24, bgcolor: 'grey.300', borderRadius: 1, mb: 2 }} />
                <Box sx={{ width: '80%', height: 16, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
                <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No posts available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There are no posts to display at the moment.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {posts.map((post) => (
        <Grid item xs={12} sm={variant === 'grid' ? 6 : 12} md={variant === 'grid' ? 4 : 12} key={post._id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              {/* Status and Category */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Chip
                  label={post.status}
                  size="small"
                  color={getStatusColor(post.status)}
                  sx={{ textTransform: 'capitalize' }}
                />
                <Chip
                  label={post.category}
                  size="small"
                  variant="outlined"
                  color={getCategoryColor(post.category)}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>

              {/* Title */}
              <Typography 
                variant="h6" 
                component="h2" 
                gutterBottom
                sx={{
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
                onClick={() => handleViewPost(post._id)}
              >
                {post.title}
              </Typography>

              {/* Author Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  by {post.author?.firstName} {post.author?.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                  <Schedule fontSize="small" sx={{ fontSize: 12 }} />
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(post.createdAt), 'MMM dd')}
                  </Typography>
                </Box>
              </Box>

              {/* Excerpt */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {post.excerpt || post.content?.substring(0, 150) + '...'}
              </Typography>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {post.tags.slice(0, 3).map(tag => (
                    <Chip 
                      key={tag} 
                      label={`#${tag}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6rem' }}
                    />
                  ))}
                  {post.tags.length > 3 && (
                    <Chip 
                      label={`+${post.tags.length - 3}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6rem' }}
                    />
                  )}
                </Box>
              )}

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize="small" color="action" />
                  <Typography variant="caption">{post.views || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ThumbUp fontSize="small" color="action" />
                  <Typography variant="caption">{post.likesCount || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Comment fontSize="small" color="action" />
                  <Typography variant="caption">{post.commentsCount || 0}</Typography>
                </Box>
                {post.readingTime && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {post.readingTime} min read
                  </Typography>
                )}
              </Box>
            </CardContent>

            {/* Actions */}
            {showActions && (
              <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleViewPost(post._id)}
                >
                  View
                </Button>

                <Tooltip title="Like Post">
                  <IconButton
                    size="small"
                    onClick={() => onLike && onLike(post._id)}
                    color="primary"
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Share">
                  <IconButton
                    size="small"
                    onClick={() => handleShare(post)}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Bookmark">
                  <IconButton
                    size="small"
                  >
                    <BookmarkBorder fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Owner-only actions */}
                {isOwner(post) && (
                  <>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title="Edit Post">
                      <IconButton
                        size="small"
                        onClick={() => onEdit && onEdit(post)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Post">
                      <IconButton
                        size="small"
                        onClick={() => onDelete && onDelete(post._id, post.title)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </CardActions>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default PostsList;