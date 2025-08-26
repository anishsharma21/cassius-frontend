import React from 'react';
import ReactMarkdown from 'react-markdown';

const ClickableLink = ({ 
  href, 
  children, 
  className = "", 
  target = "_blank", 
  rel = "noopener noreferrer",
  onClick 
}) => {
  const baseClasses = "text-gray-800 hover:text-blue-600 transition-colors duration-200 cursor-pointer block w-full";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <a 
      href={href} 
      target={target} 
      rel={rel}
      className={combinedClasses}
      onClick={onClick}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </a>
  );
};

export default ClickableLink;