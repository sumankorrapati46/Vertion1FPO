import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const UserProfileDropdown = () => {
  const { user, logout } = useAuth();
  
  // Debug logging
  console.log('UserProfileDropdown - User data:', user);
  console.log('UserProfileDropdown - User name:', user?.name);
  console.log('UserProfileDropdown - User role:', user?.role);
  console.log('UserProfileDropdown - User email:', user?.email);
  
  // Test if component is rendering
  useEffect(() => {
    console.log('=== USERPROFILE DROPDOWN MOUNTED ===');
    console.log('User on mount:', user);
    console.log('User name on mount:', user?.name);
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    try {
      // Here you would typically make an API call to change password
      // For now, we'll just show a success message
      alert('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert('Failed to change password. Please try again.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <div 
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          {getInitials(user?.name || 'Super Admin')}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name || 'Super Admin'}</span>
          <span className="user-role">{user?.role || 'SUPER_ADMIN'}</span>
        </div>
        <i className={`fas fa-chevron-down dropdown-arrow ${isOpen ? 'rotated' : ''}`}></i>
      </div>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <div className="user-avatar-large">
              {getInitials(user?.name || 'Super Admin')}
            </div>
            <div className="user-details">
              <span className="user-name-large">{user?.name || 'Super Admin'}</span>
              <span className="user-email">{user?.email || 'superadmin@date.com'}</span>
            </div>
          </div>
          
          <div className="dropdown-actions">
            <button 
              className="dropdown-action-btn"
              onClick={() => setShowChangePassword(true)}
            >
              <i className="fas fa-key"></i>
              Change Password
            </button>
            
                         <button 
               className="dropdown-action-btn logout"
               onClick={handleLogout}
               style={{ color: '#dc2626', borderColor: '#dc2626' }}
             >
               <i className="fas fa-sign-out-alt"></i>
               Logout
             </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay">
          <div className="change-password-modal">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button 
                className="modal-close"
                onClick={() => setShowChangePassword(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowChangePassword(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown; 