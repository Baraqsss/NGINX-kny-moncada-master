/**
 * Email templates for the application
 */

// Email confirmation template with KNY Moncada branding
export const getEmailConfirmationTemplate = (data) => {
  const { email, registrationDate, websiteName } = data;
  
  // Base URL for assets - should be updated to actual production URL
  const baseUrl = 'https://kny-moncada.netlify.app'; // Example deployment URL
  
  // Logo URL for the email
  const logoUrl = `${baseUrl}/logo.png`; // This would need to be an accessible URL
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${websiteName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: linear-gradient(to right, #6955A4, #65c4b8, #b1d585);
          border-radius: 8px 8px 0 0;
        }
        .header img {
          max-width: 200px;
          height: auto;
        }
        .content {
          padding: 20px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #777;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background-color: #6955A4;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="${websiteName} Logo">
        </div>
        <div class="content">
          <h2>Welcome to Kaya Natin Youth - Moncada!</h2>
          <p>Thank you for starting your registration process with us.</p>
          <p>We have received your email address: <strong>${email}</strong></p>
          <p>You are on your way to becoming a member of our vibrant community dedicated to promoting good governance and ethical leadership.</p>
          <p>Please complete the remaining steps of your registration to finalize your membership.</p>
          <p>Date of registration: ${registrationDate}</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/login" class="btn">Continue Registration</a>
          </div>
          <p style="margin-top: 30px;">If you did not initiate this registration, please disregard this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${websiteName}. All rights reserved.</p>
          <p>Moncada, Tarlac • Philippines</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for when a user's registration is approved
export const getRegistrationApprovedTemplate = (data) => {
  const { name, email, websiteName } = data;
  
  // Implementation similar to above...
  return `
    <!-- Registration approved email template -->
    <h1>Your registration has been approved!</h1>
    <p>Hello ${name},</p>
    <!-- Content here -->
  `;
};

// Add other email templates as needed 