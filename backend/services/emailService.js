import sgMail from '@sendgrid/mail';
import config from '../config/sendgrid.js';

// Initialize SendGrid with API key
sgMail.setApiKey(config.SENDGRID_API_KEY);

class EmailService {
  static async sendEmail({ to, subject, html, text }) {
    try {
      const msg = {
        to,
        from: {
          email: config.FROM_EMAIL,
          name: config.FROM_NAME
        },
        subject,
        text,
        html
      };

      const response = await sgMail.send(msg);
      console.log('Email sent successfully:', response[0].statusCode);
      return {
        success: true,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      if (error.response) {
        console.error('SendGrid API error:', error.response.body);
      }
      throw {
        success: false,
        message: 'Failed to send email',
        error: error.message
      };
    }
  }
}

export default EmailService; 