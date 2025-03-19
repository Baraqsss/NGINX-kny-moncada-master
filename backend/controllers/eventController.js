import Event from '../models/eventModel.js';
import User from '../models/userModel.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    
    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get event by ID
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredUsers', 'name email')
      .populate('interestedUsers', 'name email');
    
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create new event (admin only)
export const createEvent = async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      location: req.body.location,
      capacity: parseInt(req.body.capacity) || 0,
      createdBy: req.user.id
    };

    // If an image was uploaded, add its URL to the event data
    if (req.file) {
      eventData.image = `/uploads/${req.file.filename}`;
    }

    console.log('Creating event with data:', eventData);
    const newEvent = await Event.create(eventData);
    
    res.status(201).json({
      status: 'success',
      data: {
        event: newEvent
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update event (admin only)
export const updateEvent = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If a new image was uploaded, update the image URL
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete event (admin only)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
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

// Register for an event
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
      });
    }
    
    // Check if user is already registered
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'already registered'
      });
    }
    
    // Check if event has reached capacity
    if (event.capacity > 0 && event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Event has reached maximum capacity'
      });
    }
    
    // Add user to registered users
    event.registeredUsers.push(req.user.id);
    await event.save();
    
    // Add event to user's registered events
    const user = await User.findById(req.user.id);
    user.eventsRegistered.push(event.id);
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Show interest in an event
export const showInterestInEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
      });
    }
    
    // Check if user is already interested
    if (event.interestedUsers.includes(req.user.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'already shown interest'
      });
    }
    
    // Add user to interested users
    event.interestedUsers.push(req.user.id);
    await event.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get events that the user is interested in
export const getInterestedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      interestedUsers: req.user.id
    }).sort({ date: 1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        events
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Unregister from an event
export const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
      });
    }
    
    // Check if user is registered
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are not registered for this event'
      });
    }
    
    // Remove user from registered users
    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.id
    );
    await event.save();
    
    // Remove event from user's registered events
    const user = await User.findById(req.user.id);
    user.eventsRegistered = user.eventsRegistered.filter(
      eventId => eventId.toString() !== event.id
    );
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 