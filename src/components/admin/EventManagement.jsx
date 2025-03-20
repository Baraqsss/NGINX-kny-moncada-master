import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaPaperclip, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaUser } from 'react-icons/fa';
import { eventsAPI } from '../../services/api';
import { API_BASE_URL } from '../../config/apiConfig';

const EventManagement = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventMembers, setEventMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 0,
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
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
    setImagePreview('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (event) => {
    console.log('Opening edit modal for event:', event);
    
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
    
    console.log(`Event ID: ${event._id || event.id}, Date: ${eventDate}, Time: ${eventTime}`);
    
    // Store the complete event object
    setCurrentEvent({...event}); // Create a copy to avoid reference issues
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Combine date and time into a single ISO string
      const dateTime = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}:00`) 
        : new Date();

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', dateTime.toISOString());
      formDataToSend.append('location', formData.location);
      formDataToSend.append('capacity', formData.capacity);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('Creating event with data:', {
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        location: formData.location,
        capacity: formData.capacity,
        hasImage: !!formData.image
      });

      await eventsAPI.createEvent(formDataToSend);
      
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
      
      // Get the event ID, handling both _id and id formats
      const eventId = currentEvent._id || currentEvent.id;
      
      console.log('Current event:', currentEvent);
      console.log('Updating event with ID:', eventId);
      console.log('Update data:', eventData);
      
      if (!eventId) {
        throw new Error('Could not determine event ID for update');
      }
      
      // Update the event
      const response = await eventsAPI.updateEvent(eventId, eventData);
      console.log('Event updated successfully:', response);
      
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

  // Add new function to fetch members for an event
  const fetchEventMembers = async (eventId) => {
    setLoadingMembers(true);
    try {
      console.log('Fetching members for event:', eventId);
      const response = await eventsAPI.getEventMembers(eventId);
      console.log('Event members response:', response);
      
      let membersList = [];
      if (response.data && response.data.members) {
        membersList = response.data.members;
      } else if (Array.isArray(response.data)) {
        membersList = response.data;
      } else if (response.members && Array.isArray(response.members)) {
        membersList = response.members;
      }
      
      setEventMembers(membersList);
    } catch (err) {
      console.error('Failed to fetch event members:', err);
      setEventMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // New function to handle opening members modal
  const openMembersModal = (event) => {
    setCurrentEvent(event);
    setShowMembersModal(true);
    fetchEventMembers(event._id || event.id);
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

      {isLoading && !showCreateModal && !showEditModal && !showMembersModal ? (
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
                    <div className="flex-1 cursor-pointer" onClick={() => openMembersModal(event)}>
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
                      
                      <div className="flex items-center text-sm  text-gray-600 mb-2">
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
                  <div className="flex justify-between items-center mt-2">
                    {event.image && (
                      <div className="flex items-center text-blue-600">
                        <FaPaperclip className="mr-1" />
                        <a href={event.image.startsWith('http') 
                          ? event.image 
                          : `${API_BASE_URL}${event.image}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            const imageUrl = event.image.startsWith('http') 
                              ? event.image 
                              : `${API_BASE_URL}${event.image}`;
                            window.open(imageUrl, '_blank');
                          }}
                        >
                          View Image
                        </a>
                      </div>
                    )}
                    <button
                      onClick={() => openMembersModal(event)}
                      className="text-violet-600 hover:text-violet-800 flex items-center"
                    >
                      <FaUsers className="mr-1" />
                      <span>View Members ({event.registeredUsers?.length || 0})</span>
                    </button>
                  </div>
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
            <form onSubmit={handleSubmit}>
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-[#9985be] leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-[#9985be] leading-tight focus:outline-none focus:shadow-outline h-32"
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-[#9985be] leading-tight focus:outline-none focus:shadow-outline"
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-[#9985be] leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-[#9985be] leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-[#9985be] leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="mb-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-auto"
                        />
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-violet-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#9985be] text-white leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#9985be] text-white leading-tight focus:outline-none focus:shadow-outline h-32"
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#9985be] text-white leading-tight focus:outline-none focus:shadow-outline"
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#9985be] text-white leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#9985be] text-white leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#9985be] text-white leading-tight focus:outline-none focus:shadow-outline"
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

export default EventManagement; 
