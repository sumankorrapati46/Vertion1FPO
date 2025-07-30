import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { isAuthenticated, hasPermission } from '../utils/authUtils';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user } = useContext(AuthContext);
  
  // Check if user is authenticated
  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access if requiredRole is specified
  if (requiredRole && !hasPermission(requiredRole)) {
    // Redirect to appropriate dashboard based on user's role
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin/dashboard" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'EMPLOYEE') {
      return <Navigate to="/employee/dashboard" replace />;
    } else {
      return <Navigate to="/farmer/dashboard" replace />;
    }
  }
  
  // Check if user needs to change password
  if (user.forcePasswordChange) {
    return <Navigate to="/change-password" replace />;
  }
  
  return children;
};

export default ProtectedRoute; 