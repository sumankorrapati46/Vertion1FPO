import React, { useState, useRef, useEffect } from 'react';

const ActionDropdown = ({ actions, customActions, item, onEdit, onDelete, onView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (action) => {
    if (action.onClick && item) {
      action.onClick(item);
    }
    setIsOpen(false);
  };

  // Build actions array from all available sources
  const allActions = [];
  
  // Add custom actions if provided
  if (customActions && Array.isArray(customActions)) {
    allActions.push(...customActions);
  }
  
  // Add actions if provided
  if (actions && Array.isArray(actions)) {
    allActions.push(...actions);
  }
  
  // Add built-in actions if provided
  // If the caller didn't pass custom actions or actions array, provide a rich default list
  if ((!customActions || customActions.length === 0) && (!actions || actions.length === 0)) {
    allActions.push(
      { label: 'Dashboard', icon: '📊', className: 'primary', onClick: () => onView && onView(item, 'overview') },
      { label: 'Edit FPO', icon: '✏️', className: 'primary', onClick: () => onEdit && onEdit(item) },
      { label: 'FPO Board Members', icon: '👥', onClick: () => onView && onView(item, 'board-members') },
      { label: 'FPO Farm Services', icon: '🚜', onClick: () => onView && onView(item, 'services') },
      { label: 'FPO Turnover', icon: '📈', onClick: () => onView && onView(item, 'turnover') },
      { label: 'FPO Crop Entries', icon: '🌾', onClick: () => onView && onView(item, 'crops') },
      { label: 'FPO Input Shop', icon: '🏬', onClick: () => onView && onView(item, 'input-shop') },
      { label: 'FPO Product Categories', icon: '🏷️', onClick: () => onView && onView(item, 'product-categories') },
      { label: 'FPO Products', icon: '📦', onClick: () => onView && onView(item, 'products') },
      { label: 'FPO Users', icon: '👤', onClick: () => onView && onView(item, 'users') }
    );

    // Add status actions if handlers exist via actions array
    if (onDelete) {
      allActions.push({ label: 'Delete', icon: '🗑️', className: 'danger', onClick: () => onDelete(item) });
    }
  }
  
  // Only add fallback actions if no actions array was provided and no custom actions
  if ((!customActions || customActions.length === 0) && (!actions || actions.length === 0)) {
    // Fallback to simple View/Edit/Delete when explicit handlers are provided
    if (onView) allActions.push({ label: 'View', icon: '👁️', className: 'info', onClick: () => onView(item) });
    if (onEdit) allActions.push({ label: 'Edit', icon: '✏️', className: 'primary', onClick: () => onEdit(item) });
    if (onDelete) allActions.push({ label: 'Delete', icon: '🗑️', className: 'danger', onClick: () => onDelete(item) });
  }

  return (
    <div className="action-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="dropdown-toggle"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        aria-label="Actions"
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          borderRadius: '8px',
          color: '#64748b',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: '600',
          padding: '8px 12px',
          minWidth: '40px',
          minHeight: '40px'
        }}
      >
        ⋯
      </button>
      
      {isOpen && allActions.length > 0 && (
        <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 99999, minWidth: '200px' }}>
          {allActions.map((action, index) => {
            // Check if action should be shown based on condition
            if (action.showCondition && item && !action.showCondition(item)) {
              return null;
            }
            
            return (
              <button
                key={index}
                className={`dropdown-item ${action.className || ''}`}
                onClick={() => handleActionClick(action)}
              >
                {action.icon && <span className="action-icon">{action.icon}</span>}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown; 