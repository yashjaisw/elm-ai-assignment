import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login,
} from '@mui/icons-material';

function LoginForm({ 
  onSubmit, 
  loading = false, 
  error = null, 
  onToggleMode = null,
  showToggle = true 
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Email Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange('email')}
        error={!!formErrors.email}
        helperText={formErrors.email}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Password Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleChange('password')}
        error={!!formErrors.password}
        helperText={formErrors.password}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={loading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Forgot Password Link */}
      <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
        <Link
          href="#"
          variant="body2"
          onClick={(e) => {
            e.preventDefault();
            // Handle forgot password
            console.log('Forgot password clicked');
          }}
        >
          Forgot password?
        </Link>
      </Box>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 2, py: 1.5 }}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <Login />}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>

      {/* Toggle to Register */}
      {showToggle && onToggleMode && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              href="#"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onToggleMode();
              }}
              sx={{ fontWeight: 'medium' }}
            >
              Sign up here
            </Link>
          </Typography>
        </Box>
      )}

      {/* Additional Options */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          By signing in, you agree to our{' '}
          <Link href="#" variant="caption" underline="hover">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" variant="caption" underline="hover">
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default LoginForm;