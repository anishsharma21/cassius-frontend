import React from 'react';
import ExpandButton from './ExpandButton';

const TableRow = ({ row, columns, rowIndex, showCheckboxes, onToggleRow, isExpanded }) => {
  return (
    <div className={`flex items-center ${isExpanded ? '' : 'border-b border-gray-100'}`}>
      {showCheckboxes && (
        <div className="flex-shrink-0 p-4 w-12 flex items-center justify-center">
          <ExpandButton 
            isExpanded={isExpanded} 
            onClick={() => onToggleRow(rowIndex)} 
          />
        </div>
      )}
      {columns.map((column, colIndex) => {
        // Center align post_upvotes, post_comments, and post_actions columns
        const isCentered = ['post_upvotes', 'post_comments', 'post_actions'].includes(column.key);
        const textAlign = isCentered ? 'text-center' : 'text-left';
        
        return (
          <div key={colIndex} className={`${column.key === 'post' ? 'p-4 pl-0 pr-2 flex items-center text-lg font-medium text-gray-800' : column.key === 'post_actions' ? 'p-4 pl-0 pr-5' : 'p-4 pl-0'} ${column.bold ? 'font-bold text-gray-900' : 'text-gray-900'} ${column.width || ''} ${textAlign}`}>
            {row[column.key]}
          </div>
        );
      })}
    </div>
  );
};

export default TableRow;