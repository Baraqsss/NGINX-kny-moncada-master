import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An event must have a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'An event must have a description'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'An event must have a date']
  },
  location: {
    type: String,
    required: [true, 'An event must have a location']
  },
  image: String,
  capacity: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  interestedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An event must have a creator']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
});

const Event = mongoose.model('Event', eventSchema);

export default Event; 