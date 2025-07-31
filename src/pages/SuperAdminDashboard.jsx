import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import "../styles/Dashboard.css";
import logo2 from "../assets/rightlogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBuilding, faUsers } from "@fortawesome/free-solid-svg-icons";
import { RegistrationList, FarmerList, EmployeeList } from "../pages/List";
import ViewAllActivityModal from "../pages/ViewAllActivityModal";
import { AuthContext } from "../AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [farmerCount, setFarmerCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activeView, setActiveView] = useState("dashboard");
  const [farmerData, setFarmerData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [photoPreviewStep0, setPhotoPreviewStep0] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef();
  const { user } = useContext(AuthContext);

  // Debug logs for diagnosis
  const role = user?.role?.toUpperCase?.().trim?.() || '';
  console.log("Dashboard user:", user);
  console.log("Dashboard user role:", role);
  console.log("Active view:", activeView);

  const handleToggle = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const farmerRes = await axios.get("http://localhost:8080/api/dashboard/farmers", { headers });
        setFarmerCount(farmerRes.data.length);

        const employeeRes = await axios.get("http://localhost:8080/api/employees", { headers });
        setEmployeeCount(employeeRes.data.length);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/api/farmers/5", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setFarmerData(data))
      .catch((err) => console.error(err));
  }, []);

  // Always show dashboard overview by default for admin and superadmin
  useEffect(() => {
    if ((user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && activeView !== 'dashboard') {
      setActiveView('dashboard');
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setProfileMenuOpen((open) => !open);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleChangePassword = () => {
    window.location.href = "/change-password";
  };

  const handleSettings = () => {
    window.location.href = "/profile";
  };

  const handleGenerateReport = () => {
    alert("Report generation feature coming soon!");
  };

  const handleAnalytics = () => {
    navigate("/analytics");
  };

  return (
    <>
      <div className="dashboard-container">
        <header className="dash-bar">
          <img src={logo2} alt="DATE Logo" className="infologo-right" />
          {/* Only show the new profile dropdown at the top right */}
          <div className="profile-dropdown-wrapper" ref={profileRef}>
            <div className="profile-circle" onClick={handleProfileClick}>
              <span role="img" aria-label="User" style={{fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>👤</span>
            </div>
            {/* Show username next to the icon */}
            <span style={{ marginLeft: 8, fontWeight: 500, fontSize: '1rem', color: '#333' }}>
              {user?.userName || user?.name || user?.email || 'User'}
            </span>
            <span className="chevron-down" onClick={handleProfileClick}>▼</span>
            {profileMenuOpen && (
              <div className="profile-dropdown-menu">
                <button onClick={handleSettings}>Settings</button>
                <button onClick={handleChangePassword}>Change Password</button>
                <button onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </header>

        <div className="banner-image" />

        <div className="dashboard-grid">
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            <ul className="sidebar-menu">
              <li>
                <button className={`dash-link-button ${activeView === "dashboard" ? "active" : ""}`} onClick={() => setActiveView("dashboard")}>📊 Dashboard</button>
              </li>
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                <>
                  {/* Registration */}
                  <li onClick={() => handleToggle("registration")} className={`has-submenu ${openMenu === "registration" ? "open" : ""}`}>
                    📝 Registration
                    {openMenu === "registration" && (
                      <ul className="submenu">
                        <li>
                          <button className="link-button" onClick={() => setActiveView("registrationList")}>📄 View Registrations</button>
                        </li>
                      </ul>
                    )}
                  </li>
                  {/* Employees */}
                  <li onClick={() => handleToggle("employees")} className={`has-submenu ${openMenu === "employees" ? "open" : ""}`}>
                    👔 Employees
                    {openMenu === "employees" && (
                      <ul className="submenu">
                        <li><button className="link-button" onClick={() => setActiveView("employeesList")}>📋 View Employees</button></li>
                        <li><button className="link-button" onClick={() => navigate('/employee-details')}>➕ Add Employee</button></li>
                      </ul>
                    )}
                  </li>
                </>
              )}
              {/* Farmers always visible */}
              <li onClick={() => handleToggle("farmers")} className={`has-submenu ${openMenu === "farmers" ? "open" : ""}`}>
                👨‍🌾 Farmers
                {openMenu === "farmers" && (
                  <ul className="submenu">
                    <li><button className="link-button" onClick={() => setActiveView("farmersList")}>📋 View Farmers</button></li>
                    <li><button className="link-button" onClick={() => navigate('/farmer-form')}>➕ Add Farmer</button></li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
          {/* Main */}
          <div className="dashboard-main">
            {/* Role-based dashboard heading */}
            {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && activeView === "dashboard" && (
              <h1 style={{
                fontSize: '2.1rem',
                fontWeight: 700,
                color: user?.role === 'SUPER_ADMIN' ? '#2e7d32' : user?.role === 'ADMIN' ? '#1565c0' : '#6a1b9a',
                marginBottom: 0,
                marginTop: 30,
                letterSpacing: 1
              }}>
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin Dashboard' : user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Employee Dashboard'}
              </h1>
            )}
            {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && activeView === "dashboard" && (
              <>
                <div className="dashboard-filters">
                  <div className="dashboard-title-grid">
                    {/* Remove Dashboard Overview title, only show welcome message */}
                    <h3>Welcome back! Here's what's happening with your agricultural data.</h3>
                  </div>
                  <div className="filter-buttons">
                    <button className="refresh-button">🔔 Refresh</button>
                    <div className="filter-group">
                      <button className={selectedFilter === "Today" ? "active" : ""} onClick={() => setSelectedFilter("Today")}>Today</button>
                      <button className={selectedFilter === "This Month" ? "active" : ""} onClick={() => setSelectedFilter("This Month")}>This Month</button>
                      <button className={selectedFilter === "This Year" ? "active" : ""} onClick={() => setSelectedFilter("This Year")}>This Year</button>
                    </div>
                  </div>
                </div>
                <div className="card-wrapper-modern">
                  <div className="modern-card">
                    <div className="modern-icon green"><FontAwesomeIcon icon={faUsers} /></div>
                    <div className="modern-info">
                      <div className="modern-title">Farmers</div>
                      <div className="modern-count">{farmerCount}</div>
                      <div className="modern-change positive">+12.4%</div>
                    </div>
                  </div>
                  <div className="modern-card">
                    <div className="modern-icon blue"><FontAwesomeIcon icon={faUser} /></div>
                    <div className="modern-info">
                      <div className="modern-title">Employees</div>
                      <div className="modern-count">{employeeCount}</div>
                      <div className="modern-change negative">-3.0%</div>
                    </div>
                  </div>
                  <div className="modern-card">
                    <div className="modern-icon violet"><FontAwesomeIcon icon={faBuilding} /></div>
                    <div className="modern-info">
                      <div className="modern-title">FPO</div>
                      <div className="modern-count">0</div>
                      <div className="modern-change neutral">+0.0%</div>
                    </div>
                  </div>
                </div>
                <div className="dashboard-sections">
                  <div className="recent-activities">
                    <ul className="activity-list">
                      <li><h3> Recent Activities </h3><span className="view-all" onClick={() => setShowActivityModal(true)}>View All</span></li>
                      <li><span className="activity-dot green" /> Farmer profile updated:  <span className="activity-time">20m ago</span> <span className="activity-status success">success</span></li>
                      <li><span className="activity-dot red" /> Employee profile updated:  <span className="activity-time">10m ago</span> <span className="activity-status success">success</span></li>
                      <li><span className="activity-dot purple" /> New FPO application submitted <span className="activity-time">Just now</span> <span className="activity-status pending">pending</span></li>
                    </ul>
                  </div>
                  <div className="quick-actions">
                    <div className="section-title">Quick Actions</div>
                    <div className="action-grid" style={{ flexDirection: 'column', gap: '12px', maxHeight: 'none', overflow: 'visible' }}>
                      <button onClick={() => setActiveView('registrationList')}>👥 View Users</button>
                      <button onClick={() => setActiveView('farmersList')}>📋 View Farmers</button>
                      <button onClick={() => setActiveView('employeesList')}>📋 View Employees</button>
                      <button onClick={() => navigate('/employee-details')}>➕ Add Employee</button>
                      <button onClick={() => navigate('/farmer-form')}>➕ Add Farmer</button>
                      <button onClick={handleGenerateReport}>📊 Generate Report</button>
                      <button onClick={handleAnalytics}>📈 View Analytics</button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {user?.role === 'EMPLOYEE' && activeView === "dashboard" && (
              <>
                <div className="quick-actions">
                  <div className="section-title">Quick Actions</div>
                  <div className="action-grid">
                    <button onClick={() => setActiveView('farmersList')}>📋 View Farmers</button>
                    <button onClick={() => navigate('/farmer-form')}>👨‍🌾 Add New Farmer</button>
                    <button onClick={() => navigate('/farmer-list')}>✅ Approve Farmer</button>
                  </div>
                </div>
              </>
            )}
            {activeView === "registrationList" && (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && <RegistrationList />}
            {activeView === "farmersList" && <FarmerList />}
            {activeView === "employeesList" && (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && <EmployeeList />}
            <ViewAllActivityModal
              isOpen={showActivityModal}
              onClose={() => setShowActivityModal(false)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
