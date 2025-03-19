import React, { useState, useEffect } from 'react';
import { FaPaperclip, FaClock } from 'react-icons/fa';
import { announcementsAPI } from '../services/api';
import { API_BASE_URL } from '../config/apiConfig';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching announcements...');
      const response = await announcementsAPI.getAllAnnouncements();
      console.log('Announcements response:', response);
      
      // Process the API response based on its structure
      let announcementsData = [];
      
      if (response?.data?.announcements && Array.isArray(response.data.announcements)) {
        // Standard API format { data: { announcements: [] } }
        announcementsData = response.data.announcements;
      } else if (response?.announcements && Array.isArray(response.announcements)) {
        // Alternative format { announcements: [] }
        announcementsData = response.announcements;
      } else if (Array.isArray(response)) {
        // Direct array response
        announcementsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // Simple wrapper { data: [] }
        announcementsData = response.data;
      } else {
        console.error('Unexpected response format:', response);
        setError('Unexpected data format received from server');
        setAnnouncements([]);
        setIsLoading(false);
        return;
      }
      
      if (announcementsData.length === 0) {
        console.log('No announcements found');
      }
      
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
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

  // Calculate time ago
  const timeAgo = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Announcements</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchAnnouncements} 
            className="ml-4 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading announcements...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No announcements available.</div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement._id || announcement.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{announcement.title}</h2>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <FaClock className="mr-1" />
                    <span>{timeAgo(announcement.createdAt)}</span>
                    <span className="mx-2">•</span>
                    <span>Posted by {announcement.createdBy?.name || 'Admin'}</span>
                  </div>
                  
                  <div className="prose max-w-none text-gray-700 mb-4 whitespace-pre-line">
                    {announcement.content || announcement.message}
                  </div>
                  
                  {announcement.image && (
                    <div className="mt-4">
                      <img 
                        src={announcement.image.startsWith('http') 
                          ? announcement.image 
                          : `http://localhost:5000${announcement.image}`} 
                        alt={announcement.title}
                        className="w-full max-h-96 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          console.error('Failed to load announcement image:', announcement.image);
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3e%3crect fill='%23f8f9fa' width='800' height='400'/%3e%3ctext fill='%23adb5bd' font-family='Arial,sans-serif' font-size='32' font-weight='bold' text-anchor='middle' x='400' y='210'%3eAnnouncement Image%3c/text%3e%3c/svg%3e";
                        }}
                      />
                    </div>
                  )}
                  
                  {announcement.attachmentUrl && (
                    <div className="mt-4 flex items-center text-blue-600">
                      <FaPaperclip className="mr-2" />
                      <a 
                        href={announcement.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 px-6 py-3 text-right">
                  <p className="text-xs text-gray-500">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Announcements; 