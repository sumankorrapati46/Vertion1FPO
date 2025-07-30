import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RegistrationDetails.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faVenusMars, faGlobeAsia, faMapMarkerAlt, faKey, faBirthdayCake } from '@fortawesome/free-solid-svg-icons';

export const RegistrationDetails = ({ id, onBack }) => {
  console.log("RegistrationDetails got id:", id);
  const [registration, setRegistration] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Fetch registration details by id
  useEffect(() => {
    if (!id) return;
    const fetchRegistration = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8080/api/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRegistration(res.data);
      } catch (error) {
        console.error("Error fetching registration details:", error);
      }
    };
    fetchRegistration();
  }, [id]);

  // Update status handler
  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      const token = localStorage.getItem("token");
      if (newStatus === "APPROVED") {
        // Call the dedicated approval endpoint to trigger approval email
        await axios.put(
          `http://localhost:8080/api/auth/users/${id}/approve`,
          { role: registration.role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("User approved and approval email sent");
        setRegistration((prev) => ({
          ...prev,
          status: newStatus,
        }));
      } else {
        // For REJECTED/RETURN, use the existing status update endpoint
        await axios.put(
          `http://localhost:8080/api/auth/users/${id}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Status updated successfully");
        setRegistration((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }
      setNewStatus("");
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // Show loader while fetching
  if (!registration) return <div className="details-container">Loading...</div>;

  return (
    <div className="details-container">
      <button onClick={onBack}>Back to List</button>
      <h2>Registration Details</h2>
      <div className="details-card"> 
        <div className="info-section">
          <p><span className="icon"><FontAwesomeIcon icon={faUser} /></span><strong>First Name:</strong> {registration.firstName}</p>
          <p><span className="icon"><FontAwesomeIcon icon={faUser} /></span><strong>Last Name:</strong> {registration.lastName}</p>
          <p><span className="icon"><FontAwesomeIcon icon={faBirthdayCake} /></span><strong>DOB:</strong> {registration.dateOfBirth}</p>
          <p><span className="icon"><FontAwesomeIcon icon={faVenusMars} /></span><strong>Gender:</strong> {registration.gender}</p>
          <p><span className="icon"><FontAwesomeIcon icon={faEnvelope} /></span><strong>Email:</strong> {registration.email}</p>
          <p><span className="icon"><FontAwesomeIcon icon={faPhone} /></span><strong>Mobile:</strong> {registration.mobileNumber}</p>
          <p><span className="icon"><FontAwesomeIcon icon={faGlobeAsia} /></span><strong>Country:</strong> {registration.country}</p>
          <p><span className="icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></span><strong>State:</strong> {registration.state}</p>
          <p><span className="icon"><FontAwesomeIcon icon={faKey} /></span><strong>Pin Code:</strong> {registration.pinCode}</p>
        </div>
      </div>

      <div className="status-section">
        <p>
          <strong>Current Status:</strong>{" "}
          <span className={`status ${registration.status?.toLowerCase()}`}>{registration.status}</span>
        </p>

        {/* Only show status update if status is PENDING */}
        {registration.status === "PENDING" && (
          <>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select Action</option>
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject</option>
              <option value="RETURN">Refer Back</option>
            </select>
            <button disabled={!newStatus} onClick={handleStatusUpdate}>
              Update Status
            </button>
          </>
        )}

        {/* Always show role if it exists */}
        {registration.role && (
          <p>
            <strong>Assigned Role:</strong> {registration.role}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegistrationDetails;
