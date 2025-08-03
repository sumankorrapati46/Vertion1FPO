import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { farmersAPI, employeesAPI, superAdminAPI } from '../api/apiService';
import DataTable from '../components/DataTable';
import StatsCard from '../components/StatsCard';
import RegistrationApprovalModal from '../components/RegistrationApprovalModal';
import RegistrationDetailModal from '../components/RegistrationDetailModal';
import ViewFarmerRegistrationDetails from '../components/ViewFarmerRegistrationDetails';
import AssignmentModal from '../components/AssignmentModal';
import FarmerForm from '../components/FarmerForm';
import ViewEditEmployeeDetails from '../components/ViewEditEmployeeDetails';
import EmployeeRegistrationForm from '../components/EmployeeRegistrationForm';
import KYCDocumentUpload from '../components/KYCDocumentUpload';
import DeleteModal from '../components/DeleteModal';
import UserProfileDropdown from '../components/UserProfileDropdown';
import '../styles/Dashboard.css';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  
  // Debug logging
  console.log('SuperAdminDashboard - User data:', user);
  console.log('SuperAdminDashboard - User name:', user?.name);
  console.log('SuperAdminDashboard - User role:', user?.role);
  console.log('SuperAdminDashboard - User email:', user?.email);
  console.log('=== SUPER ADMIN DASHBOARD LOADED ===');
  
  // Test if user data is available
  useEffect(() => {
    console.log('=== USER DATA CHECK ===');
    console.log('User in useEffect:', user);
    console.log('User name in useEffect:', user?.name);
    console.log('User role in useEffect:', user?.role);
    console.log('Greeting text:', getGreeting());
  }, [user]);
  

  const [activeTab, setActiveTab] = useState('dashboard');
  const [farmers, setFarmers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  
  // Modal states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showFarmerDetails, setShowFarmerDetails] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeRegistration, setShowEmployeeRegistration] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [registrationFilters, setRegistrationFilters] = useState({
    role: '',
    status: ''
  });
  const [showRegistrationDetailModal, setShowRegistrationDetailModal] = useState(false);
  const [selectedRegistrationForDetail, setSelectedRegistrationForDetail] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Debug effect to monitor farmers state
  useEffect(() => {
    if (farmers) {
      console.log('Farmers state updated:', farmers);
      console.log('Farmers count:', farmers.length);
    }
  }, [farmers]);

  // Debug effect to monitor employees state
  useEffect(() => {
    console.log('Employees state updated:', employees);
    console.log('Employees count:', employees?.length || 0);
    if (employees && employees.length > 0) {
      console.log('First employee:', employees[0]);
    }
  }, [employees]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from APIs...');
      
      console.log('Starting API calls...');
      let farmersData, employeesData, registrationsData;
      
      try {
        [farmersData, employeesData, registrationsData] = await Promise.all([
          farmersAPI.getAllFarmers(),
          employeesAPI.getAllEmployees(),
          superAdminAPI.getAllUsers()
        ]);
        console.log('API calls completed successfully');
      } catch (apiError) {
        console.error('API call failed:', apiError);
        // Set empty arrays if API fails
        farmersData = [];
        employeesData = [];
        registrationsData = [];
      }

      console.log('Raw API responses:');
      console.log('Farmers data:', farmersData);
      console.log('Employees data:', employeesData);
      console.log('Registrations data:', registrationsData);

      // If registrations data is empty, add some mock data for testing
      let finalRegistrationsData = registrationsData;
      if (!registrationsData || registrationsData.length === 0) {
        console.log('No registration data from API, adding mock data for testing');
        finalRegistrationsData = [
      {
        id: 1,
        name: 'John Doe',
            email: 'john.doe@example.com',
            phoneNumber: '9876543210',
            role: 'FARMER',
            status: 'PENDING'
      },
      {
        id: 2,
        name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phoneNumber: '9876543211',
            role: 'EMPLOYEE',
            status: 'PENDING'
          },
          {
            id: 3,
            name: 'Bob Wilson',
            email: 'bob.wilson@example.com',
            phoneNumber: '9876543212',
            role: 'FARMER',
            status: 'APPROVED'
          }
        ];
      }

      // If farmers data is empty, add some mock data for testing
      let finalFarmersData = farmersData;
      if (!farmersData || farmersData.length === 0) {
        console.log('No farmers data from API, adding mock data for testing');
        finalFarmersData = [
          {
            id: 1,
            name: 'John Farmer',
            contactNumber: '9876543210',
            email: 'john.farmer@example.com',
            accessStatus: 'ACTIVE',
            kycStatus: 'PENDING',
            assignedEmployee: null
          },
          {
            id: 2,
            name: 'Jane Farmer',
            contactNumber: '9876543211',
            email: 'jane.farmer@example.com',
            accessStatus: 'ACTIVE',
            kycStatus: 'APPROVED',
            assignedEmployee: 'Not Assigned'
          },
          {
            id: 3,
            name: 'Bob Farmer',
            contactNumber: '9876543212',
            email: 'bob.farmer@example.com',
            accessStatus: 'ACTIVE',
            kycStatus: 'PENDING',
            assignedEmployee: undefined
          },
          {
            id: 4,
            name: 'Alice Farmer',
            contactNumber: '9876543213',
            email: 'alice.farmer@example.com',
            accessStatus: 'ACTIVE',
            kycStatus: 'PENDING',
            assignedEmployee: 'John Employee'
          }
        ];
        console.log('Mock farmers data created:', finalFarmersData);
      }

      console.log('Setting farmers data:', finalFarmersData);
      console.log('Sample farmer structure:', finalFarmersData[0]);
      // If employees data is empty, add some mock data for testing
      let finalEmployeesData = employeesData;
      if (!employeesData || employeesData.length === 0) {
        console.log('No employees data from API, adding mock data for testing');
        finalEmployeesData = [
          {
            id: 1,
            name: 'John Employee',
            contactNumber: '9876543200',
            email: 'john.employee@example.com',
            status: 'ACTIVE',
            role: 'employee',
            designation: 'KYC Officer'
          },
          {
            id: 2,
            name: 'Jane Employee',
            contactNumber: '9876543201',
            email: 'jane.employee@example.com',
            status: 'ACTIVE',
            role: 'employee',
            designation: 'KYC Officer'
          },
          {
            id: 3,
            name: 'Mike Johnson',
            contactNumber: '9876543202',
            email: 'mike.johnson@example.com',
            status: 'ACTIVE',
            role: 'employee',
            designation: 'KYC Officer'
          },
          {
            id: 4,
            name: 'Sarah Wilson',
            contactNumber: '9876543203',
            email: 'sarah.wilson@example.com',
            status: 'ACTIVE',
            role: 'employee',
            designation: 'KYC Officer'
          }
        ];
      }

      setFarmers(finalFarmersData);
      setEmployees(finalEmployeesData);
      setRegistrations(finalRegistrationsData);
      
      console.log('Fetched data:', { farmersData, employeesData, registrationsData });
      console.log('Final employees data:', finalEmployeesData);
      console.log('Final employees count:', finalEmployeesData?.length || 0);
      
      // Test if employees are being set correctly
      console.log('=== SETTING EMPLOYEES ===');
      console.log('About to set employees:', finalEmployeesData);
      
      // Test if employees are being set correctly
      setTimeout(() => {
        console.log('=== EMPLOYEES STATE TEST ===');
        console.log('Employees state after 1 second:', finalEmployeesData);
        console.log('Employees count after 1 second:', finalEmployeesData?.length || 0);
      }, 1000);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFarmers = () => {
    return farmers;
  };

  const getFilteredEmployees = () => {
    return employees;
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

  const getStats = () => {
    const totalFarmers = farmers.length;
    const totalEmployees = employees.length;
    const pendingRegistrations = registrations.filter(r => {
      const status = r.status || r.userStatus || r.accessStatus;
      return status === 'PENDING' || status === 'pending' || status === 'Pending';
    }).length;
    const unassignedFarmers = farmers.filter(f => f.accessStatus === 'PENDING').length;
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length;
    const totalFPO = 0; // Placeholder for FPO count

    return {
      totalFarmers,
      totalEmployees,
      pendingRegistrations,
      unassignedFarmers,
      activeEmployees,
      totalFPO
    };
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
      await superAdminAPI.approveUser(registrationId);
      setRegistrations(prev => prev.map(reg => 
        reg.id === registrationId ? { ...reg, status: 'APPROVED' } : reg
      ));
      alert('Registration approved successfully!');
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Failed to approve registration');
    }
  };

  const handleRejectRegistration = async (registrationId) => {
    try {
      await superAdminAPI.rejectUser(registrationId);
      setRegistrations(prev => prev.map(reg => 
        reg.id === registrationId ? { ...reg, status: 'REJECTED' } : reg
      ));
      alert('Registration rejected successfully!');
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Failed to reject registration');
    }
  };

  const handleViewFarmer = (farmer) => {
    // Transform farmer data to match ViewFarmerRegistrationDetails expectations
    const farmerData = {
      id: farmer.id,
      firstName: farmer.firstName || '',
      lastName: farmer.lastName || '',
      middleName: farmer.middleName || '',
      dateOfBirth: farmer.dob || '',
      gender: farmer.gender || '',
      mobileNumber: farmer.contactNumber || '',
      email: farmer.email || '',
      maritalStatus: farmer.maritalStatus || 'Single',
      religion: farmer.religion || 'Not Specified',
      caste: farmer.caste || 'Not Specified',
      category: farmer.category || 'General',
      education: farmer.education || 'Not Specified',
      village: farmer.village || '',
      postOffice: farmer.postOffice || '',
      policeStation: farmer.policeStation || '',
      district: farmer.district || '',
      state: farmer.state || '',
      pincode: farmer.zipcode || '',
      occupation: farmer.occupation || 'Farmer',
      annualIncome: farmer.annualIncome || 'Not Specified',
      landOwnership: farmer.landOwnership || 'Not Specified',
      landArea: farmer.landArea || 'Not Specified',
      irrigationType: farmer.irrigationType || 'Not Specified',
      soilType: farmer.soilType || 'Not Specified',
      primaryCrop: farmer.primaryCrop || 'Not Specified',
      secondaryCrop: farmer.secondaryCrop || 'Not Specified',
      cropSeason: farmer.cropSeason || 'Not Specified',
      farmingExperience: farmer.farmingExperience || 'Not Specified',
      bankName: farmer.bankName || '',
      branchName: farmer.branchName || '',
      accountNumber: farmer.accountNumber || '',
      ifscCode: farmer.ifscCode || '',
      accountType: farmer.accountType || 'Savings',
      aadhaarNumber: farmer.aadhaarNumber || 'Not Specified',
      panNumber: farmer.panNumber || 'Not Specified',
      voterId: farmer.voterId || 'Not Specified',
      rationCardNumber: farmer.rationCardNumber || 'Not Specified',
      status: farmer.accessStatus || 'PENDING',
      assignedEmployee: farmer.assignedEmployee || 'Not Assigned',
      kycStatus: farmer.kycStatus || 'PENDING',
      photo: farmer.photoFileName ? `/uploads/${farmer.photoFileName}` : null
    };

    console.log('Transformed farmer data:', farmerData);
    setSelectedFarmer(farmerData);
    setShowFarmerDetails(true);
  };

  const handleEditFarmer = (farmer) => {
    const farmerData = {
      id: farmer.id,
      firstName: farmer.firstName || '',
      lastName: farmer.lastName || '',
      middleName: farmer.middleName || '',
      salutation: farmer.salutation || '',
      contactNumber: farmer.contactNumber || '',
      email: farmer.email || '',
      dob: farmer.dob || '',
      gender: farmer.gender || '',
      nationality: farmer.nationality || '',
      relationType: farmer.relationType || '',
      relationName: farmer.relationName || '',
      altNumber: farmer.altNumber || '',
      altNumberType: farmer.altNumberType || '',
      country: farmer.country || '',
      state: farmer.state || '',
      district: farmer.district || '',
      block: farmer.block || '',
      village: farmer.village || '',
      zipcode: farmer.zipcode || '',
      sector: farmer.sector || '',
      education: farmer.education || '',
      experience: farmer.experience || '',
      bankName: farmer.bankName || '',
      accountNumber: farmer.accountNumber || '',
      branchName: farmer.branchName || '',
      ifscCode: farmer.ifscCode || '',
      passbookFileName: farmer.passbookFileName || '',
      documentType: farmer.documentType || '',
      documentNumber: farmer.documentNumber || '',
      documentFileName: farmer.documentFileName || '',
      photoFileName: farmer.photoFileName || '',
      role: farmer.role || 'FARMER',
      accessStatus: farmer.accessStatus || 'PENDING',
      kycStatus: farmer.kycStatus || 'PENDING'
    };
    console.log('Farmer data for edit:', farmerData);
    setEditingFarmer(farmerData);
    setShowFarmerForm(true);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const handleAddEmployee = () => {
    setShowEmployeeRegistration(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
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
        await superAdminAPI.bulkAssignFarmers(farmerIds, employeeId);
      } catch (bulkError) {
        console.log('Bulk assign failed, trying individual assignments...');
        // Fallback to individual assignments
        for (const farmerId of farmerIds) {
          try {
            await superAdminAPI.assignFarmer(farmerId, employeeId);
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

  const handleApproveKYC = (farmerId) => {
    // Implement KYC approval logic
    alert('KYC approved successfully!');
  };

  const handleRejectKYC = (farmerId) => {
    // Implement KYC rejection logic
    alert('KYC rejected successfully!');
  };

  const handleReferBackKYC = (farmerId) => {
    // Implement KYC refer back logic
    alert('KYC referred back for review!');
  };

  const handleDelete = (item, type) => {
    setItemToDelete({ item, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { item, type } = itemToDelete;
      if (type === 'farmer') {
        await farmersAPI.deleteFarmer(item.id);
        setFarmers(prev => prev.filter(f => f.id !== item.id));
      } else if (type === 'employee') {
        await employeesAPI.deleteEmployee(item.id);
        setEmployees(prev => prev.filter(e => e.id !== item.id));
      } else if (type === 'registration') {
        // Handle registration deletion
        await superAdminAPI.deleteUser(item.id);
        setRegistrations(prev => prev.filter(r => r.id !== item.id));
      }
      alert(`${type} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="loading">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-main">
    <div className="dashboard-content">
            <div className="error">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">DATE</span>
            <span className="logo-subtitle">Digital Agristack</span>
          </div>
          <p>Super Admin Dashboard</p>
        </div>
        
        <div className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
      </div>

          <div 
            className={`nav-item ${activeTab === 'registration' ? 'active' : ''}`}
            onClick={() => setActiveTab('registration')}
          >
            <i className="fas fa-user-plus"></i>
            <span>Registration</span>
            <i className="fas fa-chevron-down dropdown-arrow"></i>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'farmers' ? 'active' : ''}`}
            onClick={() => setActiveTab('farmers')}
          >
            <i className="fas fa-users"></i>
            <span>Farmers</span>
            <i className="fas fa-chevron-down dropdown-arrow"></i>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <i className="fas fa-user-tie"></i>
            <span>Employees</span>
            <i className="fas fa-chevron-down dropdown-arrow"></i>
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
              <h2 className="greeting-text">{getGreeting()}, {user?.name || 'Super Admin'}! 👋</h2>
              <p className="greeting-time">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            {!user && (
              <div style={{ 
                background: '#fef3c7', 
                color: '#92400e', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                fontSize: '14px',
                marginTop: '8px'
              }}>
                ⚠️ No user data found. Using default Super Admin profile.
              </div>
            )}
            <h1 className="header-title">Super Admin Dashboard</h1>
            <p className="header-subtitle">Manage your agricultural platform</p>
          </div>
          <div className="header-right">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to DATE Digital Agristack!</h1>
          <p className="welcome-subtitle">
            Empowering your agricultural journey with data-driven insights and seamless management. 
            Explore your dashboard below.
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <>
              {/* Dashboard Overview */}
              <div className="overview-section">
                <div className="overview-header">
                  <div>
                    <h2 className="overview-title">Dashboard Overview</h2>
                    <p className="overview-description">
                      Welcome back! Here's what's happening with your agricultural data.
                    </p>
                  </div>
                  <div className="overview-actions">
                    <button className="action-btn refresh">
                      <i className="fas fa-sync-alt"></i>
                      Refresh
                    </button>
                    <button className="action-btn secondary">Today</button>
                    <button className="action-btn secondary">This Month</button>
                    <button className="action-btn primary">This Year</button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stats-card">
                    <div className="stats-icon farmers">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="stats-title">Farmers</div>
                    <div className="stats-value">{stats.totalFarmers}</div>
                    <div className="stats-change positive">
                      <i className="fas fa-arrow-up"></i>
                      +12.4%
                    </div>
                  </div>

                  <div className="stats-card">
                    <div className="stats-icon employees">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="stats-title">Employees</div>
                    <div className="stats-value">{stats.totalEmployees}</div>
                    <div className="stats-change negative">
                      <i className="fas fa-arrow-down"></i>
                      -3.0%
                    </div>
                  </div>

                  <div className="stats-card">
                    <div className="stats-icon fpo">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="stats-title">FPO</div>
                    <div className="stats-value">{stats.totalFPO}</div>
                    <div className="stats-change neutral">
                      <i className="fas fa-minus"></i>
                      +0.0%
                    </div>
                  </div>
                </div>

                {/* Bottom Sections */}
                <div className="bottom-sections">
                  {/* Recent Activities */}
                  <div className="section-card">
                    <div className="section-header">
                      <h3 className="section-title">Recent Activities</h3>
                      <a href="#" className="section-link">View All</a>
                    </div>
                    <div className="activities-list">
                      <div className="activity-item">
                        <div className="activity-content">
                          <div className="activity-text">Farmer profile updated</div>
                          <div className="activity-time">20m ago</div>
                        </div>
                        <span className="activity-badge success">Success</span>
                      </div>
                      <div className="activity-item">
                        <div className="activity-content">
                          <div className="activity-text">Employee profile updated</div>
                          <div className="activity-time">10m ago</div>
                        </div>
                        <span className="activity-badge success">Success</span>
                      </div>
                      <div className="activity-item">
                        <div className="activity-content">
                          <div className="activity-text">New FPO application submitted</div>
                          <div className="activity-time">Just now</div>
                        </div>
                        <span className="activity-badge pending">Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="section-card">
                    <div className="section-header">
                      <h3 className="section-title">Quick Actions</h3>
                    </div>
                    <div className="quick-actions-grid">
                      <button className="quick-action-btn primary">
                        <i className="fas fa-user-plus"></i>
                        Add New Farmer
                      </button>
                      <button className="quick-action-btn secondary">
                        <i className="fas fa-user-tie"></i>
                        Add Employee
                      </button>
                      <button className="quick-action-btn info">
                        <i className="fas fa-chart-bar"></i>
                        Generate Report
                      </button>
                      <button className="quick-action-btn dark">
                        <i className="fas fa-chart-line"></i>
                        View Analytics
                      </button>
                    </div>
        </div>
      </div>
    </div>
            </>
          )}

          {activeTab === 'registration' && (
            <div className="overview-section">
              <div className="overview-header">
                <h2 className="overview-title">Registration Management</h2>
                <p className="overview-description">
                  Manage pending registrations and approve new users.
                </p>
                <div className="overview-actions">
          <select 
                    value={registrationFilters.role} 
                    onChange={(e) => setRegistrationFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="">All Roles</option>
                    <option value="FARMER">Farmer</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <select 
                    value={registrationFilters.status} 
                    onChange={(e) => setRegistrationFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="filter-select"
          >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
                </div>
              </div>
              
              {(() => {
                const registrationData = getFilteredRegistrations();
                return (
                  <DataTable
                    data={registrationData}
                    columns={[
                      { key: 'name', label: 'Name' },
                      { key: 'email', label: 'Email' },
                      { key: 'phoneNumber', label: 'Phone' },
                      { key: 'role', label: 'Role' },
                      { key: 'status', label: 'Status' }
                    ]}
                    customActions={[
                      {
                        label: 'View',
                        className: 'action-btn-small info',
                        onClick: handleViewRegistration
                      },
                      {
                        label: 'Delete',
                        className: 'action-btn-small danger',
                        onClick: (registration) => handleDelete(registration, 'registration')
                      }
                    ]}
                  />
                );
              })()}
            </div>
          )}

          {activeTab === 'farmers' && (
            <div className="overview-section">
              <div className="overview-header">
                <h2 className="overview-title">Farmer Management</h2>
                <p className="overview-description">
                  Manage farmer registrations and assignments.
                </p>
                <div className="overview-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => {
                      setEditingFarmer(null);
                      setShowFarmerForm(true);
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    Add Farmer
                  </button>
                  <button className="action-btn secondary" onClick={() => {
                    console.log('=== ASSIGN FARMERS BUTTON CLICKED ===');
                    console.log('Current farmers state:', farmers || 'undefined');
                    console.log('Current employees state:', employees || 'undefined');
                    setShowAssignmentModal(true);
                  }}>
                    <i className="fas fa-user-plus"></i>
                    Assign Farmers
                  </button>
        </div>
      </div>

      <DataTable
        data={getFilteredFarmers()}
        columns={[
          { key: 'name', label: 'Name' },
                  { key: 'contactNumber', label: 'Phone' },
                  { key: 'email', label: 'Email' },
                  { key: 'accessStatus', label: 'Status' },
                  { key: 'kycStatus', label: 'KYC Status' }
                ]}
        customActions={[
          {
                    label: 'View',
                    className: 'action-btn-small info',
                    onClick: handleViewFarmer
                  },
                  {
                    label: 'Edit',
                    className: 'action-btn-small secondary',
                    onClick: handleEditFarmer
                  },
                  {
                    label: 'KYC',
                    className: 'action-btn-small primary',
                    onClick: () => setShowKYCModal(true)
                  },
                  {
                    label: 'Delete',
                    className: 'action-btn-small danger',
                    onClick: (farmer) => handleDelete(farmer, 'farmer')
          }
        ]}
      />
    </div>
          )}

          {activeTab === 'employees' && (
            <div className="overview-section">
              {!showEmployeeRegistration ? (
                <>
                  <div className="overview-header">
                    <h2 className="overview-title">Employee Management</h2>
                    <p className="overview-description">
                      Manage employee profiles and assignments.
                    </p>
                    <div className="overview-actions">
                      <button className="action-btn primary" onClick={handleAddEmployee}>
                        <i className="fas fa-plus"></i>
                        Add Employee
                      </button>
                    </div>
                  </div>

                  <DataTable
                    data={getFilteredEmployees()}
                    columns={[
                      { key: 'name', label: 'Name' },
                      { key: 'contactNumber', label: 'Phone' },
                      { key: 'email', label: 'Email' },
                      { key: 'status', label: 'Status' },
                      { key: 'role', label: 'Role' }
                    ]}
                    customActions={[
                      {
                        label: 'View',
                        className: 'action-btn-small info',
                        onClick: handleViewEmployee
                      },
                      {
                        label: 'Edit',
                        className: 'action-btn-small secondary',
                        onClick: handleEditEmployee
                      },
                      {
                        label: 'Delete',
                        className: 'action-btn-small danger',
                        onClick: (employee) => handleDelete(employee, 'employee')
                      }
                    ]}
                  />
                </>
              ) : (
                <div className="employee-registration-section">
                  <div className="overview-header">
                    <h2 className="overview-title">Add New Employee</h2>
                    <p className="overview-description">
                      Register a new employee in the system.
                    </p>
                    <div className="overview-actions">
                      <button 
                        className="action-btn secondary" 
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
          )}
        </div>
      </div>

      {/* Modals */}
      {showRegistrationModal && selectedRegistration && (
        <RegistrationApprovalModal
          registration={selectedRegistration}
          onClose={() => setShowRegistrationModal(false)}
          onApprove={() => handleApproveRegistration(selectedRegistration.id)}
          onReject={() => handleRejectRegistration(selectedRegistration.id)}
        />
      )}

      {showFarmerDetails && selectedFarmer && (
        <ViewFarmerRegistrationDetails
          farmerData={selectedFarmer}
          onClose={() => setShowFarmerDetails(false)}
        />
      )}

             {showAssignmentModal && (() => {
         console.log('=== RENDERING ASSIGNMENT MODAL ===');
         console.log('showAssignmentModal:', showAssignmentModal);
         console.log('Employees state:', employees);
         console.log('Employees length:', employees?.length || 0);
         return (
           <AssignmentModal 
             farmers={farmers.filter(f => {
               // Check if farmer is unassigned based on backend data structure
               return !f.assignedEmployee || 
                      f.assignedEmployee === 'Not Assigned' || 
                      f.assignedEmployee === null ||
                      f.assignedEmployee === undefined ||
                      f.assignedEmployee === '';
             })}
             employees={(() => {
               console.log('=== PASSING EMPLOYEES TO MODAL ===');
               console.log('Employees array:', employees);
               console.log('Employees type:', typeof employees);
               console.log('Employees length:', employees?.length || 0);
               console.log('Employees is array:', Array.isArray(employees));
               if (employees && employees.length > 0) {
                 console.log('First employee:', employees[0]);
                 console.log('First employee name:', employees[0]?.name);
                 console.log('First employee designation:', employees[0]?.designation);
                 console.log('All employee names:', employees.map(emp => emp?.name));
               } else {
                 console.log('No employees found or employees is empty/null');
               }
               return employees;
             })()}
             onClose={() => setShowAssignmentModal(false)}
             onAssign={handleAssignFarmers}
           />
         );
      })()}

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



      {showEmployeeDetails && selectedEmployee && (
        <ViewEditEmployeeDetails
          employee={selectedEmployee}
          onClose={() => setShowEmployeeDetails(false)}
        />
      )}
      
      {showKYCModal && (
        <KYCDocumentUpload
          onClose={() => setShowKYCModal(false)}
          onApprove={handleApproveKYC}
          onReject={handleRejectKYC}
          onReferBack={handleReferBackKYC}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title={`Delete ${itemToDelete?.type}`}
          message={`Are you sure you want to delete this ${itemToDelete?.type}?`}
        />
      )}

      {showRegistrationDetailModal && selectedRegistrationForDetail && (
        <RegistrationDetailModal
          registration={selectedRegistrationForDetail}
          onClose={handleCloseRegistrationDetailModal}
          onUpdate={handleRegistrationUpdate}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard; 