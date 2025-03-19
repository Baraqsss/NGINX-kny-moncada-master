import dotenv from 'dotenv';
dotenv.config();

export default {
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL || 'your-verified-sender@yourdomain.com',
  FROM_NAME: process.env.FROM_NAME || 'Kaya Natin Youth - Moncada',
}; 