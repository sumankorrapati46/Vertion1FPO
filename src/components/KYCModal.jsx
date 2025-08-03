import React, { useState } from 'react';
import '../styles/Forms.css';

const KYCModal = ({ farmer, onClose, onApprove, onReject, onReferBack }) => {
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');

  const handleSubmit = () => {
    if (!action) {
      alert('Please select an action');
      return;
    }

    if ((action === 'reject' || action === 'refer-back') && !reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    switch (action) {
      case 'approve':
        onApprove(farmer.id);
        break;
      case 'reject':
        onReject(farmer.id, reason);
        break;
      case 'refer-back':
        onReferBack(farmer.id, reason);
        break;
      default:
        break;
    }
    
    onClose();
  };

  if (!farmer) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content kyc-modal">
        <div className="modal-header">
          <h2>KYC Review - {farmer.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="farmer-info">
            <h3>Farmer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{farmer.name}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{farmer.phone}</span>
              </div>
              <div className="info-item">
                <label>Location:</label>
                <span>{farmer.location}</span>
              </div>
              <div className="info-item">
                <label>Current Status:</label>
                <span className={`status-badge status-${farmer.kycStatus?.toLowerCase()}`}>
                  {farmer.kycStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="kyc-actions">
            <h3>KYC Action</h3>
            <div className="action-buttons">
              <button 
                className={`action-btn ${action === 'approve' ? 'active' : ''}`}
                onClick={() => setAction('approve')}
              >
                ✅ Approve
              </button>
              <button 
                className={`action-btn ${action === 'refer-back' ? 'active' : ''}`}
                onClick={() => setAction('refer-back')}
              >
                📝 Refer Back
              </button>
              <button 
                className={`action-btn ${action === 'reject' ? 'active' : ''}`}
                onClick={() => setAction('reject')}
              >
                ❌ Reject
              </button>
            </div>

            {(action === 'reject' || action === 'refer-back') && (
              <div className="reason-section">
                <label htmlFor="reason">Reason:</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Enter reason for ${action === 'reject' ? 'rejection' : 'refer back'}...`}
                  rows="4"
                  className="reason-textarea"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="action-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="action-btn primary" 
            onClick={handleSubmit}
            disabled={!action || ((action === 'reject' || action === 'refer-back') && !reason.trim())}
          >
            Submit Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCModal; 