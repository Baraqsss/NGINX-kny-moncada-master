import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get user by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    // Don't allow password updates through this route
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updatePassword.'
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
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

// Approve user (admin only)
export const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get pending approval users (admin only)
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false });
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Reject user (admin only)
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Role is required'
      });
    }
    
    // Validate role
    const validRoles = ['Admin', 'Member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role. Role must be one of: ' + validRoles.join(', ')
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  const startTime = Date.now();
  console.log('Register endpoint called');
  
  try {
    const {
      username,
      password,
      name,
      email,
      age,
      birthday,
      memberOrg,
      organization,
      committee
    } = req.body;

    // Validate required fields immediately
    if (!username || !password || !email || !name || !age) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, email, name, and age are required fields'
      });
    }

    // Simple validation to fail fast
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists - with a timeout to avoid hanging
    console.log('Checking if user exists...');
    
    // Use a Promise.race to ensure we don't hang on DB operations
    const checkUserPromise = User.findOne({ 
      $or: [{ email }, { username }] 
    }).select('_id').lean();
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DB timeout')), 5000)
    );
    
    let existingUser;
    try {
      existingUser = await Promise.race([checkUserPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error during user check:', error.message);
      // If it's a timeout, we'll still create the user but log it
      if (error.message !== 'DB timeout') {
        throw error;
      }
    }
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create only the essential user data to minimize processing time
    console.log('Creating new user...');
    const minimalUser = {
      username,
      password,
      name,
      email,
      age
    };
    
    // Only add non-required fields if they exist and are valid
    if (birthday) minimalUser.birthday = birthday;
    if (memberOrg === 'yes' || memberOrg === 'no') minimalUser.memberOrg = memberOrg;
    if (organization) minimalUser.organization = organization;
    if (committee) minimalUser.committee = committee;
    
    const user = await User.create(minimalUser);
    
    // Generate token immediately after user creation
    const token = generateToken(user._id);
    console.log(`User created successfully in ${Date.now() - startTime}ms`);

    // Return success response
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update current user profile
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'email',
      'phone',
      'birthday',
      'organization',
      'committee',
      'address'
    ];

    // Filter out unwanted fields
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    // Handle address fields separately
    if (req.body.address) {
      filteredBody.address = {
        street: req.body.address.street || '',
        city: req.body.address.city || '',
        state: req.body.address.state || '',
        zipCode: req.body.address.zipCode || '',
        country: req.body.address.country || ''
      };
    }

    // Handle profile picture if uploaded
    if (req.file) {
      filteredBody.profilePicture = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 