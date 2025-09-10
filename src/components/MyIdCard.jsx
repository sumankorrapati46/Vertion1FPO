import React, { useState, useEffect } from 'react';
import { idCardAPI } from '../api/apiService';
import IdCardViewer from './IdCardViewer';
import '../styles/MyIdCard.css';

const MyIdCard = ({ userId, userType }) => {
  const [idCards, setIdCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchMyIdCards();
    }
  }, [userId]);

  const fetchMyIdCards = async () => {
    try {
      setLoading(true);
      const response = await idCardAPI.getIdCardsByHolder(userId.toString());
      setIdCards(response);
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
          
          {/* Temporary manual generation button */}
          <button 
            onClick={async () => {
              try {
                const response = await idCardAPI.generateFarmerIdCard(userId);
                if (response) {
                  alert('ID Card generated successfully! Please refresh the page.');
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error generating ID card:', error);
                alert('Failed to generate ID card. Please contact administrator.');
              }
            }}
            className="generate-id-card-btn"
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Generate ID Card Now
          </button>
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
