import React, { useState } from 'react';
import FarmerRegistrationForm from './FarmerRegistrationForm';
import '../styles/Forms.css';

const FarmerForm = ({ onClose, onSubmit, editData = null }) => {
  const [showForm, setShowForm] = useState(true);

  const handleClose = () => {
    setShowForm(false);
    onClose && onClose();
  };

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
      handleClose();
    } catch (error) {
      console.error('Error submitting farmer data:', error);
    }
  };

  if (!showForm) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content farmer-modal">
        <div className="modal-header">
          <h2>{editData ? 'Edit Farmer' : 'Add New Farmer'}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <FarmerRegistrationForm
            isInDashboard={true}
            editData={editData}
            onClose={handleClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default FarmerForm; 