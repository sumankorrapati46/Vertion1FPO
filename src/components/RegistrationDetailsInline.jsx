import React, { useState } from 'react';
import { superAdminAPI } from '../api/apiService';
import '../styles/ViewFarmerDetails.css';

const RegistrationDetailsInline = ({ registration, onBack, onUpdate }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: registration?.status || 'PENDING',
    role: registration?.role || 'FARMER'
  });

  if (!registration) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Call the status update API endpoint
      await superAdminAPI.updateUserStatus(registration.id, formData.status);
      alert('Registration updated successfully!');
      // Call onUpdate to refresh the registration list
      await onUpdate(registration.id, formData);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('Failed to update registration: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleApprove = async () => {
    try {
      // Call the approve API endpoint with role
      await superAdminAPI.approveUser(registration.id, formData.role);
      alert('User approved successfully! Temporary password has been sent to their email.');
      // Call onUpdate to refresh the registration list
      await onUpdate(registration.id, { ...formData, status: 'APPROVED' });
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Failed to approve registration: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async () => {
    try {
      // Call the reject API endpoint
      await superAdminAPI.rejectUser(registration.id);
      alert('User rejected successfully! Rejection email has been sent.');
      // Call onUpdate to refresh the registration list
      await onUpdate(registration.id, { ...formData, status: 'REJECTED' });
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Failed to reject registration: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="view-farmer-content">
      <div className="view-farmer-header">
        <button className="back-btn" onClick={onBack}>← Back to Registration</button>
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Registration Details</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isEditMode ? (
            <>
              <button onClick={() => setIsEditMode(true)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px' }}>Edit</button>
              {registration.status === 'PENDING' && (
                <>
                  <button onClick={handleApprove} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px' }}>Approve</button>
                  <button onClick={handleReject} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px' }}>Reject</button>
                </>
              )}
            </>
          ) : (
            <>
              <button onClick={handleSave} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px' }}>Save</button>
              <button onClick={() => setIsEditMode(false)} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="view-farmer-body">
        <div className="farmer-details-container">
          <div className="detail-section">
            <h3>Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item"><label>Name:</label><span>{registration.name || 'Not provided'}</span></div>
              <div className="detail-item"><label>Email:</label><span>{registration.email || 'Not provided'}</span></div>
              <div className="detail-item"><label>Phone:</label><span>{registration.phoneNumber || 'Not provided'}</span></div>
              <div className="detail-item"><label>Gender:</label><span>{registration.gender || 'Not provided'}</span></div>
              <div className="detail-item"><label>Date of Birth:</label><span>{registration.dateOfBirth || 'Not provided'}</span></div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Role:</label>
                {!isEditMode ? (
                  <span className={`status-badge`}>{registration.role}</span>
                ) : (
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="edit-input"
                  >
                    <option value="FARMER">Farmer</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                )}
              </div>

              <div className="detail-item">
                <label>Status:</label>
                {!isEditMode ? (
                  <span className={`status-badge ${registration.status.toLowerCase()}`}>{registration.status}</span>
                ) : (
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="edit-input"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                )}
              </div>

              <div className="detail-item"><label>KYC Status:</label><span className={`status-badge ${(registration.kycStatus || 'PENDING').toLowerCase()}`}>{registration.kycStatus || 'PENDING'}</span></div>
              <div className="detail-item"><label>Registration Date:</label><span>{registration.createdAt ? new Date(registration.createdAt).toLocaleDateString() : 'Not provided'}</span></div>
            </div>
          </div>

          {(registration.state || registration.district || registration.region) && (
            <div className="detail-section">
              <h3>Location Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><label>State:</label><span>{registration.state || 'Not provided'}</span></div>
                <div className="detail-item"><label>District:</label><span>{registration.district || 'Not provided'}</span></div>
                <div className="detail-item"><label>Region:</label><span>{registration.region || 'Not provided'}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetailsInline;


