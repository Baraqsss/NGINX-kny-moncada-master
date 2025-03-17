import express from 'express';
import * as donationController from '../controllers/donationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for creating donations
router.post('/', donationController.createDonation);

// Protected routes
router.use(protect);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', donationController.getAllDonations);
router.get('/stats', donationController.getDonationStats);
router.route('/:id')
  .get(donationController.getDonation)
  .patch(donationController.updateDonationStatus);

export default router;