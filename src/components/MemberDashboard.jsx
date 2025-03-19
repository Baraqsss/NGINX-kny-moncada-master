import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from './Spinner';

// API base URL - adjust as needed for your environment
const API_BASE_URL = 'http://localhost:5000/api';

const MemberDashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token, isAuthenticated, authChecked } = useAuth();
  const navigate = useNavigate();

  // Debug logs
  console.log('MemberDashboard - User:', user);
  console.log('MemberDashboard - Token:', token ? 'Token exists' : 'No token');
  console.log('MemberDashboard - Is Authenticated:', isAuthenticated);

  // Helper function for role check
  const hasRole = (role) => {
    if (!user?.role) return false;
    return user.role.toLowerCase() === role.toLowerCase();
  };

  useEffect(() => {
    // Additional debug logs
    console.log('MemberDashboard - Effect running');
    console.log('MemberDashboard - Auth checked:', authChecked);
    console.log('MemberDashboard - User in effect:', user);
    
    if (!isAuthenticated) {
      console.log('MemberDashboard - Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // Skip role check for now to ensure all users can access the dashboard
    // We'll handle specific member-only features inside the component

    const fetchData = async () => {
      if (!token) {
        console.log('MemberDashboard - No token available');
        return;
      }

      console.log('MemberDashboard - Fetching data...');
      setLoading(true);
      setError(null);

      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        console.log('MemberDashboard - Making API requests with headers:', headers);

        try {
          // Fetch announcements
          const announcementsRes = await axios.get(`${API_BASE_URL}/announcements`, { headers });
          console.log('MemberDashboard - Announcements response:', announcementsRes.data);
          
          if (announcementsRes.data?.data?.announcements) {
            setAnnouncements(announcementsRes.data.data.announcements);
          } else if (Array.isArray(announcementsRes.data)) {
            setAnnouncements(announcementsRes.data);
          } else if (announcementsRes.data?.announcements) {
            setAnnouncements(announcementsRes.data.announcements);
          } else {
            console.log('MemberDashboard - Unable to parse announcements data');
          }
        } catch (annError) {
          console.error('Error fetching announcements:', annError);
        }

        try {
          // Fetch events
          const eventsRes = await axios.get(`${API_BASE_URL}/events`, { headers });
          console.log('MemberDashboard - Events response:', eventsRes.data);
          
          if (eventsRes.data?.data?.events) {
            setEvents(eventsRes.data.data.events);
          } else if (Array.isArray(eventsRes.data)) {
            setEvents(eventsRes.data);
          } else if (eventsRes.data?.events) {
            setEvents(eventsRes.data.events);
          } else {
            console.log('MemberDashboard - Unable to parse events data');
          }
        } catch (eventError) {
          console.error('Error fetching events:', eventError);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Failed to fetch data. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated, navigate]);

  const handleInterested = async (eventId) => {
    if (!token) return;

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log(`MemberDashboard - Showing interest in event ${eventId}`);
      await axios.post(`${API_BASE_URL}/events/${eventId}/interest`, {}, { headers });
      
      // Refresh events after marking interest
      const response = await axios.get(`${API_BASE_URL}/events`, { headers });
      console.log('MemberDashboard - Events after interest:', response.data);
      
      if (response.data?.data?.events) {
        setEvents(response.data.data.events);
      } else if (Array.isArray(response.data)) {
        setEvents(response.data);
      } else if (response.data?.events) {
        setEvents(response.data.events);
      }
    } catch (err) {
      console.error('Error marking interest:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to mark interest. Please try again.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
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
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Announcements Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-violet-700">Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-gray-500">No announcements available.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div key={announcement._id || index} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-lg font-medium text-violet-600">{announcement.title}</h3>
                  <p className="text-gray-600 mt-2">{announcement.content}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Posted on {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : 'Unknown date'}
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
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event._id || index} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-lg font-medium text-violet-600">{event.title}</h3>
                  <p className="text-gray-600 mt-2">{event.description}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Date: {event.date ? new Date(event.date).toLocaleDateString() : 'Unknown date'}
                  </p>
                  <button
                    onClick={() => handleInterested(event._id)}
                    disabled={event.interestedUsers?.includes(user?._id)}
                    className={`mt-3 px-4 py-2 rounded text-sm ${
                      event.interestedUsers?.includes(user?._id)
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                    }`}
                  >
                    {event.interestedUsers?.includes(user?._id) ? "You're interested!" : "I'm interested!"}
                  </button>
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