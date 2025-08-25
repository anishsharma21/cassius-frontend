import React from 'react';
import MetricsGrid from './MetricsGrid';

const RedditMetrics = () => {
  // Metrics data
  const metrics = [
    {
      title: "Found Leads",
      value: "127"
    },
    {
      title: "Replied Leads",
      value: "82"
    }
  ];

  return <MetricsGrid metrics={metrics} />;
};

export default RedditMetrics;
