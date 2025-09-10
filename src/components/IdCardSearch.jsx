import React, { useState, useEffect } from 'react';
import { idCardAPI } from '../api/apiService';
import IdCardViewer from './IdCardViewer';
import '../styles/IdCardSearch.css';

const IdCardSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cardType, setCardType] = useState('ALL');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [idCards, setIdCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 10;

  useEffect(() => {
    searchIdCards();
  }, [currentPage, cardType]);

  const searchIdCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        size: pageSize,
        ...(searchTerm && { name: searchTerm }),
        ...(cardType !== 'ALL' && { cardType }),
        ...(state && { state }),
        ...(district && { district })
      };

      const response = await idCardAPI.searchIdCards(params);
      setIdCards(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError('Failed to search ID cards');
      console.error('Error searching ID cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    searchIdCards();
  };

  const handleReset = () => {
    setSearchTerm('');
    setCardType('ALL');
    setState('');
    setDistrict('');
    setCurrentPage(0);
    searchIdCards();
  };

  const handleViewCard = (cardId) => {
    setSelectedCard(cardId);
  };

  const handleDownloadPDF = async (cardId) => {
    try {
      await idCardAPI.downloadIdCardPdf(cardId);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const handleDownloadPNG = async (cardId) => {
    try {
      await idCardAPI.downloadIdCardPng(cardId);
    } catch (err) {
      console.error('Error downloading PNG:', err);
      alert('Failed to download PNG');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

  return (
    <div className="id-card-search">
      <div className="search-header">
        <h2>ID Card Search</h2>
        <p>Search and manage farmer and employee ID cards</p>
      </div>

      <div className="search-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="searchTerm">Search by Name</label>
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter name to search..."
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="cardType">Card Type</label>
              <select
                id="cardType"
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Types</option>
                <option value="FARMER">Farmer</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter state..."
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="district">District</label>
              <input
                type="text"
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Enter district..."
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button type="button" onClick={handleReset} className="reset-btn">
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="search-results">
        {loading && (
          <div className="loading">Searching ID cards...</div>
        )}
        
        {error && (
          <div className="error">{error}</div>
        )}
        
        {!loading && !error && idCards.length === 0 && (
          <div className="no-results">
            <p>No ID cards found matching your criteria.</p>
          </div>
        )}
        
        {!loading && !error && idCards.length > 0 && (
          <>
            <div className="results-header">
              <p>Found {totalElements} ID card(s)</p>
            </div>
            
            <div className="id-cards-grid">
              {idCards.map((card) => (
                <div key={card.id} className="id-card-item">
                  <div className="card-header">
                    <h3>{card.cardId}</h3>
                    {getStatusBadge(card.status)}
                  </div>
                  
                  <div className="card-details">
                    <p><strong>Name:</strong> {card.holderName}</p>
                    <p><strong>Type:</strong> {card.cardType}</p>
                    <p><strong>Location:</strong> {card.village}, {card.district}, {card.state}</p>
                    <p><strong>Generated:</strong> {new Date(card.generatedAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      onClick={() => handleViewCard(card.cardId)}
                      className="action-btn view"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(card.cardId)}
                      className="action-btn download"
                    >
                      PDF
                    </button>
                    <button 
                      onClick={() => handleDownloadPNG(card.cardId)}
                      className="action-btn download"
                    >
                      PNG
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="page-btn"
                >
                  Previous
                </button>
                
                <span className="page-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedCard && (
        <IdCardViewer 
          cardId={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </div>
  );
};

export default IdCardSearch;
