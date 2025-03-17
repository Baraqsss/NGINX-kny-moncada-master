import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaDownload, FaSearch, FaFilter, FaSort, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { donationsAPI } from '../../services/api';

const DonationManagement = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalAmount, setTotalAmount] = useState(0);
  const [showDonationDetails, setShowDonationDetails] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);

  // Fetch donations on component mount
  useEffect(() => {
    fetchDonations();
  }, []);

  // Calculate total amount whenever donations change
  useEffect(() => {
    const total = donations.reduce((sum, donation) => {
      // Make sure amount is a number
      const amount = parseFloat(donation.amount) || 0;
      return sum + amount;
    }, 0);
    setTotalAmount(total);
  }, [donations]);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching donations...');
      const response = await donationsAPI.getAllDonations();
      console.log('Donations response:', response);
      
      // Handle different response structures
      let donationsList = [];
      if (response.data && response.data.donations) {
        // Backend API response structure
        donationsList = response.data.donations;
      } else if (Array.isArray(response)) {
        // Direct array response (possibly from mock data)
        donationsList = response;
      } else if (response.donations && Array.isArray(response.donations)) {
        // Another possible structure
        donationsList = response.donations;
      }
      
      setDonations(donationsList);
      setError('');
    } catch (err) {
      console.error('Failed to fetch donations:', err);
      setError('Failed to fetch donations: ' + (err.message || 'Unknown error'));
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
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = 'PHP') => {
    if (amount === undefined || amount === null) return '';
    
    // Make sure amount is a number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '';
    
    // Format based on currency
    switch (currency) {
      case 'USD':
        return `$${numAmount.toFixed(2)}`;
      case 'EUR':
        return `€${numAmount.toFixed(2)}`;
      case 'GBP':
        return `£${numAmount.toFixed(2)}`;
      case 'PHP':
      default:
        return `₱${numAmount.toFixed(2)}`;
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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

  // View donation details
  const viewDonationDetails = (donation) => {
    setCurrentDonation(donation);
    setShowDonationDetails(true);
  };

  // Update donation status
  const updateDonationStatus = async (donationId, newStatus) => {
    try {
      // This would be an API call in a real application
      console.log(`Updating donation ${donationId} status to ${newStatus}`);
      
      // For now, just update the local state
      setDonations(donations.map(donation => 
        (donation._id === donationId || donation.id === donationId) 
          ? { ...donation, status: newStatus } 
          : donation
      ));
      
      // If the current donation is being viewed, update it too
      if (currentDonation && (currentDonation._id === donationId || currentDonation.id === donationId)) {
        setCurrentDonation({ ...currentDonation, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update donation status:', err);
      setError('Failed to update donation status: ' + (err.message || 'Unknown error'));
    }
  };

  // Filter and sort donations
  const filteredDonations = donations.filter(donation => {
    // Search term filter
    const searchLower = searchTerm.toLowerCase();
    const donorName = donation.donor?.name || '';
    const donorEmail = donation.donor?.email || '';
    const purpose = donation.purpose || '';
    const message = donation.message || '';
    
    const matchesSearch = 
      searchTerm === '' || 
      donorName.toLowerCase().includes(searchLower) ||
      donorEmail.toLowerCase().includes(searchLower) ||
      purpose.toLowerCase().includes(searchLower) ||
      message.toLowerCase().includes(searchLower);
    
    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const donationDate = new Date(donation.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = donationDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          matchesDate = donationDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          matchesDate = donationDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
    }
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = donation.status === statusFilter;
    }
    
    return matchesSearch && matchesDate && matchesStatus;
  }).sort((a, b) => {
    // Sort by selected field
    let comparison = 0;
    
    switch (sortBy) {
      case 'amount':
        comparison = parseFloat(a.amount) - parseFloat(b.amount);
        break;
      case 'donor':
        comparison = (a.donor?.name || '').localeCompare(b.donor?.name || '');
        break;
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
      case 'date':
      default:
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
    }
    
    // Apply sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-200 text-green-800';
      case 'pending': return 'bg-yellow-200 text-yellow-800';
      case 'failed': return 'bg-red-200 text-red-800';
      case 'refunded': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Donation Management</h1>
        <button
          onClick={() => {/* Export functionality would go here */}}
          className="flex items-center bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors"
        >
          <FaDownload className="mr-2" /> Export Data
        </button>
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
                placeholder="Search donations..."
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
                value={dateFilter}
                onChange={handleDateFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500 bg-[#9985be] text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div className="flex items-center ml-2">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500 bg-[#9985be] text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-violet-100 p-3 rounded-md mb-4">
          <p className="text-violet-800 font-semibold">
            Total Donations: {formatCurrency(totalAmount)} ({filteredDonations.length} transactions)
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading donations...</div>
        ) : (
          <div className="overflow-x-auto">
            {filteredDonations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No donations found matching your criteria.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortBy === 'date' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('donor')}
                    >
                      <div className="flex items-center">
                        Donor
                        {sortBy === 'donor' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('amount')}
                    >
                      <div className="flex items-center">
                        Amount
                        {sortBy === 'amount' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortBy === 'status' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDonations.map((donation) => (
                    <tr key={donation._id || donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {donation.donor?.name || 'Anonymous'}
                        </div>
                        {donation.donor?.email && (
                          <div className="text-sm text-gray-500">
                            {donation.donor.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(donation.amount, donation.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                          {donation.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewDonationDetails(donation)}
                          className="text-violet-600 hover:text-violet-900 mr-3"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {donation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateDonationStatus(donation._id || donation.id, 'completed')}
                              className="text-green-600 hover:text-green-900 mr-3"
                              title="Mark as Completed"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => updateDonationStatus(donation._id || donation.id, 'failed')}
                              className="text-red-600 hover:text-red-900"
                              title="Mark as Failed"
                            >
                              <FaTimes />
                            </button>
                          </>
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

      {/* Donation Details Modal */}
      {showDonationDetails && currentDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Donation Details</h2>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-semibold">Amount:</span>
                <span className="text-lg font-bold">{formatCurrency(currentDonation.amount, currentDonation.currency)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-semibold">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(currentDonation.status)}`}>
                  {currentDonation.status || 'pending'}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-semibold">Date:</span>
                <span>{formatDate(currentDonation.createdAt)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-semibold">Payment Method:</span>
                <span>{currentDonation.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
              </div>
              
              {currentDonation.transactionId && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-semibold">Transaction ID:</span>
                  <span className="font-mono text-sm">{currentDonation.transactionId}</span>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Donor Information</h3>
              <div className="bg-gray-50 p-3 rounded">
                <p><span className="font-semibold">Name:</span> {currentDonation.donor?.name || 'Anonymous'}</p>
                {currentDonation.donor?.email && (
                  <p><span className="font-semibold">Email:</span> {currentDonation.donor.email}</p>
                )}
                {currentDonation.donor?.phone && (
                  <p><span className="font-semibold">Phone:</span> {currentDonation.donor.phone}</p>
                )}
                {currentDonation.donor?.anonymous && (
                  <p className="text-sm text-gray-500 italic">This donor has chosen to remain anonymous publicly.</p>
                )}
              </div>
            </div>
            
            {currentDonation.purpose && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Purpose</h3>
                <p className="bg-gray-50 p-3 rounded">{currentDonation.purpose}</p>
              </div>
            )}
            
            {currentDonation.message && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Message</h3>
                <p className="bg-gray-50 p-3 rounded whitespace-pre-line">{currentDonation.message}</p>
              </div>
            )}
            
            {currentDonation.status === 'pending' && (
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => {
                    updateDonationStatus(currentDonation._id || currentDonation.id, 'completed');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => {
                    updateDonationStatus(currentDonation._id || currentDonation.id, 'failed');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Mark as Failed
                </button>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDonationDetails(false)}
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

export default DonationManagement; 