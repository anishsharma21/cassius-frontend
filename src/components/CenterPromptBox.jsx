import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CenterPromptBox = ({
  input,
  setInput,
  handleSubmit,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to remove focus
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center justify-start mt-12">
      <div className="w-full max-w-4xl bg-gray-100 rounded-3xl shadow-md p-4 flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            className={`w-full flex items-center bg-white border rounded-3xl px-3 py-3 transition-colors ${isFocused ? 'border-black' : 'border-gray-400'}`}
            onClick={() => setIsFocused(true)}
          >
            <textarea
              className="flex-1 text-base bg-transparent border-none outline-none placeholder-gray-400 text-gray-600 px-2 resize-none min-h-[94px] max-h-60 overflow-y-auto"
              placeholder="What does your business do?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              style={{ width: '100%' }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <button
              type="submit"
              className="ml-4 bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-800 transition-colors text-white rounded-xl p-2 flex items-center justify-center focus:outline-none"
              style={{ minWidth: 40, minHeight: 40 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </form>
        <p className="text-gray-600 text-sm w-full text-left mt-4 px-1">
        <button
          type="button"
          className="text-gray-600 underline mr-1 ml-1 hover:text-gray-500 cursor-pointer"
          onClick={() => navigate('/signup')}
          >
            Add your website
          </button>
          for Cassius to create tailored campaigns.
        </p>
      </div>
    </div>
  );
};

export default CenterPromptBox;