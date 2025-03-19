import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * A wrapper component to protect routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading || !initialized) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh' 
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying authentication...
        </Typography>
      </Box>
    );
  }
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated()) {
    // Pass the current location to the login page so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;