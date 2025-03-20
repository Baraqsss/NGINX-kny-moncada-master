import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaHeart, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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

const EventsForMembers = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [interestedEvents, setInterestedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventMembers, setEventMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        await fetchEvents();
        if (user && token && !isAdmin) {
          // Only attempt to fetch member-specific data if the user is not an admin
          await fetchJoinedEvents();
          await fetchInterestedEvents();
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again.');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, token, isAdmin]);

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
      throw err;
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
      // Don't rethrow to allow component to load partially
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
      // Don't rethrow to allow component to load partially
    }
  };

  const handleInterestEvent = async (eventId) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    if (!token) {
      setError('Authentication required. Please log in.');
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
    if (!user) {
      navigate('/signup');
      return;
    }

    if (!token) {
      setError('Authentication required. Please log in.');
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

  const fetchEventMembers = async (eventId) => {
    if (!isAdmin) return;
    
    setLoadingMembers(true);
    try {
      const response = await api.get(`/events/${eventId}/members`);
      
      let membersList = [];
      if (response.data?.members) {
        membersList = response.data.members;
      } else if (Array.isArray(response.data)) {
        membersList = response.data;
      }
      
      setEventMembers(membersList);
    } catch (err) {
      console.error('Error fetching event members:', err);
      setEventMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const openMembersModal = (event, e) => {
    if (!isAdmin) return;
    
    // Prevent event bubbling
    if (e) e.stopPropagation();
    
    setCurrentEvent(event);
    setShowMembersModal(true);
    fetchEventMembers(event._id || event.id);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Events</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 && !error ? (
            <div className="text-center py-8 text-gray-500 col-span-full">No events found.</div>
          ) : (
            events.map((event) => {
              const isJoined = joinedEvents.includes(event._id || event.id);
              const isInterested = interestedEvents.includes(event._id || event.id);
              
              return (
                <div key={event._id || event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Event Image */}
                  <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
                    {event.image ? (
                      <img 
                        src={event.image.startsWith('http') 
                          ? event.image 
                          : `http://localhost:5000${event.image}`} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', event.image);
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3e%3crect fill='%23f8f9fa' width='800' height='400'/%3e%3ctext fill='%23adb5bd' font-family='Arial,sans-serif' font-size='32' font-weight='bold' text-anchor='middle' x='400' y='210'%3eEvent Image%3c/text%3e%3c/svg%3e";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <FaCalendarAlt size={48} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>

                    <div className="space-y-2 text-gray-600 text-sm">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center">
                          <FaClock className="mr-2" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <FaUsers className="mr-2" />
                        <span>{event.registeredUsers?.length || 0} / {event.capacity || 'unlimited'} registered</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {!isAdmin && (
                        <>
                          {!isJoined && !isInterested && (
                            <button
                              onClick={() => handleInterestEvent(event._id || event.id)}
                              className="flex-1 py-2 px-4 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors flex items-center justify-center"
                            >
                              <FaHeart className="mr-2" /> I'm Interested
                            </button>
                          )}
                          
                          {isInterested && !isJoined && (
                            <button
                              onClick={() => handleJoinEvent(event._id || event.id)}
                              className="flex-1 py-2 px-4 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                            >
                              Join Event
                            </button>
                          )}
                          
                          {isJoined && (
                            <button
                              onClick={() => handleLeaveEvent(event._id || event.id)}
                              className="flex-1 py-2 px-4 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center justify-center"
                            >
                              <FaSignOutAlt className="mr-2" /> Leave Event
                            </button>
                          )}
                        </>
                      )}
                      
                      {isAdmin && (
                        <button
                          onClick={(e) => openMembersModal(event, e)}
                          className="flex-1 py-2 px-4 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center justify-center"
                        >
                          <FaUsers className="mr-2" /> View Members
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && currentEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              Members Registered for: {currentEvent.title}
            </h2>
            
            {loadingMembers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-700 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading members...</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {eventMembers.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No members have registered for this event yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {eventMembers.map((member) => (
                      <li key={member._id || member.id} className="py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-800">
                              <FaUser />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{member.name || member.username}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsForMembers; 