import React, { useState, useRef, useEffect } from 'react';

const WorkspaceSelector = ({ activeBusiness, onBusinessChange }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
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

  const businesses = [
    {
      id: 1,
      name: 'TechStart Solutions',
      industry: 'Software Development',
      location: 'Sydney, Australia',
      employees: '15-50',
      website: 'techstart.com.au'
    },
    {
      id: 2,
      name: 'EcoGreen Marketing',
      industry: 'Environmental Services',
      location: 'Melbourne, Australia',
      employees: '5-15',
      website: 'ecogreen.com.au'
    }
  ];

  const handleBusinessSelect = (business) => {
    onBusinessChange(business);
    setPopupOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setPopupOpen((prev) => !prev)}
        className="-ml-2 py-2 font-medium cursor-pointer text-black hover:text-gray-600 transition-colors flex items-center"
        aria-label="Select Workspace"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 18 18">
          <path d="M6.75 7.5L9 5.25L11.25 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.25 10.5L9 12.75L6.75 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {popupOpen && (
        <div
          ref={popupRef}
          className="absolute right-0 mt-2 bg-white border border-gray-400 rounded-lg p-4 z-40 w-70"
        >
          <h3 className="text-sm font-medium text-black mb-3">Select Workspace</h3>
          <div className="space-y-2">
            {businesses.map((business) => {
              const isActive = business.id === activeBusiness.id;
              return (
                <div
                  key={business.id}
                  className={"flex items-center cursor-pointer px-3 py-2 rounded-full hover:bg-gray-100"}
                  onClick={() => handleBusinessSelect(business)}
                >
                  <div className={"w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center mr-3"}>
                    <span className={"text-white font-bold text-sm"}>
                      {business.name.charAt(0)}
                    </span>
                  </div>
                  <p className={"text-black font-medium text-sm"}>
                    {business.name}
                  </p>
                  {isActive && (
                    <div className="w-2 h-2 bg-green-600 rounded-full ml-6"></div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-t-black flex items-center justify-center">
            <button className="px-6 py-2 text-sm font-medium cursor-pointer text-center bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Add New Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector; 