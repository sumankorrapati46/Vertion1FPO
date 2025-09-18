import React, { useState, useEffect, useCallback } from 'react';
import { idCardAPI } from '../api/apiService';
import '../styles/IdCardViewer.css';

const IdCardViewer = ({ cardId, onClose, inlineMode = false }) => {
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
      setLoading(false); // Open modal immediately with details

      // Lazy-load image separately to avoid blocking modal open
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

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cardId, onClose, fetchIdCard]);

  const handleDownloadPDF = async () => {
    try {
      const response = await idCardAPI.downloadIdCardPdf(cardId);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `idcard_${cardId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
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
      link.download = `idcard_${cardId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PNG:', err);
      alert('Failed to download PNG');
    }
  };

  if (loading) {
    return inlineMode ? (
      <div className="id-card-inline"><div className="loading">Loading…</div></div>
    ) : (
      <div className="id-card-modal">
        <div className="id-card-content">
          <div className="loading">Loading ID card...</div>
        </div>
      </div>
    );
  }

  if (error || !idCard) {
    return inlineMode ? (
      <div className="id-card-inline"><div className="error">{error || 'ID card not found'}</div></div>
    ) : (
      <div className="id-card-modal">
        <div className="id-card-content">
          <div className="error">{error || 'ID card not found'}</div>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  if (inlineMode) {
    return (
      <div className="id-card-inline">
        <div className="id-card-preview">
          {imageUrl ? (
            <img src={imageUrl} alt="ID Card" className="id-card-image" />
          ) : (
            <div className="loading">{imageLoading ? 'Rendering…' : 'Preview unavailable'}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="id-card-modal-fullscreen" onClick={onClose}>
      <div className="id-card-content-fullscreen" onClick={(e) => e.stopPropagation()}>
        {/* Header Section */}
        <div className="id-card-header-fullscreen">
          <h1 className="id-card-title">ID Card {idCard.cardId}</h1>
          <button onClick={onClose} className="close-btn-fullscreen" aria-label="Close viewer">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Middle Section - ID Card Display */}
        <div className="id-card-body-fullscreen">
          <div className="id-card-display-container">
            <div className="id-card-display">
              {imageUrl ? (
                <img src={imageUrl} alt="ID Card Preview" className="id-card-image-fullscreen" />
              ) : (
                <div className="loading-fullscreen">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>{imageLoading ? 'Rendering ID card…' : 'Preview unavailable'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Section - Action Buttons */}
        <div className="id-card-actions-fullscreen">
          <div className="action-buttons-container">
            <button onClick={handleDownloadPDF} className="download-btn-fullscreen pdf">
              <i className="fas fa-file-pdf"></i>
              Download PDF
            </button>
            <button onClick={handleDownloadPNG} className="download-btn-fullscreen png">
              <i className="fas fa-image"></i>
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdCardViewer;
