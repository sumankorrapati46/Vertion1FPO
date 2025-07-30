import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/RegistrationForm.css';
import background from '../assets/background-image.png';
import logo from '../assets/rightlogo.png';

// Update Yup schema for password validation
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  dateOfBirth: yup
    .string()
    .required('Date of Birth is required')
    .test('age-range', 'Age must be between 18 and 90 years', function (value) {
      if (!value) return false;
      const dob = new Date(value);
      const today = new Date();
      const ageDifMs = today - dob;
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return age >= 18 && age <= 90;
    }),
  gender: yup.string().required('Gender is required'),
  email: yup.string()
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email must include @ and be valid'),
  phoneNumber: yup
    .string()
    .matches(/^\d{10}$/, 'Enter a valid 10-digit phone number')
    .required('Phone number is required'),
  role: yup.string().required('Role is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
});

const RegistrationForm = () => {
  const location = useLocation();
  const initialRole = location.state?.role || '';
  const [role, setRole] = useState(initialRole);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: initialRole },
  });

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [states, setStates] = useState([]);
  const selectedState = watch('state');

  const [emailValue, setEmailValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:8080/api/auth/countries")
      .then((res) => setCountries(res.data))
      .catch((err) => console.error("Error fetching countries:", err));
  }, []);
 
  // ✅ Fetch states by country
  useEffect(() => {
    if (selectedCountry) {
      axios.get(`http://localhost:8080/api/auth/states/${selectedCountry}`)
        .then((res) => setStates(res.data))
        .catch((err) => console.error("Error fetching states:", err));
    } else {
      setStates([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (!resendTimer) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!emailValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Enter a valid email first');
      return;
    }
    try {
      await axios.post(
        'http://localhost:8080/api/auth/send-otp',
        { emailOrPhone: emailValue },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setOtpSent(true);
      setResendTimer(30);
      alert('OTP sent');
    } catch (e) {
      alert(e.response?.data || 'Failed to send OTP');
      console.error(e);
    }
  };
   
  // ✅ Handle Verify OTP
  const handleVerifyOTP = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/verify-otp", {
        emailOrPhone: emailValue,
        otp: otp,
      });
      alert("Email verified successfully!");
      setEmailVerified(true);
    } catch (error) {
      alert("OTP verification error.");
      console.error(error);
    }
  };

  // ✅ Final Registration Submission to backend
  const onSubmit = async (data) => {
    if (!emailVerified) {
      alert('Please verify your email before submitting.');
      return;
    }

    try {
      console.log('Submitting registration data:', data);
      const response = await axios.post('/api/auth/register', data);
      console.log('Registration successful:', response.data);
      
      // Show success message with approval notice
      alert('Registration successful! Please wait for admin approval. You will receive an email with login credentials once approved.');
      
      // Reset form
      reset();
      setEmailVerified(false);
      setOtpSent(false);
      setEmailValue('');
      setOtp('');
      
      // Don't navigate to login - user needs to wait for approval
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="reg-main-content">
      {/* Left Info Panel */}
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
          <p className="help-desk">Empowering Agricultural Excellence</p>
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
      {/* Right Registration Form Card */}
      <div className="reg-form-section">
        <div className="reg-modern-form-card">
          <div className="date-logo-section">
            <img src={logo} alt="DATE Logo" className="date-logo" />
            <div className="date-text">
              <h3>Digital Agristack Transaction Enterprises</h3>
              <p>Empowering Agricultural Excellence</p>
            </div>
          </div>
          <div className="reg-form-header">
            <h2 className="reg-form-title">Registration Form</h2>
            <p className="reg-form-subtitle">Enter your details to get started</p>
          </div>
          <input type="hidden" {...register('role')} value={role} />
            {/* Optionally, show the role as read-only for user confirmation */}
            {role && (
              <div className="reg-form-group">
                <label>Role</label>
                <input type="text" value={role} readOnly className="reg-role-field" />
              </div>
            )}
          <form onSubmit={handleSubmit(onSubmit)} className="reg-modern-form reg-form-grid">

            <div className="reg-form-col">
              <div className="reg-form-group">
                <label> Name <span className="reg-required">*</span></label>
                <input 
                  type="text" 
                  {...register('name')} 
                  className={errors.name ? 'reg-error' : ''}
                  placeholder="Enter your first name"
                />
                {errors.name && <span className="reg-error-message">{errors.name.message}</span>}
              </div>
              <div className="reg-form-group">
                <label>Gender <span className="reg-required">*</span></label>
                <select {...register('gender')} className={errors.gender ? 'reg-error' : ''}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="reg-error-message">{errors.gender.message}</span>}
              </div>
              <div className="reg-form-group">
                <label>Date of Birth <span className="reg-required">*</span></label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className={errors.dateOfBirth ? 'reg-error' : ''}
                />
                {errors.dateOfBirth && <span className="reg-error-message">{errors.dateOfBirth.message}</span>}
              </div>
            </div>
            <div className="reg-form-col">
              <div className="reg-form-group">
                <label>Phone Number <span className="reg-required">*</span></label>
                <input 
                  type="text" 
                  {...register('phoneNumber')} 
                  className={errors.phoneNumber ? 'reg-error' : ''}
                  placeholder="Enter 10-digit number"
                />
                {errors.phoneNumber && <span className="reg-error-message">{errors.phoneNumber.message}</span>}
              </div>
              <div className="reg-form-group">
                <label>Email Address <span className="reg-required">*</span></label>
                <input
                  type="email"
                  {...register('email')}
                  value={emailValue}
                  onChange={(e) => {
                    setEmailValue(e.target.value);
                    setOtpSent(false);
                    setEmailVerified(false);
                  }}
                  className={errors.email ? 'reg-error' : ''}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="reg-error-message">{errors.email.message}</span>}
               
              </div>
              <div className="reg-form-group">
                <label>Password <span className="reg-required">*</span></label>
                <input
                  type="password"
                  {...register('password')}
                  className={errors.password ? 'reg-error' : ''}
                  placeholder="Enter a strong password"
                  autoComplete="new-password"
                />
                {errors.password && <span className="reg-error-message">{errors.password.message}</span>}

              </div>
            </div>
             {/* Email Verification */}
             <div className="reg-email-verification">
                  {(!otpSent && !emailVerified) && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="reg-otp-btn reg-primary"
                    >
                      Send OTP
                    </button>
                  )}
                  {(otpSent && !emailVerified) && (
                    <div className="reg-otp-container">
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="reg-otp-input"
                      />
                      <div className="reg-otp-buttons">
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          className="reg-otp-btn reg-secondary"
                          disabled={resendTimer > 0}
                        >
                          {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          className="reg-otp-btn reg-primary"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                  {emailVerified && (
                    <div className="reg-verification-success">
                      <span className="reg-success-icon">✓</span>
                      Email Verified
                    </div>
                  )}
                </div>
            <div className="reg-form-actions reg-form-actions-full">
              <button type="submit" className="reg-submit-btn">
                Register Now ...
              </button>
            </div>
            <div className="reg-login-link reg-form-actions-full">
              <h4>Already have an account? <Link to="/login">Sign In</Link></h4>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm; 