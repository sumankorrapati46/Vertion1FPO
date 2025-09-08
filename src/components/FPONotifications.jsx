import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPONotifications = ({ fpoId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, [fpoId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fpoAPI.getFPONotifications(fpoId);
      setNotifications(response);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await fpoAPI.markNotificationAsRead(fpoId, notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'READ' }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await fpoAPI.deleteNotification(fpoId, notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="fpo-notifications">
      <div className="section-header">
        <h3>Notifications & Updates</h3>
        <button className="btn btn-primary">Create Notification</button>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-data">No notifications found</div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`notification-card ${notification.status.toLowerCase()}`}>
              <div className="notification-header">
                <h4>{notification.title}</h4>
                <div className="notification-meta">
                  <span className={`type-badge ${notification.type.toLowerCase().replace('_', '-')}`}>
                    {notification.type.replace('_', ' ')}
                  </span>
                  <span className={`status-badge ${notification.status.toLowerCase()}`}>
                    {notification.status}
                  </span>
                </div>
              </div>
              
              <div className="notification-body">
                <p className="message">{notification.message}</p>
                <div className="notification-details">
                  <span className="created-at">
                    Created: {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  {notification.priority && (
                    <span className={`priority ${notification.priority.toLowerCase()}`}>
                      Priority: {notification.priority}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="notification-actions">
                {notification.status === 'UNREAD' && (
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(notification.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPONotifications;
