import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';

const DashboardTile = ({ title, content, path, icon }) => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const handleClick = () => {
    if (path) {
      posthog?.capture('dashboard_tile_clicked', {
        tile_title: title,
        destination_path: path,
        action: 'tile_navigation'
      });
      navigate(path);
    }
  };

  return (
    <div className="mb-8 w-80 h-48">
      {/* Title above the tile */}
      <h3 className="text-base font-semibold text-black mb-2">
        {title}
      </h3>
      
      {/* Tile structure */}
      <div 
        className={`bg-gray-50 border border-gray-400 rounded-lg p-2 transition-all duration-200 h-40 ${
          path ? 'cursor-pointer hover:bg-gray-100' : ''
        }`}
        onClick={handleClick}
      >
        {/* Content section */}
        <div className="h-full">
          {content}
        </div>
      </div>
    </div>
  );
};

export default DashboardTile; 