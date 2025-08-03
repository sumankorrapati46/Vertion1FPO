import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { authAPI } from '../api/apiService';
import logo from '../assets/rightlogo.png';
import '../styles/Login.css';

const generateCaptcha = () => {
  // Random captcha generation
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let captcha = '';
  for (let i = 0; i < 5; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('official'); // 'official', 'fpo', 'employee', 'farmer'
  const [captcha, setCaptcha] = useState('');
  const [captchaValue, setCaptchaValue] = useState(generateCaptcha());
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginType = (type) => {
    setLoginType(type);
    setError('');
    setCaptcha('');
    setCaptchaValue(generateCaptcha());
  };

  const handleRefreshCaptcha = () => {
    setCaptchaValue(generateCaptcha());
    setCaptcha('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (captcha.trim().toLowerCase() !== captchaValue.toLowerCase()) {
      setError('Captcha does not match.');
      setLoading(false);
      setCaptchaValue(generateCaptcha());
      setCaptcha('');
      return;
    }
    try {
      const loginData = { userName, password };
      const response = await authAPI.login(loginData);
      console.log('Login - Full login response:', response);
      console.log('Login - Login response data keys:', Object.keys(response || {}));
      const { token } = response;
      try {
        // Get user profile with token
        const userData = await authAPI.getProfile();
        console.log('Login - Profile response data:', userData);
        console.log('Login - Profile response data keys:', Object.keys(userData || {}));
        const user = {
          userName: userData.userName || userName,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          forcePasswordChange: userData.forcePasswordChange || false,
          status: userData.status
        };
        
        // For users with temporary passwords, force password change
        if (password.includes('Temp@')) {
          user.forcePasswordChange = true;
          console.log('Login - Detected temporary password, forcing password change');
        }
        
        console.log('Login - User data from profile:', user);
        console.log('Login - User role from profile:', userData.role);
        login(user, token);
        
        // Check if user needs to change password (first time login with temp password)
        console.log('Login - Checking forcePasswordChange:', user.forcePasswordChange);
        console.log('Login - Password contains Temp@:', password.includes('Temp@'));
        
        if (user.forcePasswordChange) {
          console.log('Login - Redirecting to change password page');
          navigate('/change-password');
          return;
        }
        
        // Role-based navigation after password change or normal login
        console.log('Login - User role for navigation:', user.role);
        console.log('Login - User role (normalized):', user.role?.toUpperCase?.()?.trim?.());
        console.log('Login - User role type:', typeof user.role);
        console.log('Login - User role length:', user.role?.length);
        console.log('Login - User role includes spaces:', user.role?.includes(' '));
        
        const normalizedRole = user.role?.toUpperCase?.()?.trim?.() || '';
        console.log('Login - Normalized role:', normalizedRole);
        console.log('Login - Normalized role === ADMIN:', normalizedRole === 'ADMIN');
        console.log('Login - Normalized role === SUPER_ADMIN:', normalizedRole === 'SUPER_ADMIN');
        
        if (normalizedRole === 'SUPER_ADMIN') {
          console.log('Login - Redirecting SUPER_ADMIN to /super-admin/dashboard');
          alert('SUPER_ADMIN detected - redirecting to /super-admin/dashboard');
          navigate('/super-admin/dashboard');
        } else if (normalizedRole === 'ADMIN') {
          console.log('Login - Redirecting ADMIN to /admin/dashboard');
          alert('ADMIN detected - redirecting to /admin/dashboard');
          navigate('/admin/dashboard');
        } else if (normalizedRole === 'EMPLOYEE') {
          console.log('Login - Redirecting EMPLOYEE to /employee/dashboard');
          alert('EMPLOYEE detected - redirecting to /employee/dashboard');
          navigate('/employee/dashboard');
        } else {
          console.log('Login - Redirecting FARMER to /dashboard');
          alert('FARMER detected - redirecting to /dashboard');
          navigate('/dashboard');
        }
      } catch (profileErr) {
        console.log('Profile fetch failed, trying alternative methods');
        console.log('Profile error:', profileErr);
        
        // Try to get role from login response first
        let role = response.data?.role;
        let forcePasswordChange = response.data?.forcePasswordChange || false;
        
        // For users with temporary passwords, force password change
        if (password.includes('Temp@')) {
          forcePasswordChange = true;
          console.log('Login - Detected temporary password, forcing password change');
        }
        
        // If role is not in login response, try to get it from the backend
        if (!role) {
          try {
            console.log('Login - Trying to get role from /auth/me endpoint');
            const meResponse = await authAPI.getProfile();
            console.log('Login - /auth/me response:', meResponse);
            role = meResponse?.role;
            console.log('Login - Role from /auth/me:', role);
          } catch (meErr) {
            console.log('Login - /auth/me failed:', meErr);
            
            // Try another common endpoint
            try {
              console.log('Login - Trying to get role from /api/auth/users/profile endpoint');
              const altProfileResponse = await authAPI.getProfile();
              console.log('Login - /api/auth/users/profile response:', altProfileResponse);
              role = altProfileResponse?.role;
              console.log('Login - Role from /api/auth/users/profile:', role);
            } catch (altErr) {
              console.log('Login - /api/auth/users/profile failed:', altErr);
            }
          }
        }
        
        // If still no role, try to determine from username or use a default
        if (!role) {
          console.log('Login - No role found, trying to determine from username');
          console.log('Login - Username being checked:', userName);
          // Check if username contains admin indicators
          const lowerUserName = userName.toLowerCase();
          
          // Specific username mapping for known accounts
          const superAdminUsernames = [
            'projecthinfintiy@12.in',
            'superadmin@hinfinity.in'
          ];
          
          const adminUsernames = [
            'karthik.m@hinfinity.in',
            'admin@hinfinity.in'
          ];
          
          const employeeUsernames = [
            'employee@hinfinity.in',
            'emp@hinfinity.in',
            'testemployee@hinfinity.in',
            'hari2912@gmail.com',
            'harish134@gmail.com',
            'employee2@hinfinity.in',
            'test@employee.com'
          ];
          
          console.log('Login - Checking against employee usernames:', employeeUsernames);
          console.log('Login - Username in employee list?', employeeUsernames.includes(userName));
          
          if (superAdminUsernames.includes(userName)) {
            role = 'SUPER_ADMIN';
            console.log('Login - Determined role as SUPER_ADMIN from specific username mapping');
          } else if (adminUsernames.includes(userName)) {
            role = 'ADMIN';
            console.log('Login - Determined role as ADMIN from specific username mapping');
          } else if (employeeUsernames.includes(userName)) {
            role = 'EMPLOYEE';
            console.log('Login - Determined role as EMPLOYEE from specific username mapping');
            console.log('Login - Employee username detected:', userName);
          } else if (lowerUserName.includes('admin') || lowerUserName.includes('super')) {
            role = 'SUPER_ADMIN';
            console.log('Login - Determined role as SUPER_ADMIN from username');
          } else if (lowerUserName.includes('emp') || lowerUserName.includes('employee')) {
            role = 'EMPLOYEE';
            console.log('Login - Determined role as EMPLOYEE from username');
          } else {
            role = 'FARMER';
            console.log('Login - Defaulting to FARMER role');
          }
        }
        
        const user = {
          userName: userName,
          role: role,
          forcePasswordChange: forcePasswordChange
        };
        
        console.log('Login - Final fallback user data:', user);
        console.log('Login - Final role determined:', role);
        
        login(user, token);
        
        // Check if user needs to change password
        console.log('Login - Fallback: Checking forcePasswordChange:', user.forcePasswordChange);
        console.log('Login - Fallback: Password contains Temp@:', password.includes('Temp@'));
        
        if (user.forcePasswordChange) {
          console.log('Login - Fallback: Redirecting to change password page');
          navigate('/change-password');
          return;
        }
        
        // Role-based navigation
        console.log('Login - Fallback: User role for navigation:', user.role);
        console.log('Login - Fallback: User role (normalized):', user.role?.toUpperCase?.()?.trim?.());
        console.log('Login - Fallback: User role type:', typeof user.role);
        console.log('Login - Fallback: User role length:', user.role?.length);
        console.log('Login - Fallback: User role includes spaces:', user.role?.includes(' '));
        
        const normalizedRole = user.role?.toUpperCase?.()?.trim?.() || '';
        console.log('Login - Fallback: Normalized role:', normalizedRole);
        console.log('Login - Fallback: Normalized role === ADMIN:', normalizedRole === 'ADMIN');
        console.log('Login - Fallback: Normalized role === SUPER_ADMIN:', normalizedRole === 'SUPER_ADMIN');
        
        if (normalizedRole === 'SUPER_ADMIN') {
          console.log('Login - Fallback: Redirecting SUPER_ADMIN to /super-admin/dashboard');
          alert('FALLBACK: SUPER_ADMIN detected - redirecting to /super-admin/dashboard');
          navigate('/super-admin/dashboard');
        } else if (normalizedRole === 'ADMIN') {
          console.log('Login - Fallback: Redirecting ADMIN to /admin/dashboard');
          alert('FALLBACK: ADMIN detected - redirecting to /admin/dashboard');
          navigate('/admin/dashboard');
        } else if (normalizedRole === 'EMPLOYEE') {
          console.log('Login - Fallback: Redirecting EMPLOYEE to /employee/dashboard');
          alert('FALLBACK: EMPLOYEE detected - redirecting to /employee/dashboard');
          navigate('/employee/dashboard');
        } else {
          console.log('Login - Fallback: Redirecting FARMER to /dashboard');
          alert('FALLBACK: FARMER detected - redirecting to /dashboard');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Login error response:', err.response);
      console.error('Login error message:', err.message);
      setError(`Login failed: ${err.response?.data?.message || err.message || 'Invalid credentials or server error.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    if (loginType === 'employee') {
      navigate('/register-employee', { state: { role: 'EMPLOYEE' } });
    } else if (loginType === 'farmer') {
      navigate('/register-farmer', { state: { role: 'FARMER' } });
    } else if (loginType === 'fpo') {
      navigate('/register-fpo', { state: { role: 'FPO' } });
    }
  };

  return (
    <div className="login-container">
      {/* Top Navigation Bar */}
      <nav className="nic-navbar">
        <div className="nic-logo">
          <span>DATE</span>
        </div>
        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <span className="nav-dot">•</span>
          <a href="#enrollment">Check Enrollment Status</a>
          <span className="nav-dot">•</span>
          <a href="#csc">Login with CSC</a>
        </div>
      </nav>

      <div className="main-content">
        {/* Left Section - Information Panel */}
        <div className="info-panel">
          <div className="agri-stack-header">
            <h1 className="agri-stack-title">
              <span className="agri-text">Date</span>
              <span className="agri-text">Agri</span>
              <span className="leaf-icon">🌿</span>
              <span className="stack-text">Stack</span>
            </h1>
            <h2 className="registry-title">India Farmer Registry</h2>
          </div>
          <div className="registry-info">
            <h3>Digital Agristack Transaction Enterprises</h3>
            <p className="help-desk">
              Empowering Agricultural Excellence
            </p>
          </div>
          
          {/* Enhanced Agricultural Content */}
          <div className="agricultural-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">🌾</span>
              <div className="highlight-content">
                <h4>Revolutionizing Indian Agriculture</h4>
                <p>Connecting 140+ million farmers with cutting-edge digital solutions</p>
              </div>
            </div>
            
            <div className="highlight-item">
              <span className="highlight-icon">📱</span>
              <div className="highlight-content">
                <h4>Smart Farming Technology</h4>
                <p>AI-powered crop monitoring and precision agriculture tools</p>
              </div>
            </div>
            
            <div className="highlight-item">
              <span className="highlight-icon">💰</span>
              <div className="highlight-content">
                <h4>Financial Inclusion</h4>
                <p>Direct benefit transfers and digital payment solutions</p>
              </div>
            </div>
            
            <div className="highlight-item">
              <span className="highlight-icon">🌱</span>
              <div className="highlight-content">
                <h4>Sustainable Practices</h4>
                <p>Promoting eco-friendly farming and climate-smart agriculture</p>
              </div>
            </div>
            
            <div className="highlight-item">
              <span className="highlight-icon">🏆</span>
              <div className="highlight-content">
                <h4>National Recognition</h4>
                <p>Government of India's flagship agricultural digitization initiative</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="login-form-section">
          <div className="login-card">
            {/* DATE Logo at Top */}
            <div className="date-logo-section">
              <img src={logo} alt="DATE Logo" className="date-logo" />
              <div className="date-text">
                <h3>Digital Agristack Transaction Enterprises</h3>
                <p>Empowering Agricultural Excellence</p>
              </div>
            </div>
            {/* Login Type Section */}
            <div className="login-type-section">
              <h3>Log In as</h3>
              <div className="login-type-toggle">
                <button 
                  type="button"
                  className={`toggle-btn ${loginType === 'official' ? 'active' : ''}`}
                  onClick={() => handleLoginType('official')}
                >
                  Official
                </button>
                <button 
                  type="button"
                  className={`toggle-btn ${loginType === 'fpo' ? 'active' : ''}`}
                  onClick={() => handleLoginType('fpo')}
                >
                  FPO
                </button>
                <button 
                  type="button"
                  className={`toggle-btn ${loginType === 'employee' ? 'active' : ''}`}
                  onClick={() => handleLoginType('employee')}
                >
                  Employee
                </button>
                <button 
                  type="button"
                  className={`toggle-btn ${loginType === 'farmer' ? 'active' : ''}`}
                  onClick={() => handleLoginType('farmer')}
                >
                  Farmer
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Username Field */}
              <div className="form-field">
                <label>Insert Registered Mobile Number as Username</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter username"
                />
              </div>

              {/* Password Field */}
              <div className="form-field">
                <label>Enter password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    👁️
                  </button>
                </div>
              </div>

                             {/* Forgot Password Link */}
               <div className="forgot-password">
                 <a href="/forgot-password">Forgot Password?</a>
                 <span className="separator">|</span>
                 <a href="/forgot-userid">Forgot User ID?</a>
               </div>

              {/* Captcha Section */}
              <div className="captcha-section">
                <label>Captcha</label>
                <div className="captcha-container">
                  <div className="captcha-image">
                    <span>{captchaValue}</span>
                  </div>
                  <button type="button" className="refresh-captcha" onClick={handleRefreshCaptcha}>
                    🔄
                  </button>
                  <input
                    type="text"
                    value={captcha}
                    onChange={e => setCaptcha(e.target.value)}
                    placeholder="Enter Captcha"
                    className="captcha-input"
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              

              
              <div className="login-actions-row">
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
                {(loginType === 'employee' || loginType === 'farmer' || loginType === 'fpo') && (
                  <button
                    type="button"
                    className="create-account-btn"
                    onClick={handleCreateAccount}
                  >
                    Create New user Acount
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 