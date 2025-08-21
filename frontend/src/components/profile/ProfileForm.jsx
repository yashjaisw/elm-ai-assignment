import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Save,
  Cancel,
  CameraAlt,
  Edit,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { updateUserProfile, selectUser, selectAuthLoading } from '../../store/slices/authSlice';

function ProfileForm() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const initialData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
      };
      setFormData(initialData);
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    if (user) {
      const hasChanged = (
        formData.firstName !== (user.firstName || '') ||
        formData.lastName !== (user.lastName || '') ||
        formData.bio !== (user.bio || '')
        // Note: email is typically not editable
      );
      setHasChanges(hasChanged);
    }
  }, [formData, user]);

  // Handle form field changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'First name must not exceed 50 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must not exceed 50 characters';
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must not exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      enqueueSnackbar('Please fix the errors in the form', { variant: 'error' });
      return;
    }

    try {
      // Only send changed fields
      const updatedFields = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim(),
      };

      await dispatch(updateUserProfile(updatedFields)).unwrap();
      
      setIsEditing(false);
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Profile update error:', error);
      enqueueSnackbar(error || 'Failed to update profile', { variant: 'error' });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  // Handle profile picture upload (mock)
  const handleProfilePictureUpload = () => {
    enqueueSnackbar('Profile picture upload coming soon!', { variant: 'info' });
  };

  if (!user) {
    return (
      <Alert severity="error">
        Unable to load user profile. Please try refreshing the page.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{ 
                width: 100, 
                height: 100,
                fontSize: '2rem',
                bgcolor: 'primary.main'
              }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Button
              size="small"
              variant="contained"
              sx={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                minWidth: 32,
                width: 32,
                height: 32,
                borderRadius: '50%',
                p: 0
              }}
              onClick={handleProfilePictureUpload}
            >
              <CameraAlt fontSize="small" />
            </Button>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip 
                label={user.role} 
                size="small" 
                color="primary" 
                sx={{ textTransform: 'capitalize' }}
              />
              <Chip 
                label="Active" 
                size="small" 
                color="success" 
              />
            </Box>
          </Box>

          <Button
            variant={isEditing ? "outlined" : "contained"}
            startIcon={<Edit />}
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        </Box>
      </Paper>

      {/* Profile Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {user.loginCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Logins
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Posts Created
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {user.lastLoginAt 
                  ? format(new Date(user.lastLoginAt), 'MMM dd')
                  : 'Never'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Login
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profile Form */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>
        
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Personal Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              disabled={!isEditing || loading}
              InputProps={{
                startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              disabled={!isEditing || loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              value={formData.email}
              disabled={true} // Email is typically not editable
              InputProps={{
                startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />,
              }}
              helperText="Email address cannot be changed. Contact support if needed."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              value={formData.bio}
              onChange={handleChange('bio')}
              error={!!formErrors.bio}
              helperText={
                formErrors.bio || 
                `${formData.bio.length}/500 characters • Tell others about yourself`
              }
              disabled={!isEditing || loading}
              multiline
              rows={4}
              placeholder="Write a short bio about yourself..."
            />
          </Grid>

          {/* Account Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Account Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Member Since"
              value={format(new Date(user.createdAt), 'MMMM dd, yyyy')}
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Updated"
              value={format(new Date(user.updatedAt), 'MMMM dd, yyyy')}
              disabled
            />
          </Grid>

          {/* Action Buttons */}
          {isEditing && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSave}
                  disabled={loading || !hasChanges}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>

              {hasChanges && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You have unsaved changes. Click "Save Changes" to update your profile.
                </Alert>
              )}
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}

export default ProfileForm;