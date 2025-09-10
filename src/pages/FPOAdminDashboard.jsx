import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fpoAPI } from '../api/apiService';
import '../styles/FPOAdminDashboard.css';
import UserProfileDropdown from '../components/UserProfileDropdown';

const FPOAdminDashboard = () => {
  const { fpoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fpo, setFpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview'); // overview | farmers | employees
  const [farmers, setFarmers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [farmerSearch, setFarmerSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fpoAPI.getFPOById(fpoId);
        setFpo(data);
      } catch (e) {
        setError('Failed to load FPO details');
      } finally {
        setLoading(false);
      }
    };
    if (fpoId) load();
  }, [fpoId]);

  // Lazy-load section data when switching views
  useEffect(() => {
    const loadFarmers = async () => {
      try {
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
        console.error(e);
        setFarmers([]);
      }
    };
    const loadEmployees = async () => {
      try {
        const all = await (await import('../api/apiService')).fpoUsersAPI.list(fpoId);
        const emps = (all || []).filter(u => (u.role || '').toUpperCase() === 'EMPLOYEE');
        setEmployees(emps);
      } catch (e) {
        console.error(e);
        setEmployees([]);
      }
    };
    if (view === 'farmers') loadFarmers();
    if (view === 'employees') loadEmployees();
  }, [view, fpoId]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <span>Loading FPO Admin Dashboard…</span>
      </div>
    );
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  const fpoName = fpo?.fpoName || fpo?.name || '—';
  const fpoCode = fpo?.fpoId || fpo?.id || '—';

  return (
    <div className="fpo-admin-layout">
      <aside className="fpo-admin-sidebar">
        <div className="brand">DATE CROP</div>
        <div className="section-label">navigation</div>
        <nav>
          <button className="nav-item active">Admin Dashboard</button>
        </nav>
        <div className="section-label">components</div>
        <nav>
          <button className={`nav-item ${view==='farmers' ? 'active' : ''}`} onClick={() => setView('farmers')}>Farmers</button>
          <button className={`nav-item ${view==='employees' ? 'active' : ''}`} onClick={() => setView('employees')}>Employees</button>
          <button className="nav-item" onClick={() => navigate(`/fpo/dashboard/${fpoId}`)}>FPO</button>
        </nav>
      </aside>

      <main className="fpo-admin-main">
        <header className="fpo-admin-topbar">
          <div className="title">
            <h1>FPO Admin Dashboard</h1>
            <div className="subtitle">
              <span className="muted">Selected FPO:</span> <strong>{fpoName}</strong>
              <span className="divider">•</span>
              <span className="muted">FPO ID:</span> <strong>{fpoCode}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="btn ghost" onClick={() => navigate(`/fpo/dashboard/${fpoId}`)}>Open FPO Dashboard</button>
            <UserProfileDropdown variant="compact" />
          </div>
        </header>

        {view === 'overview' && (
        <section className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-title">Farmers</div>
            <div className="stat-value">0</div>
            <div className="stat-sub">0% Increase</div>
          </div>
          <div className="stat-card teal">
            <div className="stat-title">Employees</div>
            <div className="stat-value">0</div>
            <div className="stat-sub">0% Increase</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-title">FPO</div>
            <div className="stat-value">1</div>
            <div className="stat-sub">Active</div>
          </div>
        </section>
        )}

        {view === 'overview' && (
        <section className="cards-grid">
          <div className="panel">
            <div className="panel-header">
              <h2>Manage Farmers</h2>
            </div>
            <p className="panel-desc">Add and manage farmers belonging to this FPO only.</p>
            <div className="panel-actions">
              <button className="btn primary" onClick={() => navigate(`/register-farmer`, { state: { role: 'FARMER', fpoId } })}>Add Farmer</button>
              <button className="btn" onClick={() => setView('farmers')}>View Farmers</button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Manage Employees</h2>
            </div>
            <p className="panel-desc">Create and manage employees scoped to this FPO.</p>
            <div className="panel-actions">
              <button className="btn primary" onClick={() => navigate(`/register-employee`, { state: { role: 'EMPLOYEE', fpoId } })}>Add Employee</button>
              <button className="btn" onClick={() => setView('employees')}>View Employees</button>
            </div>
          </div>
        </section>
        )}

        {view === 'farmers' && (
          <section className="panel" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ marginTop: 0 }}>Farmers</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={farmerSearch}
                  onChange={(e) => setFarmerSearch(e.target.value)}
                  placeholder="Search name, phone or email"
                  className="input"
                  style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <button className="btn" onClick={() => setView('overview') || setTimeout(() => setView('farmers'), 0)}>Refresh</button>
                <button className="btn primary" onClick={() => navigate(`/register-farmer`, { state: { role: 'FARMER', fpoId } })}>Add Farmer</button>
              </div>
            </div>
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
                {farmers.filter(f => {
                  const q = farmerSearch.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    (f.name || '').toLowerCase().includes(q) ||
                    (f.phoneNumber || '').toLowerCase().includes(q) ||
                    (f.email || '').toLowerCase().includes(q)
                  );
                }).map(f => (
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
          </section>
        )}

        {view === 'employees' && (
          <section className="panel" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ marginTop: 0 }}>Employees</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search name, phone or email"
                  className="input"
                  style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <button className="btn" onClick={() => setView('overview') || setTimeout(() => setView('employees'), 0)}>Refresh</button>
                <button className="btn primary" onClick={() => navigate(`/register-employee`, { state: { role: 'EMPLOYEE', fpoId } })}>Add Employee</button>
              </div>
            </div>
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
                {employees.filter(u => {
                  const q = employeeSearch.trim().toLowerCase();
                  if (!q) return true;
                  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                  return (
                    name.toLowerCase().includes(q) ||
                    (u.email || '').toLowerCase().includes(q) ||
                    (u.phoneNumber || '').toLowerCase().includes(q)
                  );
                }).map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>{u.phoneNumber}</td>
                    <td>{u.status}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={async () => {
                        try {
                          const { fpoUsersAPI } = await import('../api/apiService');
                          await fpoUsersAPI.toggleActive(fpoId, u.id, !(u.status === 'APPROVED'));
                          // refresh
                          setView('overview');
                          setTimeout(() => setView('employees'), 0);
                        } catch (e) {
                          alert('Failed to update status');
                        }
                      }}>{u.status === 'APPROVED' ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn" onClick={async () => {
                        const pwd = prompt('Enter new password for employee');
                        if (!pwd) return;
                        try {
                          const { fpoUsersAPI } = await import('../api/apiService');
                          await fpoUsersAPI.updatePassword(fpoId, u.id, pwd);
                          alert('Password updated');
                        } catch (e) { alert('Failed to update password'); }
                      }}>Edit Password</button>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No employees yet</td></tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default FPOAdminDashboard;


