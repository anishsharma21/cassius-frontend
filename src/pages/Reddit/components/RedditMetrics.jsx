import React from 'react';
import MetricsGrid from './MetricsGrid.jsx';

const RedditMetrics = ({ 
  totalPosts = 0, 
  repliedPosts = 0, 
  onNewLeadsClick,
  onRepliedLeadsClick,
  onTotalLeadsClick,
  activeFilter = 'all'
}) => {
  // Calculate new (unreplied) leads count
  const newLeadsCount = totalPosts - repliedPosts;

  // Metrics data with click handlers and active state
  const metrics = [
    {
      title: "Total Leads",
      value: totalPosts.toString(),
      onClick: onTotalLeadsClick,
      isActive: activeFilter === 'all',
      isClickable: true
    },
    {
      title: "New Leads",
      value: newLeadsCount.toString(),
      onClick: onNewLeadsClick,
      isActive: activeFilter === 'new',
      isClickable: true
    },
    {
      title: "Replied Leads",
      value: repliedPosts.toString(),
      onClick: onRepliedLeadsClick,
      isActive: activeFilter === 'replied',
      isClickable: true
    }
  ];

  return <MetricsGrid metrics={metrics} />;
};

export default RedditMetrics;