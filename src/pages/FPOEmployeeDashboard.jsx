import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fpoAPI, farmersAPI, kycAPI } from '../api/apiService';
import '../styles/Dashboard.css';
import FarmerRegistrationForm from '../components/FarmerRegistrationForm';
import KYCModal from '../components/KYCModal';
import ActionDropdown from '../components/ActionDropdown';
import UserProfileDropdown from '../components/UserProfileDropdown';

const FPOEmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fpo, setFpo] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [view, setView] = useState('farmers'); // only farmers in FPO employee dashboard
  const [showCreateFarmer, setShowCreateFarmer] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showFarmerView, setShowFarmerView] = useState(false);
  const [farmerViewData, setFarmerViewData] = useState(null);
  const [tab, setTab] = useState('pending'); // pending | approved | all
  const [search, setSearch] = useState('');

  const employeeFpoId = user?.fpoId || user?.assignedFpoId || user?.fpo?.id || user?.fpo?.fpoId;
  
  // Debug logging to ensure FPO ID consistency
  console.log('FPOEmployeeDashboard - User FPO ID:', user?.fpoId);
  console.log('FPOEmployeeDashboard - Resolved FPO ID:', employeeFpoId);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (employeeFpoId) {
          const info = await fpoAPI.getFPOById(employeeFpoId);
          setFpo(info);
        }
        // Load FPO members and enrich with farmer details
        const members = await fpoAPI.getFPOMembers(employeeFpoId);
        const base = (members || []).map((m, idx) => ({
          id: m.id || idx + 1,
          memberId: m.id,
          farmerId: m.farmerId,
          name: m.farmerName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
          phone: '-',
          email: '-',
          kycStatus: (m.status || 'PENDING').toUpperCase(),
          raw: m
        }));
        const enriched = await Promise.all(base.map(async (row) => {
          if (!row.farmerId) return row;
          try {
            // Use dashboard endpoint to get KYC status
            const dashboardData = await farmersAPI.getFarmerDashboard(row.farmerId);
            return {
              ...row,
              name: dashboardData?.firstName ? `${dashboardData.firstName} ${dashboardData.lastName || ''}`.trim() : (row.name || '-'),
              phone: dashboardData?.contactNumber || row.phone,
              email: dashboardData?.email || row.email,
              kycStatus: (dashboardData?.kycStatus || row.kycStatus || 'PENDING').toUpperCase(),
            };
          } catch {
            return row;
          }
        }));
        setFarmers(enriched);

        // Note: FPO employee dashboard intentionally does not show Employees list
      } catch (e) {
        console.error(e);
        setError('Failed to load FPO employee dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [employeeFpoId]);


  // Auto-refresh farmers data every 30 seconds to keep in sync with FPO Admin
  useEffect(() => {
    if (employeeFpoId) {
      const interval = setInterval(() => {
        // Reload farmers data
        const loadFarmers = async () => {
          try {
            const members = await fpoAPI.getFPOMembers(employeeFpoId);
            const base = (members || []).map((m, idx) => ({
              id: m.id || idx + 1,
              memberId: m.id,
              farmerId: m.farmerId,
              name: m.farmerName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
              phone: '-',
              email: '-',
              kycStatus: (m.status || 'PENDING').toUpperCase(),
              raw: m
            }));
            const enriched = await Promise.all(base.map(async (row) => {
              if (!row.farmerId) return row;
              try {
                // Use dashboard endpoint to get KYC status
                const dashboardData = await farmersAPI.getFarmerDashboard(row.farmerId);
                return {
                  ...row,
                  name: dashboardData?.firstName ? `${dashboardData.firstName} ${dashboardData.lastName || ''}`.trim() : (row.name || '-'),
                  phone: dashboardData?.contactNumber || row.phone,
                  email: dashboardData?.email || row.email,
                  kycStatus: (dashboardData?.kycStatus || row.kycStatus || 'PENDING').toUpperCase(),
                };
              } catch {
                return row;
              }
            }));
            setFarmers(enriched);
          } catch (e) {
            console.error('Auto-refresh failed:', e);
          }
        };
        loadFarmers();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [employeeFpoId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return farmers.filter(f => {
      const byTab = tab === 'all' ? true : tab === 'pending' ? (f.kycStatus !== 'APPROVED') : (f.kycStatus === 'APPROVED');
      if (!byTab) return false;
      if (!q) return true;
      return (f.name || '').toLowerCase().includes(q) || (f.phone || '').toLowerCase().includes(q) || (f.email || '').toLowerCase().includes(q);
    });
  }, [farmers, tab, search]);

  const stats = useMemo(() => {
    const total = farmers.length;
    const approved = farmers.filter(f => f.kycStatus === 'APPROVED').length;
    const pending = total - approved;
    return { total, approved, pending };
  }, [farmers]);

  const approveKyc = async (farmer) => {
    try {
      await fpoAPI.approveKyc(farmer.id);
      setFarmers(prev => prev.map(x => x.id === farmer.id ? { ...x, kycStatus: 'APPROVED' } : x));
    } catch (e) {
      console.error('KYC approval error:', e);
      alert('Failed to approve KYC: ' + (e.response?.data?.message || e.message));
    }
  };

  const rejectKyc = async (farmer) => {
    try {
      await fpoAPI.rejectKyc(farmer.id, { reason: 'Rejected by FPO employee' });
      setFarmers(prev => prev.map(x => x.id === farmer.id ? { ...x, kycStatus: 'REJECTED' } : x));
    } catch (e) {
      console.error('KYC rejection error:', e);
      alert('Failed to reject KYC: ' + (e.response?.data?.message || e.message));
    }
  };


  if (loading) return <div className="admin-loading"><div className="spinner" /><span>Loading FPO Employee Dashboard…</span></div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <h1 className="logo-title">DATE</h1>
            <p className="logo-subtitle">Digital Agristack</p>
          </div>
        </div>
        <div className="header-right">
          <UserProfileDropdown user={user} onLogout={logout} />
        </div>
      </div>

      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-welcome">Welcome!!!</h2>
          <div className="sidebar-role">FPO Employee</div>
        </div>
        <div className="sidebar-nav">
          <div className={`nav-item ${view === 'farmers' ? 'active' : ''}`} onClick={() => setView('farmers')}>
            <i className="fas fa-users" />
            <span>Farmers</span>
          </div>
          <div className={`nav-item ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
            <i className="fas fa-user-clock" />
            <span>Pending KYC</span>
          </div>
          <div className={`nav-item ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>
            <i className="fas fa-user-check" />
            <span>Approved</span>
          </div>
          <div className={`nav-item ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
            <i className="fas fa-users" />
            <span>All Farmers</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="welcome-section">
          <h1 className="welcome-title">{fpo?.fpoName || 'FPO'} — Employee</h1>
          <p className="welcome-subtitle">Manage KYC for farmers under this FPO.</p>
        </div>

        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon"><i className="fas fa-users" /></div>
            <div className="stats-content">
              <div className="stats-value">{stats.total}</div>
              <div className="stats-label">Total Farmers</div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon"><i className="fas fa-user-check" /></div>
            <div className="stats-content">
              <div className="stats-value">{stats.approved}</div>
              <div className="stats-label">KYC Approved</div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon"><i className="fas fa-user-clock" /></div>
            <div className="stats-content">
              <div className="stats-value">{stats.pending}</div>
              <div className="stats-label">Pending KYC</div>
            </div>
          </div>
        </div>

        {view === 'farmers' && (
        <section className="panel" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Farmers</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search name/phone/email" style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
              <button className="btn" onClick={() => setSearch('')}>Clear</button>
              <button className="btn primary" onClick={() => setShowCreateFarmer(true)}>Add Farmer</button>
            </div>
          </div>
          <table className="fpo-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>KYC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.name}</td>
                  <td>{f.phone}</td>
                  <td>{f.email}</td>
                  <td>{f.kycStatus}</td>
                  <td>
                    <ActionDropdown
                      item={f}
                      customActions={[
                        {
                          label: 'View',
                          className: 'info',
                          onClick: async (farmer) => {
                            try {
                              const dto = await farmersAPI.getFarmerById(farmer.farmerId || farmer.id);
                              setFarmerViewData(dto);
                              setShowFarmerView(true);
                            } catch (e) {
                              alert('Failed to load farmer details');
                            }
                          }
                        },
                        ...(f.kycStatus !== 'APPROVED' ? [
                          {
                            label: 'Review & Approve',
                            className: 'success',
                            onClick: (farmer) => {
                              setSelectedFarmer(farmer);
                              setShowKycModal(true);
                            }
                          },
                          {
                            label: 'Reject KYC',
                            className: 'danger',
                            onClick: async (farmer) => {
                              await rejectKyc(farmer);
                            }
                          }
                        ] : [])
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No farmers</td></tr>
              )}
            </tbody>
          </table>
        </section>
        )}

        {showCreateFarmer && (
          <div className="form-modal-overlay">
            <div className="form-modal-content" style={{ width: '90%', maxWidth: 1100 }}>
              <div className="form-modal-header">
                <h3>Create Farmer</h3>
                <button className="close-btn" onClick={() => setShowCreateFarmer(false)}>×</button>
              </div>
              <div className="form-modal-body">
                <FarmerRegistrationForm 
                  isInDashboard
                  onClose={() => setShowCreateFarmer(false)}
                  onSubmit={async (formData) => {
                    setShowCreateFarmer(false);
                    // reload farmers after slight delay
                    setTimeout(async () => {
                      try {
                        // Use FPO-specific farmer creation API to ensure farmer is linked to this FPO
                        const created = await fpoAPI.createFPOFarmer(employeeFpoId, formData);
                        // Assign farmer to this employee so KYC approve endpoint authorizes
                        try {
                          const me = user?.email;
                          // Use admin endpoint to assign by ids if available
                          const employeeId = user?.id || user?.employeeId;
                          if (employeeId && (created?.id || created?.farmerId)) {
                            // Fallback assignment via admin endpoint
                            await (await import('../api/apiService')).adminAPI?.assignFarmerToEmployee?.(created.id || created.farmerId, employeeId);
                          }
                        } catch (assignErr) { console.warn('Assignment skipped', assignErr); }
                        // Link farmer as FPO member so it appears in this dashboard
                        try {
                          await fpoAPI.addMemberToFPO(employeeFpoId, { memberType: 'FARMER', farmerId: created?.id || created?.farmerId || created?.farmer?.id });
                        } catch (linkErr) {
                          console.warn('Failed to link farmer as FPO member', linkErr);
                        }
                        const members = await fpoAPI.getFPOMembers(employeeFpoId);
                        const base = (members || []).map((m, idx) => ({
                          id: m.id || idx + 1,
                          memberId: m.id,
                          farmerId: m.farmerId,
                          name: m.farmerName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
                          phone: '-',
                          email: '-',
                          kycStatus: (m.status || 'PENDING').toUpperCase(),
                          raw: m
                        }));
                        const enriched = await Promise.all(base.map(async (row) => {
                          if (!row.farmerId) return row;
                          try {
                            const dto = await farmersAPI.getFarmerById(row.farmerId);
                            return {
                              ...row,
                              name: dto?.firstName ? `${dto.firstName} ${dto.lastName || ''}`.trim() : (row.name || '-'),
                              phone: dto?.contactNumber || row.phone,
                              email: dto?.email || row.email,
                              kycStatus: (dto?.status || row.kycStatus || 'PENDING').toUpperCase(),
                            };
                          } catch { return row; }
                        }));
                        setFarmers(enriched);
                      } catch {}
                    }, 500);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {showKycModal && selectedFarmer && (
          <KYCModal
            farmer={{
              id: selectedFarmer.farmerId || selectedFarmer.id,
              name: selectedFarmer.name,
              phone: selectedFarmer.phone,
              location: fpo?.district || '',
              kycStatus: selectedFarmer.kycStatus
            }}
            onClose={() => { setShowKycModal(false); setSelectedFarmer(null); }}
            onApprove={async (farmerId, docs) => {
              try {
                await fpoAPI.approveKyc(farmerId);
                setFarmers(prev => prev.map(x => (x.farmerId === farmerId || x.id === farmerId) ? { ...x, kycStatus: 'APPROVED' } : x));
              } catch (e) { 
                console.error('KYC approval error:', e);
                alert('Failed to approve: ' + (e.response?.data?.message || e.message)); 
              }
            }}
            onReject={async (farmerId, reason) => {
              try { 
                await fpoAPI.rejectKyc(farmerId, { reason }); 
                setFarmers(prev => prev.map(x => (x.farmerId === farmerId || x.id === farmerId) ? { ...x, kycStatus: 'REJECTED' } : x)); 
              } catch (e) { 
                console.error('KYC rejection error:', e);
                alert('Failed to reject: ' + (e.response?.data?.message || e.message)); 
              }
            }}
            onReferBack={async (farmerId, reason) => {
              try { 
                await fpoAPI.referBackKyc(farmerId, { reason }); 
              } catch (e) { 
                console.error('KYC refer-back error:', e);
                console.log('Refer-back not implemented'); 
              }
            }}
          />
        )}

        {showFarmerView && farmerViewData && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Farmer Details - {farmerViewData.firstName} {farmerViewData.lastName}</h2>
                <button className="modal-close" onClick={() => { setShowFarmerView(false); setFarmerViewData(null); }}>×</button>
              </div>
              <div className="modal-body">
                <div className="info-grid">
                  <div className="info-item"><label>Name:</label><span>{farmerViewData.firstName} {farmerViewData.lastName}</span></div>
                  <div className="info-item"><label>Phone:</label><span>{farmerViewData.contactNumber || '-'}</span></div>
                  <div className="info-item"><label>Email:</label><span>{farmerViewData.email || '-'}</span></div>
                  <div className="info-item"><label>Village:</label><span>{farmerViewData.village || '-'}</span></div>
                  <div className="info-item"><label>District:</label><span>{farmerViewData.district || '-'}</span></div>
                  <div className="info-item"><label>State:</label><span>{farmerViewData.state || '-'}</span></div>
                  <div className="info-item"><label>Status:</label><span>{farmerViewData.status || '-'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employees section intentionally removed for FPO Employee dashboard */}
      </div>
    </div>
  );
};

export default FPOEmployeeDashboard;


