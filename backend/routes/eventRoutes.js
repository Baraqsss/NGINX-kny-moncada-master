import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { protect, restrictTo, isApproved } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);

// Protected routes
router.use(protect);

// Member routes (requires approval)
router.use(isApproved);
router.post('/:id/register', eventController.registerForEvent);
router.post('/:id/interest', eventController.showInterestInEvent);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', eventController.createEvent);
router.route('/:id')
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

export default router; 