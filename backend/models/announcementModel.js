import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An announcement must have a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'An announcement must have content'],
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An announcement must have a creator']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: null
  }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement; 