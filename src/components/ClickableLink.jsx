import React from 'react';

const ClickableLink = ({ href, children, className = '', ...props }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`text-blue-600 hover:text-blue-800 hover:underline cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

export default ClickableLink;
