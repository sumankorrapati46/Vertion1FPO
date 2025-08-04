import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { farmersAPI, employeesAPI, adminAPI, superAdminAPI } from '../api/apiService';
import '../styles/Dashboard.css';
import FarmerForm from '../components/FarmerForm';
import FarmerRegistrationForm from '../components/FarmerRegistrationForm';
import EmployeeRegistrationForm from '../components/EmployeeRegistrationForm';
import AssignmentModal from '../components/AssignmentModal';
import KYCDocumentUpload from '../components/KYCDocumentUpload';
import ViewFarmerRegistrationDetails from '../components/ViewFarmerRegistrationDetails';
import ViewEditEmployeeDetails from '../components/ViewEditEmployeeDetails';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import UserProfileDropdown from '../components/UserProfileDropdown';
import RegistrationApprovalModal from '../components/RegistrationApprovalModal';
import RegistrationDetailModal from '../components/RegistrationDetailModal';

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
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showRegistrationDetailModal, setShowRegistrationDetailModal] = useState(false);
  const [selectedRegistrationForDetail, setSelectedRegistrationForDetail] = useState(null);
  const [showEmployeeRegistration, setShowEmployeeRegistration] = useState(false);
  const [showFarmerRegistration, setShowFarmerRegistration] = useState(false);
  const [registrationFilters, setRegistrationFilters] = useState({
    role: '',
    status: ''
  });
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
    
    // Listen for KYC status updates from Employee Dashboard
    const handleKYCUpdate = (event) => {
      console.log('🔄 Admin Dashboard: KYC status updated, refreshing data...');
      console.log('📊 KYC Update details:', event.detail);
      fetchData(); // Refresh data when KYC status changes
    };
    
    window.addEventListener('kycStatusUpdated', handleKYCUpdate);
    
    return () => {
      window.removeEventListener('kycStatusUpdated', handleKYCUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔍 Admin: Starting to fetch real data from API...');
      
      // Fetch farmers, employees, and registrations from API using admin endpoints
      const farmersData = await adminAPI.getFarmersWithKyc();
      const employeesData = await adminAPI.getEmployeesWithStats();
      const registrationsData = await superAdminAPI.getRegistrationList();
      
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
      
      // Handle registrations data
      console.log('✅ Admin API Response:', { 
        farmersCount: farmersData?.length || 0,
        employeesCount: employeesData?.length || 0,
        registrationsCount: registrationsData?.length || 0,
        registrationsData: registrationsData
      });
      
      if (registrationsData && registrationsData.length > 0) {
        console.log('✅ Setting real registrations data:', registrationsData.length, 'registrations');
        setRegistrations(registrationsData);
      } else {
        console.log('❌ No registrations data from API, trying fallback...');
        // Fallback to super admin endpoints
        try {
          const superAdminRegistrations = await superAdminAPI.getRegistrationList();
          console.log('🔄 Fallback registrations data:', superAdminRegistrations);
          if (superAdminRegistrations && superAdminRegistrations.length > 0) {
            console.log('✅ Setting real registrations data from fallback:', superAdminRegistrations.length, 'registrations');
            setRegistrations(superAdminRegistrations);
          } else {
            console.log('❌ No registrations data from fallback API, using mock data');
            loadMockRegistrationData();
          }
        } catch (basicError) {
          console.error('❌ Fallback error:', basicError);
          console.log('❌ Using mock data due to API error');
          loadMockRegistrationData();
        }
      }
    } catch (error) {
      console.error('❌ Admin error fetching data:', error);
      console.log('❌ Using fallback endpoints due to API error');
      // Try basic admin endpoints as fallback
      try {
        const farmersData = await adminAPI.getAllFarmers();
        const employeesData = await adminAPI.getAllEmployees();
        const registrationsData = await superAdminAPI.getRegistrationList();
        
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
        
        if (registrationsData && registrationsData.length > 0) {
          setRegistrations(registrationsData);
        } else {
          loadMockRegistrationData();
        }
      } catch (fallbackError) {
        loadMockData();
        loadMockRegistrationData();
      }
    }
  };

  const loadMockData = () => {
    const mockFarmers = [
      {
        id: 1,
        name: 'vamsi krishna',
        phone: '9876543210',
        state: 'Andhrapradesh',
        district: 'kadapa',
        region: 'Southern',
        kycStatus: 'NOT_STARTED',
        assignmentStatus: 'ASSIGNED',
        assignedEmployee: 'harish reddy',
        assignedDate: '2024-01-15'
      },
      {
        id: 2,
        name: 'Ainash kumar',
        phone: '9876543211',
        state: 'Andhrapradesh',
        district: 'kadapa',
        region: 'Southern',
        kycStatus: 'NOT_STARTED',
        assignmentStatus: 'ASSIGNED',
        assignedEmployee: 'harish reddy',
        assignedDate: '2024-01-18'
      },
      {
        id: 3,
        name: 'Ramu Yadav',
        phone: '9876543212',
        state: 'Telangana',
        district: 'Karimnagar',
        region: 'Southern',
        kycStatus: 'NOT_STARTED',
        assignmentStatus: 'ASSIGNED',
        assignedEmployee: 'harish reddy',
        assignedDate: '2024-01-10'
      },
      {
        id: 4,
        name: 'hari chowdary',
        phone: '6271979190',
        state: 'Andhrapradesh',
        district: 'Kadapa',
        region: 'Southern',
        kycStatus: 'NOT_STARTED',
        assignmentStatus: 'ASSIGNED',
        assignedEmployee: 'harish reddy',
        assignedDate: '2024-01-20'
      },
      {
        id: 5,
        name: 'kumar chowdary',
        phone: '6302949363',
        state: 'Andhrapradesh',
        district: 'kadpaa',
        region: 'Southern',
        kycStatus: 'NOT_STARTED',
        assignmentStatus: 'ASSIGNED',
        assignedEmployee: 'karthik kumar',
        assignedDate: '2024-01-25'
      },
      {
        id: 6,
        name: 'dinakar lankipalli',
        phone: '9857687867',
        state: 'Andrapradesh',
        district: 'Jangaon',
        region: 'Southern',
        kycStatus: 'NOT_STARTED',
        assignmentStatus: 'ASSIGNED',
        assignedEmployee: 'dinakar lankipalli',
        assignedDate: '2024-01-12'
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

  const loadMockRegistrationData = () => {
    const mockRegistrations = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '9876543210',
        role: 'FARMER',
        status: 'PENDING',
        createdAt: '2024-01-15',
        documents: ['Aadhar Card', 'PAN Card'],
        kycStatus: 'NOT_STARTED'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '9876543211',
        role: 'EMPLOYEE',
        status: 'APPROVED',
        createdAt: '2024-01-14',
        documents: ['Aadhar Card', 'PAN Card', 'Educational Certificate'],
        kycStatus: 'APPROVED'
      },
      {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        phoneNumber: '9876543212',
        role: 'FARMER',
        status: 'REJECTED',
        createdAt: '2024-01-13',
        documents: ['Aadhar Card'],
        kycStatus: 'REJECTED',
        rejectionReason: 'Incomplete documentation'
      }
    ];
    setRegistrations(mockRegistrations);
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

  const getFilteredRegistrations = () => {
    console.log('All registrations:', registrations);
    // Apply filters
    const filtered = registrations.filter(registration => {
      const roleMatch = !registrationFilters.role || registration.role === registrationFilters.role;
      const statusMatch = !registrationFilters.status || registration.status === registrationFilters.status;
      return roleMatch && statusMatch;
    });
    console.log('Filtered registrations:', filtered);
    return filtered;
  };

  const handleViewRegistration = (registration) => {
    setSelectedRegistrationForDetail(registration);
    setShowRegistrationDetailModal(true);
  };

  const handleCloseRegistrationDetailModal = () => {
    setShowRegistrationDetailModal(false);
    setSelectedRegistrationForDetail(null);
  };

  const handleRegistrationUpdate = () => {
    // Refresh the registration data
    fetchData();
  };

  const handleApproveRegistration = async (registrationId) => {
    try {
      await superAdminAPI.approveUser(registrationId, 'FARMER'); // Default role, can be updated
      setRegistrations(prev => prev.map(reg => 
        reg.id === registrationId ? { ...reg, status: 'APPROVED' } : reg
      ));
      alert('Registration approved successfully!');
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Failed to approve registration. Please try again.');
    }
  };

  const handleRejectRegistration = async (registrationId) => {
    try {
      await superAdminAPI.rejectUser(registrationId, 'Rejected by Admin');
      setRegistrations(prev => prev.map(reg => 
        reg.id === registrationId ? { ...reg, status: 'REJECTED' } : reg
      ));
      alert('Registration rejected successfully!');
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Failed to reject registration. Please try again.');
    }
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
        {!showFarmerRegistration ? (
          <>
            <div className="overview-header">
              <h2 className="overview-title">Farmer Management</h2>
              <p className="overview-description">
                View and manage all farmer profiles with KYC status and assignments.
              </p>
              <div className="overview-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowFarmerRegistration(true)}
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
          </>
        ) : (
          <div className="farmer-registration-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Add New Farmer</h2>
                <p className="section-description">
                  Fill in the farmer details to create a new farmer account.
                </p>
              </div>
              <div className="section-actions">
                <button 
                  className="action-btn-small secondary"
                  onClick={() => setShowFarmerRegistration(false)}
                >
                  <i className="fas fa-arrow-left"></i>
                  Back to Farmers
                </button>
              </div>
            </div>

            <FarmerRegistrationForm 
              isInDashboard={true}
              onClose={() => setShowFarmerRegistration(false)}
              onSubmit={async (farmerData) => {
                try {
                  const newFarmer = await farmersAPI.createFarmer(farmerData);
                  setFarmers(prev => [...prev, newFarmer]);
                  alert('Farmer created successfully!');
                  setShowFarmerRegistration(false);
                } catch (error) {
                  console.error('Error creating farmer:', error);
                  alert('Failed to create farmer. Please try again.');
                }
              }}
            />
          </div>
        )}
    </div>
  );
  };

  const renderRegistration = () => {
    const filteredRegistrations = getFilteredRegistrations();

    return (
      <div className="registration-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Registration Management</h2>
            <p className="section-description">
              Review and manage user registration requests.
            </p>
          </div>
          <div className="section-actions">
            <button 
              className="action-btn-small primary"
              onClick={() => {
                console.log('🔄 Manually refreshing data...');
                fetchData();
              }}
            >
              <i className="fas fa-sync-alt"></i>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Filters */}
      <div className="filters-section">
          <div className="filter-group">
          <select 
              className="filter-select"
              value={registrationFilters.role}
              onChange={(e) => setRegistrationFilters(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">All Roles</option>
              <option value="FARMER">Farmer</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="filter-group">
            <select 
              className="filter-select"
              value={registrationFilters.status}
              onChange={(e) => setRegistrationFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

        {/* Registration Table */}
      <DataTable
          data={filteredRegistrations}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
            { key: 'phoneNumber', label: 'Phone' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status' },
            { key: 'createdAt', label: 'Registration Date' }
          ]}
          customActions={[
            {
              label: 'View',
              className: 'action-btn-small info',
              onClick: handleViewRegistration
            },
            {
              label: 'Approve',
              className: 'action-btn-small success',
              onClick: (registration) => handleApproveRegistration(registration.id),
              show: (registration) => registration.status === 'PENDING'
            },
            {
              label: 'Reject',
              className: 'action-btn-small danger',
              onClick: (registration) => handleRejectRegistration(registration.id),
              show: (registration) => registration.status === 'PENDING'
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
        {!showEmployeeRegistration ? (
          <>
            <div className="overview-header">
              <h2 className="overview-title">Employee Management</h2>
              <p className="overview-description">
                View and manage employee profiles with KYC assignment statistics.
              </p>
              <div className="overview-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowEmployeeRegistration(true)}
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
          </>
        ) : (
          <div className="employee-registration-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Add New Employee</h2>
                <p className="section-description">
                  Fill in the employee details to create a new employee account.
                </p>
              </div>
              <div className="section-actions">
        <button 
                  className="action-btn-small secondary"
                  onClick={() => setShowEmployeeRegistration(false)}
        >
                  <i className="fas fa-arrow-left"></i>
                  Back to Employees
        </button>
              </div>
            </div>

            <EmployeeRegistrationForm 
              isInDashboard={true}
              onClose={() => setShowEmployeeRegistration(false)}
              onSubmit={async (employeeData) => {
                try {
                  const newEmployee = await employeesAPI.createEmployee(employeeData);
                  setEmployees(prev => [...prev, newEmployee]);
                  alert('Employee created successfully!');
                  setShowEmployeeRegistration(false);
                } catch (error) {
                  console.error('Error creating employee:', error);
                  alert('Failed to create employee. Please try again.');
                }
              }}
            />
          </div>
        )}
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

          <div 
            className={`nav-item ${activeTab === 'registration' ? 'active' : ''}`}
            onClick={() => setActiveTab('registration')}
          >
            <i className="fas fa-user-plus"></i>
            <span>Registration</span>
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
          {activeTab === 'registration' && renderRegistration()}
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

      {showRegistrationDetailModal && selectedRegistrationForDetail && (
        <RegistrationDetailModal
          registration={selectedRegistrationForDetail}
          onClose={handleCloseRegistrationDetailModal}
          onUpdate={handleRegistrationUpdate}
          onApprove={handleApproveRegistration}
          onReject={handleRejectRegistration}
                   />
                 )}
               </div>
             );
};

export default AdminDashboard; 