import React from 'react';

const ExpandButton = ({ isExpanded, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center transition-colors cursor-pointer"
    >
      <svg 
        className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
};

export default ExpandButton;