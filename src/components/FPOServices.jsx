import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOServices = ({ fpoId, showDebugButton = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServices();
    
    // Additional debugging - check user authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('FPOServices: Auth check - token exists:', !!token);
    console.log('FPOServices: Auth check - user:', user ? JSON.parse(user) : 'No user');
  }, [fpoId]);

  const loadServices = async () => {
    if (!fpoId) {
      console.log('FPOServices: No fpoId provided');
      setError('No FPO ID provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('FPOServices: Loading services for fpoId:', fpoId);
      console.log('FPOServices: Making API call to:', `/api/fpo/${fpoId}/services`);
      
      const response = await fpoAPI.getFPOServices(fpoId);
      console.log('FPOServices: Full API response:', response);
      console.log('FPOServices: Response type:', typeof response);
      console.log('FPOServices: Response length:', Array.isArray(response) ? response.length : 'Not an array');
      
      // Handle different response formats
      let servicesData = response;
      if (response && typeof response === 'object') {
        // Check if response is wrapped in data property
        if (response.data && Array.isArray(response.data)) {
          servicesData = response.data;
          console.log('FPOServices: Using response.data, length:', servicesData.length);
        }
        // Check if response is wrapped in content property
        else if (response.content && Array.isArray(response.content)) {
          servicesData = response.content;
          console.log('FPOServices: Using response.content, length:', servicesData.length);
        }
        // Check if response has services property
        else if (response.services && Array.isArray(response.services)) {
          servicesData = response.services;
          console.log('FPOServices: Using response.services, length:', servicesData.length);
        }
      }
      
      console.log('FPOServices: Final services data:', servicesData);
      setServices(servicesData || []);
    } catch (err) {
      setError('Failed to load services');
      console.error('FPOServices: Error loading services:', err);
      console.error('FPOServices: Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading services...</div>;
  }

  if (error) {
    return <div className="error" style={{ padding: '20px', textAlign: 'center', color: '#ef4444', backgroundColor: '#fef2f2', borderRadius: '8px', margin: '10px 0' }}>Error: {error}</div>;
  }

  // Debug logging for rendering
  console.log('FPOServices: Rendering with services:', services);
  console.log('FPOServices: Services length:', services.length);

  return (
    <div className="fpo-services">
      {/* Debug refresh button - only show if showDebugButton is true */}
      {showDebugButton && (
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={loadServices}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔄 Refresh Services (Debug)
          </button>
        </div>
      )}
      
      <div className="services-list">
        {services.length === 0 ? (
          <div className="no-data" style={{ padding: '20px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px', margin: '10px 0' }}>
            <p style={{ margin: '0 0 10px 0' }}>No services found for this FPO</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Click "Create Farm Service" to add services</p>
            {showDebugButton && (
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Debug: fpoId={fpoId}, services={JSON.stringify(services)}</p>
            )}
          </div>
        ) : (
          services.map((service, index) => {
            console.log(`FPOServices: Rendering service ${index}:`, service);
            return (
            <div key={service.id} className="service-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div className="service-info">
                <h4 style={{ margin: 0 }}>{service.serviceType?.toString().replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</h4>
                <p className="description" style={{ margin: '6px 0 0 0', color: '#475569' }}>{service.description || '—'}</p>
              </div>
              <span className={`status-pill ${service.status === 'APPROVED' ? 'status-active' : ''}`} style={{ background: service.status === 'APPROVED' ? '#10b981' : '#e2e8f0', color: service.status === 'APPROVED' ? '#ffffff' : '#0f172a', padding: '6px 12px', borderRadius: 999, fontWeight: 700 }}>
                {service.status === 'APPROVED' ? 'Active' : (service.status || 'Pending')}
              </span>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FPOServices;
