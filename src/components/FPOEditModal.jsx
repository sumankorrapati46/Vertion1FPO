import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOEditModal = ({ fpo, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    fpoName: '',
    registrationNumber: '',
    ceoName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fpo) {
      setForm({
        fpoName: fpo.fpoName || '',
        registrationNumber: fpo.registrationNumber || '',
        ceoName: fpo.ceoName || '',
        email: fpo.email || '',
        phoneNumber: fpo.phoneNumber || '',
        address: `${fpo.village || ''}${fpo.village ? ', ' : ''}${fpo.district || ''}${fpo.district ? ', ' : ''}${fpo.state || ''}${fpo.pincode ? ' - ' + fpo.pincode : ''}`.trim()
      });
    }
  }, [fpo]);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Derive address parts minimally; keep unknowns from original
      const next = {
        ...fpo,
        fpoName: form.fpoName,
        registrationNumber: form.registrationNumber,
        ceoName: form.ceoName,
        email: form.email,
        phoneNumber: form.phoneNumber
      };

      // If the address field is edited, store it back in village as a single line
      if (form.address && form.address !== `${fpo.village || ''}`) {
        next.village = form.address; // keep simple single-line address
      }

      const updated = await fpoAPI.updateFPO(fpo.id, next);
      onUpdated && onUpdated(updated);
      onClose && onClose();
    } catch (err) {
      console.error('Failed to update FPO', err);
      alert('Failed to update FPO');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <h2>Update FPO</h2>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>FPO Name*</label>
              <input name="fpoName" value={form.fpoName} onChange={updateField} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Registration No</label>
              <input name="registrationNumber" value={form.registrationNumber} onChange={updateField} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>CEO Name</label>
              <input name="ceoName" value={form.ceoName} onChange={updateField} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Email</label>
              <input name="email" value={form.email} onChange={updateField} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Phone</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={updateField} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Address</label>
              <textarea name="address" value={form.address} onChange={updateField} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FPOEditModal;


