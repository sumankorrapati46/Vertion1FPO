import React from 'react';
import FarmerRegistrationForm from '../components/FarmerRegistrationForm';

const FarmerRegistration = () => {
  const handleSubmit = async (data) => {
    try {
      console.log('Farmer registration submitted:', data);
      // Here you would typically send the data to your backend
      alert('Farmer registration completed successfully!');
    } catch (error) {
      console.error('Error submitting farmer registration:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <FarmerRegistrationForm
      isInDashboard={false}
      onSubmit={handleSubmit}
    />
  );
};

export default FarmerRegistration; 