import React from 'react';
import MetricsGrid from './MetricsGrid';

const RedditMetrics = () => {
  // Metrics data
  const metrics = [
    {
      title: "Total Profit",
      value: "$4,127.40",
      percentage: "+2.81%",
      comparisonText: "From last month"
    },
    {
      title: "Avg. Order Value",
      value: "$82.24",
      percentage: "+2.96%",
      comparisonText: "From last month"
    }
  ];

  return <MetricsGrid metrics={metrics} />;
};

export default RedditMetrics;
