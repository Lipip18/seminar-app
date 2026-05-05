import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
     // Redirect to their own dashboard
     if (user.role === 'Admin') return <Navigate to="/admin/dashboard" />;
     if (user.role === 'Faculty') return <Navigate to="/faculty/dashboard" />;
     return <Navigate to="/student/dashboard" />;
  }

  return children;
}
