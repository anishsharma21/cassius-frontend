import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import RedditMetrics from '../components/RedditMetrics';
import RedditTableConfig from '../components/RedditTableConfig';
import RedditTableData from '../components/RedditTableData';
import RedditTableActions from '../components/RedditTableActions';
import DataTable from '../components/DataTable';
import ReplyButton from '../components/ReplyButton';
import ClickableLink from '../components/ClickableLink';

function Reddit() {
  const [replyStates, setReplyStates] = useState({});
  const [commentReplyStates, setCommentReplyStates] = useState({});

  const handleReplyClick = (rowIndex) => {
    setReplyStates(prev => ({
      ...prev,
      [rowIndex]: true
    }));
  };

  const handleUnreplyClick = (rowIndex) => {
    setReplyStates(prev => ({
      ...prev,
      [rowIndex]: false
    }));
  };

  const handleCommentReplyClick = (rowIndex, commentIndex) => {
    setCommentReplyStates(prev => ({
      ...prev,
      [`${rowIndex}-${commentIndex}`]: true
    }));
  };

  const handleCommentUnreplyClick = (rowIndex, commentIndex) => {
    setCommentReplyStates(prev => ({
      ...prev,
      [`${rowIndex}-${commentIndex}`]: false
    }));
  };

  // Get data from reusable components
  const columns = RedditTableConfig();
  const { tableData: baseTableData, expandableData: baseExpandableData } = RedditTableData();
  const actions = RedditTableActions();

  // Create table data with reply state management and UI components
  const tableData = baseTableData.map((row, index) => ({
    post: (
      <div>
        <ClickableLink href={row.postUrl}>
          {row.postTitle}
        </ClickableLink>
      </div>
    ),
    fullPostContent: row.fullPostContent,
    post_upvotes: row.post_upvotes,
    post_comments: row.post_comments,
    post_actions: (
      <div className="flex items-center justify-center gap-3">
        <ReplyButton 
          onClick={() => handleReplyClick(index)}
          onUnreply={() => handleUnreplyClick(index)}
          isReplied={replyStates[index]}
        />
      </div>
    )
  }));

  // Create expandable data with comment reply state management and UI components
  const expandableData = baseExpandableData.map((rowComments, rowIndex) =>
    rowComments.map((comment, commentIndex) => ({
      timestamp: comment.timestamp,
      upvotes: comment.upvotes,
      comments: comment.comments,
      content: comment.content,
      status: (
        <div className="flex items-center justify-center gap-3">
          <ReplyButton 
            onClick={() => handleCommentReplyClick(rowIndex, commentIndex)}
            onUnreply={() => handleCommentUnreplyClick(rowIndex, commentIndex)}
            isReplied={commentReplyStates[`${rowIndex}-${commentIndex}`]}
          />
        </div>
      )
    }))
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Reddit Hub"
          subtitle="Find the best Reddit posts for your business"
        />
        <RedditMetrics />
      </div>

      <DataTable
        title="Leads"
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
