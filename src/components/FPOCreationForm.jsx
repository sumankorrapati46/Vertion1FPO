import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';
import '../styles/FPOCreationForm.css';

const FPOCreationForm = ({ onClose, onFPOCreated, onSubmit, fpoData }) => {
  const [formData, setFormData] = useState({
    fpoName: '',
    ceoName: '',
    phoneNumber: '',
    email: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    joinDate: '',
    registrationType: 'COOPERATIVE',
    numberOfMembers: 1,
    registrationNumber: '',
    panNumber: '',
    gstNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    // Prefill when editing
    if (fpoData) {
      setFormData(prev => ({ ...prev, ...fpoData }));
    }
    loadStates();
  }, []);

  useEffect(() => {
    if (formData.state) {
      loadDistricts(formData.state);
    } else {
      setDistricts([]);
    }
  }, [formData.state]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fpoName.trim()) {
      newErrors.fpoName = 'FPO Name is required';
    }

    if (!formData.ceoName.trim()) {
      newErrors.ceoName = 'CEO/Contact Person Name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.village.trim()) {
      newErrors.village = 'Village is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.joinDate) {
      newErrors.joinDate = 'Join Date is required';
    }

    if (!formData.numberOfMembers || formData.numberOfMembers < 1) {
      newErrors.numberOfMembers = 'Number of members must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(formData);
      } else {
        const response = await fpoAPI.createFPO(formData);
        if (typeof onFPOCreated === 'function') {
          onFPOCreated(response);
        }
      }
      onClose && onClose();
    } catch (err) {
      console.error('Error creating FPO:', err);
      alert('Failed to create FPO. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal fpo-creation-modal">
        <div className="modal-header">
          <h2>Create New FPO</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="fpo-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fpoName">FPO Name *</label>
                <input
                  type="text"
                  id="fpoName"
                  name="fpoName"
                  value={formData.fpoName}
                  onChange={handleInputChange}
                  className={errors.fpoName ? 'error' : ''}
                />
                {errors.fpoName && <span className="error-message">{errors.fpoName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="ceoName">CEO/Contact Person Name *</label>
                <input
                  type="text"
                  id="ceoName"
                  name="ceoName"
                  value={formData.ceoName}
                  onChange={handleInputChange}
                  className={errors.ceoName ? 'error' : ''}
                />
                {errors.ceoName && <span className="error-message">{errors.ceoName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={errors.phoneNumber ? 'error' : ''}
                  maxLength="10"
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Address Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="village">Village *</label>
                <input
                  type="text"
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                  className={errors.village ? 'error' : ''}
                />
                {errors.village && <span className="error-message">{errors.village}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="district">District *</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={errors.district ? 'error' : ''}
                />
                {errors.district && <span className="error-message">{errors.district}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="Enter State"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={errors.state ? 'error' : ''}
                  list="state-suggestions"
                />
                {/* Optional datalist to help users, still free-text */}
                <datalist id="state-suggestions">
                  {states.map((state) => (
                    <option key={state} value={state} />
                  ))}
                </datalist>
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="pincode">Pincode *</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={errors.pincode ? 'error' : ''}
                  maxLength="6"
                />
                {errors.pincode && <span className="error-message">{errors.pincode}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Registration Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="joinDate">Join Date *</label>
                <input
                  type="date"
                  id="joinDate"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className={errors.joinDate ? 'error' : ''}
                />
                {errors.joinDate && <span className="error-message">{errors.joinDate}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="registrationType">Registration Type *</label>
                <select
                  id="registrationType"
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={handleInputChange}
                >
                  <option value="COMPANY">Company</option>
                  <option value="COOPERATIVE">Cooperative</option>
                  <option value="SOCIETY">Society</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numberOfMembers">Number of Members *</label>
                <input
                  type="number"
                  id="numberOfMembers"
                  name="numberOfMembers"
                  value={formData.numberOfMembers}
                  onChange={handleInputChange}
                  className={errors.numberOfMembers ? 'error' : ''}
                  min="1"
                />
                {errors.numberOfMembers && <span className="error-message">{errors.numberOfMembers}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="registrationNumber">Registration Number</label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information (Optional)</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="panNumber">PAN Number</label>
                <input
                  type="text"
                  id="panNumber"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="gstNumber">GST Number</label>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bankName">Bank Name</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ifscCode">IFSC Code</label>
                <input
                  type="text"
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="branchName">Branch Name</label>
                <input
                  type="text"
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create FPO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FPOCreationForm;
