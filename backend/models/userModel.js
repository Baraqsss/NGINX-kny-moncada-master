import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Add indexes for performance
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    index: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required']
  },
  birthday: {
    type: Date
  },
  memberOrg: {
    type: String,
    enum: ['yes', 'no']
  },
  organization: {
    type: String
  },
  committee: {
    type: String,
    enum: [
      'Campaign and Advocacy',
      'Programs and Events',
      'Social Media and Communications',
      'Finance',
      'Membership'
    ]
  },
  role: {
    type: String,
    enum: ['Member', 'Admin'],
    default: 'Member',
    index: true
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        // Skip validation if not provided
        if (!v) return true;
        return /^\d{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profilePicture: String,
  eventsRegistered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  isApproved: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Performance optimizations
  strict: true, 
  minimize: false
});

// Hash password before saving - optimize for speed
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Use lower salt rounds for faster hashing (8 instead of 10)
    // Still secure but faster for serverless functions
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create compound index for common queries
userSchema.index({ username: 1, email: 1 });

// Method to check if password is correct
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 