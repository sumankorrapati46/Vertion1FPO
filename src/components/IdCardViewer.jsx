import React, { useState, useEffect } from 'react';
import { idCardAPI } from '../api/apiService';
import '../styles/IdCardViewer.css';

const IdCardViewer = ({ cardId, onClose, inlineMode = false }) => {
  const [idCard, setIdCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

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
  }, [cardId, onClose]);

  const fetchIdCard = async () => {
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
  };

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
    <div className="id-card-modal" onClick={onClose}>
      <div className="id-card-content" onClick={(e) => e.stopPropagation()}>
        <div className="id-card-header">
          <h2>ID Card <span className="muted">{idCard.cardId}</span></h2>
          <button onClick={onClose} className="close-btn" aria-label="Close viewer">&times;</button>
        </div>
        <div className="id-card-body">
          <div className="id-card-preview">
            {imageUrl ? (
              <img src={imageUrl} alt="ID Card Preview" className="id-card-image" />
            ) : (
              <div className="loading">{imageLoading ? 'Rendering preview…' : 'Preview unavailable'}</div>
            )}
          </div>
        </div>
        <div className="id-card-actions">
          <button onClick={handleDownloadPDF} className="download-btn pdf">Download PDF</button>
          <button onClick={handleDownloadPNG} className="download-btn png">Download PNG</button>
        </div>
      </div>
    </div>
  );
};

export default IdCardViewer;
