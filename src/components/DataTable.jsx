import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TableHead from './TableHead';
import TableRow from './TableRow';
import ExpandableContent from './ExpandableContent';

const DataTable = ({ 
  title, 
  columns, 
  data, 
  actions = [], 
  showCheckboxes = true,
  expandableData = null
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const toggleRow = (rowIndex) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex);
    } else {
      newExpandedRows.add(rowIndex);
    }
    setExpandedRows(newExpandedRows);
  };

  // Calculate pagination
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  // Handle page changes
  const goToPage = (page) => {
    setCurrentPage(page);
    setExpandedRows(new Set()); // Reset expanded rows when changing pages
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
    setExpandedRows(new Set());
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100">
      <TableHeader title={title} actions={actions} />

      <div className="w-full">
          <TableHead columns={columns} showCheckboxes={showCheckboxes} />
          
          <div>
            {currentData.map((row, rowIndex) => {
              const actualRowIndex = startIndex + rowIndex;
              return (
                <React.Fragment key={actualRowIndex}>
                  <TableRow
                    row={row}
                    columns={columns}
                    rowIndex={actualRowIndex}
                    showCheckboxes={showCheckboxes}
                    onToggleRow={toggleRow}
                    isExpanded={expandedRows.has(actualRowIndex)}
                  />
                  
                  <ExpandableContent
                    columns={columns}
                    showCheckboxes={showCheckboxes}
                    expandableData={expandableData}
                    rowIndex={actualRowIndex}
                    isExpanded={expandedRows.has(actualRowIndex)}
                    postContent={row.fullPostContent}
                  />
                </React.Fragment>
              );
            })}
          </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        {/* Left Side - Rows Per Page Control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show rows per page</span>
                      <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
        </div>

                 {/* Right Side - Pagination Status and Navigation */}
         <div className="flex items-center space-x-4">
           <span className="text-sm text-gray-700">
             {currentPage} of {totalPages}
           </span>
          
          <div className="flex items-center space-x-2">
            {/* Previous Page Button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-1 rounded-md transition-colors ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Page Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-1 rounded-md transition-colors ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
