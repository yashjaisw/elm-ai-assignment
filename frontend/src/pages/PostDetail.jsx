import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack,
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
  Person,
  Send,
  AttachFile,
  Download,
} from '@mui/icons-material';
import { format } from 'date-fns';

import {
  fetchPostById,
  addComment,
  likePost,
  deletePost,
  clearCurrentPost,
  selectCurrentPost,
  selectCurrentPostLoading,
  selectCurrentPostError,
} from '../store/slices/postsSlice';
import { selectUser } from '../store/slices/authSlice';

function PostDetail() {
  const { postId, commentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const post = useSelector(selectCurrentPost);
  const loading = useSelector(selectCurrentPostLoading);
  const error = useSelector(selectCurrentPostError);
  const currentUser = useSelector(selectUser);

  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch post on component mount
  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  // Scroll to comment if commentId is provided
  useEffect(() => {
    if (commentId && post?.comments) {
      const timer = setTimeout(() => {
        const commentElement = document.getElementById(`comment-${commentId}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          commentElement.style.backgroundColor = '#fff3e0';
          setTimeout(() => {
            commentElement.style.backgroundColor = 'transparent';
          }, 2000);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [commentId, post]);

  // Check if current user liked the post
  useEffect(() => {
    if (post && currentUser) {
      const userLike = post.likes?.find(like => like.user === currentUser._id);
      setIsLiked(!!userLike);
    }
  }, [post, currentUser]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!currentUser) {
      enqueueSnackbar('Please login to like posts', { variant: 'warning' });
      return;
    }

    setIsLiked(!isLiked); // Optimistic update

    try {
      await dispatch(likePost(postId)).unwrap();
    } catch (error) {
      setIsLiked(isLiked); // Revert on error
      enqueueSnackbar(error || 'Failed to update like', { variant: 'error' });
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      enqueueSnackbar('Please enter a comment', { variant: 'warning' });
      return;
    }

    if (!currentUser) {
      enqueueSnackbar('Please login to comment', { variant: 'warning' });
      return;
    }

    setSubmittingComment(true);

    try {
      await dispatch(addComment({ 
        postId, 
        content: commentText.trim() 
      })).unwrap();
      
      setCommentText('');
      enqueueSnackbar('Comment added successfully!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error || 'Failed to add comment', { variant: 'error' });
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(deletePost(postId)).unwrap();
      enqueueSnackbar('Post deleted successfully', { variant: 'success' });
      navigate('/posts');
    } catch (error) {
      enqueueSnackbar(error || 'Failed to delete post', { variant: 'error' });
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar('Link copied to clipboard!', { variant: 'success' });
    }
  };

  // Handle file download (mock implementation)
  const handleFileDownload = (attachment) => {
    enqueueSnackbar(`Downloading ${attachment.originalName}...`, { variant: 'info' });
    // In a real app, you'd download from the actual file URL
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="text" width="80%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button onClick={() => navigate('/posts')}>
              Back to Posts
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // No post found
  if (!post) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Post not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The post you're looking for doesn't exist or has been deleted.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/posts')}>
          Back to Posts
        </Button>
      </Box>
    );
  }

  const isOwner = currentUser && post.author?._id === currentUser._id;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/posts');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Posts
        </Link>
        <Typography color="text.primary">
          {post?.title?.length > 50 ? `${post.title.substring(0, 50)}...` : post?.title || 'Post'}
        </Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/posts')}
        sx={{ mb: 3 }}
      >
        Back to Posts
      </Button>

      {/* Post Content */}
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
        {/* Post Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {post?.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Avatar sx={{ width: 40, height: 40 }}>
              {post?.author?.firstName?.[0]}{post?.author?.lastName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {post?.author?.firstName} {post?.author?.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {post?.createdAt ? format(new Date(post.createdAt), 'MMMM dd, yyyy • h:mm a') : ''}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {post?.views || 0} views
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {post?.readingTime || 1} min read
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {currentUser?._id === post?.author?._id && (
              <>
                <IconButton
                  color="primary"
                  onClick={() => navigate(`/posts/${postId}/edit`)}
                  title="Edit post"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={handleDeletePost}
                  title="Delete post"
                >
                  <Delete />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Category and Tags */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip 
            label={post?.category} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          />
          {post?.tags?.map(tag => (
            <Chip 
              key={tag} 
              label={`#${tag}`} 
              size="small" 
              variant="outlined" 
            />
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Post Content */}
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.8,
            fontSize: '1.1rem',
            whiteSpace: 'pre-wrap',
            mb: 3 
          }}
        >
          {post?.content}
        </Typography>

        {/* Attachments */}
        {post?.attachments && post.attachments.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attachments
            </Typography>
            {post.attachments.map((attachment, index) => (
              <Card key={index} sx={{ mb: 1 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
          <Button
            startIcon={isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
            onClick={handleLikeToggle}
            color={isLiked ? 'primary' : 'inherit'}
          >
            {post?.likesCount || 0} {post?.likesCount === 1 ? 'Like' : 'Likes'}
          </Button>

          <Button
            startIcon={<Comment />}
            color="inherit"
            onClick={() => document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {post?.comments?.length || 0} {post?.comments?.length === 1 ? 'Comment' : 'Comments'}
          </Button>

          <Button
            startIcon={<Share />}
            onClick={handleShare}
            color="inherit"
          >
            Share
          </Button>

          <Button
            startIcon={isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            onClick={() => setIsBookmarked(!isBookmarked)}
            color={isBookmarked ? 'primary' : 'inherit'}
          >
            {isBookmarked ? 'Saved' : 'Save'}
          </Button>
        </Box>
      </Paper>

      {/* Comments Section */}
      <Paper sx={{ p: { xs: 2, md: 3 } }} id="comment-section">
        <Typography variant="h6" gutterBottom>
          Comments ({post?.comments?.length || 0})
        </Typography>

        {/* Add Comment Form */}
        {currentUser ? (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={submittingComment}
                />
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={submittingComment || !commentText.trim()}
                    startIcon={<Send />}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Button onClick={() => navigate('/login')}>Login</Button> to post a comment.
          </Alert>
        )}

        {/* Comments List */}
        {post?.comments && post.comments.length > 0 ? (
          <Box>
            {post.comments.map((comment, index) => (
              <Box
                key={comment._id || index}
                id={`comment-${comment._id}`}
                sx={{ 
                  mb: 3, 
                  pb: 2, 
                  borderBottom: index < post.comments.length - 1 ? 1 : 0, 
                  borderColor: 'divider',
                  transition: 'background-color 0.3s ease'
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" component="span">
                        {comment.author?.firstName} {comment.author?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        {format(new Date(comment.createdAt || Date.now()), 'MMM dd, yyyy • h:mm a')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Typography>

                    {/* Comment replies would go here in a full implementation */}
                    {comment.replies && comment.replies.length > 0 && (
                      <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                        {comment.replies.map((reply, replyIndex) => (
                          <Box key={reply._id || replyIndex} sx={{ mb: 1 }}>
                            <Typography variant="caption" fontWeight="medium">
                              {reply.author?.firstName} {reply.author?.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {reply.content}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default PostDetail;