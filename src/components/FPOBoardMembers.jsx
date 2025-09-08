import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOBoardMembers = ({ fpoId }) => {
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoardMembers();
  }, [fpoId]);

  const loadBoardMembers = async () => {
    try {
      setLoading(true);
      const response = await fpoAPI.getFPOBoardMembers(fpoId);
      setBoardMembers(response);
    } catch (err) {
      setError('Failed to load board members');
      console.error('Error loading board members:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading board members...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="fpo-board-members">
      <div className="section-header">
        <h3>Board Members</h3>
        <button className="btn btn-primary">Add Board Member</button>
      </div>
      
      <div className="board-members-list">
        {boardMembers.length === 0 ? (
          <div className="no-data">No board members found</div>
        ) : (
          boardMembers.map(member => (
            <div key={member.id} className="board-member-card">
              <div className="member-info">
                <h4>{member.name}</h4>
                <p className="role">{member.role}</p>
                <p className="contact">{member.phoneNumber}</p>
              </div>
              <div className="member-actions">
                <button className="btn btn-secondary btn-sm">Edit</button>
                <button className="btn btn-danger btn-sm">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOBoardMembers;
