import React from 'react';

const SearchTerm = ({ term, rank, onClick }) => {
  // Generate consistent subtle colors based on term hash (professional palette)
  const getColors = (text) => {
    const colors = [
      { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', accent: '#3B82F6' },    // Slate theme
      { bg: '#F0FDF4', border: '#DCFCE7', text: '#166534', accent: '#10B981' },    // Green theme
      { bg: '#FDF4FF', border: '#F3E8FF', text: '#6B21A8', accent: '#8B5CF6' },    // Purple theme
      { bg: '#FFFBEB', border: '#FEF3C7', text: '#92400E', accent: '#F59E0B' },    // Amber theme
      { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', accent: '#EF4444' },    // Red theme
      { bg: '#F0F9FF', border: '#E0F2FE', text: '#0C4A6E', accent: '#0EA5E9' }     // Sky theme
    ];

    const hash = text.split('').reduce((acc, ch) => {
      acc = ((acc << 5) - acc) + ch.charCodeAt(0);
      return acc & acc;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const colors = getColors(term);

  // Display rank or "20+" if rank is null, None, undefined, or falsy
  const displayRank = (rank === null || rank === undefined || rank === 'null' || rank === 'None' || rank === '') ? "20+" : rank;

  // Handle click to open Google search in new tab
  const handleClick = () => {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
    window.open(googleSearchUrl, '_blank');
    
    // Also call the onClick prop if provided (for any additional functionality)
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className="rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer hover:shadow-md transition-all duration-200 select-none border"
      style={{ 
        backgroundColor: colors.bg, 
        borderColor: colors.border,
        color: colors.text 
      }}
      onClick={handleClick}
      title={`Click to search "${term}" on Google`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="min-w-7 h-7 px-2 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{ 
            backgroundColor: colors.accent, 
            color: '#FFFFFF' 
          }}
        >
          {displayRank}
        </div>
        <span className="font-medium" style={{ color: colors.text }}>{term}</span>
      </div>
    </div>
  );
};

export default SearchTerm;
