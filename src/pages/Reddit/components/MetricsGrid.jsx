import React from 'react';
import MetricTile from './MetricTile';

const MetricsGrid = ({ metrics }) => {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {metrics.map((metric, index) => (
        <MetricTile
          key={index}
          title={metric.title}
          value={metric.value}
          index={index}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;