import React from 'react';
import ClickableLink from './ClickableLink';

const InstagramInfluencerTile = ({ influencer, onShowDetails }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header with photo and name */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col space-y-4">
          {/* Icon row - always gets its own row on very small screens */}
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src={influencer.photo} 
                alt={influencer.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name || 'Influencer')}&background=random`;
                }}
              />
              {/* Instagram logo overlay */}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1">
                <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Text content row - wraps underneath icon */}
          <div className="text-center space-y-2">
            <div className="w-full">
              <ClickableLink 
                href={`https://instagram.com/${influencer.instagram.replace('@', '')}`}
                className="block text-center text-gray-900 hover:text-blue-600 font-medium text-sm"
              >
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <span className="break-all hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {influencer.name}
                  </span>
                  <svg className="w-3 h-3 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                  </svg>
                </div>
              </ClickableLink>
            </div>
            {influencer.location && (
              <div className="w-full flex flex-wrap items-center justify-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-gray-400 break-all hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {influencer.location}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{formatNumber(influencer.followers || 0)}</div>
          <div className="text-xs text-gray-500">Followers</div>
        </div>
      </div>

      {/* Details Button */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => onShowDetails && onShowDetails(influencer)}
          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default InstagramInfluencerTile;