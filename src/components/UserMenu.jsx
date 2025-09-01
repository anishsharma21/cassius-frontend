import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthActions } from '../hooks/useAuth';

const UserMenu = ({ user, isLoading, isCollapsed }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const iconRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuthActions();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setPopupOpen(false);
      }
    }

    if (popupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Use props data or fallback to localStorage for backward compatibility
  const userEmail = user?.email || '';
  const userInitials = user?.initials || '';
  const firstName = user?.first_name || '';
  const capitalisedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="flex items-center">
      <div className="icon-container flex-shrink-0">
        <button
          ref={iconRef}
          onClick={() => setPopupOpen((prev) => !prev)}
          className={`w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium text-base flex items-center justify-center cursor-pointer ${
            popupOpen ? 'bg-blue-600' : ''
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 bg-gray-400 rounded animate-pulse"></div>
          ) : (
            userInitials
          )}
        </button>
        {popupOpen && (
          <div
            ref={popupRef}
            className="fixed w-fit bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-[9999] max-h-[80vh] overflow-auto"
            style={{
              bottom: iconRef.current ? window.innerHeight - iconRef.current.getBoundingClientRect().top + 8 : 0,
              left: iconRef.current ? iconRef.current.getBoundingClientRect().left : 0
            }}
          >
            <div className="mb-2 text-left text-base font-normal text-black p-1">{userEmail}</div>
            <button
              onClick={handleLogout}
              className="w-full text-base font-normal text-left hover:bg-gray-100 p-1 rounded-md text-black cursor-pointer"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
      <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {!isCollapsed && (
          <div className="text-container ml-4 whitespace-nowrap overflow-hidden text-ellipsis">
            {isLoading ? (
              <div className="h-5 bg-gray-300 rounded animate-pulse" style={{ width: '100px' }}></div>
            ) : (
              capitalisedFirstName
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
