import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getAllUsers } from '../controllers/userController.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('Admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);

export default router; 