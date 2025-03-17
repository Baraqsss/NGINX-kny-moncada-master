import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TestAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiUrl, setApiUrl] = useState('');
  
  const { login, user, loading, error, authChecked } = useAuth();
  const navigate = useNavigate();

  // Check backend connection on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Try to fetch from the backend health check endpoint
        const response = await fetch('http://localhost:50001/api/health');
        if (response.ok) {
          setBackendStatus('connected');
          setApiUrl('http://localhost:50001/api');
        } else {
          setBackendStatus('error');
          setMessage('Backend responded with an error: ' + response.status);
        }
      } catch (err) {
        setBackendStatus('disconnected');
        setMessage('Cannot connect to backend: ' + err.message);
      }
    };
    
    checkBackend();
  }, []);

  // Check if user is already logged in and is admin
  useEffect(() => {
    if (authChecked && user) {
      if (user.role.toLowerCase() === 'admin') {
        setMessage(`Already logged in as admin: ${user.username}`);
        setStatus('success');
      } else {
        setMessage(`Logged in as ${user.role}, but admin access is required`);
        setStatus('error');
      }
    }
  }, [user, authChecked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Attempting to log in...');
    
    try {
      const userData = await login({ username, password });
      console.log('Login response:', userData);
      
      if (userData && userData.role && userData.role.toLowerCase() === 'admin') {
        setMessage(`Successfully logged in as admin: ${userData.username}`);
        setStatus('success');
        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else {
        setMessage(`Logged in as ${userData?.role || 'unknown role'}, but admin access is required`);
        setStatus('error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage(`Login failed: ${err.message || 'Unknown error'}`);
      setStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getBackendStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'error': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-violet-800">Admin Authentication Test</h1>
        
        <div className="mb-6 p-3 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">System Status:</h2>
          <p className={`mb-1 ${getBackendStatusColor()}`}>
            Backend: {backendStatus === 'checking' ? 'Checking...' : backendStatus}
            {backendStatus === 'connected' && ` (${apiUrl})`}
          </p>
          <p className="mb-1">Auth State: {loading ? 'Loading...' : (authChecked ? 'Checked' : 'Not checked')}</p>
          <p className="mb-1">Current User: {user ? `${user.username} (${user.role})` : 'Not logged in'}</p>
        </div>
        
        {message && (
          <div className={`mb-6 p-3 rounded ${getStatusColor()} bg-opacity-10`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              placeholder="admin"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              placeholder="admin123"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading' || loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${
              (status === 'loading' || loading) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {status === 'loading' ? 'Logging in...' : 'Test Admin Login'}
          </button>
        </form>
        
        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-1"><strong>Test Credentials:</strong></p>
          <p className="mb-1">Username: admin</p>
          <p className="mb-1">Password: admin123</p>
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-violet-600 hover:text-violet-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAdmin; 