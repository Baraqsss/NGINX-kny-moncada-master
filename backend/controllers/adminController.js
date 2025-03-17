import User from '../models/userModel.js';
import Event from '../models/eventModel.js';
import Announcement from '../models/announcementModel.js';
import Donation from '../models/donationModel.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts from each collection
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ isApproved: false });
    const totalEvents = await Event.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();
    const totalDonations = await Donation.countDocuments();
    
    // Calculate total donation amount
    const donations = await Donation.find();
    const totalDonationAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
    
    // Return stats
    res.status(200).json({
      totalUsers,
      pendingUsers,
      totalEvents,
      totalAnnouncements,
      totalDonations,
      totalDonationAmount
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Failed to get dashboard statistics' });
  }
}; 