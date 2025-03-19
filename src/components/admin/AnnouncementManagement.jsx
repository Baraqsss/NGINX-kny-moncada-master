import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaPaperclip } from 'react-icons/fa';
import { announcementsAPI } from '../../services/api';
import { API_BASE_URL } from '../../config/apiConfig';

const AnnouncementManagement = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching announcements...');
      const response = await announcementsAPI.getAllAnnouncements();
      console.log('Announcements response:', response);
      
      // Handle different response structures
      let announcementsList = [];
      if (response.data && response.data.announcements) {
        // Backend API response structure
        announcementsList = response.data.announcements;
      } else if (Array.isArray(response)) {
        // Direct array response (possibly from mock data)
        announcementsList = response;
      } else if (response.announcements && Array.isArray(response.announcements)) {
        // Another possible structure
        announcementsList = response.announcements;
      }
      
      setAnnouncements(announcementsList);
      setError('');
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      setError('Failed to fetch announcements: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      setFormData({ ...formData, image: files[0] });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image: null
    });
    setImagePreview('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (announcement) => {
    // Clear any existing preview
    setImagePreview('');
    
    // Set the current announcement data
    setCurrentAnnouncement(announcement);
    
    // Initialize form data with current announcement values
    setFormData({
      title: announcement.title || '',
      content: announcement.content || announcement.message || '',
      image: null // We'll only set a new image if the user uploads one
    });
    
    // Open the modal
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      // Log the data we're trying to send
      console.log('Form data being prepared:', formData);
      
      // Explicitly set the key/value pairs to ensure they're added correctly
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Debug - log the keys in formData
      console.log('FormData keys:', [...formDataToSend.entries()].map(entry => `${entry[0]}: ${entry[1]}`));
      
      // Create the announcement
      const response = await announcementsAPI.createAnnouncement({
        title: formData.title,
        content: formData.content,
        image: formData.image
      });
      
      console.log('Announcement created successfully:', response);
      fetchAnnouncements();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create announcement:', err);
      setError('Failed to create announcement: ' + (err.message || 'Unknown error'));
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

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Updating announcement with data:', formData);
      
      // Prepare the data to update
      const updateData = {
        title: formData.title,
        content: formData.content
      };
      
      // If there's a new image, include it
      if (formData.image instanceof File) {
        updateData.image = formData.image;
      }
      
      const announcementId = currentAnnouncement._id || currentAnnouncement.id;
      const response = await announcementsAPI.updateAnnouncement(announcementId, updateData);
      console.log('Announcement updated successfully:', response);
      
      // Refresh announcements list
      fetchAnnouncements();
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to update announcement:', err);
      setError('Failed to update announcement: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcement) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    setIsLoading(true);
    try {
      const announcementId = announcement._id || announcement.id;
      console.log('Deleting announcement with ID:', announcementId);
      await announcementsAPI.deleteAnnouncement(announcementId);
      
      // Refresh announcements list
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      setError('Failed to delete announcement: ' + (err.message || 'Unknown error'));
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

  // Render the component
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Announcements</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors"
        >
          <FaPlus className="mr-2" /> Create an Announcement
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading && !showCreateModal && !showEditModal ? (
        <div className="text-center py-4">Loading announcements...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No announcements found. Create your first announcement!</div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement._id || announcement.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{announcement.title}</h2>
                    <p className="text-sm text-gray-500">
                      Posted on {formatDate(announcement.createdAt)}
                    </p>
                    <p className="mt-2 text-gray-700 whitespace-pre-line">
                      {announcement.content || announcement.message}
                    </p>
                    
                    {announcement.image && (
                      <div className="mt-4">
                        <img 
                          src={announcement.image.startsWith('http') 
                            ? announcement.image 
                            : `http://localhost:5000${announcement.image}`} 
                          alt={announcement.title}
                          className="max-w-full h-auto rounded-lg max-h-48 object-contain"
                          onError={(e) => {
                            console.error('Failed to load announcement image:', announcement.image);
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3e%3crect fill='%23f8f9fa' width='800' height='400'/%3e%3ctext fill='%23adb5bd' font-family='Arial,sans-serif' font-size='32' font-weight='bold' text-anchor='middle' x='400' y='210'%3eAnnouncement Image%3c/text%3e%3c/svg%3e";
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(announcement)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
                {announcement.attachment && (
                  <div className="mt-3 flex items-center text-blue-600">
                    <FaPaperclip className="mr-1" />
                    <a href={announcement.attachment} target="_blank" rel="noopener noreferrer">
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Announcement</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block  text-gray-700 text-sm font-bold mb-2" htmlFor="title">
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Announcement Image
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
                        htmlFor="announcement-image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-violet-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="announcement-image-upload"
                          name="announcement-image-upload"
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

      {/* Edit Announcement Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Announcement</h2>
            <form onSubmit={handleUpdateAnnouncement}>
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-content">
                  Content
                </label>
                <textarea
                  id="edit-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#9985be] text-white leading-tight focus:outline-none focus:shadow-outline h-32"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Announcement Image
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
                    ) : currentAnnouncement?.image ? (
                      <div className="mb-4">
                        <img
                          src={currentAnnouncement.image.startsWith('http') 
                            ? currentAnnouncement.image 
                            : `http://localhost:5000${currentAnnouncement.image}`}
                          alt={currentAnnouncement.title}
                          className="mx-auto h-32 w-auto"
                          onError={(e) => {
                            console.error('Failed to load announcement image:', currentAnnouncement.image);
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3e%3crect fill='%23f8f9fa' width='800' height='400'/%3e%3ctext fill='%23adb5bd' font-family='Arial,sans-serif' font-size='32' font-weight='bold' text-anchor='middle' x='400' y='210'%3eAnnouncement Image%3c/text%3e%3c/svg%3e";
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
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
                        htmlFor="edit-image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-violet-500"
                      >
                        <span>Upload a new image</span>
                        <input
                          id="edit-image-upload"
                          name="image"
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

export default AnnouncementManagement; 