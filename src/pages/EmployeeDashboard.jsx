import React, { useState, useEffect } from 'react';
import api from '../api/apiService';

const EmployeeDashboard = () => {
  const [farmers, setFarmers] = useState([]);
  const [editingFarmerId, setEditingFarmerId] = useState(null);
  const [farmerForm, setFarmerForm] = useState({ name: '', email: '', phone: '' });
  const [farmerSearch, setFarmerSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssignedFarmers();
  }, []);

  const fetchAssignedFarmers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/employee/assigned-farmers');
      setFarmers(res.data);
    } catch (err) {
      setMessage('Failed to fetch assigned farmers.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFarmer = (farmer) => {
    setEditingFarmerId(farmer.id);
    setFarmerForm({
      name: farmer.name || '',
      email: farmer.email || '',
      phone: farmer.phone || '',
    });
  };

  const handleFarmerFormChange = (e) => {
    setFarmerForm({ ...farmerForm, [e.target.name]: e.target.value });
  };

  const handleFarmerFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.put(`/employee/farmers/${editingFarmerId}`, farmerForm);
      setMessage('Farmer updated.');
      setEditingFarmerId(null);
      setFarmerForm({ name: '', email: '', phone: '' });
      fetchAssignedFarmers();
    } catch (err) {
      setMessage('Failed to update farmer.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKyc = async (farmerId) => {
    setLoading(true);
    setMessage('');
    try {
      await api.put(`/employee/approve-kyc/${farmerId}`);
      setMessage('KYC approved.');
      fetchAssignedFarmers();
    } catch (err) {
      setMessage('Failed to approve KYC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Employee Dashboard</h2>
      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}
      <h3>Assigned Farmers</h3>
      <input
        type="text"
        placeholder="Search farmers..."
        value={farmerSearch}
        onChange={e => setFarmerSearch(e.target.value)}
        style={{ marginBottom: '1em', width: '250px' }}
      />
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>KYC Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {farmers.filter(f =>
            f.name?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
            f.email?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
            f.phone?.toLowerCase().includes(farmerSearch.toLowerCase())
          ).length === 0 && (
            <tr><td colSpan="5">No assigned farmers.</td></tr>
          )}
          {farmers.filter(f =>
            f.name?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
            f.email?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
            f.phone?.toLowerCase().includes(farmerSearch.toLowerCase())
          ).map(farmer => (
            <tr key={farmer.id}>
              <td>{editingFarmerId === farmer.id ? (
                <input name="name" value={farmerForm.name} onChange={handleFarmerFormChange} />
              ) : farmer.name}</td>
              <td>{editingFarmerId === farmer.id ? (
                <input name="email" value={farmerForm.email} onChange={handleFarmerFormChange} />
              ) : farmer.email}</td>
              <td>{editingFarmerId === farmer.id ? (
                <input name="phone" value={farmerForm.phone} onChange={handleFarmerFormChange} />
              ) : farmer.phone}</td>
              <td>{farmer.kycApproved ? 'Approved' : 'Pending'}</td>
              <td>
                {editingFarmerId === farmer.id ? (
                  <>
                    <button onClick={handleFarmerFormSubmit} disabled={loading}>Save</button>
                    <button onClick={() => { setEditingFarmerId(null); setFarmerForm({ name: '', email: '', phone: '' }); }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditFarmer(farmer)} disabled={loading}>Edit</button>
                    {!farmer.kycApproved && (
                      <button onClick={() => handleApproveKyc(farmer.id)} disabled={loading}>Approve KYC</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeDashboard; 