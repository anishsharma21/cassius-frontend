import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthActions } from '../hooks/useAuth';

const UserMenu = ({ user, isLoading }) => {
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
  const displayName = user?.display_name || '';
  const capitalisedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <button
          ref={iconRef}
          onClick={() => setPopupOpen((prev) => !prev)}
          className={`w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium flex items-center justify-center cursor-pointer ${
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
            className="absolute bottom-0 left-full ml-2 w-fit bg-white border border-gray-300 rounded-lg shadow-sm p-2 z-40 max-h-[80vh] overflow-auto"
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
      <span className="text-base font-normal text-black">
        {isLoading ? (
          <div className="h-5 bg-gray-300 rounded animate-pulse" style={{ width: '100px' }}></div>
        ) : (
          capitalisedDisplayName
        )}
      </span>
    </div>
  );
};

export default UserMenu;
