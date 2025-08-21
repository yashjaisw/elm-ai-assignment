import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard,
  Article,
  Person,
  Logout,
  AccountCircle,
} from '@mui/icons-material';

import { logoutUser } from '../../store/slices/authSlice';
import { selectUser } from '../../store/slices/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  
  const user = useSelector(selectUser);
  
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle profile menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      enqueueSnackbar('Logged out successfully', { variant: 'success' });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      enqueueSnackbar('Logout failed', { variant: 'error' });
    }
    handleMenuClose();
  };

  // Navigation helpers
  const navigateTo = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Dashboard sx={{ mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              fontWeight: 700, 
              cursor: 'pointer',
              color: 'text.primary',
            }}
            onClick={() => navigate('/posts')}
          >
            Dashboard
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<Article />}
            onClick={() => navigate('/posts')}
            sx={{
              color: isActiveRoute('/posts') ? 'primary.main' : 'text.secondary',
              fontWeight: isActiveRoute('/posts') ? 600 : 400,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Posts
          </Button>
          <Button
            color="inherit"
            startIcon={<Person />}
            onClick={() => navigate('/my_posts')}
            sx={{
              color: isActiveRoute('/my_posts') ? 'primary.main' : 'text.secondary',
              fontWeight: isActiveRoute('/my_posts') ? 600 : 400,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            My Posts
          </Button>
        </Box>

        {/* User Profile Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* User Info */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>

          {/* Profile Menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{
              p: 0.5,
              border: '2px solid',
              borderColor: 'grey.200',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {getUserInitials()}
            </Avatar>
          </IconButton>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigateTo('/profile')}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;