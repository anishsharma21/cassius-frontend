import React from 'react';

const RedditTableConfig = () => {
  // Table columns configuration
  const columns = [
    {
      key: "post",
      header: "Post",
      sortable: true,
      bold: false
    },
    {
      key: "revenue",
      header: (
        <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      sortable: true,
      bold: false
    },
    {
      key: "sales",
      header: (
        <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      sortable: true,
      bold: false
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      bold: false
    }
  ];

  return columns;
};

export default RedditTableConfig;
