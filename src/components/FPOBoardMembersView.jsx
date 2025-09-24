import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';
import '../styles/FPOBoardMembersView.css';

const FPOBoardMembersView = ({ fpo, onClose }) => {
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Form state for creating/editing board members
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phoneNumber: '',
    email: '',
    linkedinProfileUrl: '',
    location: '',
    role: 'MEMBER'
  });

  useEffect(() => {
    if (fpo?.id) {
      loadBoardMembers();
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

  const loadBoardMembers = async () => {
    try {
      setLoading(true);
      console.log('Loading board members for FPO ID:', fpo.id);
      const response = await fpoAPI.getFPOBoardMembers(fpo.id);
      console.log('Board members response:', response);
      
      // Handle different response formats
      const members = response.data || response || [];
      console.log('Board members data:', members);
      setBoardMembers(Array.isArray(members) ? members : []);
    } catch (error) {
      console.error('Error loading board members:', error);
      setBoardMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.designation.trim()) {
      errors.designation = 'Designation is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.linkedinProfileUrl && !/^https?:\/\/.+/i.test(formData.linkedinProfileUrl)) {
      errors.linkedinProfileUrl = 'Please enter a valid URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Map frontend form data to backend DTO format
      const boardMemberData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email || null,
        role: formData.role,
        address: formData.location || null,
        qualification: formData.designation || null,
        experience: null,
        photoFileName: null,
        documentFileName: null,
        remarks: formData.linkedinProfileUrl ? `LinkedIn: ${formData.linkedinProfileUrl}` : null
      };
      
      console.log('Creating board member with data:', boardMemberData);
      const response = await fpoAPI.addBoardMember(fpo.id, boardMemberData);
      console.log('Board member created successfully:', response);
      
      setShowCreateForm(false);
      setFormData({
        name: '',
        designation: '',
        phoneNumber: '',
        email: '',
        linkedinProfileUrl: '',
        location: '',
        role: 'MEMBER'
      });
      setFormErrors({});
      
      // Add a small delay to ensure backend processing
      setTimeout(() => {
        loadBoardMembers();
      }, 500);
      
      alert('Board member created successfully!');
    } catch (error) {
      console.error('Error creating board member:', error);
      alert('Error creating board member: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    
    // Extract LinkedIn URL from remarks if it exists
    let linkedinUrl = '';
    if (member.remarks && member.remarks.includes('LinkedIn:')) {
      linkedinUrl = member.remarks.replace('LinkedIn:', '').trim();
    }
    
    setFormData({
      name: member.name || '',
      designation: member.qualification || '',
      phoneNumber: member.phoneNumber || '',
      email: member.email || '',
      linkedinProfileUrl: linkedinUrl,
      location: member.address || '',
      role: member.role || 'MEMBER'
    });
    setFormErrors({});
    setShowCreateForm(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Map frontend form data to backend DTO format
      const boardMemberData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email || null,
        role: formData.role,
        address: formData.location || null,
        qualification: formData.designation || null,
        experience: null,
        photoFileName: null,
        documentFileName: null,
        remarks: formData.linkedinProfileUrl ? `LinkedIn: ${formData.linkedinProfileUrl}` : null
      };
      
      await fpoAPI.updateBoardMember(fpo.id, editingMember.id, boardMemberData);
      setShowCreateForm(false);
      setEditingMember(null);
      setFormData({
        name: '',
        designation: '',
        phoneNumber: '',
        email: '',
        linkedinProfileUrl: '',
        location: '',
        role: 'MEMBER'
      });
      setFormErrors({});
      
      // Add a small delay to ensure backend processing
      setTimeout(() => {
        loadBoardMembers();
      }, 500);
      
      alert('Board member updated successfully!');
    } catch (error) {
      console.error('Error updating board member:', error);
      alert('Error updating board member: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStatusUpdate = async (memberId, newStatus) => {
    try {
      console.log('Updating board member status:', memberId, 'to', newStatus);
      
      // Update the local state immediately for better UX
      setBoardMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, status: newStatus } : m
      ));
      
      // Find the member to get their current data
      const member = boardMembers.find(m => m.id === memberId);
      if (!member) {
        alert('Board member not found!');
        return;
      }

      // Create update data with the new status
      const updateData = {
        name: member.name,
        phoneNumber: member.phoneNumber,
        email: member.email || null,
        role: member.role,
        address: member.address || null,
        qualification: member.qualification || null,
        experience: member.experience || null,
        photoFileName: member.photoFileName || null,
        documentFileName: member.documentFileName || null,
        remarks: member.remarks || null,
        status: newStatus
      };

      console.log('Update data:', updateData);
      
      // Update the board member with new status
      const response = await fpoAPI.updateBoardMember(fpo.id, memberId, updateData);
      console.log('Update response:', response);
      
      alert(`Board member status updated to ${newStatus}!`);
      
    } catch (error) {
      console.error('Error updating board member status:', error);
      alert('Error updating board member status: ' + (error.response?.data?.message || error.message));
      
      // Revert the local state on error
      setBoardMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, status: m.status } : m
      ));
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this board member?')) {
      try {
        await fpoAPI.removeBoardMember(fpo.id, memberId);
        
        // Add a small delay to ensure backend processing
        setTimeout(() => {
          loadBoardMembers();
        }, 500);
        
        alert('Board member deleted successfully!');
      } catch (error) {
        console.error('Error deleting board member:', error);
        alert('Error deleting board member: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const filteredMembers = boardMembers.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.qualification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phoneNumber?.includes(searchTerm);
    return matchesSearch;
  });

  // If showing create/edit form, render the form in full width
  if (showCreateForm) {
    return (
      <div className="fpo-board-member-form">
        {/* Header */}
        <div className="form-header" style={{ background: 'linear-gradient(90deg,#10b981,#16a34a)' }}>
          <div className="header-content">
            <div className="header-left">
              <h1 className="form-title">
                {editingMember ? 'Edit Board Member' : 'Add New Board Member'}
              </h1>
              <p className="form-subtitle">
                {editingMember ? 'Update board member information' : 'Add a new board member for ' + (fpo?.fpoName || 'FPO')}
              </p>
            </div>
            <div className="header-right" style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingMember(null);
                  setFormErrors({});
                }}
              >
                Back to List
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <form onSubmit={editingMember ? handleUpdateMember : handleCreateMember} className="board-member-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  placeholder="Enter full name"
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="designation" className="form-label">
                  Designation <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => updateField('designation', e.target.value)}
                  className={`form-input ${formErrors.designation ? 'error' : ''}`}
                  placeholder="Enter designation"
                />
                {formErrors.designation && <span className="error-message">{formErrors.designation}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  className={`form-input ${formErrors.phoneNumber ? 'error' : ''}`}
                  placeholder="Enter phone number"
                />
                {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  placeholder="Enter email address"
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="linkedinProfileUrl" className="form-label">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  id="linkedinProfileUrl"
                  value={formData.linkedinProfileUrl}
                  onChange={(e) => updateField('linkedinProfileUrl', e.target.value)}
                  className={`form-input ${formErrors.linkedinProfileUrl ? 'error' : ''}`}
                  placeholder="https://linkedin.com/in/username"
                />
                {formErrors.linkedinProfileUrl && <span className="error-message">{formErrors.linkedinProfileUrl}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="form-input"
                  placeholder="Enter location"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="form-select"
                >
                  <option value="MEMBER">Member</option>
                  <option value="CHAIRMAN">Chairman</option>
                  <option value="VICE_CHAIRMAN">Vice Chairman</option>
                  <option value="SECRETARY">Secretary</option>
                  <option value="TREASURER">Treasurer</option>
                </select>
              </div>
            </div>

            {/* Submit Error */}
            {formErrors.submit && (
              <div className="submit-error">
                <i className="fas fa-exclamation-triangle"></i>
                {formErrors.submit}
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingMember(null);
                  setFormErrors({});
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <i className="fas fa-plus"></i>
                {editingMember ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fpo-board-members-view">
      {/* Header Section */}
      <div className="board-members-header" style={{ background: 'linear-gradient(90deg,#10b981,#16a34a)' }}>
        <div className="header-content">
          <div className="header-left">
            <h1 className="board-members-title">Board Members Management</h1>
            <p className="board-members-subtitle">Manage board members for {fpo?.fpoName || 'FPO'}</p>
          </div>
          <div className="header-right" style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>Back to FPO</button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="board-members-content">
        {/* Action Bar */}
        <div className="action-bar">
          <button 
            className="create-member-btn"
            onClick={() => {
              setShowCreateForm(true);
              setEditingMember(null);
              setFormData({
                name: '',
                designation: '',
                phoneNumber: '',
                email: '',
                linkedinProfileUrl: '',
                location: '',
                role: 'MEMBER'
              });
              setFormErrors({});
            }}
          >
            <i className="fas fa-plus"></i>
            Add Board Member
          </button>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search board members..."
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

        {/* Members Table */}
        <div className="members-table-container">
          <div className="table-wrapper">
            <table className="board-members-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Phone Number</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">
                      <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading board members...
                      </div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data-cell">
                      <div className="no-data-message">
                        <i className="fas fa-users"></i>
                        <p>No board members found</p>
                        <span>Try adjusting your search criteria or add a new board member</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, index) => (
                    <tr key={member.id || index} className="member-row">
                      <td className="member-id">{member.id || `BM${index + 1}`}</td>
                      <td className="member-name">{member.name || '-'}</td>
                      <td className="member-designation">{member.qualification || '-'}</td>
                      <td className="member-phone">{member.phoneNumber || '-'}</td>
                      <td className="member-location">{member.address || '-'}</td>
                      <td className="member-status">
                        <div className="status-toggle-container">
                          <label className="status-toggle">
                            <input
                              type="checkbox"
                              checked={member.status === 'ACTIVE'}
                              onChange={(e) => {
                                const newStatus = e.target.checked ? 'ACTIVE' : 'INACTIVE';
                                handleStatusUpdate(member.id, newStatus);
                              }}
                            />
                            <span className="status-slider">
                              <span className="status-text">
                                {member.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </span>
                          </label>
                        </div>
                      </td>
                      <td className="member-actions">
                        <div className="action-dropdown">
                          <button 
                            className="dropdown-toggle"
                            onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </button>
                          {activeDropdown === member.id && (
                            <div className={`dropdown-menu ${index >= 2 ? 'dropdown-menu-bottom' : 'dropdown-menu-top'}`}>
                              <button 
                                className="dropdown-item-enhanced edit-item"
                                onClick={() => {
                                  handleEditMember(member);
                                  setActiveDropdown(null);
                                }}
                              >
                                <i className="fas fa-edit"></i>
                                Edit
                              </button>
                              <button 
                                className="dropdown-item-enhanced delete-item"
                                onClick={() => {
                                  handleDeleteMember(member.id);
                                  setActiveDropdown(null);
                                }}
                              >
                                <i className="fas fa-trash"></i>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
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
              <span className="stat-number">{boardMembers.length}</span>
              <span className="stat-label">Total Members</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{boardMembers.filter(m => m.status === 'ACTIVE').length}</span>
              <span className="stat-label">Active Members</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-pause-circle"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{boardMembers.filter(m => m.status === 'INACTIVE').length}</span>
              <span className="stat-label">Inactive Members</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FPOBoardMembersView;
