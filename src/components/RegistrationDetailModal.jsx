import React, { useState } from 'react';
import { superAdminAPI } from '../api/apiService';

const RegistrationDetailModal = ({ registration, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: registration?.status || '',
    role: registration?.role || ''
  });

  const handleStatusChange = async (newStatus) => {
    try {
      if (newStatus === 'APPROVED') {
        await superAdminAPI.approveUser(registration.id, registration.role);
      } else if (newStatus === 'REJECTED') {
        await superAdminAPI.rejectUser(registration.id, 'Rejected by admin');
      } else {
        // For other status changes (like PENDING), use the status update endpoint
        await superAdminAPI.updateUserStatus(registration.id, newStatus);
      }
      
      setFormData(prev => ({ ...prev, status: newStatus }));
      onUpdate && onUpdate();
      alert(`Registration ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Error updating registration status:', error);
      alert(`Failed to update registration status: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      await superAdminAPI.updateUser(registration.id, { role: newRole });
      setFormData(prev => ({ ...prev, role: newRole }));
      onUpdate && onUpdate();
      alert('Role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert(`Failed to update role: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!registration) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content registration-detail-modal">
        <div className="modal-header">
          <h2>Registration Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="registration-info">
            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{registration.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{registration.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{registration.phoneNumber}</span>
                </div>
                <div className="info-item">
                  <label>Gender:</label>
                  <span>{registration.gender}</span>
                </div>
                <div className="info-item">
                  <label>Date of Birth:</label>
                  <span>{registration.dateOfBirth}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Role:</label>
                  <div className="editable-field">
                    {isEditing ? (
                      <select 
                        value={formData.role} 
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="form-select"
                      >
                        <option value="FARMER">Farmer</option>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    ) : (
                      <span className={`status-badge role-${registration.role.toLowerCase()}`}>
                        {registration.role}
                      </span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <div className="editable-field">
                    {isEditing ? (
                      <select 
                        value={formData.status} 
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="form-select"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    ) : (
                      <span className={`status-badge status-${registration.status.toLowerCase()}`}>
                        {registration.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <label>KYC Status:</label>
                  <span className={`status-badge kyc-${registration.kycStatus?.toLowerCase() || 'pending'}`}>
                    {registration.kycStatus || 'PENDING'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Registration Date:</label>
                  <span>{new Date(registration.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {registration.state && (
              <div className="info-section">
                <h3>Location Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>State:</label>
                    <span>{registration.state}</span>
                  </div>
                  <div className="info-item">
                    <label>District:</label>
                    <span>{registration.district}</span>
                  </div>
                  <div className="info-item">
                    <label>Region:</label>
                    <span>{registration.region}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className={`action-btn ${isEditing ? 'secondary' : 'primary'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Registration'}
          </button>
          <button className="action-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetailModal; 