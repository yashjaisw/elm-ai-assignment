import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Error, Refresh } from '@mui/icons-material';

function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  fullHeight = true,
  variant = 'paper', // 'paper' | 'alert'
}) {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight={fullHeight ? '50vh' : 'auto'}
      p={4}
      textAlign="center"
    >
      <Box
        sx={{
          color: 'error.main',
          mb: 2,
        }}
      >
        <Error sx={{ fontSize: 64 }} />
      </Box>

      <Typography variant="h6" gutterBottom color="error">
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          {retryLabel}
        </Button>
      )}
    </Box>
  );

  if (variant === 'alert') {
    return (
      <Alert 
        severity="error" 
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          )
        }
      >
        <Typography variant="subtitle2">{title}</Typography>
        {message !== title && (
          <Typography variant="body2">{message}</Typography>
        )}
      </Alert>
    );
  }

  return <Paper>{content}</Paper>;
}

export default ErrorState;