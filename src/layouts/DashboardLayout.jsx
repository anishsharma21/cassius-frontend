import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import UserMenu from '../components/UserMenu';

const sidebarItems = [
  { name: 'Dashboard', path: 'home' },
  { name: 'SEO & GEO Hub', path: 'seo-geo' },
  { name: 'Social Media Hub', path: 'social-media' },
  { name: 'Reddit Hub', path: 'reddit' },
];

const DashboardLayout = () => {

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between p-4">
        <div>
          <p>Cassius Logo Placeholder</p>
          <nav className="mt-4 space-y-2">
            {sidebarItems.map(({ name, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-base font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 relative px-7 py-7">
        <div className="absolute top-2 right-2">
          <UserMenu />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;