import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
import FarmerForm from '../components/FarmerForm';
import EmployeeForm from '../components/EmployeeForm';
import AssignmentModal from '../components/AssignmentModal';
import DeleteModal from '../components/DeleteModal';
import KYCDocumentUpload from '../components/KYCDocumentUpload';
import ViewFarmerRegistrationDetails from '../components/ViewFarmerRegistrationDetails';
import ViewEditEmployeeDetails from '../components/ViewEditEmployeeDetails';

import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('farmers');
  const [farmers, setFarmers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deletedRecords, setDeletedRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showFarmerDetails, setShowFarmerDetails] = useState(false);
  const [selectedFarmerData, setSelectedFarmerData] = useState(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [showKYCDocumentUpload, setShowKYCDocumentUpload] = useState(false);
  const [selectedFarmerForKYC, setSelectedFarmerForKYC] = useState(null);
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    region: '',
    kycStatus: '',
    assignmentStatus: '',
    registrationStatus: '',
    registrationRole: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock farmers data
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
      }
    ];

    // Mock employees data
    const mockEmployees = [
      {
        id: 1,
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@agri.com',
        phone: '9876543200',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        address: '123 Main Street, City Center',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        employeeId: 'EMP001',
        department: 'IT',
        designation: 'Software Engineer',
        joiningDate: '2020-03-15',
        salary: '75000',
        supervisor: 'Manager Name',
        highestQualification: 'Bachelor\'s Degree',
        institution: 'Mumbai University',
        graduationYear: '2012',
        specialization: 'Computer Science',
        emergencyName: 'Jane Doe',
        emergencyPhone: '9876543201',
        emergencyRelation: 'Spouse',
        skills: 'JavaScript, React, Node.js, Python',
        languages: 'English, Hindi, Marathi',
        certifications: 'AWS Certified Developer, React Certification',
        workExperience: '8 years in software development',
        references: 'Previous Manager - John Manager (9876543210)',
        status: 'Active',
        totalAssigned: 25,
        kycSummary: {
          approved: 15,
          pending: 8,
          referBack: 2,
          rejected: 0
        }
      },
      {
        id: 2,
        name: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@agri.com',
        phone: '9876543201',
        dateOfBirth: '1988-08-22',
        gender: 'female',
        address: '456 Park Avenue, Downtown',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        employeeId: 'EMP002',
        department: 'HR',
        designation: 'HR Manager',
        joiningDate: '2019-07-01',
        salary: '85000',
        supervisor: 'HR Director',
        highestQualification: 'Master\'s Degree',
        institution: 'Delhi University',
        graduationYear: '2010',
        specialization: 'Human Resources',
        emergencyName: 'Mike Smith',
        emergencyPhone: '9876543202',
        emergencyRelation: 'Spouse',
        skills: 'HR Management, Recruitment, Employee Relations',
        languages: 'English, Hindi',
        certifications: 'SHRM Certified Professional',
        workExperience: '10 years in HR management',
        references: 'HR Director - Sarah Johnson (9876543211)',
        status: 'Active',
        totalAssigned: 18,
        kycSummary: {
          approved: 12,
          pending: 4,
          referBack: 1,
          rejected: 1
        }
      }
    ];

    setFarmers(mockFarmers);
    setEmployees(mockEmployees);
    

    

  }, []);

  const getFilteredFarmers = () => {
    return farmers.filter(farmer => {
      const matchesState = !filters.state || farmer.state === filters.state;
      const matchesDistrict = !filters.district || farmer.district === filters.district;
      const matchesRegion = !filters.region || farmer.region === filters.region;
      const matchesKycStatus = !filters.kycStatus || farmer.kycStatus === filters.kycStatus;
      const matchesAssignmentStatus = !filters.assignmentStatus || farmer.assignmentStatus === filters.assignmentStatus;
      
      return matchesState && matchesDistrict && matchesRegion && matchesKycStatus && matchesAssignmentStatus;
    });
  };

  const getFilteredEmployees = () => {
    if (!selectedEmployee) return employees;
    return employees.filter(emp => emp.id === parseInt(selectedEmployee));
  };

  const getStats = () => {
    const totalFarmers = farmers.length;
    const unassignedFarmers = farmers.filter(f => f.assignmentStatus === 'UNASSIGNED').length;
    const pendingKyc = farmers.filter(f => f.kycStatus === 'PENDING').length;
    const overdueKyc = farmers.filter(f => {
      if (f.assignedDate) {
        const assignedDate = new Date(f.assignedDate);
        const daysDiff = (new Date() - assignedDate) / (1000 * 60 * 60 * 24);
        return daysDiff > 7 && f.kycStatus === 'PENDING';
      }
      return false;
    }).length;

    return {
      totalFarmers,
      unassignedFarmers,
      pendingKyc,
      overdueKyc
    };
  };

  const handleDelete = (item, type) => {
    setItemToDelete({ item, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    const { item, type } = itemToDelete;
    const deletedRecord = {
      id: item.id,
      entityType: type,
      entityName: item.name || item.email,
      deletedBy: user.name,
      deletedAt: new Date().toISOString(),
      reason: itemToDelete.reason || 'No reason provided'
    };

    setDeletedRecords(prev => [...prev, deletedRecord]);

    if (type === 'farmer') {
      setFarmers(prev => prev.filter(f => f.id !== item.id));
    } else if (type === 'employee') {
      setEmployees(prev => prev.filter(e => e.id !== item.id));
    }

    setShowDeleteModal(false);
    setItemToDelete(null);
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
      region: farmer.region,
      kycStatus: farmer.kycStatus,
      status: farmer.assignmentStatus,
      assignedEmployee: farmer.assignedEmployee,
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
      emp.id === selectedEmployeeData.id ? { ...emp, ...updatedData } : emp
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

  const renderOverview = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <StatsCard
          title="Total Farmers"
          value={getStats().totalFarmers}
          icon="👨‍🌾"
          color="blue"
        />
        <StatsCard
          title="Unassigned Farmers"
          value={getStats().unassignedFarmers}
          icon="📋"
          color="orange"
        />
        <StatsCard
          title="Pending KYC"
          value={getStats().pendingKyc}
          icon="⏳"
          color="yellow"
        />
        <StatsCard
          title="Overdue KYC"
          value={getStats().overdueKyc}
          icon="⚠️"
          color="red"
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
            className="action-btn primary"
            onClick={() => setShowEmployeeForm(true)}
          >
            ➕ Add Employee
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => setShowAssignmentModal(true)}
          >
            🔗 Assign Farmers
          </button>
        </div>
      </div>

      <div className="todo-panel">
        <h3>To-Do List</h3>
        <div className="todo-items">
          {getStats().unassignedFarmers > 0 && (
            <div className="todo-item">
              <span className="todo-icon">📋</span>
              <span>{getStats().unassignedFarmers} farmers need assignment</span>
            </div>
          )}
          {getStats().overdueKyc > 0 && (
            <div className="todo-item">
              <span className="todo-icon">⚠️</span>
              <span>{getStats().overdueKyc} KYC cases overdue</span>
            </div>
          )}
          {employees.filter(emp => emp.kycSummary.pending > 10).map(emp => (
            <div key={emp.id} className="todo-item">
              <span className="todo-icon">📊</span>
              <span>{emp.name} has {emp.kycSummary.pending} pending cases</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFarmers = () => (
    <div className="dashboard-content">
      <div className="filters-section">
        <h3>Farmer Management</h3>
        <div className="filters">
          <select 
            value={filters.state} 
            onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Punjab">Punjab</option>
          </select>
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
            value={filters.assignmentStatus} 
            onChange={(e) => setFilters(prev => ({ ...prev, assignmentStatus: e.target.value }))}
          >
            <option value="">All Assignment Status</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
        </div>
      </div>

      <DataTable
        data={getFilteredFarmers()}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'state', label: 'State' },
          { key: 'district', label: 'District' },
          { key: 'kycStatus', label: 'KYC Status' },
          { key: 'assignmentStatus', label: 'Assignment Status' },
          { key: 'assignedEmployee', label: 'Assigned Employee' }
        ]}
        onView={handleViewFarmer}
        onEdit={(farmer) => {
          // Handle edit farmer - open the farmer form in edit mode
          console.log('Edit farmer:', farmer);
          // For now, just show the form. In a real app, you'd pass the farmer data
          setShowFarmerForm(true);
          // TODO: Pass farmer data to form for editing
        }}
        onDelete={(farmer) => handleDelete(farmer, 'farmer')}
        showDelete={true}
        customActions={[
          {
            icon: '📁',
            label: 'KYC Docs',
            className: 'secondary',
            onClick: handleKYCDocumentUpload
          }
        ]}
      />
    </div>
  );

  const renderEmployees = () => (
    <div className="dashboard-content">
      <div className="filters-section">
        <h3>Employee Management</h3>
        <div className="filters">
          <select 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={getFilteredEmployees()}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'department', label: 'Department' },
          { key: 'designation', label: 'Designation' },
          { key: 'status', label: 'Status' }
        ]}
        onView={handleViewEmployee}
        onEdit={(employee) => {
          setShowEmployeeForm(true);
          console.log('Edit employee:', employee);
        }}
        onDelete={(employee) => handleDelete(employee, 'employee')}
        showDelete={true}
      />
    </div>
  );

  const renderAuditTrail = () => (
    <div className="dashboard-content">
      <h3>Audit Trail - Deleted Records</h3>
      <div className="audit-table">
        <table>
          <thead>
            <tr>
              <th>Entity Type</th>
              <th>Entity Name</th>
              <th>Deleted By</th>
              <th>Deleted At</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {deletedRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.entityType}</td>
                <td>{record.entityName}</td>
                <td>{record.deletedBy}</td>
                <td>{new Date(record.deletedAt).toLocaleDateString()}</td>
                <td>{record.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Super Admin Dashboard</h1>
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
          className={`nav-btn ${currentView === 'farmers' ? 'active' : ''}`}
          onClick={() => setCurrentView('farmers')}
        >
          👨‍🌾 Farmers
        </button>
        <button 
          className={`nav-btn ${currentView === 'employees' ? 'active' : ''}`}
          onClick={() => setCurrentView('employees')}
        >
          👥 Employees
        </button>

        <button 
          className={`nav-btn ${currentView === 'audit' ? 'active' : ''}`}
          onClick={() => setCurrentView('audit')}
        >
          📋 Audit Trail
        </button>
      </div>

      <div className="dashboard-main">
        {currentView === 'overview' && renderOverview()}
        {currentView === 'farmers' && renderFarmers()}
        {currentView === 'employees' && renderEmployees()}

        {currentView === 'audit' && renderAuditTrail()}
      </div>

      {showFarmerForm && (
        <FarmerForm 
          onClose={() => setShowFarmerForm(false)}
          onSubmit={(farmerData) => {
            setFarmers(prev => [...prev, { ...farmerData, id: Date.now() }]);
            setShowFarmerForm(false);
          }}
        />
      )}

      {showEmployeeForm && (
        <EmployeeForm 
          onClose={() => setShowEmployeeForm(false)}
          onSubmit={(employeeData) => {
            setEmployees(prev => [...prev, { ...employeeData, id: Date.now() }]);
            setShowEmployeeForm(false);
          }}
        />
      )}

      {showAssignmentModal && (
        <AssignmentModal 
          farmers={farmers.filter(f => f.assignmentStatus === 'UNASSIGNED')}
          employees={employees}
          onClose={() => setShowAssignmentModal(false)}
          onAssign={(assignments) => {
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
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          item={itemToDelete?.item}
          type={itemToDelete?.type}
          onClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDelete}
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
      
      {showKYCDocumentUpload && (
        <KYCDocumentUpload
          isOpen={showKYCDocumentUpload}
          onClose={handleCloseKYCDocumentUpload}
          farmer={selectedFarmerForKYC}
          onApprove={handleKYCApprove}
          onReject={handleKYCReject}
          onReferBack={handleKYCReferBack}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard; 