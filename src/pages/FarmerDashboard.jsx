import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { apiService } from '../api/apiService';
import '../styles/Dashboard.css';
import '../styles/FarmerDashboard.css';

const FarmerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [farmerData, setFarmerData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

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
      // Load farmer data from API
      const response = await apiService.getFarmerDashboardData(user?.email);
      setFarmerData(response);
    } catch (error) {
      console.error('Error loading farmer data:', error);
      setError('Failed to load farmer data');
      // Fallback to mock data
      setFarmerData({
        name: user?.name || 'Farmer Name',
        email: user?.email || user?.userName || 'farmer@example.com',
        phoneNumber: user?.phoneNumber || 'Not provided',
        kycStatus: 'PENDING',
        registrationDate: new Date().toLocaleDateString(),
        totalCrops: 0,
        pendingDocuments: 0
      });
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
              <li className={activeSection === 'overview' ? 'active' : ''} 
                  onClick={() => setActiveSection('overview')}>
                <span className="nav-icon">🏠</span>
                <span>Overview</span>
              </li>
              <li className={activeSection === 'profile' ? 'active' : ''} 
                  onClick={() => setActiveSection('profile')}>
                <span className="nav-icon">👤</span>
                <span>My Profile</span>
              </li>
              <li className={activeSection === 'crops' ? 'active' : ''} 
                  onClick={() => setActiveSection('crops')}>
                <span className="nav-icon">🌾</span>
                <span>My Crops</span>
              </li>
              <li className={activeSection === 'kyc' ? 'active' : ''} 
                  onClick={() => setActiveSection('kyc')}>
                <span className="nav-icon">📋</span>
                <span>KYC Status</span>
              </li>
              <li className={activeSection === 'documents' ? 'active' : ''} 
                  onClick={() => setActiveSection('documents')}>
                <span className="nav-icon">📄</span>
                <span>Documents</span>
              </li>
              <li className={activeSection === 'benefits' ? 'active' : ''} 
                  onClick={() => setActiveSection('benefits')}>
                <span className="nav-icon">💰</span>
                <span>Benefits</span>
              </li>
              <li className={activeSection === 'support' ? 'active' : ''} 
                  onClick={() => setActiveSection('support')}>
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
          {activeSection === 'overview' && (
            <>
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
                    <p className="stat-number">₹{farmerData?.totalBenefitsReceived || 0}</p>
                    <p className="stat-label">This month</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-btn" onClick={() => setActiveSection('profile')}>
                    <span className="action-icon">📝</span>
                    <span>Update Profile</span>
                  </button>
                  <button className="action-btn" onClick={() => setActiveSection('crops')}>
                    <span className="action-icon">🌾</span>
                    <span>Add New Crop</span>
                  </button>
                  <button className="action-btn" onClick={() => setActiveSection('documents')}>
                    <span className="action-icon">📄</span>
                    <span>Upload Documents</span>
                  </button>
                  <button className="action-btn" onClick={() => setActiveSection('support')}>
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
            </>
          )}

          {activeSection === 'profile' && (
            <div className="profile-section">
              <h2>My Profile</h2>
              <div className="profile-grid">
                <div className="profile-card">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name:</label>
                      <span>{farmerData?.fullName || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Date of Birth:</label>
                      <span>{farmerData?.dateOfBirth || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Gender:</label>
                      <span>{farmerData?.gender || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Father's Name:</label>
                      <span>{farmerData?.fatherName || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Contact Number:</label>
                      <span>{farmerData?.contactNumber || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Alternative Contact:</label>
                      <span>{farmerData?.alternativeContactNumber || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Nationality:</label>
                      <span>{farmerData?.nationality || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <h3>Address Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Country:</label>
                      <span>{farmerData?.country || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>State:</label>
                      <span>{farmerData?.state || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>District:</label>
                      <span>{farmerData?.district || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Block:</label>
                      <span>{farmerData?.block || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Village:</label>
                      <span>{farmerData?.village || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Pincode:</label>
                      <span>{farmerData?.pincode || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <h3>Professional Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Education:</label>
                      <span>{farmerData?.education || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Experience:</label>
                      <span>{farmerData?.experience || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <h3>Bank Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Bank Name:</label>
                      <span>{farmerData?.bankName || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Account Number:</label>
                      <span>{farmerData?.accountNumber || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Branch Name:</label>
                      <span>{farmerData?.branchName || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>IFSC Code:</label>
                      <span>{farmerData?.ifscCode || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'kyc' && (
            <div className="kyc-section">
              <h2>KYC Status & Assignment</h2>
              <div className="kyc-grid">
                <div className="kyc-card">
                  <h3>KYC Status</h3>
                  <div className={`kyc-status ${farmerData?.kycStatus?.toLowerCase()}`}>
                    <span className="status-badge">{farmerData?.kycStatus || 'PENDING'}</span>
                  </div>
                  <div className="kyc-details">
                    <div className="detail-item">
                      <label>Submitted Date:</label>
                      <span>{farmerData?.kycSubmittedDate || 'Not submitted'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Reviewed Date:</label>
                      <span>{farmerData?.kycReviewedDate || 'Not reviewed'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Reviewed By:</label>
                      <span>{farmerData?.kycReviewedBy || 'Not assigned'}</span>
                    </div>
                    {farmerData?.kycRejectionReason && (
                      <div className="detail-item">
                        <label>Rejection Reason:</label>
                        <span className="error-text">{farmerData.kycRejectionReason}</span>
                      </div>
                    )}
                    {farmerData?.kycReferBackReason && (
                      <div className="detail-item">
                        <label>Refer Back Reason:</label>
                        <span className="warning-text">{farmerData.kycReferBackReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="kyc-card">
                  <h3>Assigned Employee</h3>
                  {farmerData?.assignedEmployee ? (
                    <div className="employee-info">
                      <div className="employee-avatar">
                        <span>👤</span>
                      </div>
                      <div className="employee-details">
                        <h4>{farmerData.assignedEmployee.employeeName}</h4>
                        <p><strong>Email:</strong> {farmerData.assignedEmployee.employeeEmail}</p>
                        <p><strong>Contact:</strong> {farmerData.assignedEmployee.employeeContactNumber}</p>
                        <p><strong>Designation:</strong> {farmerData.assignedEmployee.employeeDesignation}</p>
                        <p><strong>Assignment Status:</strong> 
                          <span className={`status-badge ${farmerData.assignedEmployee.assignmentStatus.toLowerCase()}`}>
                            {farmerData.assignedEmployee.assignmentStatus}
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="no-assignment">
                      <p>No employee assigned yet</p>
                      <p className="small-text">An employee will be assigned for your KYC verification process</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'crops' && (
            <div className="crops-section">
              <h2>My Crops</h2>
              <div className="crops-grid">
                <div className="crop-card">
                  <h3>Current Crop</h3>
                  <div className="crop-info">
                    <div className="info-item">
                      <label>Crop:</label>
                      <span>{farmerData?.currentCrop || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Survey Number:</label>
                      <span>{farmerData?.currentSurveyNumber || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Land Holding:</label>
                      <span>{farmerData?.currentLandHolding ? `${farmerData.currentLandHolding} acres` : 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Net Income:</label>
                      <span>{farmerData?.currentNetIncome ? `₹${farmerData.currentNetIncome}` : 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Soil Test:</label>
                      <span>{farmerData?.currentSoilTest ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="info-item">
                      <label>Water Source:</label>
                      <span>{farmerData?.currentWaterSource || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="crop-card">
                  <h3>Proposed Crop</h3>
                  <div className="crop-info">
                    <div className="info-item">
                      <label>Crop:</label>
                      <span>{farmerData?.proposedCrop || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Survey Number:</label>
                      <span>{farmerData?.proposedSurveyNumber || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Land Holding:</label>
                      <span>{farmerData?.proposedLandHolding ? `${farmerData.proposedLandHolding} acres` : 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Expected Income:</label>
                      <span>{farmerData?.proposedNetIncome ? `₹${farmerData.proposedNetIncome}` : 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Soil Test:</label>
                      <span>{farmerData?.proposedSoilTest ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="info-item">
                      <label>Water Source:</label>
                      <span>{farmerData?.proposedWaterSource || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'documents' && (
            <div className="documents-section">
              <h2>My Documents</h2>
              <div className="documents-grid">
                <div className="document-card">
                  <h3>Uploaded Documents</h3>
                  <div className="document-list">
                    <div className="document-item">
                      <span className="doc-icon">📷</span>
                      <div className="doc-info">
                        <h4>Profile Photo</h4>
                        <p>{farmerData?.photoFileName || 'Not uploaded'}</p>
                      </div>
                    </div>
                    <div className="document-item">
                      <span className="doc-icon">🏦</span>
                      <div className="doc-info">
                        <h4>Bank Passbook</h4>
                        <p>{farmerData?.passbookFileName || 'Not uploaded'}</p>
                      </div>
                    </div>
                    <div className="document-item">
                      <span className="doc-icon">🆔</span>
                      <div className="doc-info">
                        <h4>Identity Document</h4>
                        <p>{farmerData?.documentFileName || 'Not uploaded'}</p>
                      </div>
                    </div>
                    <div className="document-item">
                      <span className="doc-icon">🧪</span>
                      <div className="doc-info">
                        <h4>Soil Test Certificate</h4>
                        <p>{farmerData?.soilTestCertificateFileName || 'Not uploaded'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'benefits' && (
            <div className="benefits-section">
              <h2>Benefits & Support</h2>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <h3>Benefits Received</h3>
                  <div className="benefit-summary">
                    <div className="benefit-item">
                      <span className="benefit-amount">₹{farmerData?.totalBenefitsReceived || 0}</span>
                      <span className="benefit-label">Total Benefits</span>
                    </div>
                  </div>
                  <p className="benefit-note">Benefits are calculated based on your crop registrations and government schemes</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="support-section">
              <h2>Support & Contact</h2>
              <div className="support-grid">
                <div className="support-card">
                  <h3>Contact Information</h3>
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <div className="contact-details">
                        <h4>Helpline</h4>
                        <p>1800-XXX-XXXX</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div className="contact-details">
                        <h4>Email Support</h4>
                        <p>support@farmerportal.com</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">💬</span>
                      <div className="contact-details">
                        <h4>Live Chat</h4>
                        <p>Available 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard; 