import React from 'react';

const KeywordTile = ({ keyword, rank, onClick }) => {
  // Generate consistent colors based on keyword hash (three-color palette)
  const getKeywordColors = (keyword) => {
    const colors = [
      { bg: '#2C4068', text: '#FFFFFF' },      // Dark navy blue background, white text
      { bg: '#90C8E8', text: '#2C4068' },      // Light sky blue background, dark navy blue text
      { bg: '#F09640', text: '#FFFFFF' }       // Medium orange background, white text
    ];
    
    // Use keyword to consistently assign colors
    const hash = keyword.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const colors = getKeywordColors(keyword);

  return (
    <div 
      className="rounded-3xl px-1 py-1 text-sm font-medium cursor-pointer hover:opacity-80 transition-all duration-200 select-none"
      style={{ backgroundColor: colors.bg }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {rank}.
        </div>
        <span className="font-semibold flex-1 mr-3 -ml-3" style={{ color: colors.text }}>{keyword}</span>
      </div>
    </div>
  );
};

export default KeywordTile;
