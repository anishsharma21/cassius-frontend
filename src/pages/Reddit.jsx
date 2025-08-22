import React from 'react';
import PageHeader from '../components/PageHeader';
import RedditMetrics from '../components/RedditMetrics';
import RedditTableConfig from '../components/RedditTableConfig';
import RedditTableData from '../components/RedditTableData';
import RedditTableActions from '../components/RedditTableActions';
import DataTable from '../components/DataTable';

function Reddit() {
  // Get data from reusable components
  const columns = RedditTableConfig();
  const { tableData, expandableData } = RedditTableData();
  const actions = RedditTableActions();

  return (
    <div className="p-6 bg-white min-h-screen select-none">
      <PageHeader
        title="Reddit Hub"
        subtitle="Find the best Reddit posts for your business"
      />

      <RedditMetrics />

      <DataTable
        title="Reddit Posts"
        columns={columns}
        data={tableData}
        actions={actions}
        showCheckboxes={true}
        expandableData={expandableData}
      />
    </div>
  );
}

export default Reddit;
