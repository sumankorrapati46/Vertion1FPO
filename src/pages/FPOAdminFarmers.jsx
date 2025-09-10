import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fpoAPI } from '../api/apiService';
import '../styles/FPOAdminDashboard.css';

// NOTE: Placeholder implementation – depends on backend endpoints to fetch farmers by FPO.
// If you already expose farmers by FPO, replace load logic with the real API.

const FPOAdminFarmers = () => {
  const { fpoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [farmers, setFarmers] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      // Try fetching members first; adapt once farmers-by-fpo is available
      const members = await fpoAPI.getFPOMembers(fpoId);
      const mapped = (members || []).map((m, idx) => ({
        id: m.id || idx + 1,
        name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        phoneNumber: m.phoneNumber || m.contactNumber,
        email: m.email || '-',
        status: m.status || 'ACTIVE'
      }));
      setFarmers(mapped);
    } catch (e) {
      setError('Failed to load farmers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (fpoId) load(); }, [fpoId]);

  if (loading) return <div className="admin-loading"><div className="spinner"/><span>Loading Farmers…</span></div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="fpo-admin-main" style={{ padding: 24 }}>
      <h2>Farmers</h2>
      <div className="panel" style={{ marginTop: 12 }}>
        <table className="fpo-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map(f => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.name}</td>
                <td>{f.phoneNumber}</td>
                <td>{f.email}</td>
                <td>{f.status}</td>
              </tr>
            ))}
            {farmers.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No farmers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FPOAdminFarmers;


