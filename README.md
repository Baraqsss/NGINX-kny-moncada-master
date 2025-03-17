# KNY Moncada Application

A web application for KNY Moncada organization with user management, event management, announcements, and donations.

## Features

- **User Management**: Registration, login, profile management, and admin approval
- **Event Management**: Create, edit, and delete events with member interest tracking
- **Announcements**: Create, edit, and delete announcements
- **Donations**: Track and manage donations
- **Admin Dashboard**: Statistics and management tools for administrators

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd NGINX-kny-moncada-master
   ```

2. Install dependencies for both frontend and backend:
   ```
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/kny-moncada
   JWT_SECRET=your_jwt_secret
   ```

4. Create an admin user for testing:
   ```
   cd backend
   npm run create-admin
   ```
   This will create an admin user with the following credentials:
   - Email: admin@example.com
   - Username: admin
   - Password: admin123

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   # From the root directory
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## Testing with Postman

A Postman collection is included in the root directory (`KNY-Moncada-API.postman_collection.json`). You can import this collection into Postman to test the API endpoints.

### Steps to test with Postman:

1. Import the collection into Postman
2. Create a new environment in Postman and set the following variables:
   - `token`: (leave empty, will be automatically filled after login)
   - `userId`: (leave empty, will be automatically filled after login)
   - `eventId`: (leave empty, will be automatically filled after creating an event)
   - `announcementId`: (leave empty, will be automatically filled after creating an announcement)
   - `donationId`: (leave empty, will be automatically filled after creating a donation)

3. Login with the admin user:
   - Use the "Login" request in the "Authentication" folder
   - The token will be automatically saved to the environment variables

4. Test other endpoints using the saved token for authentication

## API Endpoints

### Authentication
- `POST /api/users/login` - Login
- `POST /api/users/register` - Register
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/approve` - Approve user (admin only)
- `PUT /api/users/:id/reject` - Reject user (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `POST /api/memberships/interested/:id` - Toggle interest in event
- `GET /api/memberships/interested` - Get interested events

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get announcement by ID
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement (admin only)
- `DELETE /api/announcements/:id` - Delete announcement (admin only)

### Donations
- `GET /api/donations` - Get all donations (admin only)
- `GET /api/donations/:id` - Get donation by ID (admin only)
- `POST /api/donations` - Create donation

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (admin only)

## License

This project is licensed under the MIT License.
