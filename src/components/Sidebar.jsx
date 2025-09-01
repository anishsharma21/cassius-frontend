import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import UserMenu from './UserMenu';
import API_ENDPOINTS from '../config/api';
import brainIcon from '../assets/brain.svg'

const sidebarItems = [
  { 
    name: 'Strategy', 
    path: 'strategy',
    icon: (
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5" fill="black" viewBox="0 0 512 512">
          <path d="M502.472 256.833c-6.491-61.075-40.69-110.46-86.082-144.101-45.887-34.04-103.296-52.724-157.675-52.76-56.443.009-91.262 7.173-114.312 17.082-22.776 9.644-33.774 22.98-39.813 30.843-24.68 4.029-49.262 18.348-68.77 38.697C15.107 168.343.054 197.423 0 229.381c0 34.97 8.112 64.52 24.299 86.498 14.354 19.596 35.288 32.472 60.207 37.148 1.638 9.456 5.56 20.003 13.672 29.647 8.412 10.06 19.888 17.383 33.454 22.032 13.584 4.675 29.329 6.836 47.234 6.853h75.084c1.85 4.729 4.108 9.236 7.217 13.213 7.642 9.785 18.649 16.656 31.834 20.96 13.248 4.33 28.859 6.288 46.995 6.296 8.909 0 17.348-.407 24.512-.752h.026c5.136-.274 9.555-.469 12.698-.469 9.466 0 18.526-2.302 26.318-6.819 7.793-4.498 14.257-11.166 18.676-19.357 2.232-4.154 3.702-8.51 4.8-12.902 16.727-3.126 30.604-9.236 41.407-17.028 12.663-9.121 21.367-20.11 27.283-30.09 11.556-19.552 16.267-41.247 16.285-61.384-.019-17.163-3.49-33.147-9.529-46.394zm-26.61 96.016c-4.649 7.837-11.352 16.241-20.916 23.121-9.581 6.872-22.041 12.38-39.06 14.319l-9.519 1.072-.7 9.555c-.292 4.127-1.576 8.767-3.737 12.76-2.506 4.578-5.835 7.962-9.918 10.335-4.1 2.356-9.006 3.71-14.78 3.718-4.073 0-8.714.24-13.858.496l1.922-.088-1.914.088c-7.145.355-15.178.736-23.386.736-21.943.035-38.299-3.356-48.747-8.864-5.251-2.736-9.06-5.906-11.884-9.511-2.807-3.622-4.711-7.74-5.782-12.884l-1.904-9.218h-92.812c-16.01 0-29.302-1.992-39.725-5.578-10.44-3.622-17.94-8.678-23.28-15.054-6.96-8.306-9.024-17.32-9.289-25.237l-.31-10.077-10.024-1.044c-23.519-2.58-40.885-12.524-53.379-29.314-12.424-16.815-19.791-41.3-19.791-72.798-.054-24.422 11.874-48.474 29.443-66.875 17.463-18.454 40.46-30.674 59.419-32.463l4.348-.452 2.966-3.206c1.328-1.452 2.382-2.851 3.294-4.002 5.986-7.474 12.114-15.806 31.002-24.139 18.845-8.156 50.652-15.222 105.174-15.213 49.076-.036 102.278 17.232 143.932 48.217 41.726 31.046 71.78 75.153 77.094 129.578l.203 2.098.922 1.887c4.844 9.776 8.094 23.608 8.066 38.414 0 16.55-3.94 34.225-13.07 49.623z"/>
          <path d="M357.042 146.417h24.059c5.172 0 9.378-4.242 9.378-9.573 0-5.215-4.206-9.43-9.378-9.43h-24.059c-5.331 0-9.555 4.216-9.555 9.43.001 5.331 4.224 9.573 9.555 9.573z"/>
          <path d="M244.21 237.307c0 5.287 4.25 9.564 9.501 9.564 5.162 0 9.475-4.276 9.475-9.564v-51.82c0-2.399.709-2.958.886-3.179 3.02-2.966 14.274-2.966 22.164-2.966l.301.106h62.226c1.204 0 2.48-.106 3.906-.106 5.012-.221 11.202-.434 13.796 2.072 1.647 1.611 2.604 5.19 2.604 9.988v33.225c-.204 6.544-.24 17.56 7.128 25.042 2.869 2.958 8.2 6.464 16.896 6.464h48.89c5.136 0 9.352-4.233 9.352-9.555 0-5.198-4.216-9.519-9.352-9.519h-48.89l-3.418-.806c-1.736-1.797-1.621-8.332-1.621-11.467v-33.385c0-10.307-2.886-18.277-8.394-23.599-8.484-8.138-20.022-7.801-27.629-7.483-1.258 0-2.302.045-3.268.045h-31.364c.372-2.622.372-5.26.274-7.633v-27.602c0-5.189-4.268-9.476-9.448-9.476-5.286 0-9.43 4.286-9.43 9.476v27.752c0 2.222 0 5.738-.47 6.65 0 0-1.301.832-6.314.832h-4.684c-12.92-.16-27.778-.204-36.615 8.474-2.887 2.922-6.5 8.208-6.5 16.648v51.822zM213.677 159.709c5.304 0 9.555-4.348 9.555-9.528v-13.594h15.93c5.154 0 9.413-4.268 9.413-9.554 0-5.162-4.259-9.493-9.413-9.493h-15.93v-10.467c0-5.233-4.251-9.528-9.555-9.528-5.154 0-9.413 4.294-9.413 9.528v43.108c0 5.18 4.259 9.528 9.413 9.528zM110.841 173.682h39.468c6.438-.229 12.565-.229 15.452 2.807 2.559 2.498 3.967 8.111 3.967 16.17v37.051c0 5.242 4.233 9.546 9.581 9.546 5.154 0 9.458-4.303 9.458-9.546v-7.882h14.886c5.251 0 9.44-4.277 9.44-9.51 0-5.251-4.188-9.599-9.44-9.599h-14.886v-10.06c0-13.672-3.135-23.351-9.626-29.736-8.421-8.448-19.8-8.368-28.877-8.288h-39.423a9.454 9.454 0 0 0-9.511 9.475c0 5.277 4.127 9.572 9.511 9.572zM135.892 229.099c0-5.251-4.365-9.555-9.483-9.555H59.791c-5.26 0-9.555 4.304-9.555 9.555 0 5.233 4.295 9.528 9.555 9.528h24.148v17.339c0 5.286 4.188 9.519 9.386 9.519 5.402 0 9.59-4.233 9.59-9.519v-17.339h23.494c5.118 0 9.483-4.296 9.483-9.528z"/>
          <path d="M194.576 291.412h81.353c17.498 0 30.772-4.64 39.6-13.884 13.566-14.363 12.619-35.634 11.919-49.687-.124-2.683-.248-5.206-.248-7.323 0-5.296-4.25-9.51-9.608-9.51-5.18 0-9.368 4.215-9.368 9.51 0 2.408.124 5.171.248 8.111.584 12.256 1.24 27.337-6.854 35.873-4.941 5.26-13.682 7.89-25.689 7.89H194.877c-15.133-.23-40.584-.638-56.753 15.319-9.068 8.944-13.681 21.545-13.681 37.396 0 5.153 4.17 9.52 9.484 9.52 5.18 0 9.51-4.366 9.51-9.52 0-10.768 2.594-18.579 8.049-23.918 10.449-10.255 30.126-9.954 43.09-9.777zM323.96 332.616c0-5.162-4.171-9.502-9.475-9.502H194.107c-5.19 0-9.538 4.34-9.538 9.502 0 5.268 4.348 9.519 9.538 9.519h36.81v18.985c0 5.323 4.225 9.502 9.458 9.502a9.445 9.445 0 0 0 9.493-9.502v-18.985h64.617c5.303 0 9.475-4.251 9.475-9.519zM377.887 370.065h-4.471v-17.693c0-5.384-4.18-9.528-9.475-9.528-5.26 0-9.502 4.145-9.502 9.528v17.693h-32.941c-5.242 0-9.502 4.241-9.502 9.528 0 5.224 4.26 9.448 9.502 9.448h56.39c5.208 0 9.484-4.224 9.484-9.448-.001-5.288-4.277-9.528-9.485-9.528zM421.579 323.114v-15.523h3.419c5.357 0 9.599-4.17 9.599-9.43 0-5.251-4.242-9.555-9.599-9.555h-66.459c-5.225 0-9.511 4.304-9.511 9.555 0 5.26 4.286 9.43 9.511 9.43h43.983v15.523c0 5.358 4.313 9.502 9.556 9.502 5.233 0 9.501-4.144 9.501-9.502zM451.333 347.909h-24.042c-5.304 0-9.546 4.18-9.546 9.467 0 5.286 4.241 9.43 9.546 9.43h24.042c5.33 0 9.616-4.144 9.616-9.43.001-5.287-4.286-9.467-9.616-9.467z"/>
        </svg>
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.3 11.4 10.1 3a.6.6 0 0 1 .8-.3l1 .5a2.6 2.6 0 0 1 1.4 2.3v3.9h6.4a2 2 0 0 1 1.9 2.5l-2 8a2 2 0 0 1-1.9 1.5H4.3a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3v10"/>
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
                    <svg 
                      className="w-4 h-4 text-white"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
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
