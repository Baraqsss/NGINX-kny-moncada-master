import Donation from '../models/donationModel.js';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';
import { Readable } from 'stream';

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
    const donation = await Donation.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
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

// Get all donations with filtering and pagination
export const getDonations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.method) filter.method = req.query.method;
    if (req.query.donorName) {
      filter.donorName = { $regex: req.query.donorName, $options: 'i' };
    }
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Donation.countDocuments(filter)
    ]);

    res.json({
      status: 'success',
      data: {
        donations,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Import donations from CSV
export const importDonations = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Please upload a CSV file'
    });
  }

  try {
    const donations = [];
    const fileBuffer = req.file.buffer;
    const stream = Readable.from(fileBuffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          donations.push({
            donorName: row.donorName,
            amount: parseFloat(row.amount),
            method: row.method,
            status: row.status || 'Completed',
            date: row.date ? new Date(row.date) : new Date(),
            referenceNumber: row.referenceNumber,
            notes: row.notes,
            createdBy: req.user._id
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const importedDonations = await Donation.insertMany(donations);

    res.json({
      status: 'success',
      message: `Successfully imported ${importedDonations.length} donations`,
      count: importedDonations.length
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Export donations to CSV
export const exportDonations = async (req, res) => {
  try {
    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.method) filter.method = req.query.method;
    if (req.query.donorName) {
      filter.donorName = { $regex: req.query.donorName, $options: 'i' };
    }
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const donations = await Donation.find(filter).sort({ date: -1 });

    const csvData = donations.map(donation => ({
      donorName: donation.donorName,
      amount: donation.amount,
      method: donation.method,
      status: donation.status,
      date: donation.date.toISOString().split('T')[0],
      referenceNumber: donation.referenceNumber || '',
      notes: donation.notes || ''
    }));

    const csvString = stringify(csvData, {
      header: true,
      columns: ['donorName', 'amount', 'method', 'status', 'date', 'referenceNumber', 'notes']
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=donations.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update donation
export const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
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

// Delete donation
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        status: 'error',
        message: 'Donation not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
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