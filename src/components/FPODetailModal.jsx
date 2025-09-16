import React from 'react';
import FPOBoardMembers from './FPOBoardMembers';
import FPOServices from './FPOServices';
import FPOCrops from './FPOCrops';
import FPOTurnover from './FPOTurnover';
import FPOProducts from './FPOProducts';
import '../styles/FPOModal.css';

const FPODetailModal = ({ fpo, onClose }) => {
  if (!fpo) return null;

  const address = (fpo.village || '') + (fpo.village ? ', ' : '') +
    (fpo.district || '') + (fpo.district ? ', ' : '') + (fpo.state || '') +
    (fpo.pincode ? ' - ' + fpo.pincode : '');

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '80vw', maxWidth: 1000 }}>
        <div className="modal-header">
          <h2>{fpo.fpoName} ({fpo.fpoId})</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 20 }}>
              <h3 style={{ marginTop: 0 }}>{fpo.fpoName} ({fpo.fpoId})</h3>
              <div style={{ lineHeight: '28px' }}>
                <div><strong>Reg No:</strong> {fpo.registrationNumber || '-'}</div>
                <div><strong>Email:</strong> {fpo.email || '-'}</div>
                <div><strong>Phone:</strong> {fpo.phoneNumber || '-'}</div>
                <div><strong>CEO:</strong> {fpo.ceoName || '-'}</div>
                <div><strong>Address:</strong> {address || '-'}</div>
              </div>
            </div>
            <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 700, textAlign: 'center' }}>Status:</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <span style={{ background: '#fde68a', color: '#92400e', padding: '6px 10px', borderRadius: 10 }}>
                  {(fpo.status || '').toString().replace('_', ' ') || 'PENDING'}
                </span>
              </div>
              <div style={{ fontWeight: 700, textAlign: 'center', marginTop: 20 }}>Joined:</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fpo.joinDate || '-'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
            <div>
              <h3>Farm Services</h3>
              <FPOServices fpoId={fpo.id} />
            </div>
            <div>
              <h3>Turnovers</h3>
              <FPOTurnover fpoId={fpo.id} />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Board Members</h3>
            <FPOBoardMembers fpoId={fpo.id} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
            <div>
              <h3>Products Sold</h3>
              <FPOProducts fpoId={fpo.id} />
            </div>
            <div>
              <h3>Crop Entries</h3>
              <FPOCrops fpoId={fpo.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FPODetailModal;


