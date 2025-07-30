import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RegistrationDetails } from "./RegistrationDetails";
import "../styles/List.css";
import { AuthContext } from '../AuthContext';
 
// ------------------ Registration List ------------------
export const RegistrationList = () => {
  const [registrations, setRegistrations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false); // Add this
  const token = localStorage.getItem("token");
   const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('ALL'); // New state for tab
  const { user } = useContext(AuthContext);
  const userRole = user?.role;

  // Move fetchRegistrations outside useEffect
  const fetchRegistrations = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/auth/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRegistrations(response.data);
    } catch (error) {
      console.error("Error fetching registrations", error);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations, token, refreshFlag]); // Add refreshFlag as dependency

  // Approve/Reject handlers
  const handleApproveUser = async (userId) => {
    try {
      // Use the approve endpoint to send temp password
      await axios.put(`http://localhost:8080/api/auth/users/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User approved and temporary password sent');
      setRefreshFlag(f => !f);
    } catch (err) {
      alert('Failed to approve user');
      console.error(err);
    }
  };
  const handleRejectUser = async (userId) => {
    try {
      await axios.put(`http://localhost:8080/api/auth/users/${userId}/status`, { status: 'REJECTED' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User rejected');
      setRefreshFlag(f => !f);
    } catch (err) {
      alert('Failed to reject user');
      console.error(err);
    }
  };

  // Filter registrations based on selected tab
  const filteredRegistrations = registrations.filter((r) => {
    // Hide admin registrations for ADMIN users only (case-insensitive)
    if (userRole?.toUpperCase?.() === 'ADMIN' && r.role?.toUpperCase?.() === 'ADMIN') return false;
    // Hide super admin registrations for all except SUPER_ADMIN
    if (userRole?.toUpperCase?.() !== 'SUPER_ADMIN' && r.role?.toUpperCase?.() === 'SUPER_ADMIN') return false;
    // Search filter
    const name = (r.name || r.userName || "").toLowerCase();
    const email = (r.email || "").toLowerCase();
    const mobile = (r.mobileNumber || "").toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      mobile.includes(searchTerm.toLowerCase());
    // Tab filter
    if (selectedTab === 'PENDING') return matchesSearch && r.status === 'PENDING';
    if (selectedTab === 'APPROVED') return matchesSearch && r.status === 'APPROVED';
    if (selectedTab === 'REJECTED') return matchesSearch && r.status === 'REJECTED';
    return matchesSearch; // ALL
  });

  // RegistrationList: update delete handler
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/super-admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      setRefreshFlag(f => !f); // Refresh the list
    } catch (err) {
      alert('Failed to delete user');
      console.error(err);
    }
  };
  return (
    <div className="list-container">

      {!selectedId && (
        <>
      <h3>📋 Registration List</h3>
      
      {/* Tabs for filtering */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <button
          className={selectedTab === 'ALL' ? 'tab-active' : ''}
          onClick={() => setSelectedTab('ALL')}
        >
          All
        </button>
        <button
          className={selectedTab === 'PENDING' ? 'tab-active' : ''}
          onClick={() => setSelectedTab('PENDING')}
        >
          Pending
        </button>
        <button
          className={selectedTab === 'APPROVED' ? 'tab-active' : ''}
          onClick={() => setSelectedTab('APPROVED')}
        >
          Approved
        </button>
        <button
          className={selectedTab === 'REJECTED' ? 'tab-active' : ''}
          onClick={() => setSelectedTab('REJECTED')}
        >
          Rejected
        </button>
      </div>
       <div className="search-container">
        <input
            type="text"
            placeholder="🔍 Search....."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
           />
          </div>
      {filteredRegistrations.length === 0 ? (
        <p>No registrations found.</p>
      ) : (
        <table className="registration-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Date of Birth</th>
              <th>State</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((r) => (
              <tr key={r.id}>
                <td>{r.name || r.userName}</td>
                <td>{r.email}</td>
                <td>{r.mobileNumber || "N/A"}</td>
                <td>{r.dateOfBirth || "N/A"}</td>
                <td>{r.state || "N/A"}</td>
                {/* Show role only if status is not PENDING and role exists */}
                <td>{r.status !== "PENDING" && r.role ? r.role : ""}</td>
                <td>
                  <span
                    className={
                      r.status === "APPROVED"
                        ? "status-approved"
                        : r.status === "PENDING"
                        ? "status-pending"
                        : r.status === "REJECTED"
                        ? "status-rejected"
                        : "status-default"
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setSelectedId(r.id)} className="view-btn" style={{ background: '#006838', color: '#fff', borderRadius: '6px', padding: '6px 18px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View</button>
                    {userRole === 'SUPER_ADMIN' && r.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveUser(r.id)}
                          style={{ background: '#22c55e', color: '#fff', borderRadius: '6px', padding: '6px 14px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectUser(r.id)}
                          style={{ background: '#e53935', color: '#fff', borderRadius: '6px', padding: '6px 14px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {userRole === 'ADMIN' && r.status === 'PENDING' && r.role !== 'ADMIN' && (
                      <>
                        <button
                          onClick={() => handleApproveUser(r.id)}
                          style={{ background: '#22c55e', color: '#fff', borderRadius: '6px', padding: '6px 14px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectUser(r.id)}
                          style={{ background: '#e53935', color: '#fff', borderRadius: '6px', padding: '6px 14px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {userRole === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(r.id)}
                        className="delete-btn"
                        style={{ background: '#e53935', color: '#fff', borderRadius: '6px', padding: '6px 18px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
      
        </>
      )}
      {selectedId && (
        <RegistrationDetails
          id={selectedId}
          onBack={() => {
            setSelectedId(null);
            setRefreshFlag(f => !f); // Toggle to trigger refresh
          }}
        />
      )}
    </div>
  );
};
 
// ------------------ Farmer List ------------------
 export const FarmerList = () => {
  const [farmers, setFarmers] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const userRole = user?.role;
  const { farmerId } = useParams();
  const [loading, setLoading] = useState(false);
  const { reset } = useForm();

  // ✅ Fetch all farmers list
  const fetchAllFarmers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in.");
      return;
    }
    try {
      const res = await axios.get("http://localhost:8080/api/farmers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFarmers(res.data || []);
    } catch (err) {
      console.error("Error fetching farmers:", err);
      alert("Failed to fetch farmers.");
    }
  };

  // ✅ Fetch single farmer if farmerId is in URL
  const fetchFarmerData = async () => {
    if (!farmerId || farmerId === "undefined") {
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/farmers/${farmerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      reset(res.data);
    } catch (err) {
      console.error("Error fetching farmer data:", err);
      alert("Failed to fetch farmer data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ On mount, fetch the list
  useEffect(() => {
    fetchAllFarmers();
  }, []);

  // ✅ If editing a farmer
  useEffect(() => {
    if (farmerId) {
      fetchFarmerData();
    }
  }, [farmerId, fetchFarmerData]);

  // ✅ Update status locally
  const handleStatusChange = (id, newStatus) => {
    const updatedFarmers = farmers.map((f) =>
      f.id === id ? { ...f, status: newStatus } : f
    );
    setFarmers(updatedFarmers);
  };

  // ✅ Mask Aadhaar
  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return "";
    return `****-***-${aadhaar.slice(-4)}`;
  };
  // ✅ Show loading state
  if (loading) return <p>Loading farmer data...</p>;

  // FarmerList: add delete handler and button
  const handleDeleteFarmer = async (farmerId) => {
    if (!window.confirm('Are you sure you want to delete this farmer?')) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/super-admin/farmers/${farmerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Farmer deleted successfully');
      setFarmers(farmers.filter(f => f.id !== farmerId));
    } catch (err) {
      alert('Failed to delete farmer');
      console.error(err);
    }
  };

  return (
    <div className="list-container">
      <h3> Farmers List</h3>
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      {farmers.length === 0 ? (
        <p>No farmers found.</p>
      ) : (
        <table className="registration-table">
          <thead>
            <tr>
              <th>Farmer ID</th>
              <th>Name</th>
              <th>Document</th>
              <th>State</th>
              <th>District</th>
              <th>Mandal</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((f) => (
              <tr key={f.id}>
                <td><span className="farmer-id">{f.id}</span></td>
                <td>{f.name?.trim() || `${f.firstName || ""} ${f.lastName || ""}`.trim()}</td>
                <td>{f.documentType?.toLowerCase() === "aadhaar" && f.documentNumber ? maskAadhaar(f.documentNumber) : f.documentType || "-"}</td>
                <td>{f.state || "-"}</td>
                <td>{f.district || "-"}</td>
                <td>{f.block || "-"}</td>
                <td>
                  <select
                    className="reg-selact"
                    value={f.status || ""}
                    onChange={(e) => handleStatusChange(f.id, e.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <button
                    className="view-btn"
                    style={{ background: '#006838', color: '#fff', borderRadius: '6px', padding: '6px 18px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => navigate(`/view-farmer/${f.id}`)}
                  >
                    View
                  </button>
                  {userRole === 'SUPER_ADMIN' && (
                    <button
                      className="delete-btn"
                      style={{ background: '#e53935', color: '#fff', borderRadius: '6px', padding: '6px 18px', border: 'none', fontWeight: 600, cursor: 'pointer', marginLeft: 8 }}
                      onClick={() => handleDeleteFarmer(f.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
 
// ------------------ Employee List ------------------
export const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const userRole = user?.role;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data);
      } catch (error) {
        console.error("❌ Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((e) => {
    // Hide super admin employees for all except SUPER_ADMIN
    if (userRole?.toUpperCase?.() !== 'SUPER_ADMIN' && e.role?.toUpperCase?.() === 'SUPER_ADMIN') return false;
    const name = (e.name || "").toLowerCase();
    const designation = (e.designation || "").toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      designation.includes(searchTerm.toLowerCase())
    );
  });

  // Add a handler for changing employee status
  const handleEmployeeStatusChange = (id, newStatus) => {
    const updatedEmployees = employees.map((e) =>
      e.id === id ? { ...e, status: newStatus } : e
    );
    setEmployees(updatedEmployees);
  };

  // EmployeeList: add delete handler and button
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/super-admin/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Employee deleted successfully');
      setEmployees(employees.filter(e => e.id !== employeeId));
    } catch (err) {
      alert('Failed to delete employee');
      console.error(err);
    }
  };

  return (
    <div className="list-container">
      <h3>📋 Employees List</h3>
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search by name or designation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      {filteredEmployees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table className="registration-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>District</th>
              <th>Contact Number</th>
              <th>Onboard Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((e) => (
              <tr key={e.id}>
                <td><span className="employee-id">{e.Id}</span></td>
                <td>{e.firstName}</td>
                <td>{e.role}</td>
                <td>{e.district}</td>
                <td>{e.contactNumber}</td>
                <td>{e.onboardDate}</td>
                <td>
                  <select
                    className="reg-selact"
                    value={e.status || ""}
                    onChange={(ev) => handleEmployeeStatusChange(e.id, ev.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <button
                    className="view-btn"
                    style={{ background: '#006838', color: '#fff', borderRadius: '6px', padding: '6px 18px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => navigate(`/view-employee/${e.id}`)}
                  >
                    View
                  </button>
                  {userRole === 'SUPER_ADMIN' && (
                    <button
                      className="delete-btn"
                      style={{ background: '#e53935', color: '#fff', borderRadius: '6px', padding: '6px 18px', border: 'none', fontWeight: 600, cursor: 'pointer', marginLeft: 8 }}
                      onClick={() => handleDeleteEmployee(e.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}; 