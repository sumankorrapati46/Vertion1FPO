import React, { useState, useRef, useEffect } from 'react';

const ActionDropdown = ({ actions, item }) => {
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
    if (action.onClick) {
      action.onClick(item);
    }
    setIsOpen(false);
  };

  return (
    <div className="action-dropdown" ref={dropdownRef}>
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Actions"
      >
        ⋯
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          {actions.map((action, index) => {
            // Check if action should be shown based on condition
            if (action.showCondition && !action.showCondition(item)) {
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