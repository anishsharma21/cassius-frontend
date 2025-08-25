import React from 'react';

const TableHead = ({ columns, showCheckboxes = true }) => {
  return (
    <thead>
      <tr className="border-b border-gray-200">
        {showCheckboxes && (
          <th className="text-left p-4 w-12">
          </th>
        )}
        {columns.map((column, index) => {
          // Center align post_upvotes, post_comments, and post_actions columns
          const isCentered = ['post_upvotes', 'post_comments', 'post_actions'].includes(column.key);
          const textAlign = isCentered ? 'text-center' : 'text-left';
          
          return (
            <th key={index} className={`${textAlign} p-4 pl-0 text-sm font-medium text-gray-600 ${column.width || ''}`}>
              {column.header}
              {column.sortable && (
                <svg className="inline w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default TableHead;
