import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingSpinner({ 
  message = 'Loading...', 
  size = 40, 
  fullHeight = true,
  color = 'primary' 
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight={fullHeight ? '60vh' : 'auto'}
      py={fullHeight ? 0 : 4}
      gap={2}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          textAlign="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default LoadingSpinner;