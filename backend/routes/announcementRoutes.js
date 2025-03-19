import express from 'express';
import * as announcementController from '../controllers/announcementController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', announcementController.getAllAnnouncements);
router.get('/:id', announcementController.getAnnouncement);

// Protected routes
router.use(protect);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', upload.single('image'), announcementController.createAnnouncement);
router.route('/:id')
  .patch(upload.single('image'), announcementController.updateAnnouncement)
  .delete(announcementController.deleteAnnouncement);

export default router;