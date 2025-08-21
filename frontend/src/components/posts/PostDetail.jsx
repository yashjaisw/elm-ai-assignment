import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Avatar,
  Chip,
  Box,
  Button,
  Divider,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  Bookmark,
  BookmarkBorder,
  Edit,
  Delete,
  Visibility,
  Schedule,
  AttachFile,
  Download,
} from '@mui/icons-material';
import { format } from 'date-fns';

function PostDetail({ 
  post, 
  currentUser = null,
  onLike = null,
  onEdit = null,
  onDelete = null,
  onShare = null,
  showActions = true,
  variant = 'full' // 'full', 'compact', 'preview'
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!post) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Post not found
        </Typography>
      </Paper>
    );
  }

  const isOwner = currentUser && post.author?._id === currentUser._id;

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike && onLike(post._id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (onShare) {
      onShare(post);
    } else {
      // Default share behavior
      const shareData = {
        title: post.title,
        text: post.excerpt || post.title,
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.log('Error sharing:', error);
        }
      } else {
        navigator.clipboard.writeText(shareData.url);
      }
    }
  };

  const handleFileDownload = (attachment) => {
    // Mock download - in real app, would download from actual URL
    console.log('Downloading:', attachment.originalName);
  };

  return (
    <Paper sx={{ p: variant === 'compact' ? 2 : 4 }}>
      {/* Post Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={variant === 'compact' ? 'h6' : 'h4'} 
          component="h1" 
          gutterBottom
        >
          {post.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: variant === 'compact' ? 32 : 40, height: variant === 'compact' ? 32 : 40 }}>
            {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {post.author?.firstName} {post.author?.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(post.createdAt), 'MMMM dd, yyyy')}
                  {variant === 'full' && ` • ${format(new Date(post.createdAt), 'h:mm a')}`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {post.views || 0} views
                </Typography>
              </Box>
              {post.readingTime && (
                <Typography variant="caption" color="text.secondary">
                  {post.readingTime} min read
                </Typography>
              )}
            </Box>
          </Box>

          {/* Owner Actions */}
          {isOwner && showActions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="primary"
                onClick={() => onEdit && onEdit(post)}
                title="Edit post"
                size={variant === 'compact' ? 'small' : 'medium'}
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => onDelete && onDelete(post._id, post.title)}
                title="Delete post"
                size={variant === 'compact' ? 'small' : 'medium'}
              >
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Category and Tags */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={post.category} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          />
          {post.tags?.slice(0, variant === 'compact' ? 3 : 10).map(tag => (
            <Chip 
              key={tag} 
              label={`#${tag}`} 
              size="small" 
              variant="outlined" 
            />
          ))}
          {post.tags?.length > 3 && variant === 'compact' && (
            <Chip 
              label={`+${post.tags.length - 3} more`} 
              size="small" 
              variant="outlined" 
            />
          )}
        </Box>
      </Box>

      {variant !== 'preview' && <Divider sx={{ mb: 3 }} />}

      {/* Post Content */}
      <Typography 
        variant="body1" 
        sx={{ 
          lineHeight: 1.8,
          fontSize: variant === 'compact' ? '1rem' : '1.1rem',
          whiteSpace: 'pre-wrap',
          mb: 3,
          // Truncate for preview variant
          ...(variant === 'preview' && {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          })
        }}
      >
        {variant === 'preview' 
          ? (post.excerpt || post.content.substring(0, 200) + '...')
          : post.content
        }
      </Typography>

      {/* Attachments */}
      {variant !== 'preview' && post.attachments && post.attachments.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Attachments
          </Typography>
          {post.attachments.map((attachment, index) => (
            <Card key={index} sx={{ mb: 1 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AttachFile color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {attachment.originalName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(attachment.size / 1024).toFixed(1)} KB • {attachment.mimeType}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleFileDownload(attachment)}
                    title="Download file"
                  >
                    <Download />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Interaction Buttons */}
      {showActions && variant !== 'preview' && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          pt: 2, 
          borderTop: 1, 
          borderColor: 'divider' 
        }}>
          <Button
            startIcon={isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
            onClick={handleLike}
            color={isLiked ? 'primary' : 'inherit'}
            size={variant === 'compact' ? 'small' : 'medium'}
          >
            {post.likesCount || 0} {post.likesCount === 1 ? 'Like' : 'Likes'}
          </Button>

          <Button
            startIcon={<Comment />}
            color="inherit"
            size={variant === 'compact' ? 'small' : 'medium'}
          >
            {post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
          </Button>

          <Button
            startIcon={<Share />}
            onClick={handleShare}
            color="inherit"
            size={variant === 'compact' ? 'small' : 'medium'}
          >
            Share
          </Button>

          <Button
            startIcon={isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            onClick={handleBookmark}
            color={isBookmarked ? 'primary' : 'inherit'}
            size={variant === 'compact' ? 'small' : 'medium'}
          >
            {isBookmarked ? 'Saved' : 'Save'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default PostDetail;