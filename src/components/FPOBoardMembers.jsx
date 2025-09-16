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
      <div className="board-members-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {boardMembers.length === 0 ? (
          <div className="no-data">No board members found</div>
        ) : (
          boardMembers.map(member => (
            <div key={member.id} className="board-member-card">
              <h4 style={{ marginTop: 0 }}>{member.name} {member.role ? `- ${member.role}` : ''}</h4>
              <p style={{ margin: '12px 0 0 0' }}><strong>Mobile:</strong> {member.phoneNumber || '—'}</p>
              <p style={{ margin: '12px 0 0 0' }}><strong>Email:</strong> {member.email || '—'}</p>
              <p style={{ margin: '12px 0 0 0' }}><strong>Location:</strong> {member.location || '—'}</p>
              <p style={{ margin: '12px 0 0 0' }}><strong>LinkedIn:</strong> {member.linkedin || '—'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOBoardMembers;
