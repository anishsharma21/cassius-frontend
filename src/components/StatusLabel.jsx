import React from 'react';

const StatusLabel = ({ text, variant = "default" }) => {
  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-700",
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    error: "bg-red-50 border-red-200 text-red-700"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variants[variant]}`}>
      {text}
    </span>
  );
};

export default StatusLabel;
