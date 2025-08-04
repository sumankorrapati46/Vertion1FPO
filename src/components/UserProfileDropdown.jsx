import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
 
const UserProfileDropdown = ({ variant = 'default' }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeUserId, setShowChangeUserId] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const dropdownRef = useRef(null);
 
  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
 
  // User ID change form state
  const [userIdData, setUserIdData] = useState({
    currentUserId: '',
    newUserId: '',
    confirmUserId: ''
  });
 
  // Notifications state
  const [notifications] = useState([
    { id: 1, type: 'info', message: 'New farmer registration pending approval', time: '2 minutes ago' },
    { id: 2, type: 'warning', message: 'KYC verification overdue for 3 farmers', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'Employee assignment completed successfully', time: '3 hours ago' }
  ]);
 
  // Close dropdown when clicking outside
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
 
  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
 
  // Handle password change
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
 
  // Handle user ID change
  const handleChangeUserId = async (e) => {
    e.preventDefault();
   
    if (userIdData.newUserId !== userIdData.confirmUserId) {
      alert('New User IDs do not match!');
      return;
    }
 
    if (userIdData.newUserId.length < 3) {
      alert('New User ID must be at least 3 characters long!');
      return;
    }
 
    try {
      // Here you would typically make an API call to change user ID
      alert('User ID changed successfully!');
      setShowChangeUserId(false);
      setUserIdData({
        currentUserId: '',
        newUserId: '',
        confirmUserId: ''
      });
    } catch (error) {
      alert('Failed to change User ID. Please try again.');
    }
  };
 
  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
 
  // Get display name based on user role and available data
  const getDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
   
    if (user?.userName) {
      const role = user.role || 'USER';
      switch (role) {
        case 'ADMIN':
          return 'Admin User';
        case 'SUPER_ADMIN':
          return 'Super Admin User';
        case 'EMPLOYEE':
          return 'Employee User';
        case 'FARMER':
          return 'Farmer User';
        default:
          return user.userName;
      }
    }
   
    return 'User';
  };
 
  // Get display role
  const getDisplayRole = () => {
    if (user?.role) {
      return user.role.replace('_', ' ');
    }
    return 'USER';
  };
 
  // Get avatar initials
  const getAvatarInitials = () => {
    const displayName = getDisplayName();
    return getInitials(displayName);
  };
 
  // Get user status (online/offline)
  const getUserStatus = () => {
    return 'online'; // You can implement real status logic here
  };
 
  // Get user email
  const getUserEmail = () => {
    return user?.email || `${user?.userName || 'user'}@date.com`;
  };
 
  // Render compact variant (for mobile or minimal header)
  if (variant === 'compact') {
    return (
      <div className="user-profile-dropdown compact" ref={dropdownRef}>
        <div
          className="user-profile-trigger compact"
          onClick={() => setIsOpen(!isOpen)}
          title="User Menu"
        >
          <div className="user-avatar-compact">
            {getAvatarInitials()}
          </div>
          <i className={`fas fa-chevron-down dropdown-arrow ${isOpen ? 'rotated' : ''}`}></i>
        </div>
 
        {isOpen && (
          <div className="user-dropdown-menu compact">
            <div className="dropdown-header">
              <div className="user-avatar-large">
                {getAvatarInitials()}
              </div>
              <div className="user-details">
                <span className="user-name-large">{getDisplayName()}</span>
                <span className="user-role">{getDisplayRole()}</span>
                <span className="user-email">{getUserEmail()}</span>
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
                className="dropdown-action-btn"
                onClick={() => setShowChangeUserId(true)}
              >
                <i className="fas fa-user-edit"></i>
                Change User ID
              </button>
             
              <button
                className="dropdown-action-btn logout"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
 
  // Render enhanced variant (for desktop with full user info)
  if (variant === 'enhanced') {
    return (
      <div className="user-profile-dropdown enhanced" ref={dropdownRef}>
        <div className="enhanced-user-header">
          <div className="user-profile-section">
            <div className="user-profile-info">
              <div className="user-avatar-container">
                <div className="user-avatar-large">
                  {getAvatarInitials()}
                </div>
                <div className={`user-status-indicator ${getUserStatus()}`}></div>
              </div>
              <div className="user-details">
                <span className="user-name-display">{getDisplayName()}</span>
                <span className="user-role-display">{getDisplayRole()}</span>
                <span className="user-email-display">{getUserEmail()}</span>
              </div>
            </div>
            <div className="user-actions">
              <button
                className="header-action-btn"
                title="Notifications"
                onClick={() => setShowNotifications(true)}
              >
                <i className="fas fa-bell"></i>
                <span className="notification-badge">{notifications.length}</span>
              </button>
              <button
                className="header-action-btn"
                title="Settings"
                onClick={() => setShowSettings(true)}
              >
                <i className="fas fa-cog"></i>
              </button>
              <button
                className="header-action-btn"
                title="Help"
                onClick={() => setShowHelp(true)}
              >
                <i className="fas fa-question-circle"></i>
              </button>
            </div>
          </div>
         
          <div
            className="user-profile-trigger"
            onClick={() => setIsOpen(!isOpen)}
            title="User Menu"
          >
            <i className={`fas fa-chevron-down dropdown-arrow ${isOpen ? 'rotated' : ''}`}></i>
          </div>
        </div>
 
        {isOpen && (
          <div className="user-dropdown-menu enhanced">
            <div className="dropdown-header">
              <div className="user-avatar-large">
                {getAvatarInitials()}
              </div>
              <div className="user-details">
                <span className="user-name-large">{getDisplayName()}</span>
                <span className="user-role">{getDisplayRole()}</span>
                <span className="user-email">{getUserEmail()}</span>
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
                className="dropdown-action-btn"
                onClick={() => setShowChangeUserId(true)}
              >
                <i className="fas fa-user-edit"></i>
                Change User ID
              </button>
             
              <button
                className="dropdown-action-btn"
                onClick={() => setShowSettings(true)}
              >
                <i className="fas fa-cog"></i>
                Settings
              </button>
             
              <button
                className="dropdown-action-btn"
                onClick={() => setShowHelp(true)}
              >
                <i className="fas fa-question-circle"></i>
                Help & Support
              </button>
             
              <button
                className="dropdown-action-btn logout"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
 
 
  // Render default variant (standard dropdown)
  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <div
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          {getAvatarInitials()}
        </div>
        <div className="user-info">
          <span className="user-name">{getDisplayName()}</span>
          <span className="user-role">{getDisplayRole()}</span>
        </div>
        <i className={`fas fa-chevron-down dropdown-arrow ${isOpen ? 'rotated' : ''}`}></i>
      </div>
 
      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <div className="user-avatar-large">
              {getAvatarInitials()}
            </div>
            <div className="user-details">
              <span className="user-name-large">{getDisplayName()}</span>
              <span className="user-role">{getDisplayRole()}</span>
              <span className="user-email">{getUserEmail()}</span>
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
              className="dropdown-action-btn"
              onClick={() => setShowChangeUserId(true)}
            >
              <i className="fas fa-user-edit"></i>
              Change User ID
            </button>
           
            <button
              className="dropdown-action-btn logout"
              onClick={handleLogout}
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
          <div className="modal-content">
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
 
      {/* Change User ID Modal */}
      {showChangeUserId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Change User ID</h3>
              <button
                className="modal-close"
                onClick={() => setShowChangeUserId(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
           
            <form onSubmit={handleChangeUserId}>
              <div className="form-group">
                <label htmlFor="currentUserId">Current User ID</label>
                <input
                  type="text"
                  id="currentUserId"
                  value={userIdData.currentUserId}
                  onChange={(e) => setUserIdData(prev => ({
                    ...prev,
                    currentUserId: e.target.value
                  }))}
                  required
                />
              </div>
             
              <div className="form-group">
                <label htmlFor="newUserId">New User ID</label>
                <input
                  type="text"
                  id="newUserId"
                  value={userIdData.newUserId}
                  onChange={(e) => setUserIdData(prev => ({
                    ...prev,
                    newUserId: e.target.value
                  }))}
                  required
                />
              </div>
             
              <div className="form-group">
                <label htmlFor="confirmUserId">Confirm New User ID</label>
                <input
                  type="text"
                  id="confirmUserId"
                  value={userIdData.confirmUserId}
                  onChange={(e) => setUserIdData(prev => ({
                    ...prev,
                    confirmUserId: e.target.value
                  }))}
                  required
                />
              </div>
             
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowChangeUserId(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Change User ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {/* Notifications Modal */}
      {showNotifications && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Notifications</h3>
              <button
                className="modal-close"
                onClick={() => setShowNotifications(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
           
            <div className="notifications-list">
              {notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-icon">
                    <i className={`fas fa-${notification.type === 'info' ? 'info-circle' : notification.type === 'warning' ? 'exclamation-triangle' : 'check-circle'}`}></i>
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
           
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Settings</h3>
              <button
                className="modal-close"
                onClick={() => setShowSettings(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
           
            <div className="settings-content">
              <p>Settings functionality coming soon!</p>
            </div>
           
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Help & Support</h3>
              <button
                className="modal-close"
                onClick={() => setShowHelp(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
           
            <div className="help-content">
              <p>Help and support functionality coming soon!</p>
            </div>
           
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowHelp(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default UserProfileDropdown;
 