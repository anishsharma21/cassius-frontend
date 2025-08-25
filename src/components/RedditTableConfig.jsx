import React from 'react';

const RedditTableConfig = () => {
  // Table columns configuration
  const columns = [
    {
      key: "post",
      header: "Post",
      sortable: false,
      bold: false,
      width: "w-65/100" // 65% width
    },
    {
      key: "post_upvotes",
      header: (
        <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      sortable: false,
      bold: false,
      width: "w-10/100" // 10% width
    },
    {
      key: "post_comments",
      header: (
        <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
      sortable: false,
      bold: false,
      width: "w-10/100" // 10% width
    },
    {
      key: "post_actions",
      header: "Status",
      sortable: false,
      bold: false,
      width: "w-15/100" // 15% width
    }
  ];

  return columns;
};

export default RedditTableConfig;
