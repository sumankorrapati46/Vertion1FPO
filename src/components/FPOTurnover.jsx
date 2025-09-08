import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOTurnover = ({ fpoId }) => {
  const [turnovers, setTurnovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTurnovers();
  }, [fpoId]);

  const loadTurnovers = async () => {
    try {
      setLoading(true);
      const response = await fpoAPI.getFPOTurnovers(fpoId);
      setTurnovers(response);
    } catch (err) {
      setError('Failed to load turnover data');
      console.error('Error loading turnover data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading turnover data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="fpo-turnover">
      <div className="section-header">
        <h3>Turnover & Financial Data</h3>
        <button className="btn btn-primary">Add Turnover Entry</button>
      </div>
      
      <div className="turnover-list">
        {turnovers.length === 0 ? (
          <div className="no-data">No turnover data found</div>
        ) : (
          turnovers.map(turnover => (
            <div key={turnover.id} className="turnover-card">
              <div className="turnover-info">
                <h4>FY {turnover.financialYear} - {turnover.turnoverType}</h4>
                <p className="period">
                  {turnover.turnoverType === 'MONTHLY' ? `Month: ${turnover.month}` : 
                   turnover.turnoverType === 'QUARTERLY' ? `Quarter: ${turnover.quarter}` : 
                   'Yearly'}
                </p>
                <div className="financial-details">
                  <div className="revenue">
                    <span className="label">Revenue:</span>
                    <span className="value">₹{turnover.revenue?.toLocaleString()}</span>
                  </div>
                  <div className="expenses">
                    <span className="label">Expenses:</span>
                    <span className="value">₹{turnover.expenses?.toLocaleString()}</span>
                  </div>
                  <div className="profit-loss">
                    <span className="label">
                      {turnover.profit > 0 ? 'Profit:' : 'Loss:'}
                    </span>
                    <span className={`value ${turnover.profit > 0 ? 'profit' : 'loss'}`}>
                      ₹{Math.abs(turnover.profit || turnover.loss || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="turnover-actions">
                <button className="btn btn-secondary btn-sm">Edit</button>
                <button className="btn btn-danger btn-sm">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOTurnover;
