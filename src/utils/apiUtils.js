/**
 * Utility functions for making API requests
 */

/**
 * Check if we should use mock data for development
 * @returns {boolean} - Whether to use mock data
 */
export const shouldUseMockData = () => {
  return false; // Set to false to use real backend API
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
    return [
      { 
        id: '1', 
        title: 'New Website Launch', 
        message: 'We are excited to announce our new website!', 
        createdAt: '2023-12-01', 
        attachment: null 
      },
      { 
        id: '2', 
        title: 'Holiday Schedule', 
        message: 'Our office will be closed during the holidays from December 24th to January 2nd. For urgent matters, please contact our emergency line at 555-123-4567.', 
        createdAt: '2023-12-05',
        attachment: null 
      },
      { 
        id: '3', 
        title: 'New Board Members', 
        message: 'We welcome our new board members for the upcoming year: Jane Smith, John Doe, and Maria Garcia. They bring a wealth of experience in community development and nonprofit management.', 
        createdAt: '2023-12-10',
        attachment: null 
      },
      { 
        id: '4', 
        title: 'Annual Report Available', 
        message: 'Our annual report is now available for download. It includes our financial statements, program outcomes, and plans for the upcoming year.', 
        createdAt: '2023-12-15', 
        attachment: 'annual-report.pdf' 
      }
    ];
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
        isApproved: true
      };
    } else {
      return {
        id: '1',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        role: 'Member',
        isApproved: true
      };
    }
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
  
  // Merge options with headers
  const requestOptions = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // Handle non-2xx responses
    if (!response.ok) {
      // Try to parse error message from response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use status text
        throw new Error(response.statusText || 'An error occurred');
      }
      
      // Throw error with message from API if available
      throw new Error(
        errorData.message || 
        errorData.error || 
        'An error occurred'
      );
    }
    
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make a GET request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const get = (url, options = {}) => {
  return apiRequest(url, {
    method: 'GET',
    ...options,
  });
};

/**
 * Make a POST request
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The data to send
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const post = (url, data, options = {}) => {
  // For mock data in development, handle special cases
  if (shouldUseMockData()) {
    // Handle login
    if (url.includes('/users/login')) {
      if (data.username === 'admin' && data.password === 'admin123') {
        return Promise.resolve({
          token: 'mock-admin-token',
          user: {
            id: 'admin1',
            name: 'Admin User',
            username: 'admin',
            email: 'admin@example.com',
            role: 'Admin',
            isApproved: true
          }
        });
      } else {
        return Promise.resolve({
          token: 'mock-user-token',
          user: {
            id: '1',
            name: 'Test User',
            username: data.username,
            email: `${data.username}@example.com`,
            role: 'Member',
            isApproved: true
          }
        });
      }
    }
    
    // Handle registration
    if (url.includes('/users/register')) {
      return Promise.resolve({
        token: 'mock-user-token',
        user: {
          id: Date.now().toString(),
          ...data,
          role: 'Member',
          isApproved: false
        }
      });
    }
  }
  
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * Make a PUT request
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The data to send
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const put = (url, data, options = {}) => {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * Make a DELETE request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional options
 * @returns {Promise} - The fetch promise
 */
export const del = (url, options = {}) => {
  return apiRequest(url, {
    method: 'DELETE',
    ...options,
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