// src/pages/OtpVerification.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/apiService';
import '../styles/Login.css';
 
const OtpVerification = () => {
  /* ───────── STATE ───────── */
  const [otp,         setOtp]         = useState('');
  const [timer,       setTimer]       = useState(30);  // 30‑second cooldown
  const [canResend,   setCanResend]   = useState(false);
 
  const navigate  = useNavigate();
  const location  = useLocation();
  let { target, type } = location.state || {};        // { target, type: "userId" | "password" }
  // Fallback to sessionStorage so refresh/direct visit still works
  if (!target || !type) {
    try {
      const saved = JSON.parse(sessionStorage.getItem('otpFlow') || 'null');
      if (saved?.target && saved?.type) {
        target = saved.target; // eslint-disable-line prefer-const
        type = saved.type;     // eslint-disable-line prefer-const
      }
    } catch (_) {}
  }
 
  /* ───────── GUARD ───────── */
  useEffect(() => {
    if (!target || !type) {
      alert('Invalid navigation – redirecting.');
      navigate('/forgot-password');
    }
  }, [target, type, navigate]);
 
  /* ───────── TIMER ───────── */
  useEffect(() => {
    if (timer === 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1_000);
    return () => clearInterval(id);
  }, [timer]);
 
  /* ───────── VERIFY ───────── */
  const handleVerify = async () => {
    if (otp.length !== 6) { alert('Enter a 6‑digit OTP'); return; }
    try {
      // Backend expects emailOrPhone
      await authAPI.verifyOTP({ email: target, otp });
      alert('OTP verified ✔️');
      try {
        sessionStorage.setItem('otpFlow', JSON.stringify({ target, type, otpVerified: true }));
      } catch (_) {}
      if (type === 'userId') {
        navigate('/change-userid', { state: { target } });
      } else {
        navigate('/change-password', { state: { target } });
      }
    } catch (err) {
      console.error(err);
      alert('Invalid or expired OTP.');
    }
  };
 
  /* ───────── RESEND ───────── */
  const handleResend = async () => {
    if (!canResend) return;
    try {
      await authAPI.resendOTP(target);
      alert('OTP resent!');
      setTimer(30);
      setCanResend(false);
      setOtp('');
    } catch (err) {
      console.error(err);
      alert('Could not resend OTP.');
    }
  };
 
  /* ───────── UI ───────── */
  return (
    <div className="kerala-login-container">
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

        {/* Right Section - OTP Verification Form */}
        <div className="login-form-section">
          <div className="login-card">
            {/* DATE Logo at Top */}
            <div className="date-logo-section">
              <div className="date-logo">DATE</div>
              <div className="date-text">
                <h3>Digital Agristack Transaction Enterprises</h3>
                <p>Empowering Agricultural Excellence</p>
              </div>
            </div>

            <div className="otp-verification-content">
              <h2>Email Verification</h2>
              <p>We sent a 6-digit code to <strong>{target}</strong></p>
              <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                <div className="form-field">
                  <label htmlFor="otpInput">Enter OTP</label>
                  <input
                    id="otpInput"
                    className="otp-input"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="resend-otp">
                  {canResend ? (
                    <button type="button" onClick={handleResend} className="resend-btn">Resend OTP</button>
                  ) : (
                    <span className="resend-timer">Resend in {timer}s</span>
                  )}
                </div>
                <div className="otp-buttons">
                  <button type="submit" className="login-btn">Verify</button>
                  <button type="button" className="create-account-btn" onClick={() => navigate(-1)}>Back</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default OtpVerification; 