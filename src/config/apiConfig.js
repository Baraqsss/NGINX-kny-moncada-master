// API base URL - adjust port if needed
const API_BASE_URL = 'http://localhost:50001/api';

// Function to check if backend is available on a specific port
const checkBackendAvailability = async (port) => {
  try {
    const response = await fetch(`http://localhost:${port}/`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Try to find the correct port (for development purposes)
const findBackendPort = async () => {
  // Start with default port
  let port = 5000;
  
  // Try up to 5 ports
  for (let i = 0; i < 5; i++) {
    const isAvailable = await checkBackendAvailability(port + i);
    if (isAvailable) {
      return port + i;
    }
  }
  
  // If no port found, return default
  return port;
};

// Authentication endpoints
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,
  PROFILE: `${API_BASE_URL}/users/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
};

// User management endpoints
const USER_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/users`,
  GET_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  APPROVE: (id) => `${API_BASE_URL}/users/${id}/approve`,
  REJECT: (id) => `${API_BASE_URL}/users/${id}/reject`,
  UPDATE_ROLE: (id) => `${API_BASE_URL}/users/${id}/role`,
  DELETE: (id) => `${API_BASE_URL}/users/${id}`,
};

// Event endpoints
const EVENT_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/events`,
  GET_BY_ID: (id) => `${API_BASE_URL}/events/${id}`,
  CREATE: `${API_BASE_URL}/events`,
  UPDATE: (id) => `${API_BASE_URL}/events/${id}`,
  DELETE: (id) => `${API_BASE_URL}/events/${id}`,
  TOGGLE_INTEREST: (id) => `${API_BASE_URL}/memberships/interested/${id}`,
  GET_INTERESTED: `${API_BASE_URL}/memberships/interested`,
};

// Announcement endpoints
const ANNOUNCEMENT_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/announcements`,
  GET_BY_ID: (id) => `${API_BASE_URL}/announcements/${id}`,
  CREATE: `${API_BASE_URL}/announcements`,
  UPDATE: (id) => `${API_BASE_URL}/announcements/${id}`,
  DELETE: (id) => `${API_BASE_URL}/announcements/${id}`,
};

// Donation endpoints
const DONATION_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/donations`,
  GET_BY_ID: (id) => `${API_BASE_URL}/donations/${id}`,
  CREATE: `${API_BASE_URL}/donations`,
  UPDATE: (id) => `${API_BASE_URL}/donations/${id}`,
  DELETE: (id) => `${API_BASE_URL}/donations/${id}`,
};

// Admin dashboard endpoints
const ADMIN_ENDPOINTS = {
  STATS: `${API_BASE_URL}/admin/stats`,
};

export {
  API_BASE_URL,
  findBackendPort,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  EVENT_ENDPOINTS,
  ANNOUNCEMENT_ENDPOINTS,
  DONATION_ENDPOINTS,
  ADMIN_ENDPOINTS,
}; 