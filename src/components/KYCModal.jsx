import React, { useState } from 'react';
import '../styles/Forms.css';

const KYCModal = ({ farmer, onClose, onSubmit }) => {
  const [kycStatus, setKycStatus] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!kycStatus) {
      alert('Please select a KYC status');
      return;
    }

    if ((kycStatus === 'REFER_BACK' || kycStatus === 'REJECTED') && !reason.trim()) {
      alert('Please provide a reason for refer back or rejection');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(farmer.id, kycStatus, reason);
      onClose();
    } catch (error) {
      console.error('Error updating KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'PENDING':
        return 'orange';
      case 'REFER_BACK':
        return 'yellow';
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>KYC Review - {farmer.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="farmer-details">
          <div className="detail-row">
            <span className="label">Phone:</span>
            <span className="value">{farmer.phone}</span>
          </div>
          <div className="detail-row">
            <span className="label">Location:</span>
            <span className="value">{farmer.location}</span>
          </div>
          <div className="detail-row">
            <span className="label">Assigned Date:</span>
            <span className="value">{farmer.assignedDate}</span>
          </div>
          <div className="detail-row">
            <span className="label">Current Status:</span>
            <span className={`status-badge ${getStatusColor(farmer.kycStatus)}`}>
              {farmer.kycStatus}
            </span>
          </div>
          {farmer.notes && (
            <div className="detail-row">
              <span className="label">Previous Notes:</span>
              <span className="value">{farmer.notes}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="kycStatus">KYC Status *</label>
            <select
              id="kycStatus"
              value={kycStatus}
              onChange={(e) => setKycStatus(e.target.value)}
              required
            >
              <option value="">Select Status</option>
              <option value="APPROVED">✅ Approve</option>
              <option value="REFER_BACK">🔄 Refer Back</option>
              <option value="REJECTED">❌ Reject</option>
            </select>
          </div>

          {(kycStatus === 'REFER_BACK' || kycStatus === 'REJECTED') && (
            <div className="form-group">
              <label htmlFor="reason">Reason *</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Enter reason for ${kycStatus.toLowerCase()}`}
                rows="3"
                required
              />
            </div>
          )}

          <div className="kyc-actions">
            <div className="action-buttons">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading || !kycStatus}
              >
                {loading ? 'Updating...' : 'Update KYC Status'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KYCModal; 