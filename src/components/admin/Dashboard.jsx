import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaBullhorn, FaMoneyBillWave, FaTachometerAlt, FaUserShield } from 'react-icons/fa';
import { ADMIN_ENDPOINTS } from '../../config/apiConfig';
import { get } from '../../utils/apiUtils';
import { adminAPI } from '../../services/api';

import UserManagement from './UserManagement';
import EventManagement from './EventManagement';
import AnnouncementManagement from './AnnouncementManagement';
import DonationManagement from './DonationManagement';

// Fallback stats in case the API fails
const FALLBACK_STATS = {
  totalUsers: 0,
  pendingUsers: 0,
  totalEvents: 0,
  totalAnnouncements: 0,
  totalDonations: 0
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set active tab based on current path
    const path = location.pathname.split('/').pop();
    if (path === 'dashboard' || path === '') {
      setActiveTab('overview');
    } else {
      setActiveTab(path);
    }

    // Fetch dashboard stats
    fetchDashboardStats();
  }, [location.pathname]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Use the adminAPI service to get dashboard stats
      const data = await adminAPI.getDashboardStats();
      setStats(data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError('Failed to fetch dashboard statistics. Using default values.');
      // Keep using the current stats or fallback stats
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure user is admin
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700"></div>
        <p className="ml-3 text-violet-700">Loading...</p>
      </div>
    );
  }

  if (user.role !== 'Admin') {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-600">You do not have permission to access this page.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-4 py-2 bg-violet-700 text-white rounded hover:bg-violet-800"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaTachometerAlt /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'events', label: 'Events', icon: <FaCalendarAlt /> },
    { id: 'announcements', label: 'Announcements', icon: <FaBullhorn /> },
    { id: 'donations', label: 'Donations', icon: <FaMoneyBillWave /> }
  ];

  return (
    <div className="container mt-24 mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <FaUserShield className="text-violet-700 text-3xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.id === 'overview' ? '/admin/dashboard' : `/admin/dashboard/${tab.id}`}
              className={`flex items-center px-4 py-2 mr-2 ${
                activeTab === tab.id
                  ? 'text-violet-700 border-b-2 border-violet-700 font-medium'
                  : 'text-gray-600 hover:text-violet-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Dashboard Content */}
      {activeTab === 'overview' && (
        <>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading dashboard statistics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                    <FaUsers size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/admin/dashboard/users" className="text-blue-500 hover:underline text-sm">
                    View all users
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                    <FaUsers size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.pendingUsers}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/admin/dashboard/users" className="text-yellow-500 hover:underline text-sm">
                    Review pending users
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                    <FaCalendarAlt size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Events</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalEvents}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/admin/dashboard/events" className="text-green-500 hover:underline text-sm">
                    Manage events
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                    <FaMoneyBillWave size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalDonations}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/admin/dashboard/donations" className="text-purple-500 hover:underline text-sm">
                    View donations
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Component Routes */}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'events' && <EventManagement />}
      {activeTab === 'announcements' && <AnnouncementManagement />}
      {activeTab === 'donations' && <DonationManagement />}
    </div>
  );
};

export default Dashboard; 