import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Edit,
  Save,
  Cancel,
  Lock,
  Delete,
  Analytics,
  PhotoCamera,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { selectUser, updateUserProfile } from '../store/slices/authSlice';
import usersService from '../services/usersService';

function Profile() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const user = useSelector(selectUser);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    profilePicture: '',
  });
  
  // Password change dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setStatsLoading(true);
        const response = await usersService.getUserStats();
        setUserStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Don't show error to user as stats are optional
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Handle form submission
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        enqueueSnackbar('First name and last name are required', { variant: 'error' });
        return;
      }

      const response = await usersService.updateProfile(formData);
      
      // Update Redux state with new user data
      dispatch(updateUserProfile(response.data.user));
      
      setIsEditing(false);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      
    } catch (error) {
      console.error('Profile update error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update profile',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    try {
      // Validation
      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        enqueueSnackbar('All password fields are required', { variant: 'error' });
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        enqueueSnackbar('New passwords do not match', { variant: 'error' });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        enqueueSnackbar('New password must be at least 6 characters', { variant: 'error' });
        return;
      }

      setPasswordLoading(true);
      
      await usersService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      
    } catch (error) {
      console.error('Password change error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to change password',
        { variant: 'error' }
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        enqueueSnackbar('Password is required to delete account', { variant: 'error' });
        return;
      }

      setDeleteLoading(true);
      
      await usersService.deleteAccount(deletePassword);
      
      enqueueSnackbar('Account has been deactivated', { variant: 'info' });
      
      // In a real app, you might redirect to login or show a goodbye message
      setDeleteDialogOpen(false);
      
    } catch (error) {
      console.error('Account deletion error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete account',
        { variant: 'error' }
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
      });
    }
    setIsEditing(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h4" component="h1">
                My Profile
              </Typography>
              <Chip
                label={user.isActive ? 'Active' : 'Inactive'}
                color={user.isActive ? 'success' : 'default'}
                variant="outlined"
              />
            </Box>

            <Box display="flex" alignItems="center" gap={3}>
              <Box position="relative">
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: '2rem',
                    bgcolor: 'primary.main'
                  }}
                  src={formData.profilePicture}
                >
                  {getUserInitials()}
                </Avatar>
                {isEditing && (
                  <Tooltip title="Change Profile Picture">
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6">
                Profile Information
              </Typography>
              
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  disabled={!isEditing}
                />
              </Grid>

                              <Grid item xs={12}>
                  <TextField
                    label="Profile Picture URL"
                    value={formData.profilePicture}
                    onChange={handleInputChange('profilePicture')}
                    placeholder="https://example.com/avatar.jpg"
                    helperText="Enter a URL for your profile picture"
                    disabled={!isEditing} // Optional: keep it read-only unless editing
                  />
                </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={!isEditing}
                  type="email"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Bio"
                  value={formData.bio}
                  onChange={handleInputChange('bio')}
                  disabled={!isEditing}
                  multiline
                  rows={4}
                  placeholder="Tell us about yourself..."
                  helperText={`${formData.bio.length}/500 characters`}
                />
              </Grid>


              
            </Grid>
          </Paper>
        </Grid>

        {/* User Stats & Actions */}
        <Grid item xs={12} md={4}>
          {/* User Statistics */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Analytics sx={{ mr: 1 }} />
              Account Statistics
            </Typography>
            
            {statsLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : userStats ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {userStats.loginCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Logins
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {userStats.daysSinceJoining}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Days Active
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {userStats.totalPosts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Posts Created
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {userStats.totalLikes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Likes Received
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">
                Unable to load statistics
              </Typography>
            )}
          </Paper>

          {/* Account Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Actions
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Lock />}
                onClick={() => setPasswordDialogOpen(true)}
                fullWidth
              >
                Change Password
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                fullWidth
              >
                Delete Account
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              helperText="At least 6 characters"
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} disabled={passwordLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={passwordLoading}
            startIcon={passwordLoading ? <CircularProgress size={16} /> : null}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle color="error.main">Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will deactivate your account. All your posts will remain but you won't be able to log in.
          </Alert>
          <TextField
            label="Enter your password to confirm"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;