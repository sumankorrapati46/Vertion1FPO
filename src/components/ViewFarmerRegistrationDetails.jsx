import React from 'react';
import '../styles/ViewFarmerDetails.css';

const ViewFarmerRegistrationDetails = ({ farmerData, onClose }) => {
  if (!farmerData) {
    return (
      <div className="modal-overlay">
        <div className="modal-content view-farmer-modal">
          <div className="modal-header">
            <h2>Farmer Details</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p>No farmer data available.</p>
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
                  <span>{farmerData.firstName} {farmerData.lastName}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Birth:</label>
                  <span>{formatDate(farmerData.dateOfBirth)}</span>
                </div>
                <div className="detail-item">
                  <label>Gender:</label>
                  <span>{farmerData.gender}</span>
                </div>
                <div className="detail-item">
                  <label>Mobile Number:</label>
                  <span>{farmerData.mobileNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{farmerData.email}</span>
                </div>
                <div className="detail-item">
                  <label>Marital Status:</label>
                  <span>{farmerData.maritalStatus}</span>
                </div>
                <div className="detail-item">
                  <label>Religion:</label>
                  <span>{farmerData.religion}</span>
                </div>
                <div className="detail-item">
                  <label>Caste:</label>
                  <span>{farmerData.caste}</span>
                </div>
                <div className="detail-item">
                  <label>Category:</label>
                  <span>{farmerData.category}</span>
                </div>
                <div className="detail-item">
                  <label>Education:</label>
                  <span>{farmerData.education}</span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="detail-section">
              <h3>Address Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Village:</label>
                  <span>{farmerData.village}</span>
                </div>
                <div className="detail-item">
                  <label>Post Office:</label>
                  <span>{farmerData.postOffice}</span>
                </div>
                <div className="detail-item">
                  <label>Police Station:</label>
                  <span>{farmerData.policeStation}</span>
                </div>
                <div className="detail-item">
                  <label>District:</label>
                  <span>{farmerData.district}</span>
                </div>
                <div className="detail-item">
                  <label>State:</label>
                  <span>{farmerData.state}</span>
                </div>
                <div className="detail-item">
                  <label>Pincode:</label>
                  <span>{farmerData.pincode}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Complete Address:</label>
                  <span>{formatAddress(farmerData)}</span>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="detail-section">
              <h3>Professional Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Occupation:</label>
                  <span>{farmerData.occupation}</span>
                </div>
                <div className="detail-item">
                  <label>Annual Income:</label>
                  <span>{farmerData.annualIncome}</span>
                </div>
                <div className="detail-item">
                  <label>Land Ownership:</label>
                  <span>{farmerData.landOwnership}</span>
                </div>
                <div className="detail-item">
                  <label>Land Area (Acres):</label>
                  <span>{farmerData.landArea}</span>
                </div>
                <div className="detail-item">
                  <label>Irrigation Type:</label>
                  <span>{farmerData.irrigationType}</span>
                </div>
                <div className="detail-item">
                  <label>Soil Type:</label>
                  <span>{farmerData.soilType}</span>
                </div>
              </div>
            </div>

            {/* Crop Information */}
            <div className="detail-section">
              <h3>Crop Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Primary Crop:</label>
                  <span>{farmerData.primaryCrop}</span>
                </div>
                <div className="detail-item">
                  <label>Secondary Crop:</label>
                  <span>{farmerData.secondaryCrop}</span>
                </div>
                <div className="detail-item">
                  <label>Crop Season:</label>
                  <span>{farmerData.cropSeason}</span>
                </div>
                <div className="detail-item">
                  <label>Farming Experience (Years):</label>
                  <span>{farmerData.farmingExperience}</span>
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="detail-section">
              <h3>Bank Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Bank Name:</label>
                  <span>{farmerData.bankName}</span>
                </div>
                <div className="detail-item">
                  <label>Branch Name:</label>
                  <span>{farmerData.branchName}</span>
                </div>
                <div className="detail-item">
                  <label>Account Number:</label>
                  <span>{farmerData.accountNumber}</span>
                </div>
                <div className="detail-item">
                  <label>IFSC Code:</label>
                  <span>{farmerData.ifscCode}</span>
                </div>
                <div className="detail-item">
                  <label>Account Type:</label>
                  <span>{farmerData.accountType}</span>
                </div>
              </div>
            </div>

            {/* Document Information */}
            <div className="detail-section">
              <h3>Document Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Aadhaar Number:</label>
                  <span>{farmerData.aadhaarNumber}</span>
                </div>
                <div className="detail-item">
                  <label>PAN Number:</label>
                  <span>{farmerData.panNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Voter ID:</label>
                  <span>{farmerData.voterId}</span>
                </div>
                <div className="detail-item">
                  <label>Ration Card Number:</label>
                  <span>{farmerData.rationCardNumber}</span>
                </div>
              </div>
            </div>

            {/* Photo */}
            {farmerData.photo && (
              <div className="detail-section">
                <h3>Photo</h3>
                <div className="photo-container">
                  <img 
                    src={farmerData.photo} 
                    alt="Farmer" 
                    className="farmer-photo"
                  />
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="detail-section">
              <h3>Additional Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Registration Date:</label>
                  <span>{formatDate(farmerData.registrationDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${farmerData.status?.toLowerCase()}`}>
                    {farmerData.status || 'Pending'}
                  </span>
                </div>
                {farmerData.assignedEmployee && (
                  <div className="detail-item">
                    <label>Assigned Employee:</label>
                    <span>{farmerData.assignedEmployee}</span>
                  </div>
                )}
                {farmerData.kycStatus && (
                  <div className="detail-item">
                    <label>KYC Status:</label>
                    <span className={`kyc-status-badge ${farmerData.kycStatus.toLowerCase()}`}>
                      {farmerData.kycStatus}
                    </span>
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