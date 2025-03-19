import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import { EVENT_ENDPOINTS } from '../../config/apiConfig';
import { API_BASE_URL } from '../../config/apiConfig';
import { get, post, del } from '../../utils/apiUtils';

const EventsSection = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [interestedEvents, setInterestedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await get(EVENT_ENDPOINTS.GET_ALL_EVENTS);
      setEvents(response.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    }
  };

  const fetchInterestedEvents = async () => {
    try {
      const response = await get(EVENT_ENDPOINTS.GET_INTERESTED_EVENTS);
      setInterestedEvents(response.events.map(event => event._id) || []);
    } catch (err) {
      console.error('Error fetching interested events:', err);
    }
  };

  const fetchJoinedEvents = async () => {
    try {
      const response = await get(EVENT_ENDPOINTS.GET_JOINED_EVENTS);
      setJoinedEvents(response.events.map(event => event._id) || []);
    } catch (err) {
      console.error('Error fetching joined events:', err);
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchEvents(),
          fetchInterestedEvents(),
          fetchJoinedEvents()
        ]);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadEvents();
    }
  }, [user]);

  const handleInterestEvent = async (eventId) => {
    try {
      await post(`${EVENT_ENDPOINTS.SHOW_INTEREST}/${eventId}`);
      setInterestedEvents(prev => [...prev, eventId]);
      await fetchEvents();
    } catch (err) {
      if (err.response?.data?.message === 'already shown interest') {
        setInterestedEvents(prev => [...prev, eventId]);
      } else {
        console.error('Error showing interest:', err);
        setError('Failed to show interest in event');
      }
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await post(`${EVENT_ENDPOINTS.REGISTER_EVENT}/${eventId}`);
      setJoinedEvents(prev => [...prev, eventId]);
      setInterestedEvents(prev => prev.filter(id => id !== eventId));
      await fetchEvents();
    } catch (err) {
      if (err.response?.data?.message === 'already registered') {
        setJoinedEvents(prev => [...prev, eventId]);
        setInterestedEvents(prev => prev.filter(id => id !== eventId));
      } else {
        console.error('Error joining event:', err);
        setError('Failed to join event');
      }
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await del(`${EVENT_ENDPOINTS.LEAVE_EVENT}/${eventId}`);
      setJoinedEvents(prev => prev.filter(id => id !== eventId));
      setInterestedEvents(prev => prev.filter(id => id !== eventId));
      await fetchEvents();
    } catch (err) {
      console.error('Error leaving event:', err);
      setError('Failed to leave event');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700"></div>
      </div>
    );
  }

  if (error) {
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">No events available.</p>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div key={event._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                <div className="flex items-center text-gray-600">
                  <FaClock className="mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-2" />
                  <span>{event.registeredUsers?.length || 0} / {event.capacity} registered</span>
                </div>
              </div>

              <div className="mt-4 space-x-4">
                {joinedEvents.includes(event._id) ? (
                  <button
                    onClick={() => handleLeaveEvent(event._id)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Leave Event
                  </button>
                ) : interestedEvents.includes(event._id) ? (
                  <button
                    onClick={() => handleJoinEvent(event._id)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <FaUsers className="mr-2" />
                    Join Event
                  </button>
                ) : (
                  <button
                    onClick={() => handleInterestEvent(event._id)}
                    className="flex items-center px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
                  >
                    <FaHeart className="mr-2" />
                    I'm Interested
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsSection; 