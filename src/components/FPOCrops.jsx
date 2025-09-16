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
      const data = response?.data || response?.content || response || [];
      setCrops(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load crops';
      setError(msg);
      console.error('Error loading crops:', err?.response || err);
    } finally {
      setLoading(false);
    }
  };

  const formatCropYear = (crop) => {
    // Direct display fields
    const display = crop.financialYearDisplay || crop.cropYearDisplay || crop.yearDisplay || crop.yearRange || crop.fyLabel;
    if (display) return display;

    // If year is already a string like "2024-2025"
    const stringish = crop.financialYear || crop.cropYear || crop.year;
    if (typeof stringish === 'string') {
      const trimmed = stringish.trim();
      if (/\d{4}\s*-\s*\d{4}/.test(trimmed)) return trimmed.replace(/\s*/g, '').replace('-', '-');
      const asNum = Number(trimmed);
      if (!Number.isNaN(asNum) && asNum > 0) return `${asNum}-${asNum + 1}`;
    }

    // Start/end numeric forms with many possible keys
    const start = [
      crop.financialYear, crop.year, crop.cropYear, crop.cropYearStart, crop.yearStart, crop.startYear, crop.fyStart
    ].map((v) => (typeof v === 'string' ? Number(v) : v)).find((v) => typeof v === 'number' && !Number.isNaN(v));

    const end = [
      crop.financialYearEnd, crop.yearEnd, crop.cropYearEnd, crop.endYear, crop.fyEnd
    ].map((v) => (typeof v === 'string' ? Number(v) : v)).find((v) => typeof v === 'number' && !Number.isNaN(v));

    if (typeof start === 'number') {
      return `${start}-${typeof end === 'number' ? end : start + 1}`;
    }

    return '-';
  };

  if (loading) {
    return <div className="loading">Loading crops...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="fpo-crops">
      <div className="table-container">
        <table className="turnover-table">
          <thead>
            <tr>
              <th>Crop Year</th>
              <th>Crop Name</th>
              <th>Area (Acres)</th>
              <th>Production (MT)</th>
            </tr>
          </thead>
          <tbody>
            {crops.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data-cell">No crops found</td>
              </tr>
            ) : (
              crops.map((crop, index) => (
                <tr key={crop.id || index}>
                  <td>{formatCropYear(crop)}</td>
                  <td>{crop.cropName || '-'}</td>
                  <td>{Number((crop.area ?? crop.areaInAcres ?? crop.acres ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{Number((crop.production ?? crop.productionInMetricTons ?? crop.productionMT ?? crop.productionInMT ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FPOCrops;
