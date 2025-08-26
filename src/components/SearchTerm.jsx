import React from 'react';

const SearchTerm = ({ term, rank, onClick }) => {
  // Generate consistent colors based on term hash (three-color palette)
  const getColors = (text) => {
    const colors = [
      { bg: '#2C4068', text: '#FFFFFF' },      // Dark navy blue background, white text
      { bg: '#90C8E8', text: '#2C4068' },      // Light sky blue background, dark navy blue text
      { bg: '#F09640', text: '#FFFFFF' }       // Medium orange background, white text
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
      className="rounded-3xl px-1 py-1 text-sm font-medium cursor-pointer hover:opacity-80 transition-all duration-200 select-none"
      style={{ backgroundColor: colors.bg }}
      onClick={handleClick}
      title={`Click to search "${term}" on Google`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {displayRank}
        </div>
        <span className="font-semibold flex-1 mr-3 -ml-3" style={{ color: colors.text }}>{term}</span>
      </div>
    </div>
  );
};

export default SearchTerm;
