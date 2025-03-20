import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { protect, restrictTo, isApproved } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);

// Protected routes (require authentication)
router.use(protect);

// Interest routes (any authenticated user)
router.post('/:id/interest', eventController.showInterestInEvent);
router.get('/interested', eventController.getInterestedEvents);

// Member routes (requires approval)
router.use(isApproved);
router.post('/:id/register', eventController.registerForEvent);
router.delete('/:id/unregister', eventController.unregisterFromEvent);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', upload.single('image'), eventController.createEvent);
router.route('/:id')
  .patch(upload.single('image'), eventController.updateEvent)
  .delete(eventController.deleteEvent);

router.route('/:id/members').get(eventController.getEventMembers);

export default router; 