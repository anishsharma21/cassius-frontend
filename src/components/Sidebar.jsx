import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import UserMenu from './UserMenu';
import API_ENDPOINTS from '../config/api';
import flagIcon from '../assets/flag.svg';

const sidebarItems = [
  { 
    name: 'Strategy', 
    path: 'strategy',
    icon: (
      <div className="flex items-center justify-center">
        <img src={flagIcon} alt="Flag" className="w-5 h-5" />
      </div>
    )
  },
  { 
    name: 'Reddit', 
    path: 'reddit',
    icon: (
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    )
  },
  { 
    name: 'SEO', 
    path: 'geo',
    icon: (
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    )
  },
  { 
    name: 'Partnerships', 
    path: 'partnerships',
    icon: (
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    )
  },
  { 
    name: 'Company Profile', 
    path: 'company-profile',
    icon: (
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    )
  },
  { 
    name: 'Guide', 
    path: 'guide',
    icon: (
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
    )
  },
  { 
    name: 'Feedback', 
    path: 'feedback',
    icon: (
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    )
  },
];

const Sidebar = ({ isCollapsed, onToggle }) => {
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
    refetchOnWindowFocus: false
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
    refetchOnWindowFocus: false
  });

  return (
    <aside 
      className={`bg-gray-100 flex flex-col justify-between px-4 py-4 transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-auto'
      }`}
      style={{
        width: isCollapsed ? '64px' : 'auto',
        maxWidth: isCollapsed ? '64px' : '400px',
        minWidth: isCollapsed ? '64px' : '200px'
      }}
    >
      <div>
        {/* Business Component at Top */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center">
              <div 
                className={`w-8 h-8 bg-blue-600 rounded-lg ${isCollapsed ? 'mr-0 cursor-pointer hover:bg-blue-700 transition-colors' : 'mr-3'} flex items-center justify-center group`}
                onClick={isCollapsed ? onToggle : undefined}
                title={isCollapsed ? "Click to expand sidebar" : undefined}
              >
                <div className="flex items-center justify-center">
                  {isLoadingCompany ? (
                    <div className="w-4 h-4 bg-blue-400 rounded animate-pulse"></div>
                  ) : isCollapsed ? (
                    <>
                      <span className="text-white font-medium text-base group-hover:hidden">
                        {company?.name ? company.name.charAt(0) : 'C'}
                      </span>
                      <svg 
                        className="w-4 h-4 text-white hidden group-hover:block"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </>
                  ) : (
                    <span className="text-white font-medium text-base">
                      {company?.name ? company.name.charAt(0) : 'C'}
                    </span>
                  )}
                </div>
              </div>
              <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {!isCollapsed && (
                  isLoadingCompany ? (
                    <div className="h-5 bg-gray-300 rounded animate-pulse" style={{ width: '100px' }}></div>
                  ) : (
                    <h2 className="px-1 text-base font-normal text-black whitespace-nowrap">
                      {company?.name || 'Company'}
                    </h2>
                  )
                )}
              </div>
            </div>
            
                           {/* Collapse Sidebar Button - Only show when expanded */}
               {!isCollapsed && (
                 <button
                   onClick={onToggle}
                   className="ml-auto p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                   title="Collapse sidebar"
                 >
                <svg 
                  className="w-4 h-4 text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Section 1: Main Hub Navigation */}
        <nav className="mb-8">
          {sidebarItems.slice(0, 4).map(({ name, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center py-1 rounded-lg text-base text-black transition-colors mb-3 last:mb-0 min-h-[32px] ${
                    isActive
                    ? 'bg-gray-200'
                    : 'hover:bg-gray-200'
                  }`
                }
              title={isCollapsed ? name : undefined}
            >
              <div className="icon-container ml-1.5 flex-shrink-0">
                {icon}
              </div>
              <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {!isCollapsed && (
                  <div className="text-container ml-3 whitespace-nowrap overflow-hidden text-ellipsis">
                    {name}
                  </div>
                )}
              </div>
            </NavLink>
          ))}
        </nav>
        
        {/* Section 2: Company Profile (Single Item) */}
        <nav className="mb-8">
          {sidebarItems.slice(4, 5).map(({ name, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center py-1 rounded-lg text-base text-black transition-colors mb-3 last:mb-0 min-h-[32px] ${
                  isActive
                    ? 'bg-gray-200'
                    : 'hover:bg-gray-200'
                }`
              }
              title={isCollapsed ? name : undefined}
            >
              <div className="icon-container ml-1.5 flex-shrink-0">
                {icon}
              </div>
              <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {!isCollapsed && (
                  <div className="text-container ml-3 whitespace-nowrap overflow-hidden text-ellipsis">
                    {name}
                  </div>
                )}
              </div>
            </NavLink>
          ))}
        </nav>
        
        {/* Section 3: Guide and Feedback */}
        <nav>
          {sidebarItems.slice(5).map(({ name, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center py-1 rounded-lg text-base text-black transition-colors mb-3 last:mb-0 min-h-[32px] ${
                  isActive
                    ? 'bg-gray-200'
                    : 'hover:bg-gray-200'
                }`
              }
              title={isCollapsed ? name : undefined}
            >
              <div className="icon-container ml-1.5 flex-shrink-0">
                {icon}
              </div>
              <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {!isCollapsed && (
                  <div className="text-container ml-3 whitespace-nowrap overflow-hidden text-ellipsis">
                    {name}
                  </div>
                )}
              </div>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* UserMenu at the bottom of sidebar */}
      <div className="mt-auto">
        <UserMenu user={user} isLoading={isLoadingUser} isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
