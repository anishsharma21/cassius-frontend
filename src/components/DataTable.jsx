import React, { useState } from 'react';

const DataTable = ({ 
  title, 
  columns, 
  data, 
  actions = [], 
  showCheckboxes = true,
  expandableData = null
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (rowIndex) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex);
    } else {
      newExpandedRows.add(rowIndex);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 select-none">
      {/* Table Header */}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {showCheckboxes && (
                <th className="text-left p-4">
                </th>
              )}
              {columns.map((column, index) => (
                <th key={index} className="text-left p-4 pl-0 text-sm font-medium text-gray-600">
                  {column.header}
                  {column.sortable && (
                    <svg className="inline w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr className="border-b border-gray-100">
                  {showCheckboxes && (
                    <td className="p-4">
                      <button
                        onClick={() => toggleRow(rowIndex)}
                        className="flex items-center justify-center w-6 h-6 transition-colors cursor-pointer"
                      >
                        <svg 
                          className={`w-4 h-4 text-gray-600 transition-transform ${expandedRows.has(rowIndex) ? 'rotate-90' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`p-4 pl-0 ${column.bold ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
                
                {/* Expandable Comments Section */}
                {expandedRows.has(rowIndex) && expandableData && expandableData[rowIndex] && (
                  <tr>
                    <td colSpan={columns.length + (showCheckboxes ? 1 : 0)} className="p-0">
                      <div className="bg-gray-50">
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
                          <div className="space-y-3">
                            {expandableData[rowIndex].map((comment, commentIndex) => (
                              <div key={commentIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                      <span className="text-xs text-gray-500">• {comment.upvotes} upvotes</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                  </div>
                                  {comment.status && (
                                    <div className="flex-shrink-0">
                                      {comment.status}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
