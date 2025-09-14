import React, { useState, useEffect } from 'react';
import { idCardAPI, employeeAPI, employeeSelfAPI, farmersAPI } from '../api/apiService';
import IdCardViewer from './IdCardViewer';
import '../styles/MyIdCard.css';

const MyIdCard = ({ userId, userType }) => {
  const [idCards, setIdCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [uploading, setUploading] = useState(false);
  // state removed: currentPhotoFileName

  useEffect(() => {
    if (userId) {
      fetchMyIdCards();
    }
  }, [userId]);

  // Load current employee photo for quick visual verification
  // Optionally pre-load photo name for validation

  const fetchMyIdCards = async () => {
    try {
      setLoading(true);
      // Determine correct holder id
      let holderId = userId;
      if (userType === 'EMPLOYEE') {
        try {
          const profile = await employeeAPI.getProfile();
          if (profile?.id) holderId = profile.id;
        } catch (e) {
          console.warn('Failed to resolve employee profile id, falling back to userId', e);
        }
      }

      const response = await idCardAPI.getIdCardsByHolder(String(holderId));
      const listRaw = Array.isArray(response)
        ? response
        : (response?.content || response?.items || response?.data || []);
      const list = Array.isArray(listRaw) ? listRaw : [];
      // Ensure we only show the appropriate card type (EMPLOYEE/FARMER)
      let filtered = userType ? list.filter((c) => c.cardType === userType) : list;

      // Fallback: if nothing returned for holder, fetch by type and match holderId
      if ((!filtered || filtered.length === 0) && userType === 'EMPLOYEE') {
        try {
          const page = await idCardAPI.getIdCardsByType('EMPLOYEE');
          const arr = Array.isArray(page)
            ? page
            : (page?.content || page?.items || page?.data || []);
          const all = Array.isArray(arr) ? arr : [];
          const matches = all.filter((c) => String(c.holderId) === String(holderId) || String(c.holderId) === String(userId));
          filtered = matches;
        } catch (e) {
          // ignore
        }
      }

      setIdCards(filtered || []);
    } catch (err) {
      setError('Failed to load ID cards');
      console.error('Error fetching ID cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCard = (cardId) => {
    setSelectedCard(cardId);
  };

  const handleDownloadPDF = async (cardId) => {
    try {
      const response = await idCardAPI.downloadIdCardPdf(cardId);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my_idcard_${cardId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const handleDownloadPNG = async (cardId) => {
    try {
      const response = await idCardAPI.downloadIdCardPng(cardId);
      const blob = new Blob([response], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my_idcard_${cardId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PNG:', err);
      alert('Failed to download PNG');
    }
  };

  const handleUploadPhoto = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!/image\/(png|jpeg|jpg)/.test(file.type)) {
        alert('Please select a JPG or PNG image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Max 5 MB.');
        return;
      }

      setUploading(true);

      // holder id not needed here; API uses profile id internally
      if (userType === 'EMPLOYEE') {
        // Resolve employee entity id
        let empId = userId;
        try {
          const profile = await employeeAPI.getProfile();
          if (profile?.id) empId = profile.id;
        } catch {}
        await employeeSelfAPI.uploadPhoto(empId, file);
        // no-op
        // Optionally refresh profile cache after upload
      } else if (userType === 'FARMER') {
        // Farmer endpoint: PATCH /api/farmers/{id}/photo
        await farmersAPI.uploadPhoto(userId, file);
        // no-op
      }

      // Refresh list to ensure latest profile photo is used during rendering
      setTimeout(fetchMyIdCards, 300);
      alert('Photo updated successfully.');
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ACTIVE: 'status-active',
      EXPIRED: 'status-expired',
      REVOKED: 'status-revoked'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-unknown'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="my-id-card">
        <div className="loading">Loading your ID cards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-id-card">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (idCards.length === 0) {
    return (
      <div className="my-id-card">
        <div className="no-id-cards">
          <div className="no-id-cards-icon">🆔</div>
          <h3>No ID Card Found</h3>
          <p>Your ID card will be generated automatically after your registration is approved.</p>
          <p>Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-id-card">
      <div className="id-card-header">
        <h2>My ID Card</h2>
        <p>View and download your digital ID card</p>
      </div>

      <div className="id-cards-list">
        <div style={{ marginBottom: 12 }}>
          <label className="action-btn" style={{ cursor: 'pointer' }}>
            <input type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleUploadPhoto} disabled={uploading} />
            {uploading ? 'Uploading...' : 'Change Photo'}
          </label>
        </div>
        {idCards.map((card) => (
          <div key={card.id} className="id-card-item">
            <div className="card-main">
              <div className="card-info">
                <div className="card-id">
                  <h3>{card.cardId}</h3>
                  {getStatusBadge(card.status)}
                </div>
                
                <div className="card-details">
                  <p><strong>Type:</strong> {card.cardType}</p>
                  <p><strong>Generated:</strong> {new Date(card.generatedAt).toLocaleDateString()}</p>
                  <p><strong>Expires:</strong> {new Date(card.expiresAt).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {card.village}, {card.district}, {card.state}</p>
                </div>
              </div>
              
              <div className="card-actions">
                <button onClick={() => handleViewCard(card.cardId)} className="action-btn view">
                  <span>👁️</span> View
                </button>
                <button onClick={() => handleDownloadPDF(card.cardId)} className="action-btn download pdf">
                  <span>📄</span> PDF
                </button>
                <button onClick={() => handleDownloadPNG(card.cardId)} className="action-btn download png">
                  <span>🖼️</span> PNG
                </button>
              </div>
            </div>
            
            {card.status === 'EXPIRED' && (
              <div className="expired-notice">
                <span>⚠️</span> This ID card has expired. Please contact your administrator for renewal.
              </div>
            )}
            
            {card.status === 'REVOKED' && (
              <div className="revoked-notice">
                <span>🚫</span> This ID card has been revoked. Please contact your administrator for assistance.
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCard && (
        <div style={{ marginTop: 16 }}>
          <IdCardViewer cardId={selectedCard} onClose={() => setSelectedCard(null)} inlineMode />
        </div>
      )}
    </div>
  );
};

export default MyIdCard;
