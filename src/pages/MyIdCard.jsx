import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import './MyIdCard.css';

const MyIdCard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            // Try to get user profile from API first
            try {
                const profile = await apiService.getProfile();
                setUser(profile);
            } catch (error) {
                // Fallback to localStorage if API fails
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    setMessage('Unable to load user profile');
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            setMessage('Error loading user profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!user?.id) {
            setMessage('User ID not available');
            return;
        }

        try {
            setUploading(true);
            setMessage('');
            
            const response = await apiService.uploadIdPhoto(user.id, file);
            setMessage('Photo uploaded successfully!');
            
            // Reload user profile to get updated data
            await loadUserProfile();
            
        } catch (error) {
            console.error('Error uploading photo:', error);
            setMessage('Error uploading photo: ' + (error.response?.data || error.message));
        } finally {
            setUploading(false);
        }
    };

    const downloadIdCard = async () => {
        if (!user?.id) {
            setMessage('User ID not available');
            return;
        }

        try {
            setMessage('');
            const response = await apiService.getIdCardPdf(user.id);
            
            // Create blob and download
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `id-card-${user.uniqueId || user.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading ID card:', error);
            setMessage('Error downloading ID card: ' + (error.response?.data || error.message));
        }
    };

    if (loading) {
        return (
            <div className="my-id-card">
                <div className="loading">Loading ID card...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="my-id-card">
                <div className="error">Unable to load user information</div>
            </div>
        );
    }

    return (
        <div className="my-id-card">
            <div className="id-card-header">
                <h2>My ID Card</h2>
                <p>Manage your ID card and profile photo</p>
            </div>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="id-card-content">
                <div className="id-card-preview">
                    <h3>ID Card Preview</h3>
                    <div className="preview-container">
                        <iframe
                            src={`/api/users/${user.id}/idcard?t=${Date.now()}`}
                            title="ID Card Preview"
                            className="id-card-iframe"
                        />
                    </div>
                </div>

                <div className="id-card-actions">
                    <h3>Actions</h3>
                    
                    <div className="action-group">
                        <label htmlFor="photo-upload" className="upload-label">
                            Upload Photo
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploading}
                            className="file-input"
                        />
                        {uploading && <div className="uploading">Uploading...</div>}
                    </div>

                    <div className="action-group">
                        <button 
                            onClick={downloadIdCard}
                            className="download-btn"
                        >
                            Download ID Card (PDF)
                        </button>
                    </div>

                    <div className="user-info">
                        <h4>User Information</h4>
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Unique ID:</strong> {user.uniqueId || 'Not generated yet'}</p>
                        <p><strong>State:</strong> {user.state || 'N/A'}</p>
                        <p><strong>District:</strong> {user.district || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyIdCard;

