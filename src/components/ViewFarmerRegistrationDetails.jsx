import React, { useEffect } from 'react';
import '../styles/ViewFarmerDetails.css';

const ViewFarmerRegistrationDetails = ({ farmerData, onClose }) => {

  // Close on ESC key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      // Handle different date formats
      let date;
      if (typeof dateString === 'string') {
        // Try parsing as ISO date first
        if (dateString.includes('T') || dateString.includes('Z')) {
          date = new Date(dateString);
        } else {
          // Try parsing as local date (YYYY-MM-DD)
          date = new Date(dateString + 'T00:00:00');
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  // Helper to fetch the first non-empty field from a list of possible keys
  const firstValue = (...keys) => {
    for (const key of keys) {
      const value = farmerData?.[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
    return undefined;
  };

  // Normalized view-model for inconsistent backend shapes
  const normalized = {
    name: (() => {
      const direct = firstValue('name', 'fullName');
      if (direct) return direct;
      const parts = [firstValue('firstName'), firstValue('middleName'), firstValue('lastName')]
        .filter(Boolean);
      return parts.length ? parts.join(' ') : undefined;
    })(),
    dateOfBirth: firstValue('dateOfBirth', 'dob'),
    gender: firstValue('gender'),
    contactNumber: firstValue('contactNumber', 'phoneNumber', 'phone', 'mobileNumber'),
    email: firstValue('email', 'emailId', 'emailAddress') || 'Not available', // Farmer entity doesn't have email
    fatherName: firstValue('fatherName', 'relationName', 'father'),
    nationality: firstValue('nationality'),
    alternativeContactNumber: firstValue('alternativeContactNumber', 'altNumber', 'alternateContact', 'alternativeNumber'),
    alternativeRelationType: firstValue('alternativeRelationType', 'altRelationType'),
    state: firstValue('state'),
    district: firstValue('district'),
    country: firstValue('country'),
    block: firstValue('block'),
    village: firstValue('village'),
    pincode: firstValue('pincode')
  };

  // Debug logging to see what data we're working with
  console.log('🔍 ViewFarmerRegistrationDetails - Raw farmerData:', farmerData);
  console.log('🔍 ViewFarmerRegistrationDetails - Normalized data:', normalized);
  console.log('🔍 ViewFarmerRegistrationDetails - Available keys:', Object.keys(farmerData || {}));
  
  // Additional debug logging for specific fields
  console.log('🔍 Date of Birth:', farmerData?.dateOfBirth, 'Type:', typeof farmerData?.dateOfBirth);
  console.log('🔍 Father Name:', farmerData?.fatherName, 'Type:', typeof farmerData?.fatherName);
  console.log('🔍 Nationality:', farmerData?.nationality, 'Type:', typeof farmerData?.nationality);
  console.log('🔍 Alternative Contact:', farmerData?.alternativeContactNumber, 'Type:', typeof farmerData?.alternativeContactNumber);
  console.log('🔍 Alternative Relation:', farmerData?.alternativeRelationType, 'Type:', typeof farmerData?.alternativeRelationType);

  // NOTE: address is displayed as a simple string below; keep function removed to avoid unused warnings

  // Helper function to safely render values
  const safeRender = (value) => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    if (typeof value === 'object') {
      console.warn('ViewFarmerRegistrationDetails: Object found in value:', value);
      return 'Object (see console)';
    }
    const str = String(value);
    return str.trim() === '' ? 'Not provided' : str;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-farmer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <button className="back-btn" onClick={onClose} style={{
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: 'pointer',
            color: '#111827'
          }}>← Back</button>
          <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Farmer Registration Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="farmer-details-container">
            {(!farmerData || typeof farmerData !== 'object') && (
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <label>Notice:</label>
                    <span> No farmer data available or invalid data format.</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Personal Information */}
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{safeRender(normalized.name)}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Birth:</label>
                  <span>{formatDate(normalized.dateOfBirth)}</span>
                </div>
                <div className="detail-item">
                  <label>Gender:</label>
                  <span>{safeRender(normalized.gender)}</span>
                </div>
                <div className="detail-item">
                  <label>Contact Number:</label>
                  <span>{safeRender(normalized.contactNumber)}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{safeRender(normalized.email)}</span>
                </div>
                <div className="detail-item">
                  <label>Father's Name:</label>
                  <span>{safeRender(normalized.fatherName)}</span>
                </div>
                <div className="detail-item">
                  <label>Nationality:</label>
                  <span>{safeRender(normalized.nationality)}</span>
                </div>
                <div className="detail-item">
                  <label>Alternative Contact:</label>
                  <span>{safeRender(normalized.alternativeContactNumber)}</span>
                </div>
                <div className="detail-item">
                  <label>Alternative Relation:</label>
                  <span>{safeRender(normalized.alternativeRelationType)}</span>
                </div>
              </div>
            </div>

                         {/* Address Information */}
             <div className="detail-section">
               <h3>Address Information</h3>
               <div className="detail-grid">
                 <div className="detail-item">
                   <label>State:</label>
                   <span>{safeRender(normalized.state)}</span>
                 </div>
                                   <div className="detail-item">
                    <label>District:</label>
                    <span>{safeRender(normalized.district)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Block:</label>
                    <span>{safeRender(normalized.block)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Village:</label>
                    <span>{safeRender(normalized.village)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pincode:</label>
                    <span>{safeRender(normalized.pincode)}</span>
                  </div>
                                   <div className="detail-item full-width">
                    <label>Complete Address:</label>
                    <span>{[
                      safeRender(normalized.village),
                      safeRender(normalized.block),
                      safeRender(normalized.district),
                      safeRender(normalized.state),
                      safeRender(normalized.pincode)
                    ].filter(val => val !== 'Not provided').join(', ')}</span>
                  </div>
               </div>
             </div>

                         {/* Assignment Information */}
             <div className="detail-section">
               <h3>Assignment Information</h3>
               <div className="detail-grid">
                 <div className="detail-item">
                   <label>KYC Status:</label>
                   <span className={`kyc-status-badge ${safeRender(farmerData.kycStatus)?.toLowerCase()}`}>
                     {safeRender(farmerData.kycStatus) || 'PENDING'}
                   </span>
                 </div>
                 {farmerData.assignedEmployee && (
                   <div className="detail-item">
                     <label>Assigned Employee:</label>
                     <span>{typeof farmerData.assignedEmployee === 'object' ? 
                       `${safeRender(farmerData.assignedEmployee.firstName)} ${safeRender(farmerData.assignedEmployee.lastName)}` : 
                       safeRender(farmerData.assignedEmployee)}</span>
                   </div>
                 )}
                 {farmerData.assignedEmployeeId && (
                   <div className="detail-item">
                     <label>Assigned Employee ID:</label>
                     <span>{safeRender(farmerData.assignedEmployeeId)}</span>
                   </div>
                 )}
               </div>
             </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFarmerRegistrationDetails; 