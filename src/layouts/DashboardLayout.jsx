import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import API_ENDPOINTS from '../config/api';

const sidebarItems = [
  { 
    name: 'Dashboard', 
    path: 'home',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    )
  },
  { 
    name: 'Strategy Hub', 
    path: 'strategy',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  { 
    name: 'GEO Hub', 
    path: 'geo',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    name: 'Social Media Hub', 
    path: 'social-media',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
      </svg>
    )
  },
  { 
    name: 'Reddit Hub', 
    path: 'reddit',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
];

const DashboardLayout = () => {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.first_name || 'User';
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Company data
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(API_ENDPOINTS.getCompanyName, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCompanyName(data);
        } else {
          console.error('Failed to fetch company name');
        }
      } catch (error) {
        console.error('Error fetching company name:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyName();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col justify-between px-2">
        <div>
          <p className="text-center mt-6 font-bold text-2xl text-black">CASSIUS</p>
          <hr className="mt-6"></hr>
          <nav className="mt-6 space-y-3">
            {sidebarItems.map(({ name, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md text-sm font-semibold ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-black hover:bg-gray-100'
                  }`
                }
              >
                {icon}
                {name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
  
      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Top Bar */}
        <div className="bg-white px-6 py-5.5">
          <div className="relative flex items-center justify-center">
            {/* Left Section - Company Display */}
            <div className="fixed top-0 left-64 px-6 py-5.5">
              <div className="flex items-center text-md font-semibold space-x-4">
                <div className="flex items-center space-x-2 pl-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-green-700 text-sm font-normal">Active</span>
                </div>
                <div className="border-3 border-blue-900 bg-blue-900 rounded-4xl flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-md">
                      {loading ? '...' : (companyName ? companyName.charAt(0) : 'C')}
                    </span>
                  </div>
                  <h2 className="text-white font-semibold text-sm pr-4">
                    {loading ? 'Loading...' : (companyName || 'Company')}
                  </h2>
                </div>
              </div>
            </div>
  
            {/* Right Section - Fixed UserMenu */}
            <div className="fixed top-0 right-0 px-6 py-5.5">
              <UserMenu />
            </div>
          </div>
        </div>
  
        {/* Content Area */}
        <div className="px-8 pt-9 flex justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
  

export default DashboardLayout;