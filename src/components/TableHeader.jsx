import React from 'react';

const TableHeader = ({ title, actions = [] }) => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {actions.length > 0 && (
        <div className="flex gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableHeader;
