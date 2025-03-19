/**
 * Utility functions for making API requests
 */

/**
 * Check if we should use mock data for development
 * @returns {boolean} - Whether to use mock data
 */
export const shouldUseMockData = () => {
  // This could be set based on environment variables or a global config
  return process.env.NODE_ENV === 'development' && !isBackendAvailable();
};

// Simple cache to avoid checking backend availability too frequently
let backendAvailabilityCache = {
  isAvailable: null,
  lastChecked: null
};

/**
 * Check if backend is available
 * @returns {boolean} - Whether the backend is available
 */
const isBackendAvailable = async () => {
  // If we've checked in the last 30 seconds, use cached result
  const now = Date.now();
  if (backendAvailabilityCache.lastChecked && 
      now - backendAvailabilityCache.lastChecked < 30000) {
    return backendAvailabilityCache.isAvailable;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/health', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // Short timeout to avoid hanging
      signal: AbortSignal.timeout(2000)
    });
    
    backendAvailabilityCache = {
      isAvailable: response.ok,
      lastChecked: now
    };
    
    return response.ok;
  } catch (error) {
    backendAvailabilityCache = {
      isAvailable: false,
      lastChecked: now
    };
    return false;
  }
};

/**
 * Get mock data for a specific endpoint
 * @param {string} url - The API endpoint URL
 * @returns {Object|null} - Mock data or null if no mock data exists
 */
export const getMockData = (url) => {
  // Mock data for admin dashboard stats
  if (url.includes('/admin/stats')) {
    return {
      totalUsers: 15,
      pendingUsers: 3,
      totalEvents: 8,
      totalAnnouncements: 12,
      totalDonations: 25
    };
  }
  
  // Mock data for users
  if (url.includes('/users') && !url.includes('/login') && !url.includes('/register') && !url.includes('/me')) {
    return [
      { id: '1', name: 'Admin User', username: 'admin', email: 'admin@example.com', role: 'Admin', isApproved: true },
      { id: '2', name: 'John Doe', username: 'johndoe', email: 'john@example.com', role: 'Member', isApproved: true },
      { id: '3', name: 'Jane Smith', username: 'janesmith', email: 'jane@example.com', role: 'Member', isApproved: false },
      { id: '4', name: 'Bob Johnson', username: 'bjohnson', email: 'bob@example.com', role: 'Member', isApproved: true },
      { id: '5', name: 'Alice Brown', username: 'abrown', email: 'alice@example.com', role: 'Member', isApproved: false }
    ];
  }
  
  // Mock data for events
  if (url.includes('/events')) {
    return [
      { id: '1', title: 'Community Cleanup', description: 'Join us for a community cleanup event', date: '2023-12-15', location: 'City Park', image: 'https://via.placeholder.com/300' },
      { id: '2', title: 'Fundraising Gala', description: 'Annual fundraising gala', date: '2023-12-20', location: 'Grand Hotel', image: 'https://via.placeholder.com/300' },
      { id: '3', title: 'Youth Leadership Workshop', description: 'Workshop for young leaders', date: '2024-01-10', location: 'Community Center', image: 'https://via.placeholder.com/300' },
      { id: '4', title: 'Environmental Awareness Day', description: 'Learn about environmental conservation', date: '2024-01-22', location: 'Public Library', image: 'https://via.placeholder.com/300' }
    ];
  }
  
  // Mock data for announcements
  if (url.includes('/announcements')) {
    return mockAnnouncementsData;
  }
  
  // Mock data for donations
  if (url.includes('/donations')) {
    return [
      { id: '1', amount: 100, donor: 'Anonymous', date: '2023-12-01', campaign: 'General Fund' },
      { id: '2', amount: 250, donor: 'John Doe', date: '2023-12-03', campaign: 'Youth Programs' },
      { id: '3', amount: 500, donor: 'ABC Corporation', date: '2023-12-05', campaign: 'Community Projects' },
      { id: '4', amount: 75, donor: 'Jane Smith', date: '2023-12-10', campaign: 'General Fund' },
      { id: '5', amount: 1000, donor: 'XYZ Foundation', date: '2023-12-15', campaign: 'Scholarship Fund' }
    ];
  }
  
  // Mock data for current user
  if (url.includes('/users/me')) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      return {
        id: 'admin1',
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        role: 'Admin',
        isApproved: true,
        phone: '555-123-4567',
        birthday: '1985-05-15',
        organization: 'Kaya Natin Youth',
        committee: 'Executive Board',
        age: 38,
        createdAt: '2022-01-01',
        address: {
          street: '123 Admin Blvd',
          city: 'Moncada',
          state: 'Tarlac',
          zipCode: '2400',
          country: 'Philippines'
        },
        profilePicture: "https://ui-avatars.com/api/?name=Admin+User&background=6955A4&color=fff&size=200"
      };
    } else {
      // Get username from local storage if available
      const storedUser = localStorage.getItem('user');
      let username = 'testuser';
      let name = 'Test User';
      
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          username = parsed.username || username;
          name = parsed.name || name;
        } catch (e) {
          console.error('Error parsing stored user when creating mock profile:', e);
        }
      }
      
      return {
        id: '1',
        name: name,
        username: username,
        email: `${username}@example.com`,
        role: 'Member',
        isApproved: true,
        phone: '555-987-6543',
        birthday: '1995-08-23',
        organization: 'Kaya Natin Youth',
        committee: 'Programs and Events',
        age: 28,
        createdAt: '2023-03-15',
        address: {
          street: '456 Member St',
          city: 'Moncada',
          state: 'Tarlac',
          zipCode: '2400',
          country: 'Philippines'
        },
        profilePicture: `https://ui-avatars.com/api/?name=${name.replace(/ /g, '+')}&background=6955A4&color=fff&size=200`
      };
    }
  }
  
  // Mock data for user profile update
  if (url.includes('/users/profile') && url.includes('PUT')) {
    // Return the request body as the response
    // This would need to be handled in the actual API call logic
    return { success: true, message: 'Profile updated successfully' };
  }
  
  // No mock data for this endpoint
  return null;
};

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Request options
 * @returns {Promise} - The fetch promise
 */
export const apiRequest = async (url, options = {}) => {
  // Check if we should use mock data
  if (shouldUseMockData()) {
    const mockData = getMockData(url);
    if (mockData) {
      console.log(`Using mock data for ${url}`, mockData);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData;
    }
  }

  // Get the authentication token from localStorage
  const token = localStorage.getItem('token');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // If FormData, remove Content-Type to let browser set it with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  
  // Merge options with headers
  const requestOptions = {
    ...options,
    headers
  };
  
  try {
    console.log(`[API Request] ${options.method || 'GET'} ${url}`);
    
    // Set up a timeout for the request (10 seconds)
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set timeout that properly aborts the fetch
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);
    
    // Add signal to request options
    requestOptions.signal = signal;
    
    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Handle the response
    if (!response.ok) {
      // Try to parse error message from response
      try {
        const errorData = await response.json();
        console.error(`[API Error] ${response.status} ${response.statusText}:`, errorData);
        
        // Create an error with the message from the API
        const error = new Error(errorData.message || `API Error: ${response.statusText}`);
        error.response = { status: response.status, data: errorData };
        throw error;
      } catch (jsonError) {
        // If parsing JSON fails, create a generic error
        console.error(`[API Error] ${response.status} ${response.statusText} (failed to parse error)`);
        const error = new Error(`API Error: ${response.status} ${response.statusText}`);
        error.response = { status: response.status };
        throw error;
      }
    }
    
    // Check if the response is empty
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`[API Response] ${url}:`, data);
      return data;
    } else {
      console.log(`[API Response] ${url}: Non-JSON response`);
      // For non-JSON responses, return the response object
      return { success: true, status: response.status };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[API Timeout] Request to ${url} timed out after 10 seconds`);
      throw new Error(`Request timed out. Please check your connection and try again.`);
    }
    
    if (!error.response) {
      console.error(`[API Network Error] ${url}:`, error);
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('Network request failed') || 
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('Network Error')) {
        throw new Error(`Cannot connect to the server. Please check your connection and try again.`);
      }
      error.message = `Network error: ${error.message}`;
    }
    throw error;
  }
};

/**
 * Perform a GET request
 * @param {string} url - The endpoint URL
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const get = (url, options = {}) => {
  return apiRequest(url, {
    method: 'GET',
    ...options
  });
};

/**
 * Perform a POST request
 * @param {string} url - The endpoint URL
 * @param {Object} data - The data to send
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const post = (url, data = {}, options = {}) => {
  // Handle FormData separately
  const body = data instanceof FormData ? data : JSON.stringify(data);
  
  return apiRequest(url, {
    method: 'POST',
    body,
    ...options
  });
};

/**
 * Perform a PUT request
 * @param {string} url - The endpoint URL
 * @param {Object} data - The data to send
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const put = (url, data = {}, options = {}) => {
  // Handle FormData separately
  const body = data instanceof FormData ? data : JSON.stringify(data);
  
  return apiRequest(url, {
    method: 'PUT',
    body,
    ...options
  });
};

/**
 * Perform a PATCH request
 * @param {string} url - The endpoint URL
 * @param {Object} data - The data to send
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const patch = (url, data = {}, options = {}) => {
  // Handle FormData separately
  const body = data instanceof FormData ? data : JSON.stringify(data);
  
  return apiRequest(url, {
    method: 'PATCH',
    body,
    ...options
  });
};

/**
 * Perform a DELETE request
 * @param {string} url - The endpoint URL
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const del = (url, options = {}) => {
  return apiRequest(url, {
    method: 'DELETE',
    ...options
  });
};

/**
 * Upload a file with form data
 * @param {string} url - The API endpoint URL
 * @param {FormData} formData - The form data to send
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const uploadFile = (url, formData, options = {}) => {
  // For file uploads, don't set Content-Type header
  // The browser will set it with the correct boundary
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return apiRequest(url, {
    method: 'POST',
    body: formData,
    headers,
    ...options,
  });
};

/**
 * Update a file with form data
 * @param {string} url - The API endpoint URL
 * @param {FormData} formData - The form data to send
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const updateFile = (url, formData, options = {}) => {
  // For file uploads, don't set Content-Type header
  // The browser will set it with the correct boundary
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return apiRequest(url, {
    method: 'PUT',
    body: formData,
    headers,
    ...options,
  });
};

// Add mock announcements data for development
export const mockAnnouncementsData = {
  status: 'success',
  data: {
    announcements: [
      {
        _id: '1',
        title: 'Welcome to our community!',
        content: 'We\'re excited to have you join our organization. Stay tuned for upcoming events and volunteer opportunities.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        createdBy: { name: 'Admin' },
        priority: 'high'
      },
      {
        _id: '2',
        title: 'Monthly Meeting Scheduled',
        content: 'Our next monthly meeting will be held on the 15th. Please make sure to attend as we\'ll be discussing important topics.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        createdBy: { name: 'Admin' },
        priority: 'medium'
      },
      {
        _id: '3',
        title: 'Fundraising Campaign Update',
        content: 'We\'ve reached 75% of our fundraising goal! Thank you to everyone who has contributed so far. We still need your support to reach our target.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), 
        createdBy: { name: 'Fundraising Committee' },
        priority: 'medium'
      }
    ]
  }
}; 