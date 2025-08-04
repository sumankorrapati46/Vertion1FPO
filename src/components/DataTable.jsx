import React from 'react';
import ActionDropdown from './ActionDropdown';

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
      case 'active':
        return 'status-approved';
      case 'inactive':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  };

  // Debug function to safely render values
  const safeRender = (value, columnKey) => {
    try {
      // If value is an object, try to extract meaningful data
      if (value && typeof value === 'object') {
        console.warn(`DataTable: Object found for column ${columnKey}:`, value);
        return 'Object (see console)';
      }
      
      // If value is null or undefined, return 'N/A'
      if (value === null || value === undefined) {
        return 'N/A';
      }
      
      // If value is a string, number, or boolean, return it as string
      return String(value);
    } catch (error) {
      console.error(`DataTable: Error rendering value for column ${columnKey}:`, error);
      return 'Error';
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
                  {(() => {
                    const value = row[column.key];
                    
                    // Handle status fields with special styling
                    if (column.key === 'kycStatus' || column.key === 'assignmentStatus' || column.key === 'status' || column.key === 'accessStatus') {
                      return (
                        <span className={getStatusClass(value)}>
                          {safeRender(value, column.key)}
                        </span>
                      );
                    }
                    
                    // Handle date fields
                    if (column.key === 'registrationDate' || column.key === 'assignedDate') {
                      return value ? new Date(value).toLocaleDateString() : 'N/A';
                    }
                    
                    // Handle name fields (combine firstName, middleName, and lastName if needed)
                    if (column.key === 'name') {
                      if (row.firstName || row.lastName) {
                        const parts = [row.firstName, row.middleName, row.lastName].filter(Boolean);
                        return parts.length > 0 ? parts.join(' ') : 'N/A';
                      } else if (row.name) {
                        return row.name;
                      } else {
                        return 'N/A';
                      }
                    }
                    
                    // Handle phone fields
                    if (column.key === 'phone' || column.key === 'phoneNumber') {
                      return row.phoneNumber || row.phone || row.contactNumber || 'N/A';
                    }
                    
                    // Handle email fields
                    if (column.key === 'email') {
                      return row.email || 'N/A';
                    }
                    
                    // Handle role fields
                    if (column.key === 'role') {
                      return row.role || 'N/A';
                    }
                    
                    // For all other fields, return the value or 'N/A'
                    return safeRender(value, column.key);
                  })()}
                </td>
              ))}
              <td className="actions-cell">
                <ActionDropdown 
                  actions={[
                    ...(onView ? [{
                      label: 'View',
                      icon: '👁️',
                      className: 'info',
                      onClick: onView
                    }] : []),
                    ...(onEdit ? [{
                      label: 'Edit',
                      icon: '✏️',
                      className: 'primary',
                      onClick: onEdit
                    }] : []),
                    ...customActions.map(action => ({
                      ...action,
                      icon: action.icon || ''
                    })),
                    ...(showDelete && onDelete ? [{
                      label: 'Delete',
                      icon: '🗑️',
                      className: 'danger',
                      onClick: onDelete
                    }] : [])
                  ]}
                  item={row}
                />
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