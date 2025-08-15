import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import SideChat from '../components/SideChat';
import API_ENDPOINTS from '../config/api';
import redditIcon from '../assets/reddit.svg';
import chatgptIcon from '../assets/chatgpt.svg';
import xIcon from '../assets/x.svg';
import flagIcon from '../assets/flag.svg';

const sidebarItems = [
  { 
    name: 'Dashboard', 
    path: 'home',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
        <line x1="9" y1="3" x2="9" y2="21" strokeWidth="2"/>
        <line x1="3" y1="9" x2="9" y2="9" strokeWidth="2"/>
      </svg>
    )
  },
  { 
    name: 'Reddit Hub', 
    path: 'reddit',
    icon: (
      <img src={redditIcon} alt="Reddit" className="w-5 h-5 mr-3" />
    )
  },
  { 
    name: 'Strategy Hub', 
    path: 'strategy',
    icon: (
      <img src={flagIcon} alt="Flag" className="w-5 h-5 mr-3" />
    )
  },
  { 
    name: 'GEO Hub', 
    path: 'geo',
    icon: (
      <img src={chatgptIcon} alt="ChatGPT" className="w-5 h-5 mr-3" />
    )
  },
  { 
    name: 'Social Media Hub', 
    path: 'social-media',
    icon: (
      <img src={xIcon} alt="X (Twitter)" className="w-4 h-4 ml-0.5 mr-3.5" />
    )
  },
];

const DashboardLayout = () => {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const [companyName, setCompanyName] = useState(userData.company_name || 'Company');
  const [chatWidth, setChatWidth] = useState(33.33); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fetch company name from backend if not in localStorage
  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!userData.company_name) {
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const response = await fetch(API_ENDPOINTS.getCompanyName, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const newCompanyName = data.company_name || 'Company';
              setCompanyName(newCompanyName);
              
              // Update localStorage with company name
              const updatedUserData = { ...userData, company_name: newCompanyName };
              localStorage.setItem('user', JSON.stringify(updatedUserData));
            }
          }
        } catch (error) {
          console.error('Error fetching company name:', error);
        }
      }
    };

    fetchCompanyName();
  }, [userData.company_name]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;
    const newChatWidth = ((containerWidth - x) / containerWidth) * 100;
    
    // Limit the chat width between 20% and 60%
    if (newChatWidth >= 20 && newChatWidth <= 60) {
      setChatWidth(newChatWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Blends with background */}
      <aside className="w-60 bg-gray-100 flex flex-col justify-between px-4 py-4">
        <div>
          {/* Business Component at Top */}
          <div className="mb-6">
            <div className="flex items-center justify-left">
              <div className="rounded-full flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-base text-sm">
                    {companyName.charAt(0)}
                  </span>
                </div>
                <h2 className="px-1 text-black font-semibold text-base">
                  {companyName}
                </h2>
              </div>
            </div>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map(({ name, path, icon }) => {
              const isComingSoon = ['strategy', 'geo', 'social-media'].includes(path);
              
              return (
                <div key={path} className="relative">
                  {isComingSoon ? (
                    <div
                      className="flex items-center p-2 rounded-lg text-sm font-medium text-gray-400"
                      onMouseEnter={() => setHoveredItem(path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="grayscale opacity-30">
                        {icon}
                      </div>
                      {name}
                    </div>
                  ) : (
                    <NavLink
                      to={path}
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-lg text-sm font-medium text-black transition-colors ${
                          isActive
                            ? 'bg-slate-300'
                            : 'hover:bg-gray-200'
                        }`
                      }
                    >
                      {icon}
                      {name}
                    </NavLink>
                  )}
                  
                  {/* Coming Soon Tooltip */}
                  {isComingSoon && hoveredItem === path && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      Coming Soon
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        
        {/* UserMenu at the bottom of sidebar */}
        <div className="mt-auto">
          <UserMenu />
        </div>
      </aside>

      {/* Main Content Area - Floating white sections */}
      <div 
        className="flex-1 p-2"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex h-full">
          {/* Main Page - Floating white section */}
          <div 
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            style={{ width: `${100 - chatWidth}%` }}
          >
            <div className="p-3 h-full overflow-y-auto">
              <Outlet />
            </div>
          </div>
          
          {/* Draggable Divider */}
          <div
            className="w-2 bg-gray-100 cursor-col-resize transition-colors relative"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
          
          {/* Chat Page - Floating white section */}
          <div 
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            style={{ width: `${chatWidth}%` }}
          >
            <SideChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;