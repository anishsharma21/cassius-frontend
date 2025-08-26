import React from 'react';

const TableHeader = ({ title, actions = [] }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {action}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableHeader;
