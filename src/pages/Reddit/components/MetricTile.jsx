import React from 'react';

const MetricTile = ({ title, value, index = 0 }) => {
  // Define exact colors from GEO keywords (matching SearchTerm component)
  const colors = [
    { bg: '#2C4068', text: '#FFFFFF' },      // Dark navy blue background, white text
    { bg: '#90C8E8', text: '#2C4068' }       // Light sky blue background, dark navy blue text
  ];
  
  const colorScheme = colors[index % colors.length];
  
  return (
    <div 
      className="rounded-full px-3 py-2 font-bold text-center min-w-[160px]"
      style={{ 
        backgroundColor: colorScheme.bg, 
        color: colorScheme.text 
      }}
    >
      <div className="text-base">{value} {title}</div>
    </div>
  );
};

export default MetricTile;
