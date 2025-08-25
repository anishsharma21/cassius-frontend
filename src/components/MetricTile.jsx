import React from 'react';

const MetricTile = ({ title, value, percentage, comparisonText }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm">
          <span className="text-green-600 font-bold">{percentage}</span>
          <span className="text-gray-500 ml-1 text-xs">{comparisonText}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricTile;
