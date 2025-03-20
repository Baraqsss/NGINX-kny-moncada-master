import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaDownload, FaSearch, FaFilter, FaSort, FaEye, FaCheck, FaTimes, FaFileUpload, FaFileDownload, FaPlus, FaTrash } from 'react-icons/fa';
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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    method: 'Cash',
    status: 'Completed',
    date: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    donorName: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch donations on component mount
  useEffect(() => {
    fetchDonations();
  }, [currentPage, filters]);

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

  // Filter donations
  const filteredDonations = donations.filter(donation => {
    const matchesDonorName = !filters.donorName || 
      donation.donorName.toLowerCase().includes(filters.donorName.toLowerCase());
    
    const matchesStatus = !filters.status || 
      donation.status === filters.status;
    
    const matchesMethod = !filters.method || 
      donation.method === filters.method;
    
    return matchesDonorName && matchesStatus && matchesMethod;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the donationsAPI service instead of direct fetch
      console.log('Creating donation with data:', formData);
      const response = await donationsAPI.createDonation(formData);
      console.log('Donation created:', response);

      if (response.data && response.data.donation) {
        setDonations([response.data.donation, ...donations]);
      } else if (response.donation) {
        setDonations([response.donation, ...donations]);
      }
      
      setShowForm(false);
      setFormData({
        donorName: '',
        amount: '',
        method: 'Cash',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        notes: ''
      });
      
      setError('Donation added successfully!');
      setTimeout(() => setError(''), 3000);
      fetchDonations();
    } catch (err) {
      console.error('Error creating donation:', err);
      setError(err.message || 'Failed to create donation');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      console.log('Importing donations from file:', file.name);
      const response = await donationsAPI.importDonations(file);
      console.log('Import response:', response);
      
      setError(`Successfully imported ${response.count || 'multiple'} donations`);
      setTimeout(() => setError(''), 3000);
      fetchDonations();
    } catch (err) {
      console.error('Error importing donations:', err);
      setError(err.message || 'Failed to import donations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // Get the filtered donations
      const dataToExport = filteredDonations.map(donation => ({
        'Donor Name': donation.donorName,
        'Amount': `₱${donation.amount.toFixed(2)}`,
        'Method': donation.method,
        'Status': donation.status,
        'Date': new Date(donation.date).toLocaleDateString(),
        'Reference Number': donation.referenceNumber || '-',
        'Notes': donation.notes || '-'
      }));

      // Add total amount row
      const totalRow = {
        'Donor Name': 'TOTAL',
        'Amount': `₱${totalAmount.toFixed(2)}`,
        'Method': '',
        'Status': '',
        'Date': '',
        'Reference Number': '',
        'Notes': ''
      };
      dataToExport.push(totalRow);

      // Convert to CSV
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => 
          headers.map(header => {
            const cell = row[header] || '';
            // Escape commas and quotes in the cell value
            return `"${String(cell).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `donations_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setError('Donations exported successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error exporting donations:', err);
      setError('Failed to export donations');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;

    setIsLoading(true);
    try {
      console.log('Deleting donation with ID:', id);
      await donationsAPI.deleteDonation(id);
      
      setDonations(donations.filter(d => (d._id || d.id) !== id));
      setError('Donation deleted successfully');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error deleting donation:', err);
      setError(err.message || 'Failed to delete donation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Donation Management</h1>
        <div className="flex space-x-2">
          <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
            <FaFileUpload className="inline mr-2" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaFileDownload className="inline mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
          >
            <FaPlus className="inline mr-2" />
            Add Donation
          </button>
        </div>
      </div>

      {/* Success and Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Donation Form */}
      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Donation</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Donor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Method <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
                required
              >
                <option value="Cash">Cash</option>
                <option value="G-Cash">G-Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
                required
              >
                <option value="Completed">Completed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
                rows="3"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Save Donation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Donor Name
            </label>
            <input
              type="text"
              value={filters.donorName}
              onChange={(e) => setFilters({ ...filters, donorName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
              placeholder="Search by donor name"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
            >
              <option value="">All</option>
              <option value="Completed">Completed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Method
            </label>
            <select
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-white bg-[#9985be] focus:outline-none focus:border-violet-500"
            >
              <option value="">All</option>
              <option value="Cash">Cash</option>
              <option value="G-Cash">G-Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDonations.map((donation) => (
              <tr key={donation._id}>
                <td className="px-6 py-4 whitespace-nowrap">{donation.donorName}</td>
                <td className="px-6 py-4 whitespace-nowrap">₱{donation.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{donation.method}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      donation.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {donation.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(donation.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{donation.referenceNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(donation._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Next
          </button>
        </nav>
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