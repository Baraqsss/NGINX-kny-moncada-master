import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optimize MongoDB connection for serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Reduced timeout to fail faster
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

// Connect to database immediately to handle cold starts better
connectDB().catch(err => {
  console.error('Initial MongoDB connection failed:', err);
});

// Simple logging middleware to troubleshoot timeouts
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('KNY Moncada Foundation API is running');
});

// Health check endpoint - avoid database operations for health checks
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Only start the server if not being imported (for Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app for Vercel
export default app;