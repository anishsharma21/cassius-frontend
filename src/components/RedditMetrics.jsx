import React from 'react';
import MetricsGrid from './MetricsGrid';

const RedditMetrics = () => {
  // Metrics data
  const metrics = [
    {
      title: "Replied Leads",
      value: "127",
      percentage: "+2.81%",
      comparisonText: "From last month"
    },
    {
      title: "Generated Clicks",
      value: "82",
      percentage: "+2.96%",
      comparisonText: "From last month"
    }
  ];

  return <MetricsGrid metrics={metrics} />;
};

export default RedditMetrics;
