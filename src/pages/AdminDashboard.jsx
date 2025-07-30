import React, { useState, useEffect } from 'react';
import api from '../api/apiService';

const TABS = [
  'Farmers',
  'Employees',
  'Assign Farmer',
  'Assignments',
];

const AdminDashboard = () => {
  const [tab, setTab] = useState(0);
  // Farmers CRUD
  const [farmers, setFarmers] = useState([]);
  const [farmerForm, setFarmerForm] = useState({ name: '', email: '', phone: '' });
  const [editingFarmerId, setEditingFarmerId] = useState(null);
  const [farmerSearch, setFarmerSearch] = useState('');
  // Employees CRUD
  const [employees, setEmployees] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', phone: '' });
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  // Assign Farmer
  const [assignFarmerId, setAssignFarmerId] = useState('');
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignments, setAssignments] = useState([]);
  // General
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (tab === 0) fetchFarmers();
    if (tab === 1) fetchEmployees();
    if (tab === 2 || tab === 3) {
      fetchFarmers();
      fetchEmployees();
      fetchAssignments();
    }
  }, [tab]);

  // --- Farmers CRUD ---
  const fetchFarmers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/admin/farmers');
      setFarmers(res.data);
    } catch (err) {
      setMessage('Failed to fetch farmers.');
    } finally {
      setLoading(false);
    }
  };
  const handleFarmerFormChange = (e) => {
    setFarmerForm({ ...farmerForm, [e.target.name]: e.target.value });
  };
  const handleFarmerFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (editingFarmerId) {
        await api.put(`/admin/farmers/${editingFarmerId}`, farmerForm);
        setMessage('Farmer updated.');
      } else {
        await api.post('/admin/farmers', farmerForm);
        setMessage('Farmer added.');
      }
      setFarmerForm({ name: '', email: '', phone: '' });
      setEditingFarmerId(null);
      fetchFarmers();
    } catch (err) {
      setMessage('Failed to save farmer.');
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
  const handleDeleteFarmer = async (farmerId) => {
    if (!window.confirm('Delete this farmer?')) return;
    setLoading(true);
    setMessage('');
    try {
      await api.delete(`/admin/farmers/${farmerId}`);
      setMessage('Farmer deleted.');
      fetchFarmers();
    } catch (err) {
      setMessage('Failed to delete farmer.');
    } finally {
      setLoading(false);
    }
  };

  // --- Employees CRUD ---
  const fetchEmployees = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/admin/employees');
      setEmployees(res.data);
    } catch (err) {
      setMessage('Failed to fetch employees.');
    } finally {
      setLoading(false);
    }
  };
  const handleEmployeeFormChange = (e) => {
    setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value });
  };
  const handleEmployeeFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (editingEmployeeId) {
        await api.put(`/admin/employees/${editingEmployeeId}`, employeeForm);
        setMessage('Employee updated.');
      } else {
        await api.post('/admin/employees', employeeForm);
        setMessage('Employee added.');
      }
      setEmployeeForm({ name: '', email: '', phone: '' });
      setEditingEmployeeId(null);
      fetchEmployees();
    } catch (err) {
      setMessage('Failed to save employee.');
    } finally {
      setLoading(false);
    }
  };
  const handleEditEmployee = (employee) => {
    setEditingEmployeeId(employee.id);
    setEmployeeForm({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
    });
  };
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Delete this employee?')) return;
    setLoading(true);
    setMessage('');
    try {
      await api.delete(`/admin/employees/${employeeId}`);
      setMessage('Employee deleted.');
      fetchEmployees();
    } catch (err) {
      setMessage('Failed to delete employee.');
    } finally {
      setLoading(false);
    }
  };

  // --- Assign Farmer ---
  const fetchAssignments = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/admin/assignments');
      setAssignments(res.data);
    } catch (err) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };
  const handleAssignFarmer = async () => {
    if (!assignFarmerId || !assignEmployeeId) {
      setMessage('Please select both a farmer and an employee.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await api.post(`/admin/assign-farmer?farmerId=${assignFarmerId}&employeeId=${assignEmployeeId}`);
      setMessage('Farmer assigned to employee successfully.');
      setAssignFarmerId('');
      setAssignEmployeeId('');
      fetchAssignments();
    } catch (err) {
      setMessage('Failed to assign farmer.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ fontWeight: tab === i ? 'bold' : 'normal' }}>{t}</button>
        ))}
      </div>
      {tab === 0 && (
        <div>
          <h3>Farmers</h3>
          <input
            type="text"
            placeholder="Search farmers..."
            value={farmerSearch}
            onChange={e => setFarmerSearch(e.target.value)}
            style={{ marginBottom: '1em', width: '250px' }}
          />
          {loading && <p>Loading...</p>}
          {message && <p>{message}</p>}
          <form onSubmit={handleFarmerFormSubmit} style={{ marginBottom: '1em' }}>
            <input name="name" placeholder="Name" value={farmerForm.name} onChange={handleFarmerFormChange} required />
            <input name="email" placeholder="Email" value={farmerForm.email} onChange={handleFarmerFormChange} required />
            <input name="phone" placeholder="Phone" value={farmerForm.phone} onChange={handleFarmerFormChange} required />
            <button type="submit" disabled={loading}>{editingFarmerId ? 'Update' : 'Add'} Farmer</button>
            {editingFarmerId && <button type="button" onClick={() => { setEditingFarmerId(null); setFarmerForm({ name: '', email: '', phone: '' }); }}>Cancel</button>}
          </form>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {farmers.filter(f =>
                f.name?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                f.email?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                f.phone?.toLowerCase().includes(farmerSearch.toLowerCase())
              ).length === 0 && (
                <tr><td colSpan="4">No farmers found.</td></tr>
              )}
              {farmers.filter(f =>
                f.name?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                f.email?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                f.phone?.toLowerCase().includes(farmerSearch.toLowerCase())
              ).map(farmer => (
                <tr key={farmer.id}>
                  <td>{farmer.name}</td>
                  <td>{farmer.email}</td>
                  <td>{farmer.phone}</td>
                  <td>
                    <button onClick={() => handleEditFarmer(farmer)} disabled={loading}>Edit</button>
                    <button onClick={() => handleDeleteFarmer(farmer.id)} disabled={loading}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 1 && (
        <div>
          <h3>Employees</h3>
          <input
            type="text"
            placeholder="Search employees..."
            value={employeeSearch}
            onChange={e => setEmployeeSearch(e.target.value)}
            style={{ marginBottom: '1em', width: '250px' }}
          />
          {loading && <p>Loading...</p>}
          {message && <p>{message}</p>}
          <form onSubmit={handleEmployeeFormSubmit} style={{ marginBottom: '1em' }}>
            <input name="name" placeholder="Name" value={employeeForm.name} onChange={handleEmployeeFormChange} required />
            <input name="email" placeholder="Email" value={employeeForm.email} onChange={handleEmployeeFormChange} required />
            <input name="phone" placeholder="Phone" value={employeeForm.phone} onChange={handleEmployeeFormChange} required />
            <button type="submit" disabled={loading}>{editingEmployeeId ? 'Update' : 'Add'} Employee</button>
            {editingEmployeeId && <button type="button" onClick={() => { setEditingEmployeeId(null); setEmployeeForm({ name: '', email: '', phone: '' }); }}>Cancel</button>}
          </form>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.filter(e =>
                e.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                e.email?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                e.phone?.toLowerCase().includes(employeeSearch.toLowerCase())
              ).length === 0 && (
                <tr><td colSpan="4">No employees found.</td></tr>
              )}
              {employees.filter(e =>
                e.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                e.email?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                e.phone?.toLowerCase().includes(employeeSearch.toLowerCase())
              ).map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone}</td>
                  <td>
                    <button onClick={() => handleEditEmployee(employee)} disabled={loading}>Edit</button>
                    <button onClick={() => handleDeleteEmployee(employee.id)} disabled={loading}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 2 && (
        <div>
          <h3>Assign Farmer to Employee</h3>
          {loading && <p>Loading...</p>}
          {message && <p>{message}</p>}
          <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
            <select value={assignFarmerId} onChange={e => setAssignFarmerId(e.target.value)}>
              <option value="">Select Farmer</option>
              {farmers.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
              ))}
            </select>
            <select value={assignEmployeeId} onChange={e => setAssignEmployeeId(e.target.value)}>
              <option value="">Select Employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
              ))}
            </select>
            <button onClick={handleAssignFarmer} disabled={loading}>Assign</button>
          </div>
        </div>
      )}
      {tab === 3 && (
        <div>
          <h3>Assignments</h3>
          {loading && <p>Loading...</p>}
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Employee</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr><td colSpan="2">No assignments found.</td></tr>
              )}
              {assignments.map(a => (
                <tr key={a.farmerId + '-' + a.employeeId}>
                  <td>{a.farmerName} ({a.farmerEmail})</td>
                  <td>{a.employeeName} ({a.employeeEmail})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 