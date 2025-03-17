import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading, authChecked } = useAuth();

  // Show loading state while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700"></div>
        <p className="ml-3 text-violet-700">Verifying admin access...</p>
      </div>
    );
  }

  // If user is not authenticated or not an admin, redirect to login
  if (!user || user.role.toLowerCase() !== 'admin') {
    console.log('Access denied: User is not an admin', user);
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated and is an admin, render the protected route
  console.log('Admin access granted for user:', user.username);
  return <Outlet />;
};

export default AdminRoute; 