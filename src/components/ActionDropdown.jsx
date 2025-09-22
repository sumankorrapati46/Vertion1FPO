import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

const ActionDropdown = ({ actions, customActions, item, onEdit, onDelete, onView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Build actions array from all available sources using useMemo
  const allActions = useMemo(() => {
    const actionsArray = [];
    
    // Add custom actions if provided
    if (customActions && Array.isArray(customActions)) {
      actionsArray.push(...customActions);
    }
    
    // Add actions if provided
    if (actions && Array.isArray(actions)) {
      actionsArray.push(...actions);
    }
    
    // Only add fallback actions if no custom actions or actions array were provided
    if ((!customActions || customActions.length === 0) && (!actions || actions.length === 0)) {
      // Fallback to simple View/Edit/Delete when explicit handlers are provided
      if (onView) actionsArray.push({ label: 'View', icon: '👁️', className: 'info', onClick: () => onView(item) });
      if (onEdit) actionsArray.push({ label: 'Edit', icon: '✏️', className: 'primary', onClick: () => onEdit(item) });
      if (onDelete) actionsArray.push({ label: 'Delete', icon: '🗑️', className: 'danger', onClick: () => onDelete(item) });
    }
    
    // If still no actions, add a default action for debugging
    if (actionsArray.length === 0) {
      actionsArray.push({ 
        label: 'No Actions Available', 
        icon: '⚠️', 
        className: 'warning', 
        onClick: () => console.log('No actions available for item:', item) 
      });
    }
    
    return actionsArray;
  }, [customActions, actions, onView, onEdit, onDelete, item]);

  // Close dropdown when clicking outside and update position on scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      // Simply close the dropdown when scrolling to keep it completely fixed
      if (isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, allActions.length]);

  const handleActionClick = (action) => {
    console.log('ActionDropdown: Action clicked:', action.label, 'with item:', item);
    console.log('ActionDropdown: Action onClick function:', action.onClick);
    if (action.onClick && item) {
      console.log('ActionDropdown: Calling onClick function');
      action.onClick(item);
    } else {
      console.log('ActionDropdown: No onClick function or item');
    }
    setIsOpen(false);
  };

  // Calculate dropdown position when opening
  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dropdownWidth = 280; // minWidth from styling
      const dropdownHeight = Math.min(allActions.length * 50 + 24, 400); // max 400px height
      
      // Use viewport coordinates (getBoundingClientRect gives viewport-relative coordinates)
      let top = rect.bottom + 8; // Position below the button with 8px gap
      let left = rect.left;
      
      // Check if dropdown would go below viewport
      if (top + dropdownHeight > viewportHeight) {
        // Position above the button instead
        top = rect.top - dropdownHeight - 8;
      }
      
      // Check if dropdown would go right of viewport
      if (left + dropdownWidth > viewportWidth) {
        // Align to the right edge of the button
        left = rect.right - dropdownWidth;
      }
      
      // Ensure dropdown doesn't go above viewport
      if (top < 0) {
        top = 8;
      }
      
      // Ensure dropdown doesn't go left of viewport
      if (left < 0) {
        left = 8;
      }
      
      setDropdownPosition({ top, left });
    }
  };

  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    calculatePosition();
    setIsOpen(true);
  };

  return (
    <>
      <div className="action-dropdown-container">
        <button
          ref={buttonRef}
          className="dropdown-toggle-btn"
          onClick={handleToggleClick}
          aria-label="Actions"
          title="Actions"
          style={{
            background: isOpen ? '#e5e7eb' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            color: isOpen ? '#374151' : '#6b7280'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>
      
      {/* Render dropdown using portal to ensure it's outside table structure */}
      {isOpen && createPortal(
        <>
          {/* Backdrop for better UX */}
          <div 
            className="dropdown-backdrop" 
            onClick={() => {
              setIsOpen(false);
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999998,
              background: 'transparent'
            }}
          />
          
          <div 
            ref={dropdownRef}
            className="dropdown-menu-enhanced"
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              zIndex: 999999,
              minWidth: '280px',
              maxWidth: '320px',
              maxHeight: '400px',
              background: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
              padding: '12px',
              pointerEvents: 'auto',
              overflowY: 'auto',
              overflowX: 'visible'
            }}
          >
            {allActions.map((action, index) => {
              // Check if action should be shown based on condition
              if (action.showCondition && item && !action.showCondition(item)) {
                return null;
              }
              
              return (
                <button
                  key={`${action.label}-${index}`}
                  className={`dropdown-item-enhanced ${action.className || ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked for action:', action.label, 'at index:', index);
                    handleActionClick(action);
                  }}
                  title={action.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${getButtonBorderColor(action.className)}`,
                    background: getButtonBackground(action.className),
                    color: getButtonTextColor(action.className),
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px',
                    minHeight: '44px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    // Force override any CSS
                    backgroundImage: 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  <span className="action-icon" style={{ marginRight: '12px', fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 }}>
                    {action.icon || getDefaultIcon(action.label)}
                  </span>
                  <span className="action-label">{action.label}</span>
                  {action.className === 'danger' && <span className="action-badge">⚠️</span>}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
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

// Helper function to get button background color
const getButtonBackground = (className) => {
  switch (className) {
    case 'primary':
      return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    case 'info':
      return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
    case 'warning':
      return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    case 'danger':
      return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    case 'success':
      return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    default:
      return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  }
};

// Helper function to get button text color
const getButtonTextColor = (className) => {
  switch (className) {
    case 'primary':
    case 'info':
    case 'warning':
    case 'danger':
    case 'success':
      return '#ffffff';
    default:
      return '#374151';
  }
};

// Helper function to get button border color
const getButtonBorderColor = (className) => {
  switch (className) {
    case 'primary':
      return '#3b82f6';
    case 'info':
      return '#06b6d4';
    case 'warning':
      return '#f59e0b';
    case 'danger':
      return '#ef4444';
    case 'success':
      return '#10b981';
    default:
      return '#e5e7eb';
  }
};

export default ActionDropdown; 