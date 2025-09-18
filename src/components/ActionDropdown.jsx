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

  const handleToggleClick = () => {
    setIsOpen(true);
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
    <div className="action-dropdown-container" ref={dropdownRef}>
      {/* Only render button when dropdown is closed */}
      {!isOpen && (
        <button
          className="dropdown-toggle-btn"
          onClick={handleToggleClick}
          aria-label="Actions"
          title="Actions"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      )}
      
      {/* Only render dropdown when open */}
      {isOpen && allActions.length > 0 && (
        <>
          {/* Backdrop for better UX */}
          <div 
            className="dropdown-backdrop" 
            onClick={() => {
              setIsOpen(false);
            }}
          />
          
          <div 
            className="dropdown-menu-enhanced"
          >
            {allActions.map((action, index) => {
              // Check if action should be shown based on condition
              if (action.showCondition && item && !action.showCondition(item)) {
                return null;
              }
              
              return (
                <button
                  key={index}
                  className={`dropdown-item-enhanced ${action.className || ''}`}
                  onClick={() => handleActionClick(action)}
                  title={action.label}
                >
                  <span className="action-icon">{action.icon || getDefaultIcon(action.label)}</span>
                  <span className="action-label">{action.label}</span>
                  {action.className === 'danger' && <span className="action-badge">⚠️</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to get default icons for actions
const getDefaultIcon = (label) => {
  const iconMap = {
    'View': '👁️',
    'Edit': '✏️',
    'Delete': '🗑️',
    'Approve': '✅',
    'Reject': '❌',
    'Dashboard': '📊',
    'Settings': '⚙️',
    'Profile': '👤',
    'Logout': '🚪'
  };
  return iconMap[label] || '🔧';
};

export default ActionDropdown; 