import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'A donation must have an amount'],
    min: [1, 'Donation amount must be at least 1']
  },
  currency: {
    type: String,
    default: 'PHP',
    enum: ['PHP', 'USD', 'EUR', 'GBP']
  },
  donor: {
    name: {
      type: String,
      required: [true, 'A donor must have a name']
    },
    email: String,
    phone: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    anonymous: {
      type: Boolean,
      default: false
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'A donation must have a payment method'],
    enum: ['bank_transfer', 'credit_card', 'paypal', 'gcash', 'other']
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  purpose: {
    type: String,
    default: 'general'
  },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation; 