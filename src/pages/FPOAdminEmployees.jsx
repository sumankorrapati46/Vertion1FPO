import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fpoUsersAPI } from '../api/apiService';
import '../styles/FPOAdminDashboard.css';

const FPOAdminEmployees = () => {
  const { fpoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const all = await fpoUsersAPI.list(fpoId);
      const employees = (all || []).filter(u => (u.role || '').toUpperCase() === 'EMPLOYEE');
      setUsers(employees);
    } catch (e) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (fpoId) load(); }, [fpoId]);

  const handleToggle = async (user) => {
    try {
      await fpoUsersAPI.toggleActive(fpoId, user.id, !(user.status === 'APPROVED'));
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleChangePassword = async (user) => {
    const pwd = prompt('Enter new password for employee');
    if (!pwd) return;
    try {
      await fpoUsersAPI.updatePassword(fpoId, user.id, pwd);
      alert('Password updated');
    } catch (e) {
      alert('Failed to update password');
    }
  };

  if (loading) return <div className="admin-loading"><div className="spinner"/><span>Loading Employees…</span></div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="fpo-admin-main" style={{ padding: 24 }}>
      <h2>Employees</h2>
      <div className="panel" style={{ marginTop: 12 }}>
        <table className="fpo-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.phoneNumber}</td>
                <td>{u.status}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={() => handleToggle(u)}>
                    {u.status === 'APPROVED' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn" onClick={() => handleChangePassword(u)}>Edit Password</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No employees yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FPOAdminEmployees;


