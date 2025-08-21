import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Inbox } from '@mui/icons-material';

function EmptyState({
  title = 'No data available',
  description = '',
  actionLabel,
  onAction,
  icon,
  fullHeight = true,
}) {
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullHeight ? '50vh' : 'auto',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          color: 'text.disabled',
          mb: 2,
        }}
      >
        {icon || <Inbox sx={{ fontSize: 64 }} />}
      </Box>

      <Typography variant="h6" gutterBottom color="text.secondary">
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}

export default EmptyState;