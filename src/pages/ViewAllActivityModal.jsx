// ViewAllActivityModal.jsx
import React, { useState } from "react";
import "../styles/ViewAllActivityModal.css";

const ViewAllActivityModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("farmers");

  const renderContent = () => {
    switch (activeTab) {
      case "farmers":
        return <div>📋 Farmer List Table Here</div>;
      case "employees":
        return <div>👥 Employee List Table Here</div>;
      case "fpos":
        return <div>🏢 FPO Application List Table Here</div>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Recent Activities - View All</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <div className="tab-buttons">
          <button
            className={activeTab === "farmers" ? "active" : ""}
            onClick={() => setActiveTab("farmers")}
          >
            Farmers
          </button>
          <button
            className={activeTab === "employees" ? "active" : ""}
            onClick={() => setActiveTab("employees")}
          >
            Employees
          </button>
          <button
            className={activeTab === "fpos" ? "active" : ""}
            onClick={() => setActiveTab("fpos")}
          >
            FPOs
          </button>
        </div>

        <div className="tab-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ViewAllActivityModal;
