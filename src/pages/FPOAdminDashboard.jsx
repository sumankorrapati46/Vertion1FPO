import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fpoAPI, fpoUsersAPI, farmersAPI } from '../api/apiService';
import '../styles/Dashboard.css';
import '../styles/FPOManagement.css';
import UserProfileDropdown from '../components/UserProfileDropdown';
import FPOList from '../components/FPOList';
import FPOEditModal from '../components/FPOEditModal';
import FPODetailModal from '../components/FPODetailModal';
import FPOCreationForm from '../components/FPOCreationForm';
import FPOBoardMembersModal from '../components/FPOBoardMembersModal';
import FPOFarmServicesModal from '../components/FPOFarmServicesModal';
import FPOTurnoverModal from '../components/FPOTurnoverModal';
import FPOCropEntriesModal from '../components/FPOCropEntriesModal';
import FPOInputShopModal from '../components/FPOInputShopModal';
import FPOProductCategoriesModal from '../components/FPOProductCategoriesModal';
import FPOProductsModal from '../components/FPOProductsModal';
import FPOUsersModal from '../components/FPOUsersModal';
import FarmerRegistrationForm from '../components/FarmerRegistrationForm';
import EmployeeRegistrationForm from '../components/EmployeeRegistrationForm';

const FPOAdminDashboard = () => {
  const { fpoId: urlFpoId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Use URL FPO ID if available, otherwise fall back to user's FPO ID for consistency
  const fpoId = urlFpoId || user?.fpoId || user?.assignedFpoId || user?.fpo?.id || user?.fpo?.fpoId;
  
  // Debug logging to ensure FPO ID consistency
  console.log('FPOAdminDashboard - URL FPO ID:', urlFpoId);
  console.log('FPOAdminDashboard - User FPO ID:', user?.fpoId);
  console.log('FPOAdminDashboard - Resolved FPO ID:', fpoId);
  const [fpo, setFpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview'); // overview | farmers | employees
  const [farmers, setFarmers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [farmerSearch, setFarmerSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // FPO Management States
  const [fpos, setFpos] = useState([]);
  const [showFPOCreationForm, setShowFPOCreationForm] = useState(false);
  const [showInlineFarmerCreate, setShowInlineFarmerCreate] = useState(false);
  const [showInlineEmployeeCreate, setShowInlineEmployeeCreate] = useState(false);
  const [viewingFPO, setViewingFPO] = useState(false);
  const [selectedFPO, setSelectedFPO] = useState(null);
  const [fpoFilters, setFpoFilters] = useState({
    state: '',
    district: '',
    status: ''
  });
  const [fpoSearch, setFpoSearch] = useState('');
  const [showFPOEditModal, setShowFPOEditModal] = useState(false);
  const [showFPODetailModal, setShowFPODetailModal] = useState(false);
  const [showFPOBoardMembersModal, setShowFPOBoardMembersModal] = useState(false);
  const [showFPOFarmServicesModal, setShowFPOFarmServicesModal] = useState(false);
  const [showFPOTurnoverModal, setShowFPOTurnoverModal] = useState(false);
  const [showFPOCropEntriesModal, setShowFPOCropEntriesModal] = useState(false);
  const [showFPOInputShopModal, setShowFPOInputShopModal] = useState(false);
  const [showFPOProductCategoriesModal, setShowFPOProductCategoriesModal] = useState(false);
  const [showFPOProductsModal, setShowFPOProductsModal] = useState(false);
  const [showFPOUsersModal, setShowFPOUsersModal] = useState(false);

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

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleChangePassword = () => {
    navigate('/change-password-dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // FPO Management Functions
  const loadFPOs = async () => {
    try {
      const data = await fpoAPI.getAllFPOs();
      setFpos(data || []);
    } catch (error) {
      console.error('Error loading FPOs:', error);
      setFpos([]);
    }
  };

  const handleAddFPO = () => {
    setShowFPOCreationForm(true);
  };

  const handleEditFPO = (fpo) => {
    setSelectedFPO(fpo);
    setShowFPOEditModal(true);
  };

  const handleViewFPO = (fpo, viewType = 'overview') => {
    setSelectedFPO(fpo);
    setViewingFPO(true);
    if (viewType === 'board-members') {
      setShowFPOBoardMembersModal(true);
    } else if (viewType === 'services') {
      setShowFPOFarmServicesModal(true);
    } else if (viewType === 'turnover') {
      setShowFPOTurnoverModal(true);
    } else if (viewType === 'crops') {
      setShowFPOCropEntriesModal(true);
    } else if (viewType === 'input-shop') {
      setShowFPOInputShopModal(true);
    } else if (viewType === 'product-categories') {
      setShowFPOProductCategoriesModal(true);
    } else if (viewType === 'products') {
      setShowFPOProductsModal(true);
    } else if (viewType === 'users') {
      setShowFPOUsersModal(true);
    } else {
      setShowFPODetailModal(true);
    }
  };

  const handleDeleteFPO = async (fpo) => {
    if (window.confirm(`Are you sure you want to delete FPO "${fpo.fpoName || fpo.name}"?`)) {
      try {
        await fpoAPI.deleteFPO(fpo.id);
        await loadFPOs();
      } catch (error) {
        console.error('Error deleting FPO:', error);
        alert('Failed to delete FPO');
      }
    }
  };

  const handleFPOCreated = () => {
    setShowFPOCreationForm(false);
    loadFPOs();
  };

  const handleFPOUpdated = () => {
    setShowFPOEditModal(false);
    setSelectedFPO(null);
    loadFPOs();
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fpoAPI.getFPOById(fpoId);
        setFpo(data);
      } catch (e) {
        setError('Failed to load FPO details');
      } finally {
        setLoading(false);
      }
    };
    if (fpoId) load();
  }, [fpoId]);

  // Reusable loaders
  const loadFarmers = async () => {
    try {
      // Load FPO members and enrich with farmer details (same logic as FPOEmployeeDashboard)
      const members = await fpoAPI.getFPOMembers(fpoId);
      const base = (members || []).map((m, idx) => ({
        id: m.id || idx + 1,
        memberId: m.id,
        farmerId: m.farmerId,
        name: m.farmerName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        phoneNumber: '-',
        email: '-',
        status: (m.status || 'PENDING').toUpperCase(),
        raw: m
      }));
      const enriched = await Promise.all(base.map(async (row) => {
        if (!row.farmerId) return row;
        try {
          const dto = await farmersAPI.getFarmerById(row.farmerId);
          return {
            ...row,
            name: dto?.firstName ? `${dto.firstName} ${dto.lastName || ''}`.trim() : (row.name || '-'),
            phoneNumber: dto?.contactNumber || row.phoneNumber,
            email: dto?.email || row.email,
            status: (dto?.status || row.status || 'PENDING').toUpperCase(),
          };
        } catch {
          return row;
        }
      }));
      setFarmers(enriched);
    } catch (e) {
      console.error(e);
      setFarmers([]);
    }
  };

  const loadEmployees = async () => {
    try {
      const all = await fpoUsersAPI.list(fpoId);
      const emps = (all || []).filter(u => (u.role || '').toUpperCase() === 'EMPLOYEE');
      setEmployees(emps);
    } catch (e) {
      console.error(e);
      setEmployees([]);
    }
  };

  // Lazy-load section data when switching views
  useEffect(() => {
    if (view === 'farmers') loadFarmers();
    if (view === 'employees') loadEmployees();
    if (view === 'fpo') loadFPOs();
  }, [view, fpoId]);

  // Auto-refresh farmers data every 30 seconds to keep in sync
  useEffect(() => {
    if (view === 'farmers' && fpoId) {
      const interval = setInterval(() => {
        loadFarmers();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [view, fpoId]);

  // Handlers for inline submissions
  const handleFarmerCreatedInline = async (formData) => {
    try {
      // Use FPO-specific farmer creation API to ensure farmer is linked to this FPO
      await fpoAPI.createFPOFarmer(fpoId, formData);
      setShowInlineFarmerCreate(false);
      setView('farmers');
      await loadFarmers();
      alert('FPO farmer created successfully');
    } catch (e) {
      console.error('Failed to create FPO farmer:', e);
      alert(e.response?.data?.message || e.response?.data?.error || 'Failed to create FPO farmer');
    }
  };

  const handleEmployeeCreatedInline = async (formData) => {
    try {
      // Use FPO-specific employee creation API to ensure employee is linked to this FPO
      await fpoAPI.createFPOEmployee(fpoId, {
        firstName: formData?.firstName || formData?.name || '',
        lastName: formData?.lastName || '',
        email: formData?.email,
        phoneNumber: formData?.phoneNumber || formData?.mobileNumber
      });
      setShowInlineEmployeeCreate(false);
      setView('employees');
      await loadEmployees();
      alert('FPO employee created successfully');
    } catch (e) {
      console.error('Failed to create FPO employee:', e);
      alert(e.response?.data?.message || e.response?.data?.error || 'Failed to create FPO employee');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <span>Loading FPO Admin Dashboard…</span>
      </div>
    );
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  const fpoName = fpo?.fpoName || fpo?.name || '—';
  const fpoCode = fpo?.fpoId || fpo?.id || '—';

  return (
    <div className="dashboard">
      {/* Top Frame - Modern Professional Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <h1 className="logo-title">DATE</h1>
            <p className="logo-subtitle">Digital Agristack</p>
          </div>
        </div>
        <div className="header-right">
          <div className="user-profile-dropdown">
            <div className="user-profile-trigger" onClick={toggleUserDropdown}>
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="user-email">{user?.email || 'admin@fpo.com'}</span>
              <i className={`fas fa-chevron-down dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`}></i>
            </div>
            <div className={`user-dropdown-menu ${showUserDropdown ? 'show' : ''}`}>
              <div className="dropdown-header">
                <div className="user-avatar-large">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="user-details">
                  <div className="user-name-large">{user?.name || 'FPO Admin'}</div>
                  <div className="user-email">{user?.email || 'admin@fpo.com'}</div>
                </div>
              </div>
              <div className="dropdown-actions">
                <button className="dropdown-action-btn" onClick={handleChangePassword}>
                  <i className="fas fa-key"></i>
                  Change Password
                </button>
                <button className="dropdown-action-btn logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-welcome">Welcome!!!</h2>
          <div className="sidebar-role">FPO Admin</div>
        </div>
        
        <div className="sidebar-nav">
          <div 
            className={`nav-item ${view === 'overview' ? 'active' : ''}`}
            onClick={() => setView('overview')}
          >
            <i className="fas fa-th-large"></i>
            <span>Dashboard</span>
          </div>

          <div 
            className={`nav-item ${view === 'farmers' ? 'active' : ''}`}
            onClick={() => setView('farmers')}
          >
            <i className="fas fa-users"></i>
            <span>Farmers</span>
          </div>
          
          <div 
            className={`nav-item ${view === 'employees' ? 'active' : ''}`}
            onClick={() => setView('employees')}
          >
            <i className="fas fa-user-tie"></i>
            <span>Employees</span>
          </div>

          <div 
            className={`nav-item ${view === 'fpo' ? 'active' : ''}`}
            onClick={() => setView('fpo')}
          >
            <i className="fas fa-building"></i>
            <span>FPO</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="welcome-section">
          <h1 className="welcome-title">
            {getGreeting()}, {user?.name || 'FPO Admin'}! 👋
          </h1>
          <p className="welcome-subtitle">
            Welcome to your FPO Admin Dashboard. Manage farmers and employees for <strong>{fpoName}</strong> (ID: {fpoCode}).
          </p>
        </div>

        {view === 'overview' && (
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stats-content">
              <div className="stats-value">{farmers.length}</div>
              <div className="stats-label">Farmers</div>
              <div className="stats-change positive">+0% from last month</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="stats-content">
              <div className="stats-value">{employees.length}</div>
              <div className="stats-label">Employees</div>
              <div className="stats-change positive">+0% from last month</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="stats-content">
              <div className="stats-value">1</div>
              <div className="stats-label">FPO</div>
              <div className="stats-change positive">Active</div>
            </div>
          </div>
        </div>
        )}

        {view === 'overview' && (
        <div className="content-grid">
          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="card-title">
                <h3>Manage Farmers</h3>
                <p>Add and manage farmers belonging to this FPO only.</p>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={() => setShowInlineFarmerCreate(true)}>
                <i className="fas fa-plus"></i>
                Add Farmer
              </button>
              <button className="btn btn-secondary" onClick={() => setView('farmers')}>
                <i className="fas fa-eye"></i>
                View Farmers
              </button>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-user-tie"></i>
              </div>
              <div className="card-title">
                <h3>Manage Employees</h3>
                <p>Create and manage employees scoped to this FPO.</p>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={() => setShowInlineEmployeeCreate(true)}>
                <i className="fas fa-plus"></i>
                Add Employee
              </button>
              <button className="btn btn-secondary" onClick={() => setView('employees')}>
                <i className="fas fa-eye"></i>
                View Employees
              </button>
            </div>
          </div>
        </div>
        )}

        {view === 'farmers' && (
          <section className="panel" style={{ marginTop: 12, width: '100%', maxWidth: 'none', padding: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h2 style={{ marginTop: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>Farmers</h2>
              <div style={{ 
                display: 'flex', 
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <input
                  value={farmerSearch}
                  onChange={(e) => setFarmerSearch(e.target.value)}
                  placeholder="Search name, phone or email"
                  className="input"
                  style={{ 
                    padding: '12px 16px', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    fontSize: '15px',
                    minWidth: '280px',
                    background: 'white',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button 
                  className="btn" 
                  onClick={() => setView('overview') || setTimeout(() => setView('farmers'), 0)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    color: '#374151',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Refresh
                </button>
                <button 
                  className="btn primary" 
                  onClick={() => setShowInlineFarmerCreate(true)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Add Farmer
                </button>
              </div>
            </div>
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <table className="fpo-table" style={{ width: '100%', margin: 0 }}>
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.filter(f => {
                    const q = farmerSearch.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      (f.name || '').toLowerCase().includes(q) ||
                      (f.phoneNumber || '').toLowerCase().includes(q) ||
                      (f.email || '').toLowerCase().includes(q)
                    );
                  }).map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: '600', color: '#15803d' }}>{f.id}</td>
                      <td style={{ fontWeight: '600', color: '#1e293b' }}>{f.name}</td>
                      <td style={{ color: '#64748b' }}>{f.phoneNumber}</td>
                      <td style={{ color: '#64748b' }}>{f.email}</td>
                      <td>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: f.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: f.status === 'ACTIVE' ? '#15803d' : '#dc2626'
                        }}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {farmers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ 
                        textAlign: 'center', 
                        color: '#64748b', 
                        padding: '60px 20px',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}>
                        No farmers found. Click "Add Farmer" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === 'employees' && (
          <section className="panel" style={{ marginTop: 12, width: '100%', maxWidth: 'none', padding: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h2 style={{ marginTop: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>Employees</h2>
              <div style={{ 
                display: 'flex', 
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <input
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search name, phone or email"
                  className="input"
                  style={{ 
                    padding: '12px 16px', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    fontSize: '15px',
                    minWidth: '280px',
                    background: 'white',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button 
                  className="btn" 
                  onClick={() => setView('overview') || setTimeout(() => setView('employees'), 0)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    color: '#374151',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Refresh
                </button>
                <button 
                  className="btn primary" 
                  onClick={() => navigate(`/register-employee`, { state: { role: 'EMPLOYEE', fpoId } })}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Add Employee
                </button>
              </div>
            </div>
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <table className="fpo-table" style={{ width: '100%', margin: 0 }}>
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(u => {
                    const q = employeeSearch.trim().toLowerCase();
                    if (!q) return true;
                    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                    return (
                      name.toLowerCase().includes(q) ||
                      (u.email || '').toLowerCase().includes(q) ||
                      (u.phoneNumber || '').toLowerCase().includes(q)
                    );
                  }).map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '600', color: '#15803d' }}>{u.id}</td>
                      <td style={{ fontWeight: '600', color: '#1e293b' }}>{u.firstName} {u.lastName}</td>
                      <td style={{ color: '#64748b' }}>{u.email}</td>
                      <td style={{ color: '#64748b' }}>{u.phoneNumber}</td>
                      <td>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: u.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.status === 'APPROVED' ? '#15803d' : '#dc2626'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          className="btn" 
                          onClick={async () => {
                            try {
                              const { fpoUsersAPI } = await import('../api/apiService');
                              await fpoUsersAPI.toggleActive(fpoId, u.id, !(u.status === 'APPROVED'));
                              // refresh
                              setView('overview');
                              setTimeout(() => setView('employees'), 0);
                            } catch (e) {
                              alert('Failed to update status');
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: u.status === 'APPROVED' ? '#ef4444' : '#22c55e',
                            border: 'none',
                            color: 'white',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {u.status === 'APPROVED' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn" 
                          onClick={async () => {
                            const pwd = prompt('Enter new password for employee');
                            if (!pwd) return;
                            try {
                              const { fpoUsersAPI } = await import('../api/apiService');
                              await fpoUsersAPI.updatePassword(fpoId, u.id, pwd);
                              alert('Password updated');
                            } catch (e) { alert('Failed to update password'); }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: '#3b82f6',
                            border: 'none',
                            color: 'white',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Edit Password
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ 
                        textAlign: 'center', 
                        color: '#64748b', 
                        padding: '60px 20px',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}>
                        No employees found. Click "Add Employee" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === 'fpo' && (
          <div className="superadmin-overview-section">
            {!showFPOCreationForm ? (
              <>
                {!viewingFPO ? (
                  <>
                    <div className="superadmin-overview-header">
                      <div className="header-left">
                        <h2 className="superadmin-overview-title">FPO Management</h2>
                        <p className="overview-description">
                          Manage Farmer Producer Organizations and their operations.
                        </p>
                      </div>
                      <div className="header-right">
                        <div className="overview-actions">
                          <button 
                            onClick={handleAddFPO}
                            className="btn btn-primary"
                            style={{
                              background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '12px 24px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <i className="fas fa-plus"></i>
                            Add FPO
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* FPO Filters */}
                    <div className="filters-section">
                      <div className="filter-group">
                        <label className="filter-label">State</label>
                        <select 
                          value={fpoFilters.state} 
                          onChange={(e) => setFpoFilters(prev => ({ ...prev, state: e.target.value }))}
                          className="filter-select"
                        >
                          <option value="">All States</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Andhrapradesh">Andhrapradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>
                      
                      <div className="filter-group">
                        <label className="filter-label">District</label>
                        <select 
                          value={fpoFilters.district} 
                          onChange={(e) => setFpoFilters(prev => ({ ...prev, district: e.target.value }))}
                          className="filter-select"
                        >
                          <option value="">All Districts</option>
                          <option value="Karimnagar">Karimnagar</option>
                          <option value="rangareddy">Rangareddy</option>
                          <option value="kadapa">Kadapa</option>
                          <option value="Kadapa">Kadapa</option>
                          <option value="kadpaa">Kadpaa</option>
                          <option value="Kuppam">Kuppam</option>
                          <option value="Pune">Pune</option>
                          <option value="Ahmedabad">Ahmedabad</option>
                          <option value="Amritsar">Amritsar</option>
                          <option value="Lucknow">Lucknow</option>
                          <option value="Chennai">Chennai</option>
                        </select>
                      </div>
                      
                      <div className="filter-group">
                        <label className="filter-label">Status</label>
                        <select 
                          value={fpoFilters.status} 
                          onChange={(e) => setFpoFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="filter-select"
                        >
                          <option value="">All Status</option>
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="PENDING">Pending</option>
                        </select>
                      </div>
                      
                      <div className="filter-group">
                        <label className="filter-label">Search</label>
                        <input
                          type="text"
                          placeholder="Search FPOs..."
                          value={fpoSearch}
                          onChange={(e) => setFpoSearch(e.target.value)}
                          className="filter-input"
                        />
                      </div>
                    </div>

                    {/* FPO List */}
                    <FPOList
                      fpos={fpos}
                      onEdit={handleEditFPO}
                      onView={handleViewFPO}
                      onDelete={handleDeleteFPO}
                      filters={fpoFilters}
                      searchTerm={fpoSearch}
                    />
                  </>
                ) : (
                  <div className="fpo-detail-view">
                    <div className="fpo-detail-header">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setViewingFPO(false)}
                        style={{ marginBottom: '20px' }}
                      >
                        <i className="fas fa-arrow-left"></i>
                        Back to FPO List
                      </button>
                    </div>
                    <div className="fpo-detail-content">
                      <h2>FPO Details: {selectedFPO?.fpoName || selectedFPO?.name}</h2>
                      <p>FPO ID: {selectedFPO?.fpoId || selectedFPO?.id}</p>
                      <p>Status: {selectedFPO?.status}</p>
                      <p>State: {selectedFPO?.state}</p>
                      <p>District: {selectedFPO?.district}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <FPOCreationForm
                onSuccess={handleFPOCreated}
                onCancel={() => setShowFPOCreationForm(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* FPO Modals */}

      {showInlineFarmerCreate && (
        <div className="form-modal-overlay">
          <div className="form-modal-content" style={{ width: '90%', maxWidth: 1100 }}>
            <div className="form-modal-header">
              <h3>Create Farmer</h3>
              <button className="close-btn" onClick={() => setShowInlineFarmerCreate(false)}>×</button>
            </div>
            <div className="form-modal-body">
              <FarmerRegistrationForm
                isInDashboard
                onClose={() => setShowInlineFarmerCreate(false)}
                onSubmit={handleFarmerCreatedInline}
              />
            </div>
          </div>
        </div>
      )}

      {showInlineEmployeeCreate && (
        <div className="form-modal-overlay">
          <div className="form-modal-content" style={{ width: '90%', maxWidth: 900 }}>
            <div className="form-modal-header">
              <h3>Create Employee</h3>
              <button className="close-btn" onClick={() => setShowInlineEmployeeCreate(false)}>×</button>
            </div>
            <div className="form-modal-body">
              <EmployeeRegistrationForm
                isInDashboard
                onSubmit={handleEmployeeCreatedInline}
              />
            </div>
          </div>
        </div>
      )}
      {showFPOEditModal && selectedFPO && (
        <FPOEditModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOEditModal(false);
            setSelectedFPO(null);
          }}
          onSuccess={handleFPOUpdated}
        />
      )}

      {showFPODetailModal && selectedFPO && (
        <FPODetailModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPODetailModal(false);
            setSelectedFPO(null);
          }}
        />
      )}

      {showFPOBoardMembersModal && selectedFPO && (
        <FPOBoardMembersModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOBoardMembersModal(false);
            setSelectedFPO(null);
          }}
        />
      )}

      {showFPOFarmServicesModal && selectedFPO && (
        <FPOFarmServicesModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOFarmServicesModal(false);
            setSelectedFPO(null);
          }}
        />
      )}

      {showFPOTurnoverModal && selectedFPO && (
        <FPOTurnoverModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOTurnoverModal(false);
            setSelectedFPO(null);
          }}
        />
      )}

      {showFPOCropEntriesModal && selectedFPO && (
        <FPOCropEntriesModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOCropEntriesModal(false);
            setSelectedFPO(null);
          }}
        />
      )}

      {showFPOInputShopModal && selectedFPO && (
        <FPOInputShopModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOInputShopModal(false);
            setSelectedFPO(null);
          }}
        />
      )}

      {showFPOProductCategoriesModal && selectedFPO && (
        <FPOProductCategoriesModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOProductCategoriesModal(false);
            setSelectedFPO(null);
          }}
        />
      )}

      {showFPOProductsModal && selectedFPO && (
        <FPOProductsModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOProductsModal(false);
            setSelectedFPO(null);
          }}
        />
      )}

      {showFPOUsersModal && selectedFPO && (
        <FPOUsersModal
          fpo={selectedFPO}
          onClose={() => {
            setShowFPOUsersModal(false);
            setSelectedFPO(null);
          }}
        />
      )}
    </div>
  );
};

export default FPOAdminDashboard;


