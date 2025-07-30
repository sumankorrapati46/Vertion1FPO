import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to regular dashboard
    navigate('/dashboard');
  }, [navigate]);

  return <Dashboard />;
};

export default SuperAdminDashboard; 