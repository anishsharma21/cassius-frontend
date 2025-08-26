import React from 'react';

const RedditTableConfig = () => {
  // Table columns configuration
  const columns = [
    {
      key: "post",
      header: "Post",
      sortable: false,
      bold: false,
      width: "min-w-0 flex-1" // Flexible width that takes remaining space
    },
    {
      key: "post_upvotes",
      header: (
        <svg className="inline w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      sortable: false,
      bold: false,
      width: "w-18" // Fixed width of 80px
    },
    {
      key: "post_comments",
      header: (
        <svg className="inline w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
      sortable: false,
      bold: false,
      width: "w-18" // Fixed width of 80px
    },
    {
      key: "post_actions",
      header: "Status",
      sortable: false,
      bold: false,
      width: "w-28" // Fixed width of 96px
    }
  ];

  return columns;
};

export default RedditTableConfig;