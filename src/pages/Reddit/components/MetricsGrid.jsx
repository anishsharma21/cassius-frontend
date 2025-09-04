import React from 'react';
import MetricTile from './MetricTile';

const MetricsGrid = ({ metrics }) => {
  return (
    <div className="flex flex-wrap justify-start md:justify-end gap-2">
      {metrics.map((metric, index) => (
        <MetricTile
          key={index}
          title={metric.title}
          value={metric.value}
          index={index}
          onClick={metric.onClick}
          isActive={metric.isActive}
          isClickable={metric.isClickable}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;