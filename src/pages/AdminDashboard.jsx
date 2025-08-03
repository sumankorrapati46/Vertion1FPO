import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { farmersAPI, employeesAPI, adminAPI } from '../api/apiService';
import '../styles/Dashboard.css';
import FarmerForm from '../components/FarmerForm';
import EmployeeRegistrationForm from '../components/EmployeeRegistrationForm';
import AssignmentModal from '../components/AssignmentModal';
import KYCDocumentUpload from '../components/KYCDocumentUpload';
import ViewFarmerRegistrationDetails from '../components/ViewFarmerRegistrationDetails';
import ViewEditEmployeeDetails from '../components/ViewEditEmployeeDetails';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import UserProfileDropdown from '../components/UserProfileDropdown';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [farmers, setFarmers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showFarmerDetails, setShowFarmerDetails] = useState(false);
  const [selectedFarmerData, setSelectedFarmerData] = useState(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [showKYCDocumentUpload, setShowKYCDocumentUpload] = useState(false);
  const [selectedFarmerForKYC, setSelectedFarmerForKYC] = useState(null);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    region: '',
    kycStatus: '',
    assignmentStatus: '',
    employeeFilter: ''
  });

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

  // Load data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch farmers and employees from API using admin endpoints with enhanced data
      const farmersData = await adminAPI.getFarmersWithKyc();
      const employeesData = await adminAPI.getEmployeesWithStats();
      
      if (farmersData && farmersData.length > 0) {
        setFarmers(farmersData);
      } else {
        // Fallback to basic admin endpoints
        try {
          const basicFarmers = await adminAPI.getAllFarmers();
          if (basicFarmers && basicFarmers.length > 0) {
            setFarmers(basicFarmers);
          } else {
            // Fallback to super-admin endpoints
            try {
              const superAdminFarmers = await farmersAPI.getAllFarmers();
              if (superAdminFarmers && superAdminFarmers.length > 0) {
                setFarmers(superAdminFarmers);
              } else {
                loadMockData();
              }
            } catch (superAdminError) {
              loadMockData();
            }
          }
        } catch (basicError) {
          loadMockData();
        }
      }
      
      if (employeesData && employeesData.length > 0) {
        setEmployees(employeesData);
      } else {
        // Fallback to basic admin endpoints
        try {
          const basicEmployees = await adminAPI.getAllEmployees();
          if (basicEmployees && basicEmployees.length > 0) {
            setEmployees(basicEmployees);
          } else {
            // Fallback to super-admin endpoints
            try {
              const superAdminEmployees = await employeesAPI.getAllEmployees();
              if (superAdminEmployees && superAdminEmployees.length > 0) {
                setEmployees(superAdminEmployees);
              } else {
                loadMockData();
              }
            } catch (superAdminError) {
              loadMockData();
            }
          }
        } catch (basicError) {
          loadMockData();
        }
      }
    } catch (error) {
      // Try basic admin endpoints as fallback
      try {
        const farmersData = await adminAPI.getAllFarmers();
        const employeesData = await adminAPI.getAllEmployees();
        
        if (farmersData && farmersData.length > 0) {
          setFarmers(farmersData);
        } else {
          loadMockData();
        }
        
        if (employeesData && employeesData.length > 0) {
          setEmployees(employeesData);
        } else {
          loadMockData();
        }
      } catch (fallbackError) {
        loadMockData();
      }
    }
  };

  const loadMockData = () => {
    const mockFarmers = [
      {
        id: 1,
        name: 'Rajesh Kumar',
        phone: '9876543210',
        state: 'Maharashtra',
        district: 'Pune',
        region: 'Western',
        kycStatus: 'APPROVED',
        assignmentStatus: 'ASSIGNED',
        assignedEmployee: 'John Doe',
        assignedDate: '2024-01-15'
      },
      {
        id: 2,
        name: 'Suresh Patel',
        phone: '9876543211',
        state: 'Gujarat',
        district: 'Ahmedabad',
        region: 'Western',
        kycStatus: 'PENDING',
        assignmentStatus: 'UNASSIGNED',
        assignedEmployee: null,
        assignedDate: null
      },
      {
        id: 3,
        name: 'Amit Singh',
        phone: '9876543212',
        state: 'Punjab',
        district: 'Amritsar',
        region: 'Northern',
        kycStatus: 'REFER_BACK',
        assignmentStatus: 'ASSIGNED',
        assignedEmployee: 'Jane Smith',
        assignedDate: '2024-01-10'
      },
      {
        id: 4,
        name: 'Priya Sharma',
        phone: '9876543213',
        state: 'Karnataka',
        district: 'Bangalore',
        region: 'Southern',
        kycStatus: 'PENDING',
        assignmentStatus: 'UNASSIGNED',
        assignedEmployee: null,
        assignedDate: null
      },
      {
        id: 5,
        name: 'Vikram Malhotra',
        phone: '9876543214',
        state: 'Tamil Nadu',
        district: 'Chennai',
        region: 'Southern',
        kycStatus: 'PENDING',
        assignmentStatus: 'UNASSIGNED',
        assignedEmployee: null,
        assignedDate: null
      },
      {
        id: 6,
        name: 'Sunita Devi',
        phone: '9876543215',
        state: 'Bihar',
        district: 'Patna',
        region: 'Eastern',
        kycStatus: 'PENDING',
        assignmentStatus: 'UNASSIGNED',
        assignedEmployee: null,
        assignedDate: null
      }
    ];

    const mockEmployees = [
      {
        id: 1,
        name: 'John Doe',
        phone: '9876543201',
        email: 'john.doe@company.com',
        designation: 'KYC Officer',
        state: 'Maharashtra',
        district: 'Pune',
        region: 'Western',
        status: 'ACTIVE',
        assignedFarmersCount: 15,
        kycStats: {
          approved: 8,
          pending: 5,
          referBack: 2,
          rejected: 0
        }
      },
      {
        id: 2,
        name: 'Jane Smith',
        phone: '9876543202',
        email: 'jane.smith@company.com',
        designation: 'KYC Officer',
        state: 'Gujarat',
        district: 'Ahmedabad',
        region: 'Western',
        status: 'ACTIVE',
        assignedFarmersCount: 12,
        kycStats: {
          approved: 6,
          pending: 4,
          referBack: 1,
          rejected: 1
        }
      },
      {
        id: 3,
        name: 'Mike Johnson',
        phone: '9876543203',
        email: 'mike.johnson@company.com',
        designation: 'KYC Officer',
        state: 'Punjab',
        district: 'Amritsar',
        region: 'Northern',
        status: 'ACTIVE',
        assignedFarmersCount: 8,
        kycStats: {
          approved: 5,
          pending: 2,
          referBack: 1,
          rejected: 0
        }
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        phone: '9876543204',
        email: 'sarah.wilson@company.com',
        designation: 'KYC Officer',
        state: 'Karnataka',
        district: 'Bangalore',
        region: 'Southern',
        status: 'ACTIVE',
        assignedFarmersCount: 0,
        kycStats: {
          approved: 0,
          pending: 0,
          referBack: 0,
          rejected: 0
        }
      }
    ];

    setFarmers(mockFarmers);
    setEmployees(mockEmployees);
  };

  const getFilteredFarmers = () => {
    return farmers.filter(farmer => {
      const matchesState = !filters.state || farmer.state === filters.state;
      const matchesDistrict = !filters.district || farmer.district === filters.district;
      const matchesKycStatus = !filters.kycStatus || farmer.kycStatus === filters.kycStatus;
      const matchesEmployee = !filters.employeeFilter || farmer.assignedEmployee === filters.employeeFilter;
      
      return matchesState && matchesDistrict && matchesKycStatus && matchesEmployee;
    });
  };

  const getFilteredEmployees = () => {
    return employees.filter(employee => {
      const matchesDistrict = !filters.district || employee.district === filters.district;
      return matchesDistrict;
    });
  };

  const getStats = () => {
    const totalFarmers = farmers.length;
    const totalEmployees = employees.length;
    const unassignedFarmers = farmers.filter(f => !f.assignedEmployee || f.assignedEmployee === 'Not Assigned').length;
    const pendingKYC = farmers.filter(f => f.kycStatus === 'PENDING' || f.kycStatus === 'NOT_STARTED').length;
    const approvedKYC = farmers.filter(f => f.kycStatus === 'APPROVED').length;
    const referBackKYC = farmers.filter(f => f.kycStatus === 'REFER_BACK').length;
    const rejectedKYC = farmers.filter(f => f.kycStatus === 'REJECTED').length;

    return {
      totalFarmers,
      totalEmployees,
      unassignedFarmers,
      pendingKYC,
      approvedKYC,
      referBackKYC,
      rejectedKYC
    };
  };

  const getTodoList = () => {
    const unassignedFarmers = farmers.filter(f => !f.assignedEmployee || f.assignedEmployee === 'Not Assigned');
    const overdueKYC = farmers.filter(f => {
      if ((f.kycStatus === 'PENDING' || f.kycStatus === 'NOT_STARTED') && f.assignedEmployee && f.assignedEmployee !== 'Not Assigned') {
        // For now, consider all pending KYC as overdue if assigned
        return true;
      }
      return false;
    });
    const employeesWithLargeQueues = employees.filter(emp => {
      const pendingCount = emp.pendingKyc || 0;
      return pendingCount > 5; // Large queue if more than 5 pending
    });

    return {
      unassignedFarmers,
      overdueKYC,
      employeesWithLargeQueues
    };
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

  const handleViewEmployee = (employee) => {
    setSelectedEmployeeData(employee);
    setShowEmployeeDetails(true);
  };

  const handleCloseEmployeeDetails = () => {
    setShowEmployeeDetails(false);
    setSelectedEmployeeData(null);
  };

  const handleUpdateEmployee = (updatedData) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === updatedData.id ? updatedData : emp
    ));
    setShowEmployeeDetails(false);
    setSelectedEmployeeData(null);
  };

  const handleKYCDocumentUpload = (farmer) => {
    setSelectedFarmerForKYC(farmer);
    setShowKYCDocumentUpload(true);
  };

  const handleCloseKYCDocumentUpload = () => {
    setShowKYCDocumentUpload(false);
    setSelectedFarmerForKYC(null);
  };

  const handleKYCApprove = (farmerId, documents) => {
    setFarmers(prev => prev.map(farmer => 
      farmer.id === farmerId 
        ? { ...farmer, kycStatus: 'APPROVED' }
        : farmer
    ));
    setShowKYCDocumentUpload(false);
    setSelectedFarmerForKYC(null);
  };

  const handleKYCReject = (farmerId, reason, documents) => {
    setFarmers(prev => prev.map(farmer => 
      farmer.id === farmerId 
        ? { ...farmer, kycStatus: 'REJECTED' }
        : farmer
    ));
    setShowKYCDocumentUpload(false);
    setSelectedFarmerForKYC(null);
  };

  const handleKYCReferBack = (farmerId, reason, documents) => {
    setFarmers(prev => prev.map(farmer => 
      farmer.id === farmerId 
        ? { ...farmer, kycStatus: 'REFER_BACK' }
        : farmer
    ));
    setShowKYCDocumentUpload(false);
    setSelectedFarmerForKYC(null);
  };

  const handleEditFarmer = (farmer) => {
    setEditingFarmer(farmer);
    setShowFarmerForm(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleAssignFarmers = async (assignments) => {
    try {
      // Extract farmer IDs and employee ID from assignments
      const farmerIds = assignments.map(a => a.farmerId);
      const employeeId = assignments[0]?.employeeId;
      
      if (!employeeId || farmerIds.length === 0) {
        alert('Please select an employee and at least one farmer');
        return;
      }
      
      // Try bulk assign first, then fallback to individual assignments
      try {
        // Call admin API to bulk assign farmers
        await adminAPI.bulkAssignFarmers(farmerIds, employeeId);
      } catch (bulkError) {
        console.log('Bulk assign failed, trying individual assignments...');
        // Fallback to individual assignments
        for (const farmerId of farmerIds) {
          try {
            await adminAPI.assignFarmer(farmerId, employeeId);
          } catch (individualError) {
            console.error(`Failed to assign farmer ${farmerId}:`, individualError);
          }
        }
      }
      
      // Update local state for each assignment
      setFarmers(prev => prev.map(farmer => {
        const assignment = assignments.find(a => a.farmerId === farmer.id);
        if (assignment) {
          return {
            ...farmer,
            assignmentStatus: 'ASSIGNED',
            assignedEmployee: assignment.employeeName,
            assignedDate: new Date().toISOString().split('T')[0]
          };
        }
        return farmer;
      }));
      
      setShowAssignmentModal(false);
      alert('Farmers assigned successfully!');
    } catch (error) {
      console.error('Error assigning farmers:', error);
      alert('Failed to assign farmers');
    }
  };

  const renderOverview = () => {
    const stats = getStats();
    const todoList = getTodoList();

    return (
      <div className="overview-section">
        <div className="overview-header">
          <h2 className="overview-title">Admin Dashboard Overview</h2>
          <p className="overview-description">
            Manage farmers, employees, and KYC assignments efficiently.
          </p>
        </div>

        {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Farmers"
            value={stats.totalFarmers}
            change="+12.4%"
            changeType="positive"
            icon="👥"
          />
          <StatsCard
            title="Total Employees"
            value={stats.totalEmployees}
            change="+5.2%"
            changeType="positive"
            icon="👨‍💼"
        />
        <StatsCard
          title="Unassigned Farmers"
            value={stats.unassignedFarmers}
            change=""
            changeType="neutral"
            icon="⏳"
        />
        <StatsCard
          title="Pending KYC"
            value={stats.pendingKYC}
            change=""
            changeType="warning"
            icon="📋"
        />
      </div>

        {/* KYC Status Breakdown */}
        <div className="kyc-breakdown">
          <h3>KYC Status Breakdown</h3>
          <div className="kyc-stats-grid">
            <div className="kyc-stat-card approved">
              <span className="kyc-stat-number">{stats.approvedKYC}</span>
              <span className="kyc-stat-label">Approved</span>
            </div>
            <div className="kyc-stat-card pending">
              <span className="kyc-stat-number">{stats.pendingKYC}</span>
              <span className="kyc-stat-label">Pending</span>
            </div>
            <div className="kyc-stat-card refer-back">
              <span className="kyc-stat-number">{stats.referBackKYC}</span>
              <span className="kyc-stat-label">Refer Back</span>
            </div>
            <div className="kyc-stat-card rejected">
              <span className="kyc-stat-number">{stats.rejectedKYC}</span>
              <span className="kyc-stat-label">Rejected</span>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="todo-section">
          <h3>To-Do List</h3>
          <div className="todo-grid">
            <div className="todo-card">
              <h4>Unassigned Farmers</h4>
              <p>{todoList.unassignedFarmers.length} farmers need assignment</p>
              <button 
                className="action-btn-small primary"
                onClick={() => setActiveTab('farmers')}
              >
                View Farmers
              </button>
            </div>
            <div className="todo-card">
              <h4>Overdue KYC Cases</h4>
              <p>{todoList.overdueKYC.length} cases overdue</p>
              <button 
                className="action-btn-small warning"
                onClick={() => setActiveTab('farmers')}
              >
                Review Cases
              </button>
            </div>
            <div className="todo-card">
              <h4>Employees with Large Queues</h4>
              <p>{todoList.employeesWithLargeQueues.length} employees</p>
              <button 
                className="action-btn-small info"
                onClick={() => setActiveTab('employees')}
              >
                View Employees
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

    const renderFarmers = () => {
    const filteredFarmers = getFilteredFarmers();

    return (
      <div className="overview-section">
        <div className="overview-header">
          <h2 className="overview-title">Farmer Management</h2>
          <p className="overview-description">
            View and manage all farmer profiles with KYC status and assignments.
          </p>
          <div className="overview-actions">
          <button 
            className="action-btn primary"
            onClick={() => setShowFarmerForm(true)}
          >
              Add Farmer
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => setShowAssignmentModal(true)}
          >
              Assign Farmers
          </button>
        </div>
      </div>

        



        {/* Filters */}
      <div className="filters-section">
          <select 
            value={filters.state} 
            onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
            className="filter-select"
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Punjab">Punjab</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
          <select 
            value={filters.district} 
            onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
            className="filter-select"
          >
            <option value="">All Districts</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Amritsar">Amritsar</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Chennai">Chennai</option>
          </select>
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
            value={filters.assignmentStatus} 
            onChange={(e) => setFilters(prev => ({ ...prev, assignmentStatus: e.target.value }))}
            className="filter-select"
          >
            <option value="">All Assignment Status</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
          <select 
            value={filters.employeeFilter} 
            onChange={(e) => setFilters(prev => ({ ...prev, employeeFilter: e.target.value }))}
            className="filter-select"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name}</option>
            ))}
          </select>
      </div>

        {/* Farmers Table */}
      <DataTable
          data={filteredFarmers}
        columns={[
          { key: 'name', label: 'Name' },
            { key: 'contactNumber', label: 'Phone' },
          { key: 'state', label: 'State' },
          { key: 'district', label: 'District' },
          { key: 'kycStatus', label: 'KYC Status' },
          { key: 'assignedEmployee', label: 'Assigned Employee' }
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
              label: 'KYC',
              className: 'action-btn-small warning',
            onClick: handleKYCDocumentUpload
          }
        ]}
      />
    </div>
  );
  };

  const renderEmployees = () => {
    const filteredEmployees = getFilteredEmployees();

    return (
      <div className="overview-section">
        <div className="overview-header">
          <h2 className="overview-title">Employee Management</h2>
          <p className="overview-description">
            View and manage employee profiles with KYC assignment statistics.
          </p>
          <div className="overview-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowEmployeeForm(true)}
            >
              Add Employee
            </button>
          </div>
        </div>

        {/* Employee Stats */}
        <div className="employee-stats">
          <h3>Employee KYC Progress</h3>
          <div className="employee-stats-grid">
            {employees.map(employee => (
              <div key={employee.id} className="employee-stat-card">
                <div className="employee-info">
                  <h4>{employee.name}</h4>
                  <p>{employee.designation} - {employee.district}</p>
                </div>
                <div className="employee-kyc-stats">
                  <div className="kyc-stat">
                    <span className="stat-number">{employee.assignedFarmersCount}</span>
                    <span className="stat-label">Total Assigned</span>
                  </div>
                  <div className="kyc-stat">
                    <span className="stat-number approved">{employee.kycStats?.approved || 0}</span>
                    <span className="stat-label">Approved</span>
                  </div>
                  <div className="kyc-stat">
                    <span className="stat-number pending">{employee.kycStats?.pending || 0}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                  <div className="kyc-stat">
                    <span className="stat-number refer-back">{employee.kycStats?.referBack || 0}</span>
                    <span className="stat-label">Refer Back</span>
                  </div>
                  <div className="kyc-stat">
                    <span className="stat-number rejected">{employee.kycStats?.rejected || 0}</span>
                    <span className="stat-label">Rejected</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

        {/* Employees Table */}
      <DataTable
          data={filteredEmployees}
        columns={[
          { key: 'name', label: 'Name' },
            { key: 'contactNumber', label: 'Contact' },
          { key: 'email', label: 'Email' },
            { key: 'state', label: 'State' },
            { key: 'district', label: 'District' },
            { key: 'totalAssigned', label: 'Assigned Farmers' },
            { key: 'approvedKyc', label: 'Approved KYC' },
            { key: 'pendingKyc', label: 'Pending KYC' }
          ]}
          customActions={[
            {
              label: 'View',
              className: 'action-btn-small info',
              onClick: handleViewEmployee
            },
            {
              label: 'Edit',
              className: 'action-btn-small primary',
              onClick: handleEditEmployee
            }
          ]}
      />
    </div>
  );
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>DATE Digital Agristack</h2>
          <p>Admin Dashboard</p>
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
            <span>Farmers</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <i className="fas fa-user-tie"></i>
            <span>Employees</span>
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
              <h2 className="greeting-text">{getGreeting()}, {user?.name || 'Admin'}! 👋</h2>
              <p className="greeting-time">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <h1 className="header-title">Admin Dashboard</h1>
            <p className="header-subtitle">Manage farmers and employees</p>
          </div>
          <div className="header-right">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'farmers' && renderFarmers()}
          {activeTab === 'employees' && renderEmployees()}
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
              if (editingFarmer) {
                const updatedFarmer = await farmersAPI.updateFarmer(editingFarmer.id, farmerData);
                setFarmers(prev => prev.map(farmer => 
                  farmer.id === editingFarmer.id ? updatedFarmer : farmer
                ));
                alert('Farmer updated successfully!');
              } else {
                const newFarmer = await farmersAPI.createFarmer(farmerData);
                setFarmers(prev => [...prev, newFarmer]);
                alert('Farmer created successfully!');
              }
              setShowFarmerForm(false);
              setEditingFarmer(null);
            } catch (error) {
              console.error('Error saving farmer:', error);
              alert('Failed to save farmer. Please try again.');
            }
          }}
        />
      )}

      {showEmployeeForm && (
        <EmployeeRegistrationForm 
          isInDashboard={true}
          editData={editingEmployee}
          onClose={() => {
            setShowEmployeeForm(false);
            setEditingEmployee(null);
          }}
          onSubmit={async (employeeData) => {
            try {
              if (editingEmployee) {
                const updatedEmployee = await employeesAPI.updateEmployee(editingEmployee.id, employeeData);
                setEmployees(prev => prev.map(employee => 
                  employee.id === editingEmployee.id ? updatedEmployee : employee
                ));
                alert('Employee updated successfully!');
              } else {
                const newEmployee = await employeesAPI.createEmployee(employeeData);
                setEmployees(prev => [...prev, newEmployee]);
                alert('Employee created successfully!');
              }
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            } catch (error) {
              console.error('Error saving employee:', error);
              alert('Failed to save employee. Please try again.');
            }
          }}
        />
      )}

      {showAssignmentModal && (
        <AssignmentModal 
          farmers={farmers.filter(f => {
            // Check if farmer is unassigned based on backend data structure
            return !f.assignedEmployee || 
                   f.assignedEmployee === 'Not Assigned' || 
                   f.assignedEmployee === null ||
                   f.assignedEmployee === undefined ||
                   f.assignedEmployee === '';
          })}
          employees={employees}
          onClose={() => setShowAssignmentModal(false)}
          onAssign={handleAssignFarmers}
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

      {showKYCDocumentUpload && selectedFarmerForKYC && (
                   <KYCDocumentUpload
          farmer={selectedFarmerForKYC}
                     onClose={handleCloseKYCDocumentUpload}
                     onApprove={handleKYCApprove}
                     onReject={handleKYCReject}
                     onReferBack={handleKYCReferBack}
                   />
                 )}
               </div>
             );
};

export default AdminDashboard; 