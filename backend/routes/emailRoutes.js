import express from 'express';
import EmailService from '../services/emailService.js';

const router = express.Router();

// Route to send confirmation email
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Send email using EmailService
    const result = await EmailService.sendEmail({ to, subject, html, text });
    res.json(result);
  } catch (error) {
    console.error('Error in send-email route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email'
    });
  }
});

export default router; 