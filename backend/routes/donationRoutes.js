import express from 'express';
import multer from 'multer';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getDonations,
  createDonation,
  deleteDonation,
  importDonations,
  exportDonations
} from '../controllers/donationController.js';

const router = express.Router();

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Please upload a CSV file'));
    }
  }
});

// Protect all routes
router.use(protect);
router.use(restrictTo('Admin'));

// Routes
router.route('/')
  .get(getDonations)
  .post(createDonation);

router.delete('/:id', deleteDonation);

router.post('/import', upload.single('file'), importDonations);
router.get('/export', exportDonations);

export default router;