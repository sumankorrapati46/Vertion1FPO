import React from 'react';
import '../styles/ViewFarmerDetails.css';

const ViewFarmerRegistrationDetails = ({ farmerData, onClose }) => {
  // Safety check to prevent rendering objects directly
  if (!farmerData || typeof farmerData !== 'object') {
    console.error('ViewFarmerRegistrationDetails: Invalid farmerData:', farmerData);
    return (
      <div className="modal-overlay">
        <div className="modal-content view-farmer-modal">
          <div className="modal-header">
            <h2>Farmer Details</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p>No farmer data available or invalid data format.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    return `${address.village || ''} ${address.postOffice || ''} ${address.policeStation || ''} ${address.district || ''} ${address.state || ''} ${address.pincode || ''}`.trim();
  };

  // Helper function to safely render values
  const safeRender = (value) => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    if (typeof value === 'object') {
      console.warn('ViewFarmerRegistrationDetails: Object found in value:', value);
      return 'Object (see console)';
    }
    return String(value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content view-farmer-modal">
        <div className="modal-header">
          <h2>Farmer Registration Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="farmer-details-container">
            
            {/* Personal Information */}
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-grid">
                                 <div className="detail-item">
                   <label>Name:</label>
                   <span>{safeRender(farmerData.name)}</span>
                 </div>
                <div className="detail-item">
                  <label>Date of Birth:</label>
                  <span>{formatDate(farmerData.dateOfBirth)}</span>
                </div>
                <div className="detail-item">
                  <label>Gender:</label>
                  <span>{safeRender(farmerData.gender)}</span>
                </div>
                                 <div className="detail-item">
                   <label>Contact Number:</label>
                   <span>{safeRender(farmerData.contactNumber)}</span>
                 </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{safeRender(farmerData.email)}</span>
                </div>
                <div className="detail-item">
                  <label>Father's Name:</label>
                  <span>{safeRender(farmerData.fatherName)}</span>
                </div>
                <div className="detail-item">
                  <label>Nationality:</label>
                  <span>{safeRender(farmerData.nationality)}</span>
                </div>
                                 <div className="detail-item">
                   <label>Alternative Contact:</label>
                   <span>{safeRender(farmerData.alternativeContactNumber)}</span>
                 </div>
                 <div className="detail-item">
                   <label>Alternative Relation:</label>
                   <span>{safeRender(farmerData.alternativeRelationType)}</span>
                 </div>
              </div>
            </div>

                         {/* Address Information */}
             <div className="detail-section">
               <h3>Address Information</h3>
               <div className="detail-grid">
                 <div className="detail-item">
                   <label>State:</label>
                   <span>{safeRender(farmerData.state)}</span>
                 </div>
                 <div className="detail-item">
                   <label>District:</label>
                   <span>{safeRender(farmerData.district)}</span>
                 </div>
                 <div className="detail-item full-width">
                   <label>Complete Address:</label>
                   <span>{`${safeRender(farmerData.district)}, ${safeRender(farmerData.state)}`.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '')}</span>
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