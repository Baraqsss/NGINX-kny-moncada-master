import Donation from '../models/donationModel.js';

// Get all donations (admin only)
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: donations.length,
      data: {
        donations
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get donation by ID (admin or donor)
export const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        status: 'fail',
        message: 'No donation found with that ID'
      });
    }
    
    // Check if user is admin or the donor
    if (req.user.role !== 'admin' && 
        (!donation.donor.userId || donation.donor.userId.toString() !== req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this donation'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        donation
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create new donation
export const createDonation = async (req, res) => {
  try {
    // If user is logged in, add their ID to the donation
    if (req.user) {
      req.body.donor = {
        ...req.body.donor,
        userId: req.user.id
      };
    }
    
    const newDonation = await Donation.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        donation: newDonation
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update donation status (admin only)
export const updateDonationStatus = async (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a status'
      });
    }
    
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!donation) {
      return res.status(404).json({
        status: 'fail',
        message: 'No donation found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        donation
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get donation statistics (admin only)
export const getDonationStats = async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 