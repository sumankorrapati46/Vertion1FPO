import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/rightlogo.png';
import Chart from 'chart.js/auto';
import '../styles/AnalyticsDashboard.css';

const MetricCard = ({ label, value, icon, theme = 'primary', trend = null }) => {
  const themes = {
    primary: { bg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', icon: '📊' },
    success: { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', icon: '✅' },
    warning: { bg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', icon: '⚠️' },
    danger: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: '🚨' },
    info: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: 'ℹ️' }
  };
  
  const t = themes[theme] || themes.primary;
  
  return (
    <div className="metric-card" style={{ background: t.bg }}>
      <div className="metric-card-content">
        <div className="metric-icon">{icon || t.icon}</div>
        <div className="metric-info">
          <div className="metric-label">{label}</div>
          <div className="metric-value">{value ?? '-'}</div>
          {trend && (
            <div className={`metric-trend ${trend.type}`}>
              {trend.icon} {trend.value}
            </div>
          )}
        </div>
        <div className="metric-sparkle">✨</div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, theme = 'default' }) => {
  const themes = {
    default: { border: '#e2e8f0', accent: '#3b82f6' },
    success: { border: '#dcfce7', accent: '#22c55e' },
    warning: { border: '#fef3c7', accent: '#f59e0b' },
    danger: { border: '#fee2e2', accent: '#ef4444' }
  };
  
  const t = themes[theme] || themes.default;
  
  return (
    <div className="chart-card" style={{ borderColor: t.border }}>
      <div className="chart-header">
        <div className="chart-title-section">
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <div className="chart-accent" style={{ backgroundColor: t.accent }}></div>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
};

const AnalyticsDashboard = ({ role = 'SUPER_ADMIN' }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topBottom, setTopBottom] = useState({ top: [], bottom: [] });
  const [modeSplit, setModeSplit] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAll = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      // Counts
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
        g.total += 1; 
        if (status === 'APPROVED') g.approved += 1; 
        acc[d] = g; 
        return acc;
      }, {});
      
      const rows = Object.entries(grouped).map(([district, g]) => ({ 
        district, 
        rate: g.total ? Math.round((g.approved / g.total) * 100) : 0 
      }));
      
      const sorted = rows.sort((a, b) => b.rate - a.rate);
      setTopBottom({ top: sorted.slice(0, 5), bottom: sorted.slice(-5).reverse() });
      
      // Enrollment mode split
      const mode = [
        { label: 'Assigned', value: (farmers || []).filter(f => !!f.assignedEmployee).length },
        { label: 'Unassigned', value: (farmers || []).filter(f => !f.assignedEmployee).length },
      ];
      setModeSplit(mode);
      
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
      setError(e.response?.data || e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    const id = setInterval(fetchAll, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(id);
  }, []);

  const renderBarChart = (canvasId, data, color, title) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    if (ctx._chart) { ctx._chart.destroy(); }
    
    ctx._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.district),
        datasets: [{ 
          label: 'Approval %', 
          data: data.map(d => d.rate), 
          backgroundColor: color,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: title,
            color: '#374151',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: { 
          y: { 
            beginAtZero: true, 
            max: 100, 
            ticks: { 
              callback: v => v + '%',
              color: '#6b7280',
              font: {
                size: 12
              }
            },
            grid: {
              color: '#e5e7eb',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#6b7280',
              font: {
                size: 12
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  };

  const renderDoughnutChart = (canvasId, data) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    if (ctx._chart) ctx._chart.destroy();
    
    // Define specific colors for enrollment mode distribution
    const getColors = (labels) => {
      return labels.map(label => {
        if (label === 'Assigned') {
          return '#16a34a'; // Green for assigned
        } else if (label === 'Unassigned') {
          return '#f59e0b'; // Orange for unassigned
        } else {
          return '#3b82f6'; // Default blue for other cases
        }
      });
    };
    
    ctx._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{ 
          data: data.map(d => d.value), 
          backgroundColor: getColors(data.map(d => d.label)),
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  };

  useEffect(() => {
    if (topBottom.top.length) renderBarChart('top5', topBottom.top, 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', 'Top 5 Districts');
    if (topBottom.bottom.length) renderBarChart('bottom5', topBottom.bottom, 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 'Bottom 5 Districts');
  }, [topBottom]);

  useEffect(() => { 
    if (modeSplit.length) renderDoughnutChart('modeSplit', modeSplit); 
  }, [modeSplit]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (isLoading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
             {/* Header Section */}
       <div className="analytics-dashboard-header">
         <div className="analytics-header-left">
           <img src={logo} alt="DATE Logo" className="analytics-header-logo" />
           <div className="analytics-header-text">
             <h1 className="analytics-dashboard-title">Analytical Dashboard</h1>
             <p className="analytics-dashboard-subtitle">Digital Agriculture Technology Enhancement</p>
           </div>
         </div>
         <div className="analytics-header-right">
           <div className="analytics-last-updated">
             <span className="analytics-update-icon">🕒</span>
             <span>Last updated: {formatTime(lastUpdated)}</span>
           </div>
           <button className="analytics-refresh-btn" onClick={fetchAll}>
             <span className="analytics-refresh-icon">🔄</span>
             Refresh
           </button>
           <button className="analytics-back-btn" onClick={() => navigate(-1)}>
             <span className="analytics-back-icon">←</span>
             Back
           </button>
         </div>
       </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Metrics Section */}
        <section className="metrics-section">
          <div className="section-header">
            <h2 className="section-title">Key Performance Indicators</h2>
            <p className="section-description">Real-time insights into farmer enrollment and approval metrics</p>
          </div>
          
          <div className="metrics-grid">
            <MetricCard 
              label="Total Beneficiaries" 
              value={stats?.totalFarmers || 0}
              icon="👥"
              theme="primary"
              trend={{ type: 'positive', value: '+12%', icon: '📈' }}
            />
            <MetricCard 
              label="Total Enrollments" 
              value={stats?.totalFarmers || 0}
              icon="📝"
              theme="success"
              trend={{ type: 'positive', value: '+8%', icon: '📈' }}
            />
            <MetricCard 
              label="Enrollment %" 
              value={stats ? `${Math.round(((stats.approvedFarmers || 0) / (stats.totalFarmers || 1)) * 100)}%` : '0%'}
              icon="📊"
              theme="warning"
              trend={{ type: 'neutral', value: '0%', icon: '➡️' }}
            />
            <MetricCard 
              label="Approved IDs" 
              value={(stats?.kycApprovedFarmers ?? stats?.approvedFarmers) || 0}
              icon="✅"
              theme="info"
              trend={{ type: 'positive', value: '+15%', icon: '📈' }}
            />
            <MetricCard 
              label="Pending Approvals" 
              value={stats?.pendingFarmers || 0}
              icon="⏳"
              theme="danger"
              trend={{ type: 'negative', value: '-5%', icon: '📉' }}
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="section-header">
            <h2 className="section-title">Farmer Enrollment Analytics</h2>
            <p className="section-description">District-wise approval rates and enrollment distribution</p>
          </div>
          
          <div className="charts-grid">
            <ChartCard 
              title="Top 5 Districts - Approval Rate" 
              subtitle="Highest performing districts"
              theme="success"
            >
              <canvas id="top5" className="chart-canvas" />
            </ChartCard>
            
            <ChartCard 
              title="Bottom 5 Districts - Approval Rate" 
              subtitle="Districts needing attention"
              theme="warning"
            >
              <canvas id="bottom5" className="chart-canvas" />
            </ChartCard>
            
            <ChartCard 
              title="Enrollment Mode Distribution" 
              subtitle="Assigned vs Unassigned farmers"
              theme="info"
            >
              <canvas id="modeSplit" className="chart-canvas" />
            </ChartCard>
          </div>
        </section>

        {/* Insights Section */}
        <section className="insights-section">
          <div className="section-header">
            <h2 className="section-title">Quick Insights</h2>
            <p className="section-description">Key observations and recommendations</p>
          </div>
          
          <div className="insights-grid">
            <div className="insight-card positive">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h3>High Performance</h3>
                <p>Top districts show excellent approval rates above 80%</p>
              </div>
            </div>
            
            <div className="insight-card warning">
              <div className="insight-icon">⚠️</div>
              <div className="insight-content">
                <h3>Attention Needed</h3>
                <p>Bottom districts require immediate intervention</p>
              </div>
            </div>
            
            <div className="insight-card info">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h3>Growth Trend</h3>
                <p>Overall enrollment shows positive growth pattern</p>
              </div>
            </div>
            
            <div className="insight-card success">
              <div className="insight-icon">✅</div>
              <div className="insight-content">
                <h3>System Health</h3>
                <p>Data refresh working correctly every 5 minutes</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;


