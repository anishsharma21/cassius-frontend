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
    <div className="bg-white rounded-lg shadow-md border border-gray-100">
      <TableHeader title={title} actions={actions} />

      <div className="overflow-x-auto">
        <table className="table-fixed w-full border-collapse">
          <TableHead columns={columns} showCheckboxes={showCheckboxes} />
          
          <tbody>
            {data.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <TableRow
                  row={row}
                  columns={columns}
                  rowIndex={rowIndex}
                  showCheckboxes={showCheckboxes}
                  onToggleRow={toggleRow}
                  isExpanded={expandedRows.has(rowIndex)}
                />
                
                <ExpandableContent
                  columns={columns}
                  showCheckboxes={showCheckboxes}
                  expandableData={expandableData}
                  rowIndex={rowIndex}
                  isExpanded={expandedRows.has(rowIndex)}
                  postContent={row.fullPostContent}
                />
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
