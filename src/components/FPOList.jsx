import React, { useState } from 'react';
import { fpoAPI } from '../api/apiService';
import '../styles/FPOList.css';
import ActionDropdown from './ActionDropdown';

const FPOList = ({ 
  fpos, 
  onFPOSelect, 
  onFPOUpdate, 
  onFPODelete, 
  loading, 
  error, 
  onRequestEdit,
  onViewFPO,
  onEditFPO,
  onBoardMembers,
  onFarmServices,
  onTurnover,
  onCropEntries,
  onInputShop,
  onProductCategories,
  onProducts,
  onFpoUsers,
  allowDelete = true,
  userRole = "SUPER_ADMIN"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFPO, setEditingFPO] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingFPO, setDeletingFPO] = useState(null);

  React.useEffect(() => {
    loadStates();
  }, []);

  React.useEffect(() => {
    if (selectedState) {
      loadDistricts(selectedState);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  const loadStates = async () => {
    try {
      const response = await fpoAPI.getDistinctStates();
      setStates(response);
    } catch (err) {
      console.error('Error loading states:', err);
    }
  };

  const loadDistricts = async (state) => {
    try {
      const response = await fpoAPI.getDistinctDistrictsByState(state);
      setDistricts(response);
    } catch (err) {
      console.error('Error loading districts:', err);
    }
  };

  const filteredFPOs = fpos.filter(fpo => {
    const matchesSearch = !searchTerm || 
      fpo.fpoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fpo.ceoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fpo.phoneNumber.includes(searchTerm) ||
      fpo.fpoId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = !selectedState || fpo.state === selectedState;
    const matchesDistrict = !selectedDistrict || fpo.district === selectedDistrict;
    const matchesStatus = !selectedStatus || fpo.status === selectedStatus;

    return matchesSearch && matchesState && matchesDistrict && matchesStatus;
  });

  const handleEdit = (fpo) => {
    if (onRequestEdit) {
      onRequestEdit(fpo);
      return;
    }
    setEditingFPO(fpo);
    setShowEditModal(true);
  };

  const handleDelete = (fpo) => {
    setDeletingFPO(fpo);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await fpoAPI.deleteFPO(deletingFPO.id);
      onFPODelete(deletingFPO.id);
      setShowDeleteModal(false);
      setDeletingFPO(null);
    } catch (err) {
      console.error('Error deleting FPO:', err);
      alert('Failed to delete FPO');
    }
  };

  const handleStatusChange = async (fpo, newStatus) => {
    try {
      if (newStatus === 'ACTIVE') {
        await fpoAPI.activateFPO(fpo.id);
      } else if (newStatus === 'INACTIVE') {
        await fpoAPI.deactivateFPO(fpo.id);
      }
      
      const updatedFPO = { ...fpo, status: newStatus };
      onFPOUpdate(updatedFPO);
    } catch (err) {
      console.error('Error updating FPO status:', err);
      alert('Failed to update FPO status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'ACTIVE': 'status-active',
      'INACTIVE': 'status-inactive',
      'SUSPENDED': 'status-suspended',
      'UNDER_REVIEW': 'status-under-review'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading FPOs...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="fpo-list-container">
      {/* Search and Filters */}
      <div className="fpo-filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search FPOs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="filter-select"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="filter-select"
            disabled={!selectedState}
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="UNDER_REVIEW">Under Review</option>
          </select>
        </div>
      </div>

      {/* FPO List */}
      <div className="fpo-list">
        {filteredFPOs.length === 0 ? (
          <div className="no-fpos">No FPOs found</div>
        ) : (
          filteredFPOs.map(fpo => (
            <div key={fpo.id} className="fpo-card">
              <div className="fpo-header">
                <div className="fpo-info">
                  <h3 className="fpo-name">{fpo.fpoName}</h3>
                  <p className="fpo-id">FPO ID: {fpo.fpoId}</p>
                </div>
                <div className="fpo-status">
                  {getStatusBadge(fpo.status)}
                </div>
              </div>
              
              <div className="fpo-details">
                <div className="detail-row">
                  <span className="label">CEO:</span>
                  <span className="value">{fpo.ceoName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{fpo.phoneNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{fpo.village}, {fpo.district}, {fpo.state}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Members:</span>
                  <span className="value">{fpo.numberOfMembers}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Join Date:</span>
                  <span className="value">{new Date(fpo.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="fpo-actions">
                {(() => {
                  const commonNavigate = (tab) => onFPOSelect(fpo, tab);
                  const menu = [
                    { label: 'Dashboard', icon: '📊', onClick: () => onViewFPO ? onViewFPO(fpo) : commonNavigate('overview') },
                    { label: 'Edit FPO', icon: '✏️', onClick: () => onEditFPO ? onEditFPO(fpo) : handleEdit(fpo) },
                    { label: 'FPO Board Members', icon: '👥', onClick: () => onBoardMembers ? onBoardMembers(fpo) : commonNavigate('board-members') },
                    { label: 'FPO Farm Services', icon: '🚜', onClick: () => onFarmServices ? onFarmServices(fpo) : commonNavigate('services') },
                    { label: 'FPO Turnover', icon: '📈', onClick: () => onTurnover ? onTurnover(fpo) : commonNavigate('turnover') },
                    { label: 'FPO Crop Entries', icon: '🌾', onClick: () => onCropEntries ? onCropEntries(fpo) : commonNavigate('crops') },
                    { label: 'FPO Input Shop', icon: '🏬', onClick: () => onInputShop ? onInputShop(fpo) : commonNavigate('input-shop') },
                    { label: 'FPO Product Categories', icon: '🏷️', onClick: () => onProductCategories ? onProductCategories(fpo) : commonNavigate('product-categories') },
                    { label: 'FPO Products', icon: '📦', onClick: () => onProducts ? onProducts(fpo) : commonNavigate('products') },
                    { label: 'FPO Users', icon: '👤', onClick: () => onFpoUsers ? onFpoUsers(fpo) : commonNavigate('users') },
                    (fpo.status === 'ACTIVE')
                      ? { label: 'Deactivate', icon: '🚫', className: 'warning', onClick: () => handleStatusChange(fpo, 'INACTIVE') }
                      : { label: 'Activate', icon: '✅', className: 'success', onClick: () => handleStatusChange(fpo, 'ACTIVE') },
                    ...(allowDelete ? [{ label: 'Delete', icon: '🗑️', className: 'danger', onClick: () => handleDelete(fpo) }] : [])
                  ];
                  return (
                    <ActionDropdown
                      item={fpo}
                      actions={menu}
                    />
                  );
                })()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the FPO "{deletingFPO?.fpoName}"?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FPOList;
