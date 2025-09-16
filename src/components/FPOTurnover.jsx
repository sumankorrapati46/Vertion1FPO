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
      <div className="turnover-list">
        {turnovers.length === 0 ? (
          <div className="no-data">No turnover data found</div>
        ) : (
          turnovers.map(turnover => (
            <div key={turnover.id} className="turnover-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div className="turnover-info">
                <h4 style={{ margin: 0 }}>{turnover.financialYear ? `${turnover.financialYear}-${(turnover.financialYear + 1)}` : ''} - {turnover.turnoverType || 'YEARLY'}</h4>
                <p className="period" style={{ margin: '6px 0 0 0', color: '#475569' }}>
                  {turnover.turnoverType === 'MONTHLY' ? `Month: ${turnover.month}` : 
                   turnover.turnoverType === 'QUARTERLY' ? `Quarter: ${turnover.quarter}` : 
                   'Yearly'}
                </p>
              </div>
              <span style={{ background: '#3b82f6', color: '#ffffff', padding: '6px 12px', borderRadius: 999, fontWeight: 700 }}>₹ {Number(turnover.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOTurnover;
