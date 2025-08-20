import React, { useEffect, useState } from 'react';
import { adminAPI, superAdminAPI } from '../api/apiService';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/rightlogo.png';
import Chart from 'chart.js/auto';

const Metric = ({ label, value, theme = 'green' }) => {
  const themes = {
    green: { bg: 'linear-gradient(135deg, #34d399, #10b981)', text: '#0b3b2e' },
    blue: { bg: 'linear-gradient(135deg, #93c5fd, #3b82f6)', text: '#0b2447' },
    purple: { bg: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', text: '#2e1065' },
    yellow: { bg: 'linear-gradient(135deg, #fde68a, #f59e0b)', text: '#78350f' },
    pink: { bg: 'linear-gradient(135deg, #fbcfe8, #ec4899)', text: '#831843' }
  };
  const t = themes[theme] || themes.green;
  return (
  <div style={{
    background: t.bg, borderRadius: 16, padding: 16, boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180, color: '#fff'
  }}>
    <div style={{ opacity: 0.9, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
    <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{value ?? '-'}</div>
  </div>
  );
};

const AnalyticsDashboard = ({ role = 'SUPER_ADMIN' }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topBottom, setTopBottom] = useState({ top: [], bottom: [] });
  const [modeSplit, setModeSplit] = useState([]);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      setError('');
      // Counts
      // Use public endpoints for anonymous dashboard
      const countsResp = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:8080/api') + '/public/dashboard/stats', { credentials: 'omit' });
      if (!countsResp.ok) throw new Error('Failed to fetch public stats: ' + countsResp.status);
      const counts = await countsResp.json();
      setStats(counts);
      // Build top/bottom district data from public farmers-with-kyc
      const farmersResp = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:8080/api') + '/public/farmers-with-kyc', { credentials: 'omit' });
      if (!farmersResp.ok) throw new Error('Failed to fetch public farmers: ' + farmersResp.status);
      const farmers = await farmersResp.json();
      const grouped = (farmers || []).reduce((acc, f) => {
        const d = f.district || 'Unknown';
        const status = (f.kycStatus || '').toUpperCase();
        const g = acc[d] || { total: 0, approved: 0 };
        g.total += 1; if (status === 'APPROVED') g.approved += 1; acc[d] = g; return acc;
      }, {});
      const rows = Object.entries(grouped).map(([district, g]) => ({ district, rate: g.total ? Math.round((g.approved / g.total) * 100) : 0 }));
      const sorted = rows.sort((a, b) => b.rate - a.rate);
      setTopBottom({ top: sorted.slice(0, 5), bottom: sorted.slice(-5).reverse() });
      // Enrollment mode split (mock from available data: assigned/not assigned)
      const mode = [
        { label: 'Assigned', value: (farmers || []).filter(f => !!f.assignedEmployee).length },
        { label: 'Unassigned', value: (farmers || []).filter(f => !f.assignedEmployee).length },
      ];
      setModeSplit(mode);
    } catch (e) {
      console.error(e);
      setError(e.response?.data || e.message);
    }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    const id = setInterval(fetchAll, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(id);
  }, []);

  const renderBar = (canvasId, data, color) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    // destroy existing
    if (ctx._chart) { ctx._chart.destroy(); }
    ctx._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.district),
        datasets: [{ label: 'Approval %', data: data.map(d => d.rate), backgroundColor: color }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } }
      }
    });
  };

  const renderPie = (canvasId, data) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (ctx._chart) ctx._chart.destroy();
    ctx._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{ data: data.map(d => d.value), backgroundColor: ['#22c55e', '#fbbf24', '#60a5fa', '#ef4444', '#a78bfa'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  };

  useEffect(() => {
    if (topBottom.top.length) renderBar('top5', topBottom.top, '#16a34a');
    if (topBottom.bottom.length) renderBar('bottom5', topBottom.bottom, '#dc2626');
  }, [topBottom]);

  useEffect(() => { if (modeSplit.length) renderPie('modeSplit', modeSplit); }, [modeSplit]);

  return (
    <div style={{ padding: 20, background: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="DATE Logo" style={{ height: 36 }} />
          <h2 style={{ margin: 0, color: '#111827' }}>Analytical Dashboard</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={fetchAll}
            style={{ padding: '8px 12px', background: '#10b981', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
          >Refresh</button>
          <button
            onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/login'); }}
            style={{ padding: '8px 12px', background: '#374151', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
          >Back</button>
        </div>
      </div>
      <div style={{ color: '#6b7280', marginBottom: 8 }}>Note: Data refreshes every 5 minutes.</div>
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 8, borderRadius: 8, marginBottom: 12 }}>{error}</div>}

      {/* Full-width line below header */}
      <div style={{ 
        height: '2px', 
        background: 'linear-gradient(90deg, #e5e7eb, #d1d5db, #e5e7eb)', 
        margin: '20px 0', 
        borderRadius: '1px' 
      }}></div>

      {/* Section: General Counts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
        <div style={{ padding: '8px 12px', background: '#ecfdf5', color: '#065f46', borderRadius: 8, fontWeight: 600 }}>General Counts</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <Metric theme="blue" label="Total Beneficiaries" value={stats?.totalFarmers} />
        <Metric theme="purple" label="Total Enrollments" value={stats?.totalFarmers} />
        <Metric theme="yellow" label="Enrollment %" value={stats ? `${Math.round(((stats.approvedFarmers || 0) / (stats.totalFarmers || 1)) * 100)}%` : '-'} />
        <Metric theme="green" label="Approved IDs" value={stats?.kycApprovedFarmers ?? stats?.approvedFarmers} />
        <Metric theme="pink" label="Pending Approvals" value={stats?.pendingFarmers} />
      </div>

      {/* Section: Farmer Enrollment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 8px' }}>
        <div style={{ padding: '8px 12px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 8, fontWeight: 600 }}>Farmer Enrollment</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, height: 320 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Farmer Enrollment Approval – Top 5 Districts</div>
          <canvas id="top5" style={{ width: '100%', height: '260px' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, height: 320 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Farmer Enrollment Approval – Bottom 5 Districts</div>
          <canvas id="bottom5" style={{ width: '100%', height: '260px' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, height: 320, gridColumn: 'span 2' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Enrollment Mode Split</div>
          <canvas id="modeSplit" style={{ width: '100%', height: '260px' }} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;


