import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOCrops = ({ fpoId }) => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCrops();
  }, [fpoId]);

  const loadCrops = async () => {
    try {
      setLoading(true);
      const response = await fpoAPI.getFPOCrops(fpoId);
      setCrops(response);
    } catch (err) {
      setError('Failed to load crops');
      console.error('Error loading crops:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading crops...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="fpo-crops">
      <div className="section-header">
        <h3>Crops</h3>
        <button className="btn btn-primary">Add Crop</button>
      </div>
      
      <div className="crops-list">
        {crops.length === 0 ? (
          <div className="no-data">No crops found</div>
        ) : (
          crops.map(crop => (
            <div key={crop.id} className="crop-card">
              <div className="crop-info">
                <h4>{crop.cropName}</h4>
                <p className="variety">Variety: {crop.variety}</p>
                <p className="area">Area: {crop.area} acres</p>
                <p className="season">Season: {crop.season}</p>
                <p className="status">Status: {crop.status}</p>
              </div>
              <div className="crop-actions">
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

export default FPOCrops;
