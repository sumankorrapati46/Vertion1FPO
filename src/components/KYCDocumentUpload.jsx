import React, { useState } from 'react';
import '../styles/KYCDocumentUpload.css';

const KYCDocumentUpload = ({ 
  isOpen, 
  onClose, 
  farmer, 
  onUpload, 
  onApprove, 
  onReject,
  onReferBack 
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState({
    aadhaar: null,
    pan: null,
    landDocuments: null,
    bankPassbook: null,
    incomeCertificate: null,
    casteCertificate: null,
    otherDocuments: []
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [kycStatus, setKycStatus] = useState('PENDING');
  const [rejectionReason, setRejectionReason] = useState('');
  const [referBackReason, setReferBackReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !farmer) return null;

  const handleFileUpload = (documentType, file) => {
    if (!file) return;

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev[documentType] + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploadedDocuments(prev => ({
            ...prev,
            [documentType]: {
              name: file.name,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString(),
              url: URL.createObjectURL(file)
            }
          }));
        }
        return { ...prev, [documentType]: newProgress };
      });
    }, 100);

    // Simulate API call
    setTimeout(() => {
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
    }, 1000);
  };

  const handleMultipleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      const newDoc = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file)
      };
      setUploadedDocuments(prev => ({
        ...prev,
        otherDocuments: [...prev.otherDocuments, newDoc]
      }));
    });
  };

  const removeDocument = (documentType, index = null) => {
    if (index !== null) {
      // Remove from otherDocuments array
      setUploadedDocuments(prev => ({
        ...prev,
        otherDocuments: prev.otherDocuments.filter((_, i) => i !== index)
      }));
    } else {
      // Remove single document
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: null
      }));
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setKycStatus('APPROVED');
      onApprove && onApprove(farmer.id, uploadedDocuments);
      alert('KYC approved successfully!');
    } catch (error) {
      console.error('Error approving KYC:', error);
      alert('Error approving KYC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setKycStatus('REJECTED');
      onReject && onReject(farmer.id, rejectionReason, uploadedDocuments);
      alert('KYC rejected successfully!');
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      alert('Error rejecting KYC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReferBack = async () => {
    if (!referBackReason.trim()) {
      alert('Please provide a reason for referring back');
      return;
    }
    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setKycStatus('REFER_BACK');
      onReferBack && onReferBack(farmer.id, referBackReason, uploadedDocuments);
      alert('KYC referred back successfully!');
    } catch (error) {
      console.error('Error referring back KYC:', error);
      alert('Error referring back KYC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocumentStatus = (documentType) => {
    const doc = uploadedDocuments[documentType];
    if (!doc) return 'missing';
    return 'uploaded';
  };

  const getRequiredDocuments = () => [
    { key: 'aadhaar', label: 'Aadhaar Card', required: true },
    { key: 'pan', label: 'PAN Card', required: true },
    { key: 'landDocuments', label: 'Land Documents', required: true },
    { key: 'bankPassbook', label: 'Bank Passbook', required: true },
    { key: 'incomeCertificate', label: 'Income Certificate', required: false },
    { key: 'casteCertificate', label: 'Caste Certificate', required: false }
  ];

  const canApprove = () => {
    const requiredDocs = getRequiredDocuments().filter(doc => doc.required);
    return requiredDocs.every(doc => getDocumentStatus(doc.key) === 'uploaded');
  };

  return (
    <div className="kyc-document-upload-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>KYC Document Upload & Review</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Farmer Information */}
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
                <label>State:</label>
                <span>{farmer.state}</span>
              </div>
              <div className="info-item">
                <label>District:</label>
                <span>{farmer.district}</span>
              </div>
              <div className="info-item">
                <label>KYC Status:</label>
                <span className={`status-badge status-${kycStatus.toLowerCase()}`}>
                  {kycStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="document-upload-section">
            <h3>Required Documents</h3>
            <div className="document-grid">
              {getRequiredDocuments().map(doc => (
                <div key={doc.key} className={`document-item ${getDocumentStatus(doc.key)}`}>
                  <div className="document-header">
                    <h4>{doc.label}</h4>
                    {doc.required && <span className="required-badge">Required</span>}
                  </div>
                  
                  {uploadedDocuments[doc.key] ? (
                    <div className="uploaded-document">
                      <div className="document-info">
                        <span className="document-name">{uploadedDocuments[doc.key].name}</span>
                        <span className="document-size">
                          {(uploadedDocuments[doc.key].size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="document-actions">
                        <button 
                          className="view-btn"
                          onClick={() => window.open(uploadedDocuments[doc.key].url)}
                        >
                          👁️ View
                        </button>
                        <button 
                          className="remove-btn"
                          onClick={() => removeDocument(doc.key)}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-area">
                      {uploadProgress[doc.key] !== undefined ? (
                        <div className="upload-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${uploadProgress[doc.key]}%` }}
                            ></div>
                          </div>
                          <span>{uploadProgress[doc.key]}%</span>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            id={`file-${doc.key}`}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor={`file-${doc.key}`} className="upload-label">
                            <div className="upload-icon">📁</div>
                            <span>Click to upload {doc.label}</span>
                            <small>PDF, JPG, PNG, DOC (Max 10MB)</small>
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Documents */}
            <div className="additional-documents">
              <h4>Additional Documents</h4>
              <div className="upload-area">
                <input
                  type="file"
                  id="additional-files"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleMultipleFileUpload(e.target.files)}
                  style={{ display: 'none' }}
                />
                <label htmlFor="additional-files" className="upload-label">
                  <div className="upload-icon">📁</div>
                  <span>Upload Additional Documents</span>
                  <small>Multiple files allowed</small>
                </label>
              </div>

              {uploadedDocuments.otherDocuments.length > 0 && (
                <div className="additional-documents-list">
                  {uploadedDocuments.otherDocuments.map((doc, index) => (
                    <div key={index} className="additional-document">
                      <span className="document-name">{doc.name}</span>
                      <div className="document-actions">
                        <button 
                          className="view-btn"
                          onClick={() => window.open(doc.url)}
                        >
                          👁️ View
                        </button>
                        <button 
                          className="remove-btn"
                          onClick={() => removeDocument('otherDocuments', index)}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* KYC Actions */}
          <div className="kyc-actions">
            <h3>KYC Review Actions</h3>
            
            <div className="action-buttons">
              <button
                className={`action-btn approve-btn ${!canApprove() ? 'disabled' : ''}`}
                onClick={handleApprove}
                disabled={!canApprove() || isSubmitting}
              >
                {isSubmitting ? '⏳ Processing...' : '✅ Approve KYC'}
              </button>

              <button
                className="action-btn refer-back-btn"
                onClick={() => document.getElementById('refer-back-reason').focus()}
                disabled={isSubmitting}
              >
                🔄 Refer Back
              </button>

              <button
                className="action-btn reject-btn"
                onClick={() => document.getElementById('rejection-reason').focus()}
                disabled={isSubmitting}
              >
                ❌ Reject KYC
              </button>
            </div>

            {/* Refer Back Reason */}
            <div className="reason-input">
              <label htmlFor="refer-back-reason">Refer Back Reason:</label>
              <textarea
                id="refer-back-reason"
                value={referBackReason}
                onChange={(e) => setReferBackReason(e.target.value)}
                placeholder="Enter reason for referring back..."
                rows="3"
              />
              {referBackReason && (
                <button
                  className="submit-reason-btn"
                  onClick={handleReferBack}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Submit Refer Back'}
                </button>
              )}
            </div>

            {/* Rejection Reason */}
            <div className="reason-input">
              <label htmlFor="rejection-reason">Rejection Reason:</label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows="3"
              />
              {rejectionReason && (
                <button
                  className="submit-reason-btn reject"
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Submit Rejection'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCDocumentUpload; 