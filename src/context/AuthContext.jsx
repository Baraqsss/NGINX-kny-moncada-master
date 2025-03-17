import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Fetch the user data
            console.log('Fetching current user data...');
            const userData = await authAPI.getCurrentUser();
            console.log('User data received:', userData);
            setUser(userData);
          } catch (fetchError) {
            console.error('Error fetching user data:', fetchError);
            
            // Only clear token if it's an authentication error
            if (fetchError.message.includes('401') || 
                fetchError.message.includes('unauthorized') || 
                fetchError.message.includes('token')) {
              console.warn('Authentication error, clearing token');
              localStorage.removeItem('token');
              setUser(null);
            } else {
              // For other errors (like network errors), keep the user logged in
              console.warn('Non-authentication error, keeping user session');
              // Try to parse user from localStorage if available
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                try {
                  setUser(JSON.parse(storedUser));
                } catch (e) {
                  console.error('Error parsing stored user:', e);
                }
              }
            }
          }
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
      // Use real login
      const data = await authAPI.login(credentials);
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
      // Use real register
      const data = await authAPI.register(userData);
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    authChecked
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 