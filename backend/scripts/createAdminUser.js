import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from '../models/userModel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb+srv://SAAVEDRA:<db_password>@cluster0.fsctl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'.cyan.underline))
  .catch(err => {
    console.error(`Error: ${err.message}`.red.bold);
    process.exit(1);
  });

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (adminExists) {
      console.log('Admin user already exists'.yellow);
      process.exit(0);
    }

    // Admin user data
    const adminUser = {
      name: 'Admin proxy',
      email: 'admin123@example.com',
      username: 'admin2',
      password: 'admin1231',
      role: 'Admin',
      isApproved: true,
      age: 30,
      phone: '1234567890',
      address: {
        street: '123 Admin St',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'Admin Country'
      }
    };

    // Create admin user
    const user = await User.create(adminUser);

    console.log(`Admin user created: ${user.name}`.green.inverse);
    console.log(`Email: ${user.email}`.cyan);
    console.log(`Username: ${user.username}`.cyan);
    console.log(`Password: admin123`.cyan);
    console.log(`Role: ${user.role}`.cyan);

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

createAdminUser();