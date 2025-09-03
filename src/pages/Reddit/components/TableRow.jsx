import React from 'react';

const TableRow = ({ row, columns, rowIndex, onToggleRow, isExpanded }) => {
  return (
    <div className={`flex items-center ${isExpanded ? '' : 'border-b border-gray-100'}`}>
      {columns.map((column, colIndex) => {
        // Center align post_upvotes, post_comments, and post_actions columns
        const isCentered = ['post_upvotes', 'post_comments', 'post_actions'].includes(column.key);
        const textAlign = isCentered ? 'text-center' : 'text-left';
        
        // Make post column clickable to expand/collapse
        const handleClick = column.key === 'post' ? () => onToggleRow(rowIndex) : undefined;
        
        return (
          <div 
            key={colIndex} 
            className={`${column.key === 'post' ? 'p-4 pl-4 pr-2 flex items-center text-lg font-medium text-gray-800 cursor-pointer' : column.key === 'post_actions' ? 'p-4 pl-0 pr-5' : 'p-4 pl-0'} ${column.bold ? 'font-bold text-gray-900' : 'text-gray-900'} ${column.width || ''} ${textAlign}`}
            onClick={handleClick}
          >
            {row[column.key]}
          </div>
        );
      })}
    </div>
  );
};

export default TableRow;