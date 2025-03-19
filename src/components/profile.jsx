import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaBuilding, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { shouldUseMockData } from '../utils/apiUtils';

// Use a data URL for the default profile image instead of importing from assets
const defaultProfilePic = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const Profile = () => {
  const { user: authUser, token, updateUserData } = useAuth();
  const [userDetails, setUserDetails] = useState(authUser || null);
  const [isLoading, setIsLoading] = useState(!authUser);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userDetails) {
      initializeFormData(userDetails);
    }
  }, [userDetails]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching detailed user profile...');
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        
        const { data } = await response.json();
        console.log('Received user profile data from API:', data);
        
        setUserDetails(data.user);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to fetch user details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authUser, token]);

  const initializeFormData = (userData) => {
    setFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      birthday: userData?.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
      organization: userData?.organization || '',
      committee: userData?.committee || '',
      address: {
        street: userData?.address?.street || '',
        city: userData?.address?.city || '',
        state: userData?.address?.state || '',
        zipCode: userData?.address?.zipCode || '',
        country: userData?.address?.country || ''
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('Submitting profile update:', formData);
      
      const formDataToSend = new FormData();
      
      // Append user data
      Object.keys(formData).forEach(key => {
        if (key === 'address') {
          Object.keys(formData.address).forEach(addressKey => {
            formDataToSend.append(`address[${addressKey}]`, formData.address[addressKey]);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append profile image if changed
      if (profileImage) {
        formDataToSend.append('profilePicture', profileImage);
      }

      // Make the API call
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const { data } = await response.json();
      console.log('Profile updated successfully:', data);

      // Update local state
      setUserDetails(data.user);
      updateUserData(data.user);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading spinner when initially loading
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !userDetails) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            setUserDetails(authUser);
          }}
          className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show message if no user details
  if (!userDetails) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-600">No user profile available. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              type="button"
              className="text-green-700"
              onClick={() => setSuccessMessage('')}
            >
              ✕
            </button>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white">
                <img
                  src={
                    imagePreview || 
                    userDetails?.profilePicture || 
                    defaultProfilePic
                  }
                  alt={userDetails?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer">
                  <FaEdit className="text-violet-700" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userDetails?.name}</h1>
              <p className="text-indigo-200">{userDetails?.role || 'Member'}</p>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 flex items-center bg-white text-violet-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-100"
                >
                  <FaEdit className="mr-1" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form/Display Content */}
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Birthday</label>
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                    />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Organization Details</h2>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Committee</label>
                    <select
                      name="committee"
                      value={formData.committee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                    >
                      <option value="">Select Committee</option>
                      <option value="Campaign and Advocacy">Campaign and Advocacy</option>
                      <option value="Programs and Events">Programs and Events</option>
                      <option value="Social Media and Communications">Social Media and Communications</option>
                      <option value="Finance">Finance</option>
                      <option value="Membership">Membership</option>
                    </select>
                  </div>
                  
                  <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Address</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Street</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">State/Province</label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Zip Code</label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setImagePreview(null);
                    initializeFormData(userDetails);
                  }}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  disabled={isUpdating}
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <FaUser className="text-gray-500 mr-2" />
                    <span className="text-gray-600 font-medium">Full Name:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.name || 'Not specified'}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-500 mr-2" />
                    <span className="text-gray-600 font-medium">Email:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.email || 'Not specified'}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <FaPhone className="text-gray-500 mr-2" />
                    <span className="text-gray-600 font-medium">Phone:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.phone || 'Not specified'}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-500 mr-2" />
                    <span className="text-gray-600 font-medium">Birthday:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.birthday ? formatDate(userDetails.birthday) : 'Not specified'}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium">Age:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.age || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Organization Details</h2>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <FaBuilding className="text-gray-500 mr-2" />
                    <span className="text-gray-600 font-medium">Organization:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.organization || 'Not specified'}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium">Committee:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.committee || 'Not specified'}</p>
                </div>
                
                <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Address</h3>
                
                {userDetails?.address ? (
                  <div className="ml-2">
                    <p className="text-gray-800">
                      {[
                        userDetails.address.street,
                        userDetails.address.city,
                        userDetails.address.state,
                        userDetails.address.zipCode,
                        userDetails.address.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="ml-2 text-gray-600">No address specified</p>
                )}
                
                <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Account Information</h3>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium">Username:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.username}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium">Member Since:</span>
                  </div>
                  <p className="ml-6 text-gray-800">{userDetails?.createdAt ? formatDate(userDetails.createdAt) : 'Not available'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;