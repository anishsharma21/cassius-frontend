import React from 'react';

const MetricTile = ({ 
  title, 
  value, 
  index = 0, 
  onClick, 
  isActive = false, 
  isClickable = false 
}) => {
  // Define exact colors from GEO keywords (matching SearchTerm component)
  const colors = [
    { bg: '#6B7280', text: '#FFFFFF' },      // Gray background, white text (for Total Leads)
    { bg: '#2C4068', text: '#FFFFFF' },      // Dark navy blue background, white text (for New Leads)
    { bg: '#90C8E8', text: '#2C4068' }       // Light sky blue background, dark navy blue text (for Replied Leads)
  ];
  
  const colorScheme = colors[index % colors.length];
  
  // Add hover and active styles
  const getClassName = () => {
    let baseClasses = "rounded-full px-3 py-1.5 font-bold text-center min-w-[120px] transition-all duration-200";
    
    if (isClickable) {
      baseClasses += " cursor-pointer";
      
      if (isActive) {
        // Active state: add a ring and slightly scale
        baseClasses += " ring-2 ring-offset-1 ring-blue-500 transform scale-105";
      } else {
        // Hover state when not active
        baseClasses += " hover:opacity-80 hover:transform hover:scale-105";
      }
    }
    
    return baseClasses;
  };
  
  return (
    <div 
      className={getClassName()}
      style={{ 
        backgroundColor: isActive ? (index === 1 ? '#1e3a5f' : '#7ab8dc') : colorScheme.bg,
        color: colorScheme.text 
      }}
      onClick={isClickable ? onClick : undefined}
      title={isClickable ? (title === 'Total Leads' ? 'Click to show all leads' : `Click to ${isActive ? 'clear' : 'apply'} ${title.toLowerCase()} filter`) : undefined}
    >
      <div className="text-sm">{value} {title}</div>
    </div>
  );
};

export default MetricTile;
