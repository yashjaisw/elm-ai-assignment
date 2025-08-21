import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { BugReport, Refresh, Home } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // You can also log the error to an error reporting service here
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            textAlign="center"
          >
            <Paper
              sx={{
                p: 4,
                maxWidth: 600,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  color: 'error.main',
                  mb: 3,
                }}
              >
                <BugReport sx={{ fontSize: 80 }} />
              </Box>

              <Typography variant="h4" gutterBottom color="error">
                Oops! Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Error Details (Development):
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 200,
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  mt: 4,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                >
                  Go Home
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 3, display: 'block' }}
              >
                If this problem persists, please contact support.
              </Typography>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;