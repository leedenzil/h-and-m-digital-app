import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // API base URL
  const API_BASE_URL = 'http://localhost:5001';
  
  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      if (token) {
        try {
          // Verify token and get user data
          const decoded = jwtDecode(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            // Token is expired
            console.log('Token expired, logging out');
            logout();
          } else {
            // Token is valid, fetch user data
            const userData = await fetchUserData(token);
            setUser(userData);
          }
        } catch (error) {
          console.error('Token verification failed', error);
          logout();
        }
      }
      
      setLoading(false);
      setInitialized(true);
    };
    
    initializeAuth();
  }, [token]);
  
  // Fetch user data from the server
  const fetchUserData = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          'x-auth-token': authToken
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };
  
  // Register a new user
  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Update state
      setToken(data.token);
      
      // Fetch and set user data
      const userData = await fetchUserData(data.token);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };
  
  // Login user
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Update state
      setToken(data.token);
      
      // Fetch and set user data
      const userData = await fetchUserData(data.token);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Clear state
    setToken(null);
    setUser(null);
  };
  
  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }
      
      const updatedUser = await response.json();
      
      // Update user state
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };
  
  // Reset password
  const resetPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };
  
  // Context value
  const value = {
    user,
    token,
    loading,
    initialized,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated,
    resetPassword
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};