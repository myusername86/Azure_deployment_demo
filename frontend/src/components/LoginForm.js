import React, { useState } from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InputField from './reusable/InputField';
import PrimaryButton from './reusable/PrimaryButton';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loginStatus, setLoginStatus] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginStatus(null);
    
    if (validateForm()) {
      // Simulate login process
      console.log('Login data:', formData);
      setLoginStatus('success');
      
      // Reset form after successful login
      setTimeout(() => {
        setFormData({ userId: '', password: '' });
        setLoginStatus(null);
      }, 2000);
    } else {
      setLoginStatus('error');
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        padding: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 2,
        }}
      >
        <LockOutlinedIcon sx={{ color: 'white', fontSize: 32 }} />
      </Box>
      
      <Typography component="h1" variant="h4" gutterBottom fontWeight="bold">
        Login
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Enter your credentials to access your account
      </Typography>

      {loginStatus === 'success' && (
        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
          Login successful! Welcome back.
        </Alert>
      )}

      {loginStatus === 'error' && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          Please fix the errors below.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <InputField
          label="User ID"
          name="userId"
          type="text"
          value={formData.userId}
          onChange={(e) => handleInputChange('userId', e.target.value)}
          error={!!errors.userId}
          helperText={errors.userId}
          placeholder="Enter your user ID"
          autoComplete="username"
          autoFocus
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <PrimaryButton
          type="submit"
          fullWidth
          text="Sign In"
        />
      </Box>
    </Paper>
  );
};

export default LoginForm;
