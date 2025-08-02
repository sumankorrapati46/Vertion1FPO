import React from 'react';

const DataTable = ({ data, columns, onEdit, onDelete, onView, showDelete = false, customActions = [] }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'refer_back':
        return 'status-refer-back';
      case 'rejected':
        return 'status-rejected';
      case 'assigned':
        return 'status-assigned';
      case 'unassigned':
        return 'status-unassigned';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.key === 'kycStatus' || column.key === 'assignmentStatus' ? (
                    <span className={getStatusClass(row[column.key])}>
                      {row[column.key]}
                    </span>
                  ) : (
                    row[column.key] || 'N/A'
                  )}
                </td>
              ))}
              <td className="actions-cell">
                <div className="action-buttons">
                  {onView && (
                    <button 
                      className="action-btn-small info"
                      onClick={() => onView(row)}
                    >
                      👁️ View
                    </button>
                  )}
                  {onEdit && (
                    <button 
                      className="action-btn-small primary"
                      onClick={() => onEdit(row)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {customActions.map((action, index) => (
                    <button
                      key={index}
                      className={`action-btn-small ${action.className || 'secondary'}`}
                      onClick={() => action.onClick(row)}
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                  {showDelete && onDelete && (
                    <button 
                      className="action-btn-small danger"
                      onClick={() => onDelete(row)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="no-data">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default DataTable; 