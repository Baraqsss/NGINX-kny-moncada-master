import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { shouldUseMockData } from '../utils/apiUtils';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Flag to use mock authentication (for development when backend is not available)
const USE_MOCK_AUTH = false;

// Mock admin user for development
const MOCK_ADMIN = {
  id: 'admin1',
  name: 'Admin User',
  username: 'admin',
  email: 'admin@example.com',
  role: 'Admin',
  isApproved: true
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          try {
            // Fetch the user data
            console.log('Fetching current user data...');
            const userData = await authAPI.getCurrentUser();
            console.log('User data received:', userData);
            
            // Store the user data in localStorage for backup
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
          } catch (fetchError) {
            console.error('Error fetching user data:', fetchError);
            
            // Only clear token if it's an authentication error
            if (fetchError.message.includes('401') || 
                fetchError.message.includes('unauthorized') || 
                fetchError.message.includes('token')) {
              console.warn('Authentication error, clearing token');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            } else {
              // For other errors (like network errors), keep the user logged in
              console.warn('Non-authentication error, trying to use stored user data');
              // Try to parse user from localStorage if available
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                try {
                  const parsedUser = JSON.parse(storedUser);
                  console.log('Using stored user data:', parsedUser);
                  setUser(parsedUser);
                } catch (e) {
                  console.error('Error parsing stored user:', e);
                }
              }
            }
          }
        } else {
          // No token found, ensure user is logged out
          console.log('No token found, user is logged out');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login with credentials:', credentials.username);
      // Use real login
      const data = await authAPI.login(credentials);
      
      console.log('Login successful, storing user data and token');
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to register user:', userData.username);
      // Use real register
      const data = await authAPI.register(userData);
      
      console.log('Registration successful, storing user data and token');
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin'); // Also clear any mock data flags
    setToken(null);
    setUser(null);
    return Promise.resolve();
  };

  // Update user data (for profile updates)
  const updateUserData = (updatedUser) => {
    console.log('Updating user data in context');
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Refresh token (for when token is close to expiry)
  const refreshToken = async () => {
    try {
      if (!token) return false;
      
      if (shouldUseMockData()) {
        // For mock data, just return success
        return true;
      }
      
      const response = await fetch('http://localhost:5000/api/users/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUserData,
    refreshToken,
    isAuthenticated: !!user,
    authChecked
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 