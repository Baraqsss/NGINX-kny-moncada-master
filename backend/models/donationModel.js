import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: [true, 'Donor name is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Cash', 'G-Cash']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Completed', 'Refunded'],
    default: 'Completed'
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  referenceNumber: {
    type: String,
    sparse: true
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
donationSchema.index({ donorName: 1 });
donationSchema.index({ date: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ method: 1 });
donationSchema.index({ referenceNumber: 1 }, { sparse: true });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation; 