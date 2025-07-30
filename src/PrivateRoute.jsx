import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (user.forcePasswordChange) return <Navigate to="/change-password" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return <Outlet />;
};

export default PrivateRoute; 