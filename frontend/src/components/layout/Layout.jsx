import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
      
      {/* Footer could go here if needed */}
    </Box>
  );
}

export default Layout;