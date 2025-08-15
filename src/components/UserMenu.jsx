import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const UserMenu = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const iconRef = useRef(null);
  const navigate = useNavigate();

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

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData.email || '';
  const userInitials = userData.initials || '';
  const displayName = userData.display_name || '';
  const capitalisedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <button
          ref={iconRef}
          onClick={() => setPopupOpen((prev) => !prev)}
          className={`w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-medium flex items-center justify-center cursor-pointer ${
            popupOpen ? 'bg-blue-600' : ''
          }`}
        >
          {userInitials}
        </button>
        {popupOpen && (
          <div
            ref={popupRef}
            className="absolute bottom-0 left-full ml-2 w-40 bg-white border border-gray-300 rounded-lg shadow-sm p-2 z-40 max-h-[80vh] overflow-auto"
          >
            <div className="mb-2 text-left text-sm text-gray-600 p-1">{userEmail}</div>
            <button className="mb-2 w-full text-sm font-base text-left hover:bg-gray-100 p-1 rounded-md text-black cursor-pointer">
              Update profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-sm font-base text-left hover:bg-gray-100 p-1 rounded-md text-black cursor-pointer"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-black">
        Welcome, {capitalisedDisplayName}.
      </span>
    </div>
  );
};

export default UserMenu;
