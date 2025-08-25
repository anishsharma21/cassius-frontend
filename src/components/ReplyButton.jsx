import React from 'react';
import Tooltip from './Tooltip';

const ReplyButton = ({ text = "Reply", iconID = "chat", onClick, onUnreply, isReplied = false }) => {
  // Icon mapping based on iconID
  const getIcon = (iconID) => {
    switch (iconID) {
      case 'external-link':
        return (
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
      case 'arrow-right':
        return (
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
          </svg>
        );
      case 'chat':
        return (
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isReplied) {
    return (
      <Tooltip text="Mark as unreplied" position="bottom">
        <div 
          className="inline-flex items-center px-3 py-1 rounded-full text-sm border bg-green-50 border-green-200 text-green-700 gap-1 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={onUnreply}
        >
          Replied
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </Tooltip>
    );
  }

  return (
    <button 
      className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
      onClick={onClick}
    >
      <span>{text}</span>
      {getIcon(iconID)}
    </button>
  );
};

export default ReplyButton;
