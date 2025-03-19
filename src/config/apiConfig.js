// API base URL - adjust port if needed
const API_BASE_URL = 'http://localhost:5000/api';

// Possible backend ports to try (in order of preference)
const POSSIBLE_PORTS = [5000, 50001, 3000, 8000, 8080];

// Function to check if backend is available on a specific port
const checkBackendAvailability = async (port) => {
  try {
    console.log(`Checking backend availability on port ${port}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(`http://localhost:${port}/api/health`, {
      signal: controller.signal,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log(`Port ${port} check failed:`, error.name === 'AbortError' ? 'timeout' : error.message);
    return false;
  }
};

// Try to find the correct port (for development purposes)
const findBackendPort = async () => {
  // Try each port in sequence
  for (const port of POSSIBLE_PORTS) {
    console.log(`Trying backend port ${port}...`);
    try {
      const isAvailable = await checkBackendAvailability(port);
      if (isAvailable) {
        console.log(`Found working backend on port ${port}`);
        return port;
      }
    } catch (err) {
      console.error(`Error checking port ${port}:`, err);
    }
  }
  
  // If no port found, return default and show warning
  console.warn('No backend ports responded. Using default port 5000.');
  return POSSIBLE_PORTS[0]; // Default to first port in list
};

// Get dynamic API URL based on discovered port
const getApiUrl = (port) => `http://localhost:${port}/api`;

// Authentication endpoints
const getAuthEndpoints = (baseUrl) => ({
  LOGIN: `${baseUrl}/users/login`,
  REGISTER: `${baseUrl}/users/register`,
  PROFILE: `${baseUrl}/users/me`,
  UPDATE_PROFILE: `${baseUrl}/users/profile`,
});

// User management endpoints
const getUserEndpoints = (baseUrl) => ({
  GET_ALL: `${baseUrl}/users`,
  GET_BY_ID: (id) => `${baseUrl}/users/${id}`,
  APPROVE: (id) => `${baseUrl}/users/${id}/approve`,
  REJECT: (id) => `${baseUrl}/users/${id}/reject`,
  UPDATE_ROLE: (id) => `${baseUrl}/users/${id}/role`,
  DELETE: (id) => `${baseUrl}/users/${id}`,
});

// Event endpoints
const getEventEndpoints = (baseUrl) => ({
  GET_ALL: `${baseUrl}/events`,
  GET_BY_ID: (id) => `${baseUrl}/events/${id}`,
  CREATE: `${baseUrl}/events`,
  UPDATE: (id) => `${baseUrl}/events/${id}`,
  DELETE: (id) => `${baseUrl}/events/${id}`,
  TOGGLE_INTEREST: (id) => `${baseUrl}/memberships/interested/${id}`,
  GET_INTERESTED: `${baseUrl}/memberships/interested`,
});

// Announcement endpoints
const getAnnouncementEndpoints = (baseUrl) => ({
  GET_ALL: `${baseUrl}/announcements`,
  GET_BY_ID: (id) => `${baseUrl}/announcements/${id}`,
  CREATE: `${baseUrl}/announcements`,
  UPDATE: (id) => `${baseUrl}/announcements/${id}`,
  DELETE: (id) => `${baseUrl}/announcements/${id}`,
});

// Donation endpoints
const getDonationEndpoints = (baseUrl) => ({
  GET_ALL: `${baseUrl}/donations`,
  GET_BY_ID: (id) => `${baseUrl}/donations/${id}`,
  CREATE: `${baseUrl}/donations`,
  UPDATE: (id) => `${baseUrl}/donations/${id}`,
  DELETE: (id) => `${baseUrl}/donations/${id}`,
});

// Admin dashboard endpoints
const getAdminEndpoints = (baseUrl) => ({
  STATS: `${baseUrl}/admin/stats`,
});

// Static endpoints for immediate use
const AUTH_ENDPOINTS = getAuthEndpoints(API_BASE_URL);
const USER_ENDPOINTS = getUserEndpoints(API_BASE_URL);
const EVENT_ENDPOINTS = getEventEndpoints(API_BASE_URL);
const ANNOUNCEMENT_ENDPOINTS = getAnnouncementEndpoints(API_BASE_URL);
const DONATION_ENDPOINTS = getDonationEndpoints(API_BASE_URL);
const ADMIN_ENDPOINTS = getAdminEndpoints(API_BASE_URL);

export {
  API_BASE_URL,
  findBackendPort,
  getApiUrl,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  EVENT_ENDPOINTS,
  ANNOUNCEMENT_ENDPOINTS,
  DONATION_ENDPOINTS,
  ADMIN_ENDPOINTS,
  // Export endpoint generators
  getAuthEndpoints,
  getUserEndpoints,
  getEventEndpoints,
  getAnnouncementEndpoints,
  getDonationEndpoints,
  getAdminEndpoints
}; 