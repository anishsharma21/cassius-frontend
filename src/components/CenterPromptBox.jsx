import React from 'react';

const CenterPromptBox = ({
  input,
  setInput,
  handleSubmit,
}) => {

  return (
    <div className="relative w-full flex flex-col items-center justify-start mt-15">
      <div className="w-full max-w-4xl bg-gray-100 rounded-3xl shadow-xl p-4 flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center">
          <div className="w-full flex items-center bg-white rounded-3xl px-3 py-3">
            <textarea
              className="flex-1 text-base bg-transparent border-none outline-none placeholder-gray-400 text-gray-600 px-2 resize-none min-h-[94px] max-h-60 overflow-y-auto"
              placeholder="Describe your brand and target market."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              style={{ width: '100%' }}
            />
            <button
              type="submit"
              className="ml-4 bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 transition-colors text-white rounded-xl p-2 flex items-center justify-center focus:outline-none"
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
        <p className="text-gray-500 text-sm w-full text-left mt-4 px-1">
          Upload your website, images, and documents for highly tailored campaigns.
        </p>
      </div>
    </div>
  );
};

export default CenterPromptBox;