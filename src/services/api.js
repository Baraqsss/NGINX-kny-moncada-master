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
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
  
  getCurrentUser: () => {
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
    
    return fetchAPI('/users/me');
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
  
  createEvent: (eventData) => fetchAPI('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),
  
  updateEvent: (id, eventData) => fetchAPI(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }),
  
  deleteEvent: (id) => fetchAPI(`/events/${id}`, {
    method: 'DELETE',
  }),
};

// Announcements API calls
export const announcementsAPI = {
  getAllAnnouncements: () => fetchAPI('/announcements'),
  
  getAnnouncement: (id) => fetchAPI(`/announcements/${id}`),
  
  createAnnouncement: (announcementData) => fetchAPI('/announcements', {
    method: 'POST',
    body: JSON.stringify(announcementData),
  }),
  
  updateAnnouncement: (id, announcementData) => fetchAPI(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(announcementData),
  }),
  
  deleteAnnouncement: (id) => fetchAPI(`/announcements/${id}`, {
    method: 'DELETE',
  }),
};

// Donations API calls
export const donationsAPI = {
  getAllDonations: () => fetchAPI('/donations'),
  
  getDonation: (id) => fetchAPI(`/donations/${id}`),
  
  createDonation: (donationData) => fetchAPI('/donations', {
    method: 'POST',
    body: JSON.stringify(donationData),
  }),
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

export default {
  auth: authAPI,
  events: eventsAPI,
  announcements: announcementsAPI,
  donations: donationsAPI,
  admin: adminAPI,
}; 