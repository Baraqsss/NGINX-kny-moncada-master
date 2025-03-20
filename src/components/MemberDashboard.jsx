import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
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

const MemberDashboard = () => {
  const { user, token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [interestedEvents, setInterestedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'Admin';

  const fetchEvents = async () => {
    try {
      const eventsResponse = await api.get('/events');
      
      if (eventsResponse.data?.events) {
        setEvents(eventsResponse.data.events);
      } else if (Array.isArray(eventsResponse.data)) {
        setEvents(eventsResponse.data);
      } else if (eventsResponse.data?.data?.events) {
        setEvents(eventsResponse.data.data.events);
      } else {
        console.log('Unexpected events format, using empty array:', eventsResponse.data);
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    }
  };

  const fetchInterestedEvents = async () => {
    if (!user || !user._id || !token || isAdmin) {
      return;
    }
    
    try {
      const interestedResponse = await api.get('/events/interested');
      
      let interestedIds = [];
      if (interestedResponse.data?.events && Array.isArray(interestedResponse.data.events)) {
        interestedIds = interestedResponse.data.events.map(event => event._id);
      } else if (interestedResponse.data?.data?.events) {
        interestedIds = interestedResponse.data.data.events.map(event => event._id);
      } else if (Array.isArray(interestedResponse.data)) {
        interestedIds = interestedResponse.data.map(event => event._id || event.id);
      }
      
      setInterestedEvents(interestedIds);
    } catch (err) {
      console.error('Error fetching interested events:', err);
      // Don't set error state here to allow dashboard to load partially
    }
  };

  const fetchJoinedEvents = async () => {
    if (!user || !user._id || !token || isAdmin) {
      return;
    }
    
    try {
      const joinedResponse = await api.get('/events/registered');
      
      let joinedIds = [];
      if (joinedResponse.data?.events && Array.isArray(joinedResponse.data.events)) {
        joinedIds = joinedResponse.data.events.map(event => event._id);
      } else if (joinedResponse.data?.data?.events) {
        joinedIds = joinedResponse.data.data.events.map(event => event._id);
      } else if (Array.isArray(joinedResponse.data)) {
        joinedIds = joinedResponse.data.map(event => event._id || event.id);
      }
      
      setJoinedEvents(joinedIds);
    } catch (err) {
      console.error('Error fetching joined events:', err);
      // Don't set error state here to allow dashboard to load partially
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const announcementsResponse = await api.get('/announcements');
      
      if (announcementsResponse.data?.announcements) {
        setAnnouncements(announcementsResponse.data.announcements);
      } else if (announcementsResponse.data?.data?.announcements) {
        setAnnouncements(announcementsResponse.data.data.announcements);
      } else if (Array.isArray(announcementsResponse.data)) {
        setAnnouncements(announcementsResponse.data);
      } else {
        console.log('Unexpected announcements format, using empty array:', announcementsResponse.data);
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      // Don't set error state here to allow dashboard to load partially
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        // Fetch data sequentially for better error tracking
        await fetchAnnouncements();
        await fetchEvents();
        
        // Only fetch user-specific data if we have a valid user and not an admin
        if (user && user._id && !isAdmin) {
          await fetchInterestedEvents();
          await fetchJoinedEvents();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, token, isAdmin]);

  const handleInterestEvent = async (eventId) => {
    if (!token || !user) {
      setError('You must be logged in to perform this action');
      return;
    }

    if (isAdmin) {
      setError('Admin users cannot show interest in events. Please use a member account.');
      return;
    }

    try {
      await api.post(`/events/${eventId}/interest`);
      
      setInterestedEvents(prev => [...prev, eventId]);
      await fetchEvents();
    } catch (err) {
      console.error('Error showing interest:', err);
      
      // Check for different error message formats
      const errorMessage = err.response?.data?.message || err.message || '';
      
      if (errorMessage.includes('already shown interest')) {
        setInterestedEvents(prev => [...prev, eventId]);
      } else {
        setError('Failed to show interest in event');
      }
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!token || !user) {
      setError('You must be logged in to perform this action');
      return;
    }

    if (isAdmin) {
      setError('Admin users cannot join events. Please use a member account.');
      return;
    }

    try {
      await api.post(`/events/${eventId}/register`);
      
      setJoinedEvents(prev => [...prev, eventId]);
      setInterestedEvents(prev => prev.filter(id => id !== eventId));
      await fetchEvents();
    } catch (err) {
      console.error('Error joining event:', err);
      
      // Check for different error message formats
      const errorMessage = err.response?.data?.message || err.message || '';
      
      if (errorMessage.includes('already registered')) {
        setJoinedEvents(prev => [...prev, eventId]);
        setInterestedEvents(prev => prev.filter(id => id !== eventId));
      } else {
        setError('Failed to join event');
      }
    }
  };

  const handleLeaveEvent = async (eventId) => {
    if (!token || !user) {
      setError('You must be logged in to perform this action');
      return;
    }

    if (isAdmin) {
      setError('Admin users cannot leave events. Please use a member account.');
      return;
    }

    try {
      await api.delete(`/events/${eventId}/unregister`);
      
      setJoinedEvents(prev => prev.filter(id => id !== eventId));
      setInterestedEvents(prev => prev.filter(id => id !== eventId));
      await fetchEvents();
    } catch (err) {
      console.error('Error leaving event:', err);
      setError('Failed to leave event');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700"></div>
      </div>
    );
  }

  if (error && events.length === 0 && announcements.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-violet-800">Member Dashboard</h1>
          <p className="text-lg text-violet-600 mt-2">
            Welcome, {user?.name || user?.username || 'Member'}!
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Logged in as: <span className="font-semibold text-violet-700">{user?.email}</span>
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">
            <strong>Admin Notice:</strong> As an admin, you can view all events but cannot interact with them (show interest, join, or leave). 
            These features are for member accounts only.
          </p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Announcements Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-violet-700">Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-gray-500">No announcements available.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div key={announcement._id || announcement.id || index} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-lg font-medium text-violet-600">{announcement.title}</h3>
                  <p className="text-gray-600 mt-2">{announcement.content || announcement.message}</p>
                  {announcement.image && (
                    <img 
                      src={announcement.image.startsWith('http') 
                        ? announcement.image 
                        : `http://localhost:5000${announcement.image}`} 
                      alt={announcement.title}
                      className="mt-2 rounded-lg w-full max-h-48 object-cover"
                      onError={(e) => {
                        console.error('Failed to load announcement image:', announcement.image);
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3e%3crect fill='%23f8f9fa' width='800' height='400'/%3e%3ctext fill='%23adb5bd' font-family='Arial,sans-serif' font-size='32' font-weight='bold' text-anchor='middle' x='400' y='210'%3eAnnouncement%3c/text%3e%3c/svg%3e";
                      }}
                    />
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    Posted on {announcement.createdAt ? formatDate(announcement.createdAt) : 'Unknown date'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-violet-700">Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">No events available.</p>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event._id || event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-violet-700">{event.title}</h3>
                  
                  {event.image && (
                    <div className="mt-3 mb-3">
                      <img 
                        src={event.image.startsWith('http') 
                          ? event.image 
                          : `http://localhost:5000${event.image}`}
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Failed to load event image:', event.image);
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3e%3crect fill='%23f8f9fa' width='800' height='400'/%3e%3ctext fill='%23adb5bd' font-family='Arial,sans-serif' font-size='32' font-weight='bold' text-anchor='middle' x='400' y='210'%3eEvent Image%3c/text%3e%3c/svg%3e";
                        }}
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-600 mt-2">{event.description}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-2" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2" />
                      <span>{event.registeredUsers?.length || 0} / {event.capacity || 'unlimited'} registered</span>
                    </div>
                  </div>

                  <div className="mt-4 space-x-4">
                    {!isAdmin ? (
                      <>
                        {joinedEvents.includes(event._id || event.id) ? (
                          <button
                            onClick={() => handleLeaveEvent(event._id || event.id)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <FaSignOutAlt className="mr-2" />
                            Leave Event
                          </button>
                        ) : interestedEvents.includes(event._id || event.id) ? (
                          <button
                            onClick={() => handleJoinEvent(event._id || event.id)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            <FaUsers className="mr-2" />
                            Join Event
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInterestEvent(event._id || event.id)}
                            className="flex items-center px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
                          >
                            <FaHeart className="mr-2" />
                            I'm Interested
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded">
                        <span>Admin View Only</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard; 