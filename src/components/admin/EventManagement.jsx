import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaPaperclip, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { eventsAPI } from '../../services/api';

const EventManagement = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 0,
    image: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching events...');
      const response = await eventsAPI.getAllEvents();
      console.log('Events response:', response);
      
      // Handle different response structures
      let eventsList = [];
      if (response.data && response.data.events) {
        // Backend API response structure
        eventsList = response.data.events;
      } else if (Array.isArray(response)) {
        // Direct array response (possibly from mock data)
        eventsList = response;
      } else if (response.events && Array.isArray(response.events)) {
        // Another possible structure
        eventsList = response.events;
      }
      
      setEvents(eventsList);
      setError('');
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to fetch events: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (name === 'image' && files.length > 0) {
      setFormData({ ...formData, image: files[0] });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      capacity: 0,
      image: null
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (event) => {
    // Extract time from date if it exists
    let eventDate = '';
    let eventTime = '';
    
    if (event.date) {
      const date = new Date(event.date);
      if (!isNaN(date.getTime())) {
        eventDate = date.toISOString().split('T')[0];
        eventTime = date.toTimeString().split(' ')[0].substring(0, 5);
      }
    }
    
    setCurrentEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: eventDate,
      time: eventTime,
      location: event.location || '',
      capacity: event.capacity || 0,
      image: null
    });
    setShowEditModal(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Combine date and time
      const dateTime = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}:00`) 
        : new Date();
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        location: formData.location,
        capacity: formData.capacity,
        createdBy: user._id || user.id
      };
      
      console.log('Creating event with data:', eventData);
      await eventsAPI.createEvent(eventData);
      
      // Refresh events list
      fetchEvents();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create event:', err);
      setError('Failed to create event: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Combine date and time
      const dateTime = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}:00`) 
        : new Date();
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        location: formData.location,
        capacity: formData.capacity
      };
      
      console.log('Updating event with data:', eventData);
      const eventId = currentEvent._id || currentEvent.id;
      await eventsAPI.updateEvent(eventId, eventData);
      
      // Refresh events list
      fetchEvents();
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to update event:', err);
      setError('Failed to update event: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setIsLoading(true);
    try {
      const eventId = event._id || event.id;
      console.log('Deleting event with ID:', eventId);
      await eventsAPI.deleteEvent(eventId);
      
      // Refresh events list
      fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError('Failed to delete event: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get event status based on date
  const getEventStatus = (dateString) => {
    if (!dateString) return 'unknown';
    
    const eventDate = new Date(dateString);
    const now = new Date();
    
    if (isNaN(eventDate.getTime())) return 'unknown';
    
    // Event is in the past
    if (eventDate < now) {
      return 'completed';
    }
    
    // Event is within the next 24 hours
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(now.getDate() + 1);
    if (eventDate < oneDayFromNow) {
      return 'upcoming-soon';
    }
    
    // Event is in the future
    return 'upcoming';
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gray-200 text-gray-800';
      case 'upcoming-soon': return 'bg-yellow-200 text-yellow-800';
      case 'upcoming': return 'bg-green-200 text-green-800';
      case 'cancelled': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Events</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors"
        >
          <FaPlus className="mr-2" /> Create Event
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading && !showCreateModal && !showEditModal ? (
        <div className="text-center py-4">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No events found. Create your first event!</div>
          ) : (
            events.map((event) => {
              const status = event.status || getEventStatus(event.date);
              return (
                <div key={event._id || event.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <h2 className="text-xl font-semibold text-gray-800 mr-3">{event.title}</h2>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <FaCalendarAlt className="mr-1" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FaMapMarkerAlt className="mr-1" />
                        <span>{event.location}</span>
                      </div>
                      
                      {event.capacity > 0 && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <FaUsers className="mr-1" />
                          <span>Capacity: {event.capacity}</span>
                        </div>
                      )}
                      
                      <p className="mt-2 text-gray-700">{event.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(event)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                  {event.image && (
                    <div className="mt-3 flex items-center text-blue-600">
                      <FaPaperclip className="mr-1" />
                      <a href={event.image} target="_blank" rel="noopener noreferrer">
                        View Image
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
                  Capacity (0 for unlimited)
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Event</h2>
            <form onSubmit={handleUpdateEvent}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-title">
                  Title
                </label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-date">
                    Date
                  </label>
                  <input
                    type="date"
                    id="edit-date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-time">
                    Time
                  </label>
                  <input
                    type="time"
                    id="edit-time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-location">
                  Location
                </label>
                <input
                  type="text"
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-capacity">
                  Capacity (0 for unlimited)
                </label>
                <input
                  type="number"
                  id="edit-capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement; 