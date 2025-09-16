import React, { useEffect, useState } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOInputShops = ({ fpoId }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fpoAPI.getFPOInputShops(fpoId);
        const data = res?.data || res || [];
        setShops(Array.isArray(data) ? data : []);
      } catch (e) {
        setError('Failed to load input shops');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fpoId]);

  if (loading) return <div className="loading">Loading input shops...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="fpo-input-shops">
      <div className="products-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {shops.length === 0 ? (
          <div className="no-data">No input shops</div>
        ) : (
          shops.map((s, idx) => (
            <div key={s.id || idx} className="item-card">
              <h4 style={{ marginTop: 0 }}>{s.shopName || '—'}</h4>
              <p style={{ margin: '8px 0 0 0' }}>Seed: {s.seedLicense || '—'}</p>
              <p style={{ margin: '8px 0 0 0' }}>Pesticide: {s.pesticideLicense || '—'}</p>
              <p style={{ margin: '8px 0 0 0' }}>Fertilizer: {s.fertiliserLicense || s.fertilizerLicense || '—'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOInputShops;


