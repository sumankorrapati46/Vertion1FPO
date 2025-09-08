import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOServices = ({ fpoId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServices();
  }, [fpoId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fpoAPI.getFPOServices(fpoId);
      setServices(response);
    } catch (err) {
      setError('Failed to load services');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading services...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="fpo-services">
      <div className="section-header">
        <h3>Services</h3>
        <button className="btn btn-primary">Add Service</button>
      </div>
      
      <div className="services-list">
        {services.length === 0 ? (
          <div className="no-data">No services found</div>
        ) : (
          services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-info">
                <h4>{service.serviceType}</h4>
                <p className="description">{service.description}</p>
                <p className="status">Status: {service.status}</p>
              </div>
              <div className="service-actions">
                <button className="btn btn-secondary btn-sm">Edit</button>
                <button className="btn btn-warning btn-sm">Update Status</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOServices;
