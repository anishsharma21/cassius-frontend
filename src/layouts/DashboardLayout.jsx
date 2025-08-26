import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import UserMenu from '../components/UserMenu';
import SideChat from '../components/SideChat';
import API_ENDPOINTS from '../config/api';
import chatgptIcon from '../assets/chatgpt.svg';
import igIcon from '../assets/ig.svg';
import flagIcon from '../assets/flag.svg';

const sidebarItems = [
  { 
    name: 'Strategy', 
    path: 'strategy',
    icon: (
      <img src={flagIcon} alt="Flag" className="w-5 h-5 mr-3" />
    )
  },
  { 
    name: 'Reddit', 
    path: 'reddit',
    icon: (
      <svg className="-ml-0.5 mr-2.5" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 800 800"><circle cx="400" cy="400" r="400" fill="#ff4500"/><path fill="#fff" d="M666.8 400c.08 5.48-.6 10.95-2.04 16.24s-3.62 10.36-6.48 15.04c-2.85 4.68-6.35 8.94-10.39 12.65s-8.58 6.83-13.49 9.27c.11 1.46.2 2.93.25 4.4a107.268 107.268 0 0 1 0 8.8c-.05 1.47-.14 2.94-.25 4.4 0 89.6-104.4 162.4-233.2 162.4S168 560.4 168 470.8c-.11-1.46-.2-2.93-.25-4.4a107.268 107.268 0 0 1 0-8.8c.05-1.47.14-2.94.25-4.4a58.438 58.438 0 0 1-31.85-37.28 58.41 58.41 0 0 1 7.8-48.42 58.354 58.354 0 0 1 41.93-25.4 58.4 58.4 0 0 1 46.52 15.5 286.795 286.795 0 0 1 35.89-20.71c12.45-6.02 25.32-11.14 38.51-15.3s26.67-7.35 40.32-9.56 27.45-3.42 41.28-3.63L418 169.6c.33-1.61.98-3.13 1.91-4.49.92-1.35 2.11-2.51 3.48-3.4 1.38-.89 2.92-1.5 4.54-1.8 1.61-.29 3.27-.26 4.87.09l98 19.6c9.89-16.99 30.65-24.27 48.98-17.19s28.81 26.43 24.71 45.65c-4.09 19.22-21.55 32.62-41.17 31.61-19.63-1.01-35.62-16.13-37.72-35.67L440 186l-26 124.8c13.66.29 27.29 1.57 40.77 3.82a284.358 284.358 0 0 1 77.8 24.86A284.412 284.412 0 0 1 568 360a58.345 58.345 0 0 1 29.4-15.21 58.361 58.361 0 0 1 32.95 3.21 58.384 58.384 0 0 1 25.91 20.61A58.384 58.384 0 0 1 666.8 400zm-396.96 55.31c2.02 4.85 4.96 9.26 8.68 12.97 3.71 3.72 8.12 6.66 12.97 8.68A40.049 40.049 0 0 0 306.8 480c16.18 0 30.76-9.75 36.96-24.69 6.19-14.95 2.76-32.15-8.68-43.59s-28.64-14.87-43.59-8.68c-14.94 6.2-24.69 20.78-24.69 36.96 0 5.25 1.03 10.45 3.04 15.31zm229.1 96.02c2.05-2 3.22-4.73 3.26-7.59.04-2.87-1.07-5.63-3.07-7.68s-4.73-3.22-7.59-3.26c-2.87-.04-5.63 1.07-7.94 2.8a131.06 131.06 0 0 1-19.04 11.35 131.53 131.53 0 0 1-20.68 7.99c-7.1 2.07-14.37 3.54-21.72 4.39-7.36.85-14.77 1.07-22.16.67-7.38.33-14.78.03-22.11-.89a129.01 129.01 0 0 1-21.64-4.6c-7.08-2.14-13.95-4.88-20.56-8.18s-12.93-7.16-18.89-11.53c-2.07-1.7-4.7-2.57-7.38-2.44s-5.21 1.26-7.11 3.15c-1.89 1.9-3.02 4.43-3.15 7.11s.74 5.31 2.44 7.38c7.03 5.3 14.5 9.98 22.33 14s16 7.35 24.4 9.97 17.01 4.51 25.74 5.66c8.73 1.14 17.54 1.53 26.33 1.17 8.79.36 17.6-.03 26.33-1.17A153.961 153.961 0 0 0 476.87 564c7.83-4.02 15.3-8.7 22.33-14zm-7.34-68.13c5.42.06 10.8-.99 15.81-3.07 5.01-2.09 9.54-5.17 13.32-9.06s6.72-8.51 8.66-13.58A39.882 39.882 0 0 0 532 441.6c0-16.18-9.75-30.76-24.69-36.96-14.95-6.19-32.15-2.76-43.59 8.68s-14.87 28.64-8.68 43.59c6.2 14.94 20.78 24.69 36.96 24.69z"/></svg>
    )
  },
  { 
    name: 'GEO', 
    path: 'geo',
    icon: (
      <img src={chatgptIcon} alt="ChatGPT" className="w-5 h-5 mr-3" />
    )
  },
  { 
    name: 'Partnerships', 
    path: 'partnerships',
    icon: (
      <img src={igIcon} alt="Instagram" className="w-5 h-5 mr-3" />
    )
  },
  { 
    name: 'Company Profile', 
    path: 'company-profile',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  { 
    name: 'Guide', 
    path: 'guide',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    name: 'Feedback', 
    path: 'feedback',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
];

const DashboardLayout = () => {
  const [chatWidth, setChatWidth] = useState(33.33); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch company data using React Query
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.companyProfile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Limit retries to prevent infinite loops
    retryDelay: 1000
  });

  // Fetch user data using React Query
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.userProfile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Limit retries to prevent infinite loops
    retryDelay: 1000
  });
  
  // Check if user is new and redirect to guide
  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === 'true' && location.pathname === '/dashboard') {
      // Clear the flag and redirect to guide
      localStorage.removeItem('isNewUser');
      navigate('/dashboard/guide', { replace: true });
    }
  }, [navigate]); // Removed location.pathname dependency

  // Debug logging for initial state
  useEffect(() => {
    console.log('DashboardLayout mounted with:', {
      companyData: company,
      userData: user,
      isLoadingCompany: isLoadingCompany,
      isLoadingUser: isLoadingUser
    });
  }, [company, user, isLoadingCompany, isLoadingUser]);

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
          <div className="mb-8">
            <div className="flex items-center justify-left">
              <div className="rounded-full flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  {isLoadingCompany ? (
                    <div className="w-4 h-4 bg-blue-400 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-white font-base text-sm">
                      {company?.name ? company.name.charAt(0) : 'C'}
                    </span>
                  )}
                </div>
                {isLoadingCompany ? (
                  <div className="h-5 bg-gray-300 rounded animate-pulse" style={{ width: '100px' }}></div>
                ) : (
                  <h2 className="px-1 text-base font-normal text-black">
                    {company?.name || 'Company'}
                  </h2>
                )}
              </div>
            </div>
          </div>
          
          {/* Section 1: Main Hub Navigation */}
          <nav className="space-y-2 mb-8">
            {sidebarItems.slice(0, 4).map(({ name, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg text-base font-normal text-black transition-colors ${
                    isActive
                      ? 'bg-gray-200'
                      : 'hover:bg-gray-200'
                  }`
                }
              >
                {icon}
                {name}
              </NavLink>
            ))}
          </nav>
          
          {/* Section 2: Profile Library (Single Item) */}
          <nav className="space-y-2 mb-8">
            {sidebarItems.slice(4, 5).map(({ name, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg text-base font-normal text-black transition-colors ${
                    isActive
                      ? 'bg-gray-200'
                      : 'hover:bg-gray-200'
                  }`
                }
              >
                {icon}
                {name}
              </NavLink>
            ))}
          </nav>
          
          {/* Section 3: Guide and Feedback */}
          <nav className="space-y-2">
            {sidebarItems.slice(5).map(({ name, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg text-base font-normal text-black transition-colors ${
                    isActive
                      ? 'bg-gray-200'
                      : 'hover:bg-gray-200'
                  }`
                }
              >
                {icon}
                {name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* UserMenu at the bottom of sidebar */}
        <div className="mt-auto">
          <UserMenu user={user} isLoading={isLoadingUser} />
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