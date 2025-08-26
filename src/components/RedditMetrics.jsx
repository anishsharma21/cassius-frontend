import React from 'react';
import MetricsGrid from './MetricsGrid';

const RedditMetrics = () => {
  // Metrics data
  const metrics = [
    {
      title: "Leads Found",
      value: "127"
    },
    {
      title: "Leads Replied",
      value: "82"
    }
  ];

  return <MetricsGrid metrics={metrics} />;
};

export default RedditMetrics;
