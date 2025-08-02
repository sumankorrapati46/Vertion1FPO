import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
import FarmerForm from '../components/FarmerForm';
import KYCModal from '../components/KYCModal';

import ViewFarmerRegistrationDetails from '../components/ViewFarmerRegistrationDetails';
import ViewEditEmployeeDetails from '../components/ViewEditEmployeeDetails';
import StatsCard from '../components/StatsCard';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [assignedFarmers, setAssignedFarmers] = useState([]);
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showFarmerDetails, setShowFarmerDetails] = useState(false);
  const [selectedFarmerData, setSelectedFarmerData] = useState(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);

  const [filters, setFilters] = useState({
    kycStatus: '',
    assignedDate: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock assigned farmers data for the current employee
    const mockAssignedFarmers = [
      {
        id: 1,
        name: 'Rajesh Kumar',
        phone: '9876543210',
        state: 'Maharashtra',
        district: 'Pune',
        assignedDate: '2024-01-15',
        kycStatus: 'APPROVED',
        location: 'Pune, Maharashtra',
        lastAction: '2024-01-20',
        notes: 'All documents verified'
      },
      {
        id: 2,
        name: 'Suresh Patel',
        phone: '9876543211',
        state: 'Gujarat',
        district: 'Ahmedabad',
        assignedDate: '2024-01-18',
        kycStatus: 'PENDING',
        location: 'Ahmedabad, Gujarat',
        lastAction: '2024-01-22',
        notes: 'Documents pending verification'
      },
      {
        id: 3,
        name: 'Amit Singh',
        phone: '9876543212',
        state: 'Punjab',
        district: 'Amritsar',
        assignedDate: '2024-01-10',
        kycStatus: 'REFER_BACK',
        location: 'Amritsar, Punjab',
        lastAction: '2024-01-25',
        notes: 'Additional documents required'
      },
      {
        id: 4,
        name: 'Ramesh Verma',
        phone: '9876543213',
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        assignedDate: '2024-01-20',
        kycStatus: 'PENDING',
        location: 'Lucknow, Uttar Pradesh',
        lastAction: '2024-01-26',
        notes: 'Initial review completed'
      }
    ];

    setAssignedFarmers(mockAssignedFarmers);
  }, []);

  const getFilteredFarmers = () => {
    return assignedFarmers.filter(farmer => {
      const matchesKycStatus = !filters.kycStatus || farmer.kycStatus === filters.kycStatus;
      const matchesAssignedDate = !filters.assignedDate || farmer.assignedDate === filters.assignedDate;
      
      return matchesKycStatus && matchesAssignedDate;
    });
  };

  const getStats = () => {
    const totalAssigned = assignedFarmers.length;
    const approved = assignedFarmers.filter(f => f.kycStatus === 'APPROVED').length;
    const pending = assignedFarmers.filter(f => f.kycStatus === 'PENDING').length;
    const referBack = assignedFarmers.filter(f => f.kycStatus === 'REFER_BACK').length;
    const rejected = assignedFarmers.filter(f => f.kycStatus === 'REJECTED').length;

    return {
      totalAssigned,
      approved,
      pending,
      referBack,
      rejected
    };
  };

  const handleKYCUpdate = (farmerId, newStatus, reason) => {
    setAssignedFarmers(prev => prev.map(farmer => {
      if (farmer.id === farmerId) {
        return {
          ...farmer,
          kycStatus: newStatus,
          lastAction: new Date().toISOString().split('T')[0],
          notes: reason || farmer.notes
        };
      }
      return farmer;
    }));
  };

  const handleLogout = () => {
    logout();
  };

  const handleViewFarmer = (farmer) => {
    // Convert the farmer data to match the registration form structure
    const farmerData = {
      firstName: farmer.name.split(' ')[0] || '',
      lastName: farmer.name.split(' ').slice(1).join(' ') || '',
      mobileNumber: farmer.phone,
      state: farmer.state,
      district: farmer.district,
      kycStatus: farmer.kycStatus,
      status: 'ASSIGNED',
      assignedEmployee: user?.name || 'Current Employee',
      assignedDate: farmer.assignedDate,
      // Add mock data for other fields
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      email: 'farmer@example.com',
      maritalStatus: 'Married',
      religion: 'Hindu',
      caste: 'General',
      category: 'General',
      education: 'High School',
      village: 'Sample Village',
      postOffice: 'Sample Post Office',
      policeStation: 'Sample Police Station',
      pincode: '123456',
      occupation: 'Farmer',
      annualIncome: '50000',
      landOwnership: 'Owned',
      landArea: '5',
      irrigationType: 'Tube Well',
      soilType: 'Alluvial',
      primaryCrop: 'Wheat',
      secondaryCrop: 'Rice',
      cropSeason: 'Rabi',
      farmingExperience: '10',
      bankName: 'State Bank of India',
      branchName: 'Main Branch',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      accountType: 'Savings',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      voterId: 'ABC1234567',
      rationCardNumber: '123456789',
      registrationDate: farmer.assignedDate || new Date().toISOString(),
      photo: null
    };
    
    setSelectedFarmerData(farmerData);
    setShowFarmerDetails(true);
  };

  const handleCloseFarmerDetails = () => {
    setShowFarmerDetails(false);
    setSelectedFarmerData(null);
  };

  const handleCloseEmployeeDetails = () => {
    setShowEmployeeDetails(false);
    setSelectedEmployeeData(null);
  };

  const handleUpdateEmployee = (updatedData) => {
    // In a real app, this would update the employee's own profile
    console.log('Employee profile updated:', updatedData);
    setShowEmployeeDetails(false);
    setSelectedEmployeeData(null);
  };



  const renderOverview = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <StatsCard
          title="Total Assigned"
          value={getStats().totalAssigned}
          icon="📋"
          color="blue"
        />
        <StatsCard
          title="Approved"
          value={getStats().approved}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="Pending"
          value={getStats().pending}
          icon="⏳"
          color="orange"
        />
        <StatsCard
          title="Refer Back"
          value={getStats().referBack}
          icon="🔄"
          color="yellow"
        />
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => setShowFarmerForm(true)}
          >
            ➕ Add Farmer
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => setCurrentView('assigned')}
          >
            📋 View Assigned Farmers
          </button>
        </div>
      </div>

      <div className="todo-panel">
        <h3>To-Do List</h3>
        <div className="todo-items">
          {getStats().pending > 0 && (
            <div className="todo-item">
              <span className="todo-icon">⏳</span>
              <span>{getStats().pending} KYC cases pending review</span>
            </div>
          )}
          {getStats().referBack > 0 && (
            <div className="todo-item">
              <span className="todo-icon">🔄</span>
              <span>{getStats().referBack} cases need follow-up</span>
            </div>
          )}
          {assignedFarmers.filter(f => {
            const assignedDate = new Date(f.assignedDate);
            const daysDiff = (new Date() - assignedDate) / (1000 * 60 * 60 * 24);
            return daysDiff > 7 && f.kycStatus === 'PENDING';
          }).length > 0 && (
            <div className="todo-item">
              <span className="todo-icon">⚠️</span>
              <span>Some KYC cases are overdue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAssignedFarmers = () => (
    <div className="dashboard-content">
      <div className="filters-section">
        <h3>Assigned Farmers</h3>
        <div className="filters">
          <select 
            value={filters.kycStatus} 
            onChange={(e) => setFilters(prev => ({ ...prev, kycStatus: e.target.value }))}
          >
            <option value="">All KYC Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REFER_BACK">Refer Back</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            value={filters.assignedDate} 
            onChange={(e) => setFilters(prev => ({ ...prev, assignedDate: e.target.value }))}
          >
            <option value="">All Dates</option>
            <option value="2024-01-15">2024-01-15</option>
            <option value="2024-01-18">2024-01-18</option>
            <option value="2024-01-20">2024-01-20</option>
          </select>
        </div>
      </div>

      <div className="farmers-grid">
        {getFilteredFarmers().map(farmer => (
          <div key={farmer.id} className="farmer-card">
            <div className="farmer-header">
              <h4>{farmer.name}</h4>
              <span className={`status-badge ${farmer.kycStatus.toLowerCase()}`}>
                {farmer.kycStatus}
              </span>
            </div>
            <div className="farmer-details">
              <p><strong>Phone:</strong> {farmer.phone}</p>
              <p><strong>Location:</strong> {farmer.location}</p>
              <p><strong>Assigned Date:</strong> {farmer.assignedDate}</p>
              <p><strong>Last Action:</strong> {farmer.lastAction}</p>
              {farmer.notes && (
                <p><strong>Notes:</strong> {farmer.notes}</p>
              )}
            </div>
            <div className="farmer-actions">
              <button 
                className="action-btn-small primary"
                onClick={() => {
                  setSelectedFarmer(farmer);
                  setShowKYCModal(true);
                }}
              >
                Review KYC
              </button>
              
              <button 
                className="action-btn-small info"
                onClick={() => handleViewFarmer(farmer)}
              >
                👁️ View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKYCProgress = () => (
    <div className="dashboard-content">
      <h3>KYC Progress Summary</h3>
      <div className="kyc-progress">
        <div className="progress-item">
          <div className="progress-label">Approved</div>
          <div className="progress-bar">
            <div 
              className="progress-fill approved" 
              style={{ width: `${(getStats().approved / getStats().totalAssigned) * 100}%` }}
            ></div>
          </div>
          <div className="progress-value">{getStats().approved}</div>
        </div>
        <div className="progress-item">
          <div className="progress-label">Pending</div>
          <div className="progress-bar">
            <div 
              className="progress-fill pending" 
              style={{ width: `${(getStats().pending / getStats().totalAssigned) * 100}%` }}
            ></div>
          </div>
          <div className="progress-value">{getStats().pending}</div>
        </div>
        <div className="progress-item">
          <div className="progress-label">Refer Back</div>
          <div className="progress-bar">
            <div 
              className="progress-fill refer-back" 
              style={{ width: `${(getStats().referBack / getStats().totalAssigned) * 100}%` }}
            ></div>
          </div>
          <div className="progress-value">{getStats().referBack}</div>
        </div>
        <div className="progress-item">
          <div className="progress-label">Rejected</div>
          <div className="progress-bar">
            <div 
              className="progress-fill rejected" 
              style={{ width: `${(getStats().rejected / getStats().totalAssigned) * 100}%` }}
            ></div>
          </div>
          <div className="progress-value">{getStats().rejected}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Employee Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-nav">
        <button 
          className={`nav-btn ${currentView === 'overview' ? 'active' : ''}`}
          onClick={() => setCurrentView('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-btn ${currentView === 'assigned' ? 'active' : ''}`}
          onClick={() => setCurrentView('assigned')}
        >
          👨‍🌾 Assigned Farmers
        </button>
        <button 
          className={`nav-btn ${currentView === 'progress' ? 'active' : ''}`}
          onClick={() => setCurrentView('progress')}
        >
          📈 KYC Progress
        </button>
      </div>

      <div className="dashboard-main">
        {currentView === 'overview' && renderOverview()}
        {currentView === 'assigned' && renderAssignedFarmers()}
        {currentView === 'progress' && renderKYCProgress()}
      </div>

      {showFarmerForm && (
        <FarmerForm 
          onClose={() => setShowFarmerForm(false)}
          onSubmit={(farmerData) => {
            setAssignedFarmers(prev => [...prev, { 
              ...farmerData, 
              id: Date.now(),
              assignedDate: new Date().toISOString().split('T')[0],
              kycStatus: 'PENDING',
              lastAction: new Date().toISOString().split('T')[0]
            }]);
            setShowFarmerForm(false);
          }}
        />
      )}

      {showKYCModal && selectedFarmer && (
        <KYCModal
          farmer={selectedFarmer}
          onClose={() => {
            setShowKYCModal(false);
            setSelectedFarmer(null);
          }}
          onSubmit={handleKYCUpdate}
        />
      )}

      {showFarmerDetails && (
        <ViewFarmerRegistrationDetails
          farmerData={selectedFarmerData}
          onClose={handleCloseFarmerDetails}
        />
      )}
      {showEmployeeDetails && (
        <ViewEditEmployeeDetails
          employeeData={selectedEmployeeData}
          onClose={handleCloseEmployeeDetails}
          onUpdate={handleUpdateEmployee}
        />
      )}

    </div>
  );
};

export default EmployeeDashboard; 