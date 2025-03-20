// API service for making requests to the backend
import { shouldUseMockData, getMockData } from '../utils/apiUtils';
import { 
  API_BASE_URL, 
  findBackendPort, 
  getApiUrl,
  getAuthEndpoints,
  getUserEndpoints,
  getEventEndpoints,
  getAnnouncementEndpoints,
  getDonationEndpoints,
  getAdminEndpoints
} from '../config/apiConfig';
import axios from 'axios';

// Store the API URL - will be updated if needed
let apiUrl = API_BASE_URL;
let currentEndpoints = {
  auth: getAuthEndpoints(API_BASE_URL),
  user: getUserEndpoints(API_BASE_URL),
  event: getEventEndpoints(API_BASE_URL),
  announcement: getAnnouncementEndpoints(API_BASE_URL),
  donation: getDonationEndpoints(API_BASE_URL),
  admin: getAdminEndpoints(API_BASE_URL)
};

// Initialize API URL
const initializeApiUrl = async () => {
  try {
    // Try to find the correct port
    const port = await findBackendPort();
    const newApiUrl = getApiUrl(port);
    
    if (newApiUrl !== apiUrl) {
      apiUrl = newApiUrl;
      console.log(`Backend detected on port ${port}, using ${apiUrl}`);
      
      // Update all endpoints with the new base URL
      currentEndpoints = {
        auth: getAuthEndpoints(apiUrl),
        user: getUserEndpoints(apiUrl),
        event: getEventEndpoints(apiUrl),
        announcement: getAnnouncementEndpoints(apiUrl),
        donation: getDonationEndpoints(apiUrl),
        admin: getAdminEndpoints(apiUrl)
      };
    }
  } catch (error) {
    console.error('Error initializing API URL:', error);
  }
};

// Initialize on load
initializeApiUrl();

// Helper function for making API requests
async function fetchAPI(endpoint, options = {}) {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;
  
  // Check if we should use mock data
  if (shouldUseMockData()) {
    const mockData = getMockData(fullUrl);
    if (mockData) {
      console.log(`Using mock data for ${fullUrl}`, mockData);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData;
    }
  }
  
  // Default headers
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    console.log(`Making API request to: ${fullUrl}`);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(fullUrl, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Something went wrong';
        console.error(`API error (${response.status}): ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      return data;
    } else {
      if (!response.ok) {
        console.error(`API error (${response.status}): ${response.statusText}`);
        throw new Error(response.statusText || 'Something went wrong');
      }
      return await response.text();
    }
  } catch (error) {
    // Check if it's a timeout error
    if (error.name === 'AbortError') {
      console.error('Request timeout: The server took too long to respond');
      throw new Error('Request timeout: The server took too long to respond');
    }
    
    // Check if it's a network error (likely backend not running)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      console.error('Network error: Backend server may not be running');
      throw new Error('Cannot connect to server. Please ensure the backend is running.');
    }
    
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API calls
export const authAPI = {
  login: (credentials) => {
    // For mock data in development, handle special cases
    if (shouldUseMockData()) {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
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
        localStorage.setItem('isAdmin', 'false');
        return Promise.resolve({
          token: 'mock-user-token',
          user: {
            id: '1',
            name: 'Test User',
            username: credentials.username,
            email: `${credentials.username}@example.com`,
            role: 'Member',
            isApproved: true
          }
        });
      }
    }
    
    return fetchAPI('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: (userData) => {
    // For mock data in development
    if (shouldUseMockData()) {
      return Promise.resolve({
        token: 'mock-user-token',
        user: {
          id: Date.now().toString(),
          ...userData,
          role: 'Member',
          isApproved: false
        }
      });
    }
    
    return fetchAPI('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  getCurrentUser: async () => {
    // For mock data in development
    if (shouldUseMockData()) {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (isAdmin) {
        return Promise.resolve({
          id: 'admin1',
          name: 'Admin User',
          username: 'admin',
          email: 'admin@example.com',
          role: 'Admin',
          isApproved: true
        });
      } else {
        return Promise.resolve({
          id: '1',
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          role: 'Member',
          isApproved: true
        });
      }
    }
    
    const response = await fetchAPI('/users/me');
    // The backend returns { status: 'success', data: { user: {...} } }
    // We need to return just the user object
    return response.data.user;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    return Promise.resolve();
  },
  
  // For development/testing purposes - mock login when backend is not available
  mockLogin: (credentials) => {
    console.log('Using mock login with credentials:', credentials);
    
    // Check if this is an admin login
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
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
    }
    
    // Regular user login
    localStorage.setItem('isAdmin', 'false');
    return Promise.resolve({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'Test User',
        username: credentials.username,
        email: 'test@example.com',
        role: 'Member',
        isApproved: true
      }
    });
  },
  
  // For development/testing purposes - mock register when backend is not available
  mockRegister: (userData) => {
    console.log('Using mock register with data:', userData);
    // Return a mock successful response
    return Promise.resolve({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: userData.name || 'New User',
        username: userData.username,
        email: userData.email || 'new@example.com',
        role: 'Member',
        isApproved: false
      }
    });
  }
};

// Events API calls
export const eventsAPI = {
  getAllEvents: () => fetchAPI('/events'),
  
  getEvent: (id) => fetchAPI(`/events/${id}`),
  
  createEvent: (eventData) => {
    // If eventData is FormData, don't stringify it
    const isFormData = eventData instanceof FormData;
    return fetchAPI('/events', {
      method: 'POST',
      body: isFormData ? eventData : JSON.stringify(eventData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });
  },
  
  updateEvent: async (id, eventData) => {
    try {
      console.log(`Updating event with ID: ${id}`);
      console.log('Update data:', eventData);
      
      if (!id) {
        console.error('No event ID provided for update');
        throw new Error('Event ID is required for update');
      }
      
      // If eventData is FormData, don't stringify it
      const isFormData = eventData instanceof FormData;
      
      // For form data updates that include files
      if (isFormData) {
        console.log('Sending event update as FormData');
        return fetchAPI(`/events/${id}`, {
          method: 'PATCH', // Use PATCH instead of PUT to allow partial updates
          body: eventData,
          // Don't set Content-Type for FormData, browser will set it with boundary
        });
      }
      
      // For regular JSON updates
      console.log('Sending event update as JSON');
      return fetchAPI(`/events/${id}`, {
        method: 'PATCH', // Use PATCH instead of PUT
        body: JSON.stringify(eventData),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  },
  
  deleteEvent: (id) => fetchAPI(`/events/${id}`, {
    method: 'DELETE',
  }),
  
  getEventMembers: (id) => fetchAPI(`/events/${id}/members`),
};

// Announcements API calls
export const announcementsAPI = {
  getAllAnnouncements: async () => {
    try {
      // Use mock data in development if needed
      if (shouldUseMockData()) {
        console.log('Using mock data for announcements');
        return Promise.resolve({
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
              }
            ]
          }
        });
      }
      
      // Make actual API request
      const response = await fetchAPI('/announcements');
      console.log('Announcements API response:', response);
      return response;
    } catch (error) {
      console.error('Error in getAllAnnouncements:', error);
      throw error;
    }
  },
  
  getAnnouncement: async (id) => {
    try {
      const response = await fetchAPI(`/announcements/${id}`);
      return response;
    } catch (error) {
      console.error(`Error getting announcement ${id}:`, error);
      throw error;
    }
  },
  
  createAnnouncement: async (announcementData) => {
    try {
      console.log('Creating announcement with data type:', 
        announcementData instanceof FormData ? 'FormData' : 'JSON object');
      
      // If announcementData contains an image file, use FormData
      if (announcementData.image instanceof File) {
        console.log('Creating FormData for announcement with image');
        const formData = new FormData();
        
        // Add all text fields to FormData
        Object.keys(announcementData).forEach(key => {
          if (key !== 'image' || !(announcementData[key] instanceof File)) {
            console.log(`Adding to FormData - ${key}:`, announcementData[key]);
            formData.append(key, announcementData[key]);
          }
        });
        
        // Add image file if it exists
        if (announcementData.image) {
          console.log('Adding image to FormData:', announcementData.image.name);
          formData.append('image', announcementData.image);
        }
        
        console.log('FormData entries:', [...formData.entries()].map(e => `${e[0]}: ${e[1] instanceof File ? e[1].name : e[1]}`));
        
        return fetchAPI('/announcements', {
          method: 'POST',
          body: formData,
          // Don't set Content-Type, browser will set it with boundary parameter
        });
      }
      
      // If announcementData is already FormData, use it directly
      if (announcementData instanceof FormData) {
        console.log('Using provided FormData for announcement');
        console.log('FormData entries:', [...announcementData.entries()].map(e => `${e[0]}: ${e[1] instanceof File ? e[1].name : e[1]}`));
        
        return fetchAPI('/announcements', {
          method: 'POST',
          body: announcementData,
          // Don't set Content-Type, browser will set it with boundary parameter
        });
      }
      
      // Otherwise just send JSON
      console.log('Sending announcement as JSON:', announcementData);
      return fetchAPI('/announcements', {
        method: 'POST',
        body: JSON.stringify(announcementData),
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },
  
  updateAnnouncement: async (id, announcementData) => {
    try {
      // Handle FormData if we have a file
      if (announcementData.image instanceof File) {
        const formData = new FormData();
        
        // Add all text fields to FormData
        Object.keys(announcementData).forEach(key => {
          if (key !== 'image' || !(announcementData[key] instanceof File)) {
            formData.append(key, announcementData[key]);
          }
        });
        
        // Add image file if it exists
        if (announcementData.image) {
          formData.append('image', announcementData.image);
        }
        
        return fetchAPI(`/announcements/${id}`, {
          method: 'PATCH', // Use PATCH instead of PUT to support partial updates
          body: formData,
          // Don't set Content-Type, browser will set it with boundary parameter
        });
      }
      
      // Otherwise just send JSON
      return fetchAPI(`/announcements/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(announcementData),
      });
    } catch (error) {
      console.error(`Error updating announcement ${id}:`, error);
      throw error;
    }
  },
  
  deleteAnnouncement: async (id) => {
    try {
      return fetchAPI(`/announcements/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting announcement ${id}:`, error);
      throw error;
    }
  },
};

// Donations API calls
const determineApiUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Production environment or Vercel deployment
    if (process.env.NODE_ENV === 'production') {
      // Get the host from the current URL
      const host = window.location.host;
      // If it's a Vercel deployment
      if (host.includes('vercel.app')) {
        return `https://${host}/api`;
      }
      // Custom domain in production
      return `https://${host}/api`;
    }
  }
  
  // Development fallback
  return 'http://localhost:5000/api';
};

const API_URL = determineApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const donationsAPI = {
  getAllDonations: async (params) => {
    const response = await api.get('/donations', { params });
    return response.data;
  },

  createDonation: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },

  deleteDonation: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },

  importDonations: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/donations/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  exportDonations: (filters) => {
    const queryString = new URLSearchParams(filters).toString();
    window.location.href = `${API_URL}/donations/export?${queryString}`;
  }
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => fetchAPI('/admin/stats'),
  
  getAllUsers: () => fetchAPI('/admin/users'),
  
  approveUser: (id) => fetchAPI(`/users/${id}/approve`, {
    method: 'PUT',
  }),
  
  rejectUser: (id) => fetchAPI(`/users/${id}/reject`, {
    method: 'PUT',
  }),
  
  updateUserRole: (id, role) => fetchAPI(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
};

// Email API calls
export const emailAPI = {
  // Send confirmation email
  sendConfirmationEmail: async (emailData) => {
    const { to, subject, html, text } = emailData;
    
    // For mock data in development
    if (shouldUseMockData()) {
      console.log('MOCK: Sending confirmation email to:', to);
      console.log('MOCK: Email subject:', subject);
      // Return a successful mock response
      return Promise.resolve({
        success: true,
        message: 'Confirmation email sent successfully (mock)'
      });
    }
    
    // Make the actual API call
    return fetchAPI('/send-email', {
      method: 'POST',
      body: JSON.stringify({
        to,
        subject,
        html,
        text
      }),
    });
  }
};

export default {
  auth: authAPI,
  events: eventsAPI,
  announcements: announcementsAPI,
  donations: donationsAPI,
  admin: adminAPI,
  email: emailAPI,
}; 