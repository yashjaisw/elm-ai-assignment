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
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard,
  Article,
  Person,
  Logout,
  AccountCircle,
  Menu as MenuIcon,
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Handle profile menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(prev => !prev);
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

  const displayName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User';

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
        {/* Mobile: Hamburger */}
        <IconButton
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 1 }}
          aria-label="open navigation"
        >
          <MenuIcon sx={{ color: 'primary.main' }} />
        </IconButton>
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

        {/* User Profile Section (desktop only) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          {/* User Name */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {displayName}
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

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
        PaperProps={{ sx: { width: 260, bgcolor: 'primary.main', color: 'common.white' } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} role="presentation" onClick={handleDrawerToggle}>
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Hello,</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{displayName}</Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <List>
            <ListItemButton
              onClick={() => navigate('/posts')}
              selected={isActiveRoute('/posts')}
              sx={{
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.12)' },
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Article />
              </ListItemIcon>
              <ListItemText primary="Posts" />
            </ListItemButton>
            <ListItemButton
              onClick={() => navigate('/my_posts')}
              selected={isActiveRoute('/my_posts')}
              sx={{
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.12)' },
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Person />
              </ListItemIcon>
              <ListItemText primary="My Posts" />
            </ListItemButton>
            <ListItemButton
              onClick={() => navigate('/profile')}
              selected={isActiveRoute('/profile')}
              sx={{
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.12)' },
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <List>
            <ListItemButton onClick={handleLogout} sx={{ '&:hover': { bgcolor: 'primary.dark' } }}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default Navbar;