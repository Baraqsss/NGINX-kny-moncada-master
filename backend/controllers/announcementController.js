import Announcement from '../models/announcementModel.js';

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: {
        announcements
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get announcement by ID
export const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!announcement) {
      return res.status(404).json({
        status: 'fail',
        message: 'No announcement found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        announcement
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create new announcement (admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const newAnnouncement = await Announcement.create({
      ...req.body,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        announcement: newAnnouncement
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update announcement (admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!announcement) {
      return res.status(404).json({
        status: 'fail',
        message: 'No announcement found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        announcement
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete announcement (admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        status: 'fail',
        message: 'No announcement found with that ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 