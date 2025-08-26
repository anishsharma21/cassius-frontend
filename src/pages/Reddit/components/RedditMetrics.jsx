import React from 'react';
import MetricsGrid from './MetricsGrid.jsx';

const RedditMetrics = ({ totalPosts = 0, repliedPosts = 0 }) => {
  // Metrics data
  const metrics = [
    {
      title: "New Leads",
      value: totalPosts.toString()
    },
    {
      title: "Replied Leads",
      value: repliedPosts.toString()
    }
  ];

  return <MetricsGrid metrics={metrics} />;
};

export default RedditMetrics;