import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaPaperclip, FaCalendarAlt, FaClock, FaThumbsUp } from 'react-icons/fa';
import { EVENT_ENDPOINTS } from '../config/apiConfig';
import { get, post, del } from '../utils/apiUtils';

const EventsForMembers = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [interestedEvents, setInterestedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch events and user's interested events on component mount
  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchInterestedEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await get(EVENT_ENDPOINTS.GET_ALL);
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInterestedEvents = async () => {
    try {
      const data = await get(EVENT_ENDPOINTS.GET_INTERESTED);
      setInterestedEvents(data.map(item => item.eventId));
    } catch (err) {
      console.error('Failed to fetch interested events:', err);
    }
  };

  const handleToggleInterest = async (eventId) => {
    if (!user) {
      // Redirect to login if not logged in
      window.location.href = '/login';
      return;
    }

    try {
      const isInterested = interestedEvents.includes(eventId);
      
      if (isInterested) {
        await del(EVENT_ENDPOINTS.TOGGLE_INTEREST(eventId));
        setInterestedEvents(interestedEvents.filter(id => id !== eventId));
      } else {
        await post(EVENT_ENDPOINTS.TOGGLE_INTEREST(eventId), {});
        setInterestedEvents([...interestedEvents, eventId]);
      }
    } catch (err) {
      console.error('Failed to toggle interest:', err);
      setError(err.message || 'Failed to update interest');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter events based on visibility
  const visibleEvents = events.filter(event => 
    event.visibility === 'public' || (user && event.visibility === 'members')
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Events</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 col-span-full">No events found.</div>
          ) : (
            visibleEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                {/* Event Image or Placeholder */}
                <div className="h-40 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <FaCalendarAlt size={48} />
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaCalendarAlt className="mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  {event.time && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaClock className="mr-2" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  
                  <p className="text-gray-700 mb-4">{event.description}</p>
                  
                  {event.attachmentUrl && (
                    <div className="mb-4 flex items-center text-blue-600">
                      <FaPaperclip className="mr-1" />
                      <a href={event.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        View Attachment
                      </a>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => handleToggleInterest(event._id)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        interestedEvents.includes(event._id)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaThumbsUp className="mr-2" />
                      {interestedEvents.includes(event._id) ? 'Interested' : 'Show Interest'}
                    </button>
                    
                    <span className="text-sm text-gray-500">
                      {event.interestedCount || 0} interested
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EventsForMembers; 