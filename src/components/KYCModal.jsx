import React, { useState } from 'react';
import '../styles/Forms.css';

const KYCModal = ({ farmer, onClose, onApprove, onReject, onReferBack }) => {
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');
  const [aadharNumber, setAadharNumber] = useState(farmer?.aadharNumber || '');
  const [panNumber, setPanNumber] = useState(farmer?.panNumber || '');

  const handleSubmit = () => {
    if (!action) {
      alert('Please select an action');
      return;
    }

    if (action === 'approve' && (!aadharNumber.trim() || !panNumber.trim())) {
      alert('Please fill both Aadhar Number and PAN Number before approving');
      return;
    }

    if ((action === 'reject' || action === 'refer-back') && !reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    switch (action) {
      case 'approve':
        onApprove(farmer.id, { aadharNumber, panNumber });
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

          <div className="document-info">
            <h3>Required Documents</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Aadhar Number:</label>
                <input
                  type="text"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  placeholder="Enter 12-digit Aadhar number"
                  maxLength="12"
                  className={aadharNumber.length > 0 && aadharNumber.length !== 12 ? 'error' : ''}
                />
                {aadharNumber.length > 0 && aadharNumber.length !== 12 && (
                  <span className="error-text">Aadhar number must be 12 digits</span>
                )}
              </div>
              <div className="form-group">
                <label>PAN Number:</label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="Enter PAN number (e.g., ABCDE1234F)"
                  maxLength="10"
                  className={panNumber.length > 0 && panNumber.length !== 10 ? 'error' : ''}
                />
                {panNumber.length > 0 && panNumber.length !== 10 && (
                  <span className="error-text">PAN number must be 10 characters</span>
                )}
              </div>
            </div>
            {(!aadharNumber.trim() || !panNumber.trim()) && (
              <div className="document-warning">
                ⚠️ Both Aadhar Number and PAN Number are required for KYC approval
              </div>
            )}
          </div>

          <div className="kyc-actions">
            <h3>KYC Action</h3>
            <div className="action-buttons">
              <button 
                className={`action-btn ${action === 'approve' ? 'active' : ''}`}
                onClick={() => setAction('approve')}
                disabled={!aadharNumber.trim() || !panNumber.trim() || aadharNumber.length !== 12 || panNumber.length !== 10}
                title={(!aadharNumber.trim() || !panNumber.trim() || aadharNumber.length !== 12 || panNumber.length !== 10) ? 'Both Aadhar and PAN numbers must be filled correctly for approval' : ''}
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
            disabled={!action || 
              ((action === 'reject' || action === 'refer-back') && !reason.trim()) ||
              (action === 'approve' && (!aadharNumber.trim() || !panNumber.trim() || aadharNumber.length !== 12 || panNumber.length !== 10))
            }
          >
            Submit Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCModal; 