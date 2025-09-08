import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOBoardMembersModal = ({ isOpen, onClose, fpoId, fpoName }) => {
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

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
    if (isOpen && fpoId) {
      loadBoardMembers();
    }
  }, [isOpen, fpoId]);

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
      console.log('Loading board members for FPO ID:', fpoId);
      const response = await fpoAPI.getFPOBoardMembers(fpoId);
      console.log('Board members response:', response);
      
      // Handle different response formats
      const members = response.data || response || [];
      console.log('Board members data:', members);
      console.log('First member details:', members[0]);
      console.log('Member qualification:', members[0]?.qualification);
      console.log('Member address:', members[0]?.address);
      setBoardMembers(Array.isArray(members) ? members : []);
    } catch (error) {
      console.error('Error loading board members:', error);
      setBoardMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
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
      console.log('FPO ID:', fpoId);
      console.log('Location value from form:', formData.location);
      console.log('Address field in DTO:', boardMemberData.address);
      
      const response = await fpoAPI.addBoardMember(fpoId, boardMemberData);
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
    setShowCreateForm(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
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
      
      await fpoAPI.updateBoardMember(fpoId, editingMember.id, boardMemberData);
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
      const response = await fpoAPI.updateBoardMember(fpoId, memberId, updateData);
      console.log('Update response:', response);
      
      alert(`Board member status updated to ${newStatus}!`);
      
      // Don't reload immediately to prevent status reversion
      // The local state update should be sufficient
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
        await fpoAPI.removeBoardMember(fpoId, memberId);
        
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

  const filteredMembers = boardMembers.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.qualification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phoneNumber?.includes(searchTerm);
    return matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content board-members-modal">
        <div className="modal-header">
          <h2>Board Members List</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Create Board Members Button */}
          <div className="create-section">
            <button 
              className="create-button"
              onClick={() => {
                setShowCreateForm(true);
                setEditingMember(null);
                setFormData({
                  name: '',
                  designation: '',
                  phoneNumber: '',
                  location: '',
                  email: '',
                  role: 'MEMBER'
                });
              }}
            >
              + Create Board Members
            </button>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-label">
              <span>Filter</span>
            </div>
            <div className="filter-inputs">
              <input
                type="text"
                placeholder="Search here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="date-range-container">
                <input
                  type="text"
                  placeholder="Enter a date range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="date-range-input"
                />
                <span className="calendar-icon">📅</span>
                <div className="date-format-hint">MM/DD/YYYY - MM/DD/YYYY</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="board-members-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Phone number</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">Loading...</td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data-cell">No data matching the filter</td>
                  </tr>
                ) : (
                  filteredMembers.map((member, index) => {
                    console.log('Rendering member:', member);
                    console.log('Qualification:', member.qualification);
                    console.log('Address:', member.address);
                    console.log('Member keys:', Object.keys(member));
                    return (
                    <tr key={member.id || index}>
                      <td>{member.id || `BM${index + 1}`}</td>
                      <td>{member.name || '-'}</td>
                      <td>{member.qualification || '-'}</td>
                      <td>{member.phoneNumber || '-'}</td>
                      <td>{member.address || '-'}</td>
                      <td>
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
                      <td>
                        <div className="action-dropdown">
                          <button 
                            className="dropdown-toggle"
                            onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                          >
                            ⋯
                          </button>
                          {activeDropdown === member.id && (
                            <div className={`dropdown-menu ${index >= 2 ? 'dropdown-menu-bottom' : 'dropdown-menu-top'}`}>
                              <button 
                                className="dropdown-item edit-item"
                                onClick={() => {
                                  handleEditMember(member);
                                  setActiveDropdown(null);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="dropdown-item delete-item"
                                onClick={() => {
                                  handleDeleteMember(member.id);
                                  setActiveDropdown(null);
                                }}
                              >
                                Delete
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

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="form-modal-overlay">
            <div className="form-modal-content">
              <div className="form-modal-header">
                <h3>{editingMember ? 'Edit Board Member' : 'Create Board Member'}</h3>
                <button 
                  className="close-button" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingMember(null);
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={editingMember ? handleUpdateMember : handleCreateMember}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className={!formData.name ? 'required-field' : ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Designation *</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      required
                      className={!formData.designation ? 'required-field' : ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      required
                      className={!formData.phoneNumber ? 'required-field' : ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={formData.linkedinProfileUrl}
                      onChange={(e) => setFormData({...formData, linkedinProfileUrl: e.target.value})}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`submit-btn ${!formData.name || !formData.designation || !formData.phoneNumber ? 'disabled' : ''}`}
                    disabled={!formData.name || !formData.designation || !formData.phoneNumber}
                  >
                    {editingMember ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FPOBoardMembersModal;
