import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPromptBox = ({
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
      <div className="w-full max-w-3xl bg-gray-100 rounded-2xl shadow-md p-4 flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            className={`w-full flex items-center bg-white border rounded-2xl px-2 py-2 transition-colors ${isFocused ? 'border-black' : 'border-gray-400'}`}
            onClick={() => setIsFocused(true)}
          >
            <textarea
              className="flex-1 text-2xl tracking-wider text-black bg-transparent font-extralight border-none outline-none placeholder-gray-400 text-gray-600 px-2 resize-none overflow-y-auto flex items-center"
              placeholder="https://your-website.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              style={{ width: '100%', minHeight: '40px', lineHeight: '40px' }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <button
              type="submit"
              className="ml-4 bg-gray-900 hover:bg-gray-800 cursor-pointer transition-colors text-white rounded-lg p-1 flex items-center justify-center focus:outline-none"
              style={{ minWidth: 35, minHeight: 35 }}
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
      </div>
    </div>
  );
};

export default LandingPromptBox;