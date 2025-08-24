import React from 'react';

const GeoBlogTile = ({ title, lastUpdated, onClick }) => {
  // Format the date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div 
      className="bg-white rounded-xl border shadow-sm border-gray-200 p-4 transition-all duration-200 cursor-pointer hover:border-gray-400"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Blog Post Title */}
        <h3 className="text-lg font-medium text-gray-800 line-clamp-2 leading-tight">
          {title}
        </h3>
        
        {/* Last Updated Date */}
        <div className="flex items-center text-sm text-gray-500">
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>{formatDate(lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
};

export default GeoBlogTile;
