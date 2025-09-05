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
  externalPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange = null,
  createTableData = null  // New prop for dynamic table data
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  // Use external pagination if provided, otherwise use internal
  const isExternalPagination = externalPagination && onPageChange;
  const effectiveCurrentPage = isExternalPagination ? currentPage : internalCurrentPage;
  
  // Use dynamic data if createTableData is provided
  const tableData = createTableData ? createTableData(expandedRows) : data;
  const effectiveTotalPages = isExternalPagination ? totalPages : Math.ceil(tableData.length / 10);

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
  const pageSize = isExternalPagination ? 10 : 10; // Fixed page size for external, default for internal
  const startIndex = (effectiveCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, tableData.length);
  const currentData = isExternalPagination ? tableData : tableData.slice(startIndex, endIndex);
  
  // For external pagination, if we have data, we're on a valid page
  const hasData = tableData && tableData.length > 0;

  // Handle page changes
  const goToPage = (page) => {
    if (isExternalPagination) {
      onPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
    setExpandedRows(new Set()); // Reset expanded rows when changing pages
  };

  const goToNextPage = () => {
    if (effectiveCurrentPage < effectiveTotalPages) {
      goToPage(effectiveCurrentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (effectiveCurrentPage > 1) {
      goToPage(effectiveCurrentPage - 1);
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <TableHeader title={title} actions={actions} />

        <div className="w-full">
          <TableHead columns={columns} showCheckboxes={false} />
          
          <div>
            {currentData.map((row, rowIndex) => {
              const actualRowIndex = startIndex + rowIndex;
              return (
                <React.Fragment key={actualRowIndex}>
                  <TableRow
                    row={row}
                    columns={columns}
                    rowIndex={actualRowIndex}
                    showCheckboxes={false}
                    onToggleRow={toggleRow}
                    isExpanded={expandedRows.has(actualRowIndex)}
                  />
                  
                  <ExpandableContent
                    isExpanded={expandedRows.has(actualRowIndex)}
                    postContent={row.fullPostContent}
                    postId={row.id}
                    postLink={row.postLink}
                    onCommentReplyUpdate={row.onCommentReplyUpdate}
                    localCommentReplyStates={row.localCommentReplyStates}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>

      {/* Pagination Controls */}
      <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">

        {/* Right Side - Pagination Status and Navigation */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            {isExternalPagination ? `Page ${effectiveCurrentPage} of ${effectiveTotalPages}` : `${effectiveCurrentPage} of ${effectiveTotalPages}`}
          </span>
          
          <div className="flex items-center space-x-2">
            {/* Previous Page Button */}
            <button
              onClick={goToPreviousPage}
              disabled={effectiveCurrentPage === 1}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                effectiveCurrentPage === 1
                  ? 'text-gray-300 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Page Button */}
            <button
              onClick={goToNextPage}
              disabled={isExternalPagination ? !hasData || tableData.length < 10 : effectiveCurrentPage === effectiveTotalPages}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                (isExternalPagination ? (!hasData || tableData.length < 10) : effectiveCurrentPage === effectiveTotalPages)
                  ? 'text-gray-300 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;