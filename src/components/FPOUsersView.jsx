import React, { useState, useEffect } from 'react';
import { fpoUsersAPI } from '../api/apiService';
import '../styles/FPOUsersView.css';

const FPOUsersView = ({ fpo, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // User types available for selection
  const USER_TYPES = [
    { value: 'ADMIN', label: 'Admin', icon: 'fas fa-user-shield', color: '#ef4444' },
    { value: 'EMPLOYEE', label: 'Employee', icon: 'fas fa-user-tie', color: '#3b82f6' },
    { value: 'FARMER', label: 'Farmer', icon: 'fas fa-seedling', color: '#10b981' },
    { value: 'FPO', label: 'FPO', icon: 'fas fa-building', color: '#8b5cf6' }
  ];

  // Form state for creating/editing users
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    role: '',
    password: ''
  });

  useEffect(() => {
    if (fpo?.id) {
      loadUsers();
    }
  }, [fpo?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.action-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users for FPO ID:', fpo.id);
      const response = await fpoUsersAPI.list(fpo.id);
      console.log('Users response:', response);
      
      // Handle different response formats
      const userData = response.data || response || [];
      console.log('Users data:', userData);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.role) {
      errors.role = 'User type is required';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('Creating user with data:', formData);
      await fpoUsersAPI.create(fpo.id, formData);
      console.log('User created successfully');
      
      setShowCreateForm(false);
      setFormData({
        email: '',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        role: '',
        password: ''
      });
      setFormErrors({});
      
      // Add a small delay to ensure backend processing
      setTimeout(() => {
        loadUsers();
      }, 500);
      
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || '',
      password: ''
    });
    setFormErrors({});
    setShowCreateForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('Updating user:', editingUser.id, 'with data:', formData);
      await fpoUsersAPI.update(fpo.id, editingUser.id, formData);
      
      setShowCreateForm(false);
      setEditingUser(null);
      setFormData({
        email: '',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        role: '',
        password: ''
      });
      setFormErrors({});
      
      alert('User updated successfully!');
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (user) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, status: (u.status === 'APPROVED' ? 'REJECTED' : 'APPROVED') } : u
      ));
      
      await fpoUsersAPI.toggleActive(fpo.id, user.id, !(user.status === 'APPROVED'));
      console.log('User status toggled successfully');
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
      // Revert optimistic update
      loadUsers();
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      alert('Password is required');
      return;
    }
    
    try {
      await fpoUsersAPI.updatePassword(fpo.id, passwordUser.id, newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const filteredUsers = users.filter(user =>
    ((user.firstName || '') + ' ' + (user.lastName || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phoneNumber || '').includes(searchTerm) ||
    (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserIcon = (role) => {
    const userType = USER_TYPES.find(type => type.value === role);
    return userType ? userType.icon : 'fas fa-user';
  };

  const getUserColor = (role) => {
    const userType = USER_TYPES.find(type => type.value === role);
    return userType ? userType.color : '#6b7280';
  };

  const getTotalUsers = () => {
    return users.length;
  };

  const getActiveUsers = () => {
    return users.filter(user => user.status === 'APPROVED').length;
  };

  const getInactiveUsers = () => {
    return users.filter(user => user.status === 'REJECTED').length;
  };

  const getUserStats = () => {
    const stats = {
      byRole: {},
      byStatus: { active: 0, inactive: 0 }
    };

    users.forEach(user => {
      const role = user.role || 'Unknown';
      const status = user.status === 'APPROVED' ? 'active' : 'inactive';
      
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    return stats;
  };

  const getRecentUsers = () => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  };

  // Full-page form view (like Turnover form) when creating/editing
  if (showCreateForm) {
    return (
      <div className="fpo-user-form">
        <div className="form-header" style={{ background: 'linear-gradient(90deg,#10b981,#16a34a)' }}>
          <div className="header-content">
            <div className="header-left">
              <h1 className="form-title">{editingUser ? 'Edit User' : 'Add New User'}</h1>
              <p className="form-subtitle">
                {editingUser ? 'Update user details' : 'Add a new user for ' + (fpo?.fpoName || 'FPO')}
              </p>
            </div>
            <div className="header-right" style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingUser(null);
                  setFormErrors({});
                }}
              >
                Back to List
              </button>
            </div>
          </div>
        </div>

        <div className="form-content">
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="user-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={`form-input ${formErrors.firstName ? 'error' : ''}`}
                  placeholder="Enter first name"
                />
                {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className={`form-input ${formErrors.lastName ? 'error' : ''}`}
                  placeholder="Enter last name"
                />
                {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  placeholder="Enter email address"
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  className={`form-input ${formErrors.phoneNumber ? 'error' : ''}`}
                  placeholder="Enter phone number"
                />
                {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">User Type <span className="required">*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className={`form-select ${formErrors.role ? 'error' : ''}`}
                >
                  <option value="">Select User Type</option>
                  {USER_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {formErrors.role && <span className="error-message">{formErrors.role}</span>}
              </div>
              {!editingUser && (
                <div className="form-group full-width">
                  <label className="form-label">Password <span className="required">*</span></label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`form-input ${formErrors.password ? 'error' : ''}`}
                    placeholder="Enter password"
                  />
                  {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingUser(null);
                  setFormErrors({});
                }}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-user-plus"></i>
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }


  const stats = getUserStats();
  const recentUsers = getRecentUsers();

  return (
    <div className="fpo-users-view">
      {/* Header Section */}
      <div className="users-header" style={{ background: 'linear-gradient(90deg,#10b981,#16a34a)' }}>
        <div className="header-content">
          <div className="header-left">
            <h1 className="users-title">FPO Users Management</h1>
            <p className="users-subtitle">Manage users and access control for {fpo?.fpoName || 'FPO'}</p>
          </div>
          <div className="header-right" style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>Back to FPO</button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="users-content">
        {/* Action Bar */}
        <div className="action-bar">
          <button 
            className="create-user-btn"
            onClick={() => {
              setShowCreateForm(true);
              setEditingUser(null);
              setFormData({
                email: '',
                phoneNumber: '',
                firstName: '',
                lastName: '',
                role: '',
                password: ''
              });
              setFormErrors({});
            }}
          >
            <i className="fas fa-user-plus"></i>
            Add User
          </button>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="date-filter-container">
              <i className="fas fa-calendar-alt calendar-icon"></i>
              <input
                type="text"
                placeholder="Date range filter"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="date-filter-input"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>User Type</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="loading-cell">
                      <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data-cell">
                      <div className="no-data-message">
                        <i className="fas fa-users"></i>
                        <p>No users found</p>
                        <span>Try adjusting your search criteria or add a new user</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const userColor = getUserColor(user.role);
                    const userIcon = getUserIcon(user.role);
                    
                    return (
                      <tr key={user.id || index} className="user-row">
                        <td className="user-id">{user.id || `U${index + 1}`}</td>
                        <td className="user-name">
                          <div className="name-display">
                            <i className="fas fa-user-circle"></i>
                            <span className="name-text">{`${user.firstName || ''} ${user.lastName || ''}`}</span>
                          </div>
                        </td>
                        <td className="user-type">
                          <span 
                            className="type-badge"
                            style={{ 
                              backgroundColor: `${userColor}20`,
                              color: userColor,
                              border: `1px solid ${userColor}40`
                            }}
                          >
                            <i className={userIcon}></i>
                            {user.role || '-'}
                          </span>
                        </td>
                        <td className="user-email">
                          <div className="email-display">
                            <i className="fas fa-envelope"></i>
                            <span className="email-text">{user.email || '-'}</span>
                          </div>
                        </td>
                        <td className="user-phone">
                          <div className="phone-display">
                            <i className="fas fa-phone"></i>
                            <span className="phone-text">{user.phoneNumber || '-'}</span>
                          </div>
                        </td>
                        <td className="join-date">
                          <div className="date-display">
                            <i className="fas fa-calendar"></i>
                            <span className="date-text">{formatDate(user.createdAt)}</span>
                          </div>
                        </td>
                        <td className="user-status">
                          <label className="status-toggle">
                            <input 
                              type="checkbox" 
                              checked={user.status === 'APPROVED'} 
                              onChange={() => handleToggleActive(user)}
                            />
                            <span className="status-slider"></span>
                            <span className="status-text">
                              {user.status === 'APPROVED' ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </td>
                        <td className="user-actions">
                          <div className="action-dropdown">
                            <button 
                              className="dropdown-toggle"
                              onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            {activeDropdown === user.id && (
                              <div className={`dropdown-menu ${index >= 2 ? 'dropdown-menu-bottom' : 'dropdown-menu-top'}`}>
                                <button 
                                  className="dropdown-item-enhanced edit-item"
                                  onClick={() => {
                                    handleEditUser(user);
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <i className="fas fa-edit"></i>
                                  Edit
                                </button>
                                <button 
                                  className="dropdown-item-enhanced password-item"
                                  onClick={() => {
                                    setPasswordUser(user);
                                    setNewPassword('');
                                    setShowPasswordModal(true);
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <i className="fas fa-key"></i>
                                  Change Password
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{getTotalUsers()}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{getActiveUsers()}</span>
              <span className="stat-label">Active Users</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-user-times"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{getInactiveUsers()}</span>
              <span className="stat-label">Inactive Users</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.byRole.ADMIN || 0}</span>
              <span className="stat-label">Admins</span>
            </div>
          </div>
        </div>

        {/* Users Overview */}
        {users.length > 0 && (
          <div className="users-overview">
            <div className="overview-header">
              <h3>Users Analytics</h3>
              <p>Overview of user distribution and activity</p>
            </div>
            <div className="overview-content">
              <div className="overview-card">
                <div className="overview-icon">
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div className="overview-info">
                  <span className="overview-title">User Distribution</span>
                  <span className="overview-value">
                    {Object.keys(stats.byRole).length} Types
                  </span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="overview-info">
                  <span className="overview-title">Recent Users</span>
                  <span className="overview-value">
                    {recentUsers.length} Added
                  </span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="overview-info">
                  <span className="overview-title">Active Rate</span>
                  <span className="overview-value">
                    {getTotalUsers() > 0 ? Math.round((getActiveUsers() / getTotalUsers()) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="form-modal-overlay">
          <div className="form-modal-content">
            <div className="form-modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingUser(null);
                  setFormErrors({});
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="user-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className={`form-input ${formErrors.firstName ? 'error' : ''}`}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className={`form-input ${formErrors.lastName ? 'error' : ''}`}
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`form-input ${formErrors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    className={`form-input ${formErrors.phoneNumber ? 'error' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    User Type <span className="required">*</span>
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => updateField('role', e.target.value)}
                    className={`form-select ${formErrors.role ? 'error' : ''}`}
                  >
                    <option value="">Select User Type</option>
                    {USER_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.role && <span className="error-message">{formErrors.role}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`form-input ${formErrors.password ? 'error' : ''}`}
                    placeholder="Enter password"
                  />
                  {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingUser(null);
                    setFormErrors({});
                  }}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <i className="fas fa-user-plus"></i>
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="form-modal-overlay">
          <div className="form-modal-content">
            <div className="form-modal-header">
              <h3>Update Password</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordUser(null);
                  setNewPassword('');
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="password-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">User Name</label>
                  <input 
                    value={`${passwordUser?.firstName || ''} ${passwordUser?.lastName || ''}`} 
                    disabled 
                    className="form-input disabled"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    value={passwordUser?.email || ''} 
                    disabled 
                    className="form-input disabled"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="newPassword" className="form-label">
                    New Password <span className="required">*</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordUser(null);
                    setNewPassword('');
                  }}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <i className="fas fa-key"></i>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FPOUsersView;
