import express from 'express';
import { registerUser, loginUser, getCurrentUser, getAllUsers, approveUser, rejectUser, updateUserRole, deleteUser } from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getCurrentUser);

// Admin routes - protected and restricted to admin users
router.get('/', protect, restrictTo('Admin'), getAllUsers);
router.put('/:id/approve', protect, restrictTo('Admin'), approveUser);
router.put('/:id/reject', protect, restrictTo('Admin'), rejectUser);
router.put('/:id/role', protect, restrictTo('Admin'), updateUserRole);
router.delete('/:id', protect, restrictTo('Admin'), deleteUser);

export default router; 