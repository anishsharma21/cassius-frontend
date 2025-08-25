import React from 'react';
import ExpandButton from './ExpandButton';

const TableRow = ({ row, columns, rowIndex, showCheckboxes, onToggleRow, isExpanded }) => {
  return (
    <tr className={isExpanded ? '' : 'border-b border-gray-100'}>
      {showCheckboxes && (
        <td className="p-4 ">
          <ExpandButton 
            isExpanded={isExpanded} 
            onClick={() => onToggleRow(rowIndex)} 
          />
        </td>
      )}
      {columns.map((column, colIndex) => {
        // Center align post_upvotes, post_comments, and post_actions columns
        const isCentered = ['post_upvotes', 'post_comments', 'post_actions'].includes(column.key);
        const textAlign = isCentered ? 'text-center' : 'text-left';
        
        return (
          <td key={colIndex} className={`p-4 pl-0 ${column.bold ? 'font-bold text-gray-900' : 'text-gray-900'} ${column.width || ''} ${textAlign}`}>
            {row[column.key]}
          </td>
        );
      })}
    </tr>
  );
};

export default TableRow;
