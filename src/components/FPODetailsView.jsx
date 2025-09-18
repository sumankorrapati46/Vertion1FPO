import React from 'react';
import FPOBoardMembers from './FPOBoardMembers';
import FPOServices from './FPOServices';
import FPOCrops from './FPOCrops';
import FPOTurnover from './FPOTurnover';
import FPOProducts from './FPOProducts';
import FPOInputShops from './FPOInputShops';
import '../styles/FPODetailsView.css';

const FPODetailsView = ({ fpo, onClose }) => {
  if (!fpo) return null;

  const address = (fpo.village || '') + (fpo.village ? ', ' : '') +
    (fpo.district || '') + (fpo.district ? ', ' : '') + (fpo.state || '') +
    (fpo.pincode ? ' - ' + fpo.pincode : '');

  return (
    <div className="fpo-details-view">
      {/* Header Section */}
      <div className="fpo-details-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="fpo-title">{fpo.fpoName}</h1>
            <p className="fpo-subtitle">{fpo.fpoId}</p>
          </div>
          <div className="header-right">
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="fpo-details-content">
        {/* Basic Information Section */}
        <div className="fpo-info-section">
          <div className="info-cards-grid">
            <div className="info-card primary">
              <div className="card-header">
                <i className="fas fa-building"></i>
                <h3>Organization Details</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <span className="label">Registration Number:</span>
                  <span className="value">{fpo.registrationNumber || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="label">CEO:</span>
                  <span className="value">{fpo.ceoName || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Address:</span>
                  <span className="value">{address || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="info-card secondary">
              <div className="card-header">
                <i className="fas fa-phone"></i>
                <h3>Contact Information</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{fpo.email || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{fpo.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Joined:</span>
                  <span className="value">{fpo.joinDate || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="info-card status">
              <div className="card-header">
                <i className="fas fa-check-circle"></i>
                <h3>Status</h3>
              </div>
              <div className="card-content">
                <div className="status-badge">
                  <span className={`status-indicator ${(fpo.status || '').toLowerCase().replace('_', '-')}`}>
                    {(fpo.status || 'PENDING').toString().replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services and Operations Section */}
        <div className="fpo-operations-section">
          <div className="section-header">
            <h2>Services & Operations</h2>
            <p>Overview of FPO services and business operations</p>
          </div>
          
          <div className="operations-grid">
            <div className="operation-card">
              <div className="card-header">
                <i className="fas fa-tractor"></i>
                <h3>Farm Services</h3>
              </div>
              <div className="card-content">
                <FPOServices fpoId={fpo.id} />
              </div>
            </div>

            <div className="operation-card">
              <div className="card-header">
                <i className="fas fa-chart-line"></i>
                <h3>Financial Turnover</h3>
              </div>
              <div className="card-content">
                <FPOTurnover fpoId={fpo.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Board Members Section */}
        <div className="fpo-board-section">
          <div className="section-header">
            <h2>Board Members</h2>
            <p>FPO leadership and governance structure</p>
          </div>
          <div className="board-content">
            <FPOBoardMembers fpoId={fpo.id} />
          </div>
        </div>

        {/* Business Operations Section */}
        <div className="fpo-business-section">
          <div className="section-header">
            <h2>Business Operations</h2>
            <p>Input shops, products, and crop management</p>
          </div>
          
          <div className="business-grid">
            <div className="business-card">
              <div className="card-header">
                <i className="fas fa-store"></i>
                <h3>Input Shops</h3>
              </div>
              <div className="card-content">
                <FPOInputShops fpoId={fpo.id} />
              </div>
            </div>

            <div className="business-card">
              <div className="card-header">
                <i className="fas fa-box"></i>
                <h3>Products Sold</h3>
              </div>
              <div className="card-content">
                <FPOProducts fpoId={fpo.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Crop Management Section */}
        <div className="fpo-crops-section">
          <div className="section-header">
            <h2>Crop Management</h2>
            <p>Agricultural activities and crop entries</p>
          </div>
          <div className="crops-content">
            <FPOCrops fpoId={(typeof fpo.id === 'number' && fpo.id) || (Number(fpo.id) ? Number(fpo.id) : fpo.id) || fpo.fpoId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FPODetailsView;
