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
      <div className="services-list">
        {services.length === 0 ? (
          <div className="no-data">No services found</div>
        ) : (
          services.map(service => (
            <div key={service.id} className="service-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div className="service-info">
                <h4 style={{ margin: 0 }}>{service.serviceType?.toString().replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</h4>
                <p className="description" style={{ margin: '6px 0 0 0', color: '#475569' }}>{service.description || '—'}</p>
              </div>
              <span className={`status-pill ${service.status === 'APPROVED' ? 'status-active' : ''}`} style={{ background: service.status === 'APPROVED' ? '#10b981' : '#e2e8f0', color: service.status === 'APPROVED' ? '#ffffff' : '#0f172a', padding: '6px 12px', borderRadius: 999, fontWeight: 700 }}>
                {service.status === 'APPROVED' ? 'Active' : (service.status || 'Pending')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOServices;
