import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import UserProfileDropdown from '../components/UserProfileDropdown';
import '../styles/Dashboard.css';

const FarmerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [farmerData, setFarmerData] = useState(null);

  useEffect(() => {
    // Check if user needs to change password
    if (user?.forcePasswordChange) {
      navigate('/change-password');
      return;
    }

    // Load farmer data
    loadFarmerData();
  }, [user, navigate]);

  const loadFarmerData = async () => {
    try {
      setLoading(true);
      // TODO: Add API call to load farmer-specific data
      // For now, use mock data
      setFarmerData({
        name: user?.name || 'Farmer Name',
        email: user?.email || user?.userName || 'farmer@example.com',
        phoneNumber: user?.phoneNumber || 'Not provided',
        kycStatus: 'PENDING',
        registrationDate: new Date().toLocaleDateString(),
        totalCrops: 0,
        pendingDocuments: 0
      });
    } catch (error) {
      console.error('Error loading farmer data:', error);
      setError('Failed to load farmer data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading farmer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">DATE</span>
            <span className="logo-subtitle">Digital Agristack</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Farmer Dashboard</h3>
            <ul>
              <li className="active">
                <span className="nav-icon">🏠</span>
                <span>Dashboard</span>
              </li>
              <li>
                <span className="nav-icon">👤</span>
                <span>My Profile</span>
              </li>
              <li>
                <span className="nav-icon">🌾</span>
                <span>My Crops</span>
              </li>
              <li>
                <span className="nav-icon">📋</span>
                <span>KYC Status</span>
              </li>
              <li>
                <span className="nav-icon">📄</span>
                <span>Documents</span>
              </li>
              <li>
                <span className="nav-icon">💰</span>
                <span>Benefits</span>
              </li>
              <li>
                <span className="nav-icon">📞</span>
                <span>Support</span>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="greeting-section">
              <h2 className="greeting-text">{getGreeting()}, {user?.name || 'Farmer'}! 👋</h2>
              <p className="greeting-time">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <h1 className="header-title">Farmer Dashboard</h1>
            <p className="header-subtitle">Manage your agricultural profile</p>
          </div>
          <div className="header-right">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🌾</div>
              <div className="stat-content">
                <h3>Total Crops</h3>
                <p className="stat-number">{farmerData?.totalCrops || 0}</p>
                <p className="stat-label">Registered crops</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>KYC Status</h3>
                <p className={`stat-number status-${farmerData?.kycStatus?.toLowerCase()}`}>
                  {farmerData?.kycStatus || 'PENDING'}
                </p>
                <p className="stat-label">Verification status</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h3>Pending Documents</h3>
                <p className="stat-number">{farmerData?.pendingDocuments || 0}</p>
                <p className="stat-label">Documents to upload</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Benefits Received</h3>
                <p className="stat-number">₹0</p>
                <p className="stat-label">This month</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn">
                <span className="action-icon">📝</span>
                <span>Update Profile</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">🌾</span>
                <span>Add New Crop</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">📄</span>
                <span>Upload Documents</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">📞</span>
                <span>Contact Support</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">✅</div>
                <div className="activity-content">
                  <h4>Profile Updated</h4>
                  <p>Your profile information was updated successfully</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">📋</div>
                <div className="activity-content">
                  <h4>KYC Verification</h4>
                  <p>Your KYC documents are under review</p>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">🌾</div>
                <div className="activity-content">
                  <h4>Crop Registration</h4>
                  <p>Wheat crop registered successfully</p>
                  <span className="activity-time">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard; 