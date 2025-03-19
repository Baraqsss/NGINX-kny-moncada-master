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
    
    // Get donation statistics
    const donationStats = await Donation.aggregate([
      {
        $match: { status: 'Completed' }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Get recent donations
    const recentDonations = await Donation.find()
      .sort({ date: -1 })
      .limit(5);

    // Get method distribution
    const methodDistribution = await Donation.aggregate([
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Return stats
    res.status(200).json({
      totalUsers,
      pendingUsers,
      totalEvents,
      totalAnnouncements,
      totalDonations,
      totalDonationAmount,
      stats: donationStats[0] || {
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0
      },
      recentDonations,
      methodDistribution
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Failed to get dashboard statistics' });
  }
}; 