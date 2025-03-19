import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MemberRoute = () => {
  const { user, loading } = useAuth();

  // Debug log
  console.log('MemberRoute User:', user);
  console.log('MemberRoute Role:', user?.role);
  console.log('MemberRoute isApproved:', user?.isApproved);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Helper function for case-insensitive role check
  const hasRole = (roleToCheck) => {
    if (!user?.role) return false;
    return user.role.toLowerCase() === roleToCheck.toLowerCase();
  };

  // Check if user is logged in and is an approved member
  if (!user || !user.isApproved || !hasRole('Member')) {
    console.log('Member route access denied - redirecting to login');
    return <Navigate to="/login" />;
  }

  console.log('Member route access granted');
  return <Outlet />;
};

export default MemberRoute; 