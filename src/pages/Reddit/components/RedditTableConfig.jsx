import React from 'react';

const RedditTableConfig = () => {
  // Table columns configuration
  const columns = [
    {
      key: "post",
      header: "Post Title",
      sortable: false,
      bold: false,
      width: "min-w-0 flex-1" // Flexible width that takes remaining space
    },
    {
      key: "post_date",
      header: "Posted",
      sortable: false,
      bold: false,
      width: "w-24" // Fixed width for date
    },
    {
      key: "post_upvotes",
      header: (
        <div className="flex justify-center items-center group relative" title="Upvotes">
          <svg className="inline w-4 h-4 text-gray-600 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Upvotes
          </span>
        </div>
      ),
      sortable: false,
      bold: false,
      width: "w-18" // Fixed width of 80px
    },
    {
      key: "post_comments",
      header: (
        <div className="flex justify-center items-center group relative" title="Comments">
          <svg className="inline w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Comments
          </span>
        </div>
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
      width: "w-36" // Fixed width increased further to prevent AI Reply text wrapping
    }
  ];

  return columns;
};

export default RedditTableConfig;