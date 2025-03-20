import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCheck, FaTimes, FaEye, FaEdit, FaTrash, FaSearch, FaFilter, FaSort, FaUserShield } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching users...');
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Direct API call to ensure we get the real data
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token'); // Clear invalid token
        throw new Error('Your session has expired. Please log in again.');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Users response:', data);
      
      // Handle different response structures
      let usersList = [];
      if (data.data && data.data.users) {
        usersList = data.data.users;
      } else if (Array.isArray(data)) {
        usersList = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersList = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
      }
      
      setUsers(usersList);
      setError('');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to fetch users: ' + (err.message || 'Unknown error'));
      // If it's an authentication error, redirect to login
      if (err.message.includes('Please log in again')) {
        // You might want to redirect to login page here
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setIsLoading(true);
      console.log(`Approving user with ID: ${userId}`);
      
      // Direct API call to approve user
      const response = await fetch(`http://localhost:5000/api/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve user: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setUsers(users.map(u => 
        (u._id === userId || u.id === userId) 
          ? { ...u, isApproved: true } 
          : u
      ));
      
      setError('');
    } catch (err) {
      console.error('Failed to approve user:', err);
      setError('Failed to approve user: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      setIsLoading(true);
      console.log(`Rejecting user with ID: ${userId}`);
      
      // Direct API call to reject user
      const response = await fetch(`http://localhost:5000/api/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reject user: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setUsers(users.map(u => 
        (u._id === userId || u.id === userId) 
          ? { ...u, isApproved: false } 
          : u
      ));
      
      setError('');
    } catch (err) {
      console.error('Failed to reject user:', err);
      setError('Failed to reject user: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setCurrentUser(users.find(u => u._id === userId || u.id === userId));
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        console.log(`Deleting user with ID: ${userId}`);
        
        // Direct API call to delete user
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
        }
        
        // Update local state
        setUsers(users.filter(u => u._id !== userId && u.id !== userId));
        
        setError('');
        setShowConfirmModal(false);
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError('Failed to delete user: ' + (err.message || 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setIsLoading(true);
      console.log(`Updating user ${userId} role to ${newRole}`);
      
      // Direct API call to update user role
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setUsers(users.map(u => 
        (u._id === userId || u.id === userId) 
          ? { ...u, role: newRole } 
          : u
      ));
      
      setError('');
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const openUserModal = (user) => {
    setCurrentUser(user);
    setShowUserModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // If already sorting by this field, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, sort by this field in ascending order
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    // Search term filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      searchTerm === '' || 
      (user.name || '').toLowerCase().includes(searchLower) ||
      (user.username || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower);
    
    // Status filter
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      matchesStatus = filterStatus === 'approved' ? user.isApproved : !user.isApproved;
    }
    
    // Role filter
    let matchesRole = true;
    if (filterRole !== 'all') {
      matchesRole = (user.role || '').toLowerCase() === filterRole.toLowerCase();
    }
    
    return matchesSearch && matchesStatus && matchesRole;
  }).sort((a, b) => {
    // Sort by selected field
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'username':
        comparison = (a.username || '').localeCompare(b.username || '');
        break;
      case 'email':
        comparison = (a.email || '').localeCompare(b.email || '');
        break;
      case 'role':
        comparison = (a.role || '').localeCompare(b.role || '');
        break;
      case 'createdAt':
      default:
        comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    
    // Apply sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
          <div className="flex items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 bg-[#9985be] text-black"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <FaFilter className="mr-2 text-gray-500" />
              <select
                value={filterStatus}
                onChange={handleStatusFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500 bg-[#9985be] text-white"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
            
            <div className="flex items-center ml-2">
              <select
                value={filterRole}
                onChange={handleRoleFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500 bg-[#9985be] text-white"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-violet-100 p-3 rounded-md mb-4">
          <p className="text-violet-800 font-semibold">
            Total Users: {filteredUsers.length} 
            {filterStatus !== 'all' && ` (${filterStatus})`}
            {filterRole !== 'all' && ` (${filterRole})`}
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortBy === 'name' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('email')}
                    >
                      <div className="flex items-center">
                        Email
                        {sortBy === 'email' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('role')}
                    >
                      <div className="flex items-center">
                        Role
                        {sortBy === 'role' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.profilePicture ? (
                              <img 
                                src={user.profilePicture} 
                                alt={user.name} 
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <span className="text-gray-500 font-semibold">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role?.toLowerCase() === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role || 'Member'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openUserModal(user)}
                          className="text-violet-600 hover:text-violet-900 mr-3"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        
                        {!user.isApproved && (
                          <button
                            onClick={() => handleApproveUser(user._id || user.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Approve User"
                          >
                            <FaCheck />
                          </button>
                        )}
                        
                        {user.isApproved && (
                          <button
                            onClick={() => handleRejectUser(user._id || user.id)}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                            title="Revoke Approval"
                          >
                            <FaTimes />
                          </button>
                        )}
                        
                        {user.role?.toLowerCase() !== 'admin' && (
                          <button
                            onClick={() => handleUpdateRole(user._id || user.id, 'Admin')}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                            title="Make Admin"
                          >
                            <FaUserShield />
                          </button>
                        )}
                        
                        {user.role?.toLowerCase() === 'admin' && user._id !== (user?._id || user?.id) && (
                          <button
                            onClick={() => handleUpdateRole(user._id || user.id, 'Member')}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Remove Admin"
                          >
                            <FaUserShield />
                          </button>
                        )}
                        
                        {user._id !== (user?._id || user?.id) && (
                          <button
                            onClick={() => handleDeleteUser(user._id || user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                {currentUser.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt={currentUser.name} 
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <span className="text-gray-500 text-xl font-semibold">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                <p className="text-gray-600">@{currentUser.username}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{currentUser.role || 'Member'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{currentUser.isApproved ? 'Approved' : 'Pending'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium">{formatDate(currentUser.createdAt)}</p>
              </div>
            </div>
            
            {currentUser.phone && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{currentUser.phone}</p>
              </div>
            )}
            
            {currentUser.address && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {[
                    currentUser.address.street,
                    currentUser.address.city,
                    currentUser.address.state,
                    currentUser.address.zipCode,
                    currentUser.address.country
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            
            {currentUser.organization && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Organization</p>
                <p className="font-medium">{currentUser.organization}</p>
              </div>
            )}
            
            {currentUser.committee && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Committee</p>
                <p className="font-medium">{currentUser.committee}</p>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              {!currentUser.isApproved ? (
                <button
                  onClick={() => {
                    handleApproveUser(currentUser._id || currentUser.id);
                    setShowUserModal(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Approve User
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleRejectUser(currentUser._id || currentUser.id);
                    setShowUserModal(false);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                >
                  Revoke Approval
                </button>
              )}
              
              <button
                onClick={() => setShowUserModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-6">Are you sure you want to delete the user <span className="font-semibold">{currentUser.name}</span>? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 