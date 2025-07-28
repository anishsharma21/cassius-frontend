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

  return (
    <div>
      <button
        ref={iconRef}
        onClick={() => setPopupOpen((prev) => !prev)}
        className={`w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center justify-center border-2 cursor-pointer ${popupOpen ? 'bg-blue-600' : ''}`}
      >
        {userInitials}
      </button>
      {popupOpen && (
        <div
          ref={popupRef}
          className="absolute right-0 mt-2 w-64 bg-white border-1 border-gray-200 rounded-lg shadow-md p-4 z-40"
        >
          <div className="mb-3 text-center">{userEmail}</div>
          <hr className="border-cyan-800 mb-3" />
          <button className="w-full px-2 py-2 text-base text-left hover:bg-gray-100 rounded-md text-gray-700 mb-2 cursor-pointer">
            Update Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-2 py-2 text-left hover:bg-gray-100 rounded-md text-gray-700 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;