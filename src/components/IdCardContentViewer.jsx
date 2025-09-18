import React, { useState, useEffect, useCallback } from 'react';
import { idCardAPI } from '../api/apiService';
import '../styles/IdCardContentViewer.css';

const IdCardContentViewer = ({ cardId, onClose }) => {
  const [idCard, setIdCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const fetchIdCard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await idCardAPI.getIdCard(cardId);
      setIdCard(response);
      setLoading(false);

      // Lazy-load image separately
      setImageLoading(true);
      idCardAPI
        .downloadIdCardPng(cardId)
        .then((imageResponse) => {
          const blob = new Blob([imageResponse], { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        })
        .catch((e) => {
          console.error('Error downloading PNG:', e);
        })
        .finally(() => setImageLoading(false));
    } catch (err) {
      setError('Failed to load ID card');
      console.error('Error fetching ID card:', err);
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    if (cardId) {
      fetchIdCard();
    }
  }, [cardId, fetchIdCard]);

  const handleDownloadPDF = async () => {
    try {
      const response = await idCardAPI.downloadIdCardPdf(cardId);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `id-card-${cardId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleDownloadPNG = async () => {
    try {
      const response = await idCardAPI.downloadIdCardPng(cardId);
      const blob = new Blob([response], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `id-card-${cardId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PNG:', error);
      alert('Failed to download PNG');
    }
  };

  if (loading) {
    return (
      <div className="id-card-content-viewer">
        <div className="id-card-header">
          <h1 className="id-card-title">Loading ID Card...</h1>
          <div className="header-buttons">
            <button onClick={onClose} className="back-btn">
              <i className="fas fa-times"></i>
              Back to List
            </button>
            <button onClick={onClose} className="close-btn">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="id-card-body">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading ID card details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !idCard) {
    return (
      <div className="id-card-content-viewer">
        <div className="id-card-header">
          <h1 className="id-card-title">ID Card Error</h1>
          <div className="header-buttons">
            <button onClick={onClose} className="back-btn">
              <i className="fas fa-times"></i>
              Back to List
            </button>
            <button onClick={onClose} className="close-btn">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="id-card-body">
          <div className="error-container">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error || 'ID card not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="id-card-content-viewer">
      {/* Header Section */}
      <div className="id-card-header">
        <h1 className="id-card-title">ID Card {idCard.cardId}</h1>
        <div className="header-buttons">
          <button onClick={onClose} className="back-btn">
            <i className="fas fa-times"></i>
            Back to List
          </button>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Middle Section - ID Card Display */}
      <div className="id-card-body">
        <div className="id-card-display-container">
          <div className="id-card-display">
            {imageUrl ? (
              <img src={imageUrl} alt="ID Card Preview" className="id-card-image" />
            ) : (
              <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                <p>{imageLoading ? 'Rendering ID card…' : 'Preview unavailable'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section - Action Buttons */}
      <div className="id-card-actions">
        <div className="action-buttons-container">
          <button onClick={handleDownloadPDF} className="download-btn pdf">
            <i className="fas fa-file-pdf"></i>
            Download PDF
          </button>
          <button onClick={handleDownloadPNG} className="download-btn png">
            <i className="fas fa-image"></i>
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdCardContentViewer;
