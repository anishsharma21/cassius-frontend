import React from 'react';

const ClickableLink = ({ 
  href, 
  children, 
  className = "", 
  target = "_blank", 
  rel = "noopener noreferrer",
  onClick 
}) => {
  const baseClasses = "font-bold text-gray-800 truncate hover:text-blue-600 transition-colors duration-200 cursor-pointer block w-full";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <a 
      href={href} 
      target={target} 
      rel={rel}
      className={combinedClasses}
      onClick={onClick}
    >
      {children}
    </a>
  );
};

export default ClickableLink;
