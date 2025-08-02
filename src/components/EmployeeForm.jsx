import React, { useState } from 'react';
import EmployeeRegistrationForm from './EmployeeRegistrationForm';
import '../styles/Forms.css';

const EmployeeForm = ({ onClose, onSubmit, editData = null }) => {
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
      console.error('Error submitting employee data:', error);
    }
  };

  if (!showForm) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content employee-modal">
        <div className="modal-header">
          <h2>{editData ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          <EmployeeRegistrationForm
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

export default EmployeeForm; 