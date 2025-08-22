import React from 'react';

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 text-base">{subtitle}</p>
      </div>
    </div>
  );
};

export default PageHeader;
