import { createContext, useState, useEffect, useContext, useRef } from 'react';
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
  // Initialize state from localStorage if available
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [token, setToken] = useState(storedToken || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Use a ref to prevent multiple simultaneous auth checks
  const isCheckingAuth = useRef(false);
  // Track last check time to limit frequency
  const lastCheckTime = useRef(0);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      // Skip if already checking or if checked recently (within 60 seconds)
      const now = Date.now();
      if (isCheckingAuth.current || (now - lastCheckTime.current < 60000)) {
        return;
      }
      
      isCheckingAuth.current = true;
      lastCheckTime.current = now;
      
      try {
        if (storedToken) {
          try {
            // Only fetch user data if not already available or on initial mount
            if (!authChecked || !user) {
              // Fetch the user data
              console.log('Fetching current user data...');
              const userData = await authAPI.getCurrentUser();
              console.log('User data received:', userData);
              
              if (userData) {
                // Update stored user data
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
              } else {
                // If no user data, clear auth state
                console.warn('No user data received, clearing auth state');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
              }
            }
          } catch (fetchError) {
            console.error('Error fetching user data:', fetchError);
            
            if (fetchError.message.includes('401') || 
                fetchError.message.includes('unauthorized') || 
                fetchError.message.includes('token')) {
              console.warn('Authentication error, clearing token');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            } else if (storedUser) {
              // For non-auth errors, keep using stored user data
              console.warn('Using stored user data due to non-auth error');
              setUser(JSON.parse(storedUser));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
        setAuthChecked(true);
        isCheckingAuth.current = false;
      }
    };

    checkLoggedIn();
  }, [storedToken]); // Remove storedUser from dependencies to prevent loops

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login with credentials:', credentials.username);
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
      // Clear any existing data on login error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
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
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setToken(null);
    setUser(null);
    setError(null);
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