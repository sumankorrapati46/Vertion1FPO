import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
import FarmerForm from '../components/FarmerForm';
import KYCModal from '../components/KYCModal';
import ViewFarmerRegistrationDetails from '../components/ViewFarmerRegistrationDetails';
import ViewEditEmployeeDetails from '../components/ViewEditEmployeeDetails';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import UserProfileDropdown from '../components/UserProfileDropdown';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [assignedFarmers, setAssignedFarmers] = useState([]);
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showFarmerDetails, setShowFarmerDetails] = useState(false);
  const [selectedFarmerData, setSelectedFarmerData] = useState(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [editingFarmer, setEditingFarmer] = useState(null);

  // Greeting function based on time of day
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

  const [filters, setFilters] = useState({
    kycStatus: '',
    assignedDate: ''
  });

  // Load data from API
  useEffect(() => {
    fetchAssignedFarmers();
  }, []);

  const fetchAssignedFarmers = async () => {
    try {
      // API call to get assigned farmers for current employee
      // const response = await employeesAPI.getAssignedFarmers(user.id);
      // setAssignedFarmers(response.data);
      
      // For now, using mock data
      loadMockAssignedFarmers();
    } catch (error) {
      console.error('Error fetching assigned farmers:', error);
      loadMockAssignedFarmers();
    }
  };

  const loadMockAssignedFarmers = () => {
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
        notes: 'All documents verified',
        assignedEmployee: user?.name || 'John Doe'
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
        notes: 'Documents pending verification',
        assignedEmployee: user?.name || 'John Doe'
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
        notes: 'Additional documents required',
        assignedEmployee: user?.name || 'John Doe'
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
        notes: 'Initial review completed',
        assignedEmployee: user?.name || 'John Doe'
      },
      {
        id: 5,
        name: 'Lakshmi Devi',
        phone: '9876543214',
        state: 'Tamil Nadu',
        district: 'Chennai',
        assignedDate: '2024-01-12',
        kycStatus: 'APPROVED',
        location: 'Chennai, Tamil Nadu',
        lastAction: '2024-01-18',
        notes: 'All documents verified and approved',
        assignedEmployee: user?.name || 'John Doe'
      },
      {
        id: 6,
        name: 'Krishna Reddy',
        phone: '9876543215',
        state: 'Andhra Pradesh',
        district: 'Vijayawada',
        assignedDate: '2024-01-25',
        kycStatus: 'REJECTED',
        location: 'Vijayawada, Andhra Pradesh',
        lastAction: '2024-01-28',
        notes: 'Documents incomplete - rejected',
        assignedEmployee: user?.name || 'John Doe'
      }
    ];

    setAssignedFarmers(mockAssignedFarmers);
  };

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

  const getTodoList = () => {
    const newAssignments = assignedFarmers.filter(f => {
      // New assignments not yet viewed (assigned within last 3 days)
      const assignedDate = new Date(f.assignedDate);
      const today = new Date();
      const daysDiff = (today - assignedDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 3 && f.kycStatus === 'PENDING';
    });

    const pendingReviews = assignedFarmers.filter(f => f.kycStatus === 'PENDING');
    const referBackCases = assignedFarmers.filter(f => f.kycStatus === 'REFER_BACK');

    return {
      newAssignments,
      pendingReviews,
      referBackCases
    };
  };

  const handleKYCUpdate = async (farmerId, newStatus, reason = '') => {
    try {
      // API call to update KYC status
      // await employeesAPI.updateKYCStatus(farmerId, newStatus, reason);
      
      // Update local state
      setAssignedFarmers(prev => prev.map(farmer => 
        farmer.id === farmerId 
          ? { 
              ...farmer, 
              kycStatus: newStatus,
              lastAction: new Date().toISOString().split('T')[0],
              notes: reason || `Status updated to ${newStatus}`
            }
          : farmer
      ));
      
      alert(`KYC status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating KYC status:', error);
      alert('Failed to update KYC status');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleViewFarmer = (farmer) => {
    setSelectedFarmerData(farmer);
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
    // Update employee profile
    setShowEmployeeDetails(false);
    setSelectedEmployeeData(null);
  };

  const handleEditFarmer = (farmer) => {
    setEditingFarmer(farmer);
    setShowFarmerForm(true);
  };

  const renderOverview = () => {
    const stats = getStats();
    const todoList = getTodoList();

    return (
      <div className="overview-section">
        <div className="overview-header">
          <h2 className="overview-title">Employee Dashboard Overview</h2>
          <p className="overview-description">
            Manage your assigned farmers and KYC verification tasks efficiently.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard
            title="Total Assigned"
            value={stats.totalAssigned}
            change=""
            changeType="neutral"
            icon="👥"
          />
          <StatsCard
            title="Approved"
            value={stats.approved}
            change=""
            changeType="positive"
            icon="✅"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            change=""
            changeType="warning"
            icon="⏳"
          />
          <StatsCard
            title="Refer Back"
            value={stats.referBack}
            change=""
            changeType="warning"
            icon="📝"
          />
        </div>

        {/* KYC Progress Chart */}
        <div className="kyc-progress-section">
          <h3>KYC Progress Summary</h3>
          <div className="kyc-progress-grid">
            <div className="progress-card approved">
              <div className="progress-circle">
                <span className="progress-number">{stats.approved}</span>
                <span className="progress-label">Approved</span>
              </div>
            </div>
            <div className="progress-card pending">
              <div className="progress-circle">
                <span className="progress-number">{stats.pending}</span>
                <span className="progress-label">Pending</span>
              </div>
            </div>
            <div className="progress-card refer-back">
              <div className="progress-circle">
                <span className="progress-number">{stats.referBack}</span>
                <span className="progress-label">Refer Back</span>
              </div>
            </div>
            <div className="progress-card rejected">
              <div className="progress-circle">
                <span className="progress-number">{stats.rejected}</span>
                <span className="progress-label">Rejected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="todo-section">
          <h3>To-Do List</h3>
          <div className="todo-grid">
            <div className="todo-card">
              <h4>New Assignments</h4>
              <p>{todoList.newAssignments.length} new farmers assigned</p>
              <button 
                className="action-btn-small primary"
                onClick={() => setActiveTab('farmers')}
              >
                Review New
              </button>
            </div>
            <div className="todo-card">
              <h4>Pending Reviews</h4>
              <p>{todoList.pendingReviews.length} cases pending</p>
              <button 
                className="action-btn-small warning"
                onClick={() => setActiveTab('farmers')}
              >
                Process Pending
              </button>
            </div>
            <div className="todo-card">
              <h4>Refer Back Cases</h4>
              <p>{todoList.referBackCases.length} need attention</p>
              <button 
                className="action-btn-small info"
                onClick={() => setActiveTab('farmers')}
              >
                Review Refer Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAssignedFarmers = () => {
    const filteredFarmers = getFilteredFarmers();

    return (
      <div className="overview-section">
        <div className="overview-header">
          <h2 className="overview-title">Assigned Farmers</h2>
          <p className="overview-description">
            View and manage your assigned farmers with KYC verification tasks.
          </p>
          <div className="overview-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowFarmerForm(true)}
            >
              Add Farmer
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <select 
            value={filters.kycStatus} 
            onChange={(e) => setFilters(prev => ({ ...prev, kycStatus: e.target.value }))}
            className="filter-select"
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
            className="filter-select"
          >
            <option value="">All Assignment Dates</option>
            <option value="2024-01-15">Jan 15, 2024</option>
            <option value="2024-01-18">Jan 18, 2024</option>
            <option value="2024-01-20">Jan 20, 2024</option>
            <option value="2024-01-25">Jan 25, 2024</option>
          </select>
        </div>

        {/* Farmers Table */}
        <DataTable
          data={filteredFarmers}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'phone', label: 'Phone' },
            { key: 'location', label: 'Location' },
            { key: 'assignedDate', label: 'Assigned Date' },
            { key: 'kycStatus', label: 'KYC Status' },
            { key: 'lastAction', label: 'Last Action' },
            { key: 'notes', label: 'Notes' }
          ]}
          customActions={[
            {
              label: 'View',
              className: 'action-btn-small info',
              onClick: handleViewFarmer
            },
            {
              label: 'Edit',
              className: 'action-btn-small primary',
              onClick: handleEditFarmer
            },
            {
              label: 'Approve',
              className: 'action-btn-small success',
              onClick: (farmer) => handleKYCUpdate(farmer.id, 'APPROVED'),
              showCondition: (farmer) => farmer.kycStatus === 'PENDING' || farmer.kycStatus === 'REFER_BACK'
            },
            {
              label: 'Refer Back',
              className: 'action-btn-small warning',
              onClick: (farmer) => {
                const reason = prompt('Enter reason for refer back:');
                if (reason) {
                  handleKYCUpdate(farmer.id, 'REFER_BACK', reason);
                }
              },
              showCondition: (farmer) => farmer.kycStatus === 'PENDING'
            },
            {
              label: 'Reject',
              className: 'action-btn-small danger',
              onClick: (farmer) => {
                const reason = prompt('Enter reason for rejection:');
                if (reason) {
                  handleKYCUpdate(farmer.id, 'REJECTED', reason);
                }
              },
              showCondition: (farmer) => farmer.kycStatus === 'PENDING' || farmer.kycStatus === 'REFER_BACK'
            }
          ]}
        />
      </div>
    );
  };

  const renderKYCProgress = () => {
    const stats = getStats();
    const total = stats.totalAssigned;
    const approvedPercentage = total > 0 ? Math.round((stats.approved / total) * 100) : 0;
    const pendingPercentage = total > 0 ? Math.round((stats.pending / total) * 100) : 0;
    const referBackPercentage = total > 0 ? Math.round((stats.referBack / total) * 100) : 0;
    const rejectedPercentage = total > 0 ? Math.round((stats.rejected / total) * 100) : 0;

    return (
      <div className="overview-section">
        <div className="overview-header">
          <h2 className="overview-title">KYC Progress Tracking</h2>
          <p className="overview-description">
            Monitor your KYC verification progress and performance metrics.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="progress-overview">
          <div className="progress-stats">
            <div className="progress-stat">
              <h3>Overall Progress</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill approved" 
                  style={{ width: `${approvedPercentage}%` }}
                ></div>
                <div 
                  className="progress-fill pending" 
                  style={{ width: `${pendingPercentage}%` }}
                ></div>
                <div 
                  className="progress-fill refer-back" 
                  style={{ width: `${referBackPercentage}%` }}
                ></div>
                <div 
                  className="progress-fill rejected" 
                  style={{ width: `${rejectedPercentage}%` }}
                ></div>
              </div>
              <div className="progress-labels">
                <span>Approved: {approvedPercentage}%</span>
                <span>Pending: {pendingPercentage}%</span>
                <span>Refer Back: {referBackPercentage}%</span>
                <span>Rejected: {rejectedPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="detailed-stats">
          <div className="stat-card approved">
            <h4>Approved Cases</h4>
            <div className="stat-content">
              <span className="stat-number">{stats.approved}</span>
              <span className="stat-percentage">{approvedPercentage}%</span>
            </div>
          </div>
          <div className="stat-card pending">
            <h4>Pending Cases</h4>
            <div className="stat-content">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-percentage">{pendingPercentage}%</span>
            </div>
          </div>
          <div className="stat-card refer-back">
            <h4>Refer Back Cases</h4>
            <div className="stat-content">
              <span className="stat-number">{stats.referBack}</span>
              <span className="stat-percentage">{referBackPercentage}%</span>
            </div>
          </div>
          <div className="stat-card rejected">
            <h4>Rejected Cases</h4>
            <div className="stat-content">
              <span className="stat-number">{stats.rejected}</span>
              <span className="stat-percentage">{rejectedPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>DATE Digital Agristack</h2>
          <p>Employee Dashboard</p>
        </div>
        
        <div className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Overview</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'farmers' ? 'active' : ''}`}
            onClick={() => setActiveTab('farmers')}
          >
            <i className="fas fa-users"></i>
            <span>Assigned Farmers</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <i className="fas fa-chart-line"></i>
            <span>KYC Progress</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Header Bar */}
        <div className="top-header"></div>

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="greeting-section">
              <h2 className="greeting-text">{getGreeting()}, {user?.name || 'Employee'}! 👋</h2>
              <p className="greeting-time">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <h1 className="header-title">Employee Dashboard</h1>
            <p className="header-subtitle">Manage assigned farmers and KYC</p>
          </div>
          <div className="header-right">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'farmers' && renderAssignedFarmers()}
          {activeTab === 'progress' && renderKYCProgress()}
        </div>
      </div>

      {/* Modals */}
      {showFarmerForm && (
        <FarmerForm 
          editData={editingFarmer}
          onClose={() => {
            setShowFarmerForm(false);
            setEditingFarmer(null);
          }}
          onSubmit={async (farmerData) => {
            try {
              // API call to create/update farmer
              setAssignedFarmers(prev => [...prev, { ...farmerData, id: Date.now() }]);
              setShowFarmerForm(false);
              setEditingFarmer(null);
              alert('Farmer saved successfully!');
            } catch (error) {
              console.error('Error saving farmer:', error);
              alert('Failed to save farmer. Please try again.');
            }
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
          onApprove={(farmerId) => handleKYCUpdate(farmerId, 'APPROVED')}
          onReject={(farmerId, reason) => handleKYCUpdate(farmerId, 'REJECTED', reason)}
          onReferBack={(farmerId, reason) => handleKYCUpdate(farmerId, 'REFER_BACK', reason)}
        />
      )}

      {showFarmerDetails && selectedFarmerData && (
        <ViewFarmerRegistrationDetails
          farmerData={selectedFarmerData}
          onClose={handleCloseFarmerDetails}
        />
      )}

      {showEmployeeDetails && selectedEmployeeData && (
        <ViewEditEmployeeDetails
          employee={selectedEmployeeData}
          onClose={handleCloseEmployeeDetails}
          onUpdate={handleUpdateEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard; 