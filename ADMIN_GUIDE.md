# KNY Moncada Admin Guide

This guide provides instructions on how to access and use the admin features of the KNY Moncada application.

## Accessing Admin Features

### Admin Login

To access the admin features, you need to log in with an admin account. For testing purposes, you can use the following credentials:

- **Username**: admin
- **Password**: admin123

You can log in through:
1. The regular login page at `/login`
2. The test admin page at `/test-admin` (for development only)

### Admin Dashboard

After logging in as an admin, you can access the admin dashboard by:

1. Clicking on your profile picture in the top-right corner
2. Selecting "Admin Dashboard" from the dropdown menu
3. Or navigating directly to `/admin/dashboard`

## Admin Features

The admin dashboard provides access to the following features:

### Overview

The dashboard overview displays key statistics about the application:
- Total number of users
- Number of pending user approvals
- Total number of events
- Total number of announcements
- Total number of donations

### User Management

Access: `/admin/dashboard/users`

User management allows you to:
- View all users
- Approve or reject pending user registrations
- Change user roles (Member/Admin)
- Delete users

### Event Management

Access: `/admin/dashboard/events`

Event management allows you to:
- View all events
- Create new events
- Edit existing events
- Delete events
- View event attendance/interest

### Announcement Management

Access: `/admin/dashboard/announcements`

Announcement management allows you to:
- View all announcements
- Create new announcements
- Edit existing announcements
- Delete announcements

### Donation Management

Access: `/admin/dashboard/donations`

Donation management allows you to:
- View all donations
- Filter donations by date, amount, or donor
- Export donation data

## Troubleshooting

### Session Expiration

If you're logged out unexpectedly or see a blank page when accessing admin features:

1. Try refreshing the page
2. If that doesn't work, log out completely and log back in
3. Navigate directly to `/test-admin` to verify your admin credentials

### API Connection Issues

If you see error messages about failing to fetch data:

1. Ensure the backend server is running
2. Check that the API URL in the application is correct
3. Verify that your admin account has the correct permissions

## Development Notes

For development purposes, the application can use mock data when the backend is not available. This is controlled by the `shouldUseMockData()` function in `src/utils/apiUtils.js`.

To toggle between mock data and real API calls:
- Set `return true;` in `shouldUseMockData()` to use mock data
- Set `return false;` to use real API calls

The mock admin user is defined in `src/context/AuthContext.jsx`. 