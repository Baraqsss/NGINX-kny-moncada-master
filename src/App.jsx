import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages and Components

import Home from "./components/home";
import Login from "./components/login";

import MemberDashboard from "./components/MemberDashboard";
    
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./components/signup.jsx";
import Layout from "./components/layout.jsx";
import About from "./components/about.jsx";
import Donate from "./components/donate.jsx";
import Volunteer from "./components/volunteer.jsx";
import Profile from "./components/profile.jsx";
import EventsForMembers from "./components/EventsForMembers.jsx";
import Announcements from "./components/Announcements.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Dashboard from "./components/admin/Dashboard.jsx";
import UserManagement from "./components/admin/UserManagement.jsx";
import EventManagement from "./components/admin/EventManagement.jsx";
import AnnouncementManagement from "./components/admin/AnnouncementManagement.jsx";
import DonationManagement from "./components/admin/DonationManagement.jsx";
import TestAdmin from "./components/TestAdmin.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/test-admin" element={<TestAdmin />} />

          {/* Layout with public routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/events" element={<EventsForMembers />} />
            <Route path="/announcements" element={<Announcements />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/member/dashboard" element={<MemberDashboard />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/dashboard/users" element={<Dashboard />} />
              <Route path="/admin/dashboard/events" element={<Dashboard />} />
              <Route path="/admin/dashboard/announcements" element={<Dashboard />} />
              <Route path="/admin/dashboard/donations" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;