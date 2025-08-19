import React, { useEffect, useState } from 'react';
import { adminAPI, superAdminAPI } from '../api/apiService';
import Chart from 'chart.js/auto';

const Metric = ({ label, value }) => (
  <div style={{
    background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180
  }}>
    <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
    <div style={{ color: '#111827', fontSize: 24, fontWeight: 700 }}>{value ?? '-'}</div>
  </div>
);

const AnalyticsDashboard = ({ role = 'SUPER_ADMIN' }) => {
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
      <h2 style={{ margin: '8px 0 16px', color: '#111827' }}>Analytical Dashboard</h2>
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 8, borderRadius: 8, marginBottom: 12 }}>{error}</div>}

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <Metric label="Total Beneficiaries" value={stats?.totalFarmers} />
        <Metric label="Total Enrollments" value={stats?.totalFarmers} />
        <Metric label="Enrollment %" value={stats ? `${Math.round(((stats.approvedFarmers || 0) / (stats.totalFarmers || 1)) * 100)}%` : '-'} />
        <Metric label="Approved IDs" value={stats?.kycApprovedFarmers ?? stats?.approvedFarmers} />
        <Metric label="Pending Approvals" value={stats?.pendingFarmers} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, height: 320 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Top 5 Districts by Approval</div>
          <canvas id="top5" style={{ width: '100%', height: '260px' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, height: 320 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Bottom 5 Districts by Approval</div>
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


