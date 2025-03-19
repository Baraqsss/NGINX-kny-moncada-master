import Announcement from '../models/announcementModel.js';

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    
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

// Create new announcement
export const createAnnouncement = async (req, res) => {
  try {
    console.log('Creating announcement with data:', req.body);
    console.log('File in request:', req.file);
    
    // Ensure required fields are present
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({
        status: 'fail',
        message: 'Title and content are required fields'
      });
    }
    
    const announcementData = {
      title: req.body.title,
      content: req.body.content,
      createdBy: req.user.id
    };

    // If an image was uploaded, add its URL to the announcement data
    if (req.file) {
      announcementData.image = `/uploads/${req.file.filename}`;
    }

    console.log('Final announcement data to save:', announcementData);
    const newAnnouncement = await Announcement.create(announcementData);
    
    res.status(201).json({
      status: 'success',
      data: {
        announcement: newAnnouncement
      }
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    console.log('Updating announcement with data:', req.body);
    console.log('File in update request:', req.file);
    
    const updateData = { ...req.body };

    // If a new image was uploaded, update the image URL
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      console.log('New image path:', updateData.image);
    }

    console.log('Final update data:', updateData);
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    console.error('Error updating announcement:', error);
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