import React from 'react';

const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {subtitle && (
        <p className="text-lg text-gray-600">{subtitle}</p>
      )}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
