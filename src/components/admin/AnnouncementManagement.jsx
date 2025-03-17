import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaPaperclip } from 'react-icons/fa';
import { announcementsAPI } from '../../services/api';
import { ANNOUNCEMENT_ENDPOINTS } from '../../config/apiConfig';

const AnnouncementManagement = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    attachment: null
  });
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
    if (name === 'attachment' && files.length > 0) {
      setFormData({ ...formData, attachment: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      attachment: null
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (announcement) => {
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content || announcement.message,
      attachment: null
    });
    setShowEditModal(true);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const announcementData = {
        title: formData.title,
        content: formData.content,
        createdBy: user._id
      };
      
      console.log('Creating announcement with data:', announcementData);
      await announcementsAPI.createAnnouncement(announcementData);
      
      // Refresh announcements list
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

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const announcementData = {
        title: formData.title,
        content: formData.content
      };
      
      console.log('Updating announcement with data:', announcementData);
      const announcementId = currentAnnouncement._id || currentAnnouncement.id;
      await announcementsAPI.updateAnnouncement(announcementId, announcementData);
      
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
            <form onSubmit={handleCreateAnnouncement}>
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  required
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

export default AnnouncementManagement; 