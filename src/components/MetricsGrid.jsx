import React from 'react';
import MetricTile from './MetricTile';

const MetricsGrid = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
      {metrics.map((metric, index) => (
        <MetricTile
          key={index}
          title={metric.title}
          value={metric.value}
          percentage={metric.percentage}
          comparisonText={metric.comparisonText}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;
