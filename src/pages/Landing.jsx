import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import CenterPromptBox from '../components/CenterPromptBox';


function Landing() {
  
  const navigate = useNavigate();
  const [promptInput, setPromptInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Prompt submitted:', promptInput);
  };

  return (
    <div className="min-h-screen pr-60 pl-60 bg-white flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <nav className="w-full mx-auto flex justify-between py-4 bg-white">
        <div>
          <p className="mt-2 font-bold text-2xl">CASSIUS</p>
        </div>
        <ul className="flex mx-auto gap-12 text-lg pt-4 font-sm text-gray-800">
          <li className="cursor-pointer hover:text-gray-700 transition-colors">Social Media</li>
          <li className="cursor-pointer hover:text-gray-700 transition-colors">Content Studio</li>
          <li className="cursor-pointer hover:text-gray-700 transition-colors">Partnerships</li>
          <li className="cursor-pointer hover:text-gray-700 transition-colors">Analytics</li>
        </ul>
        <button
          className="bg-gray-800 text-white px-6 rounded-full font-semibold shadow hover:bg-gray-700 transition-colors hover:cursor-pointer"
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>
      </nav>
      
      <div className="pr-25 pl-25 text-center mt-20">
        <h1 className="text-5xl font-semibold leading-tight text-black">
          Cassius does your marketing. All of it.
        </h1>
        <p className="pl-35 pr-35 pt-8 text-lg text-gray-700">
          Describe your business and watch Cassius create your campaign. Strategy, content, engagement, and more. Ready in minutes.
        </p>
      </div>

      {/* Prompt Section */}
      <CenterPromptBox
        input={promptInput}
        setInput={setPromptInput}
        handleSubmit={handleSubmit}
      />

      <div className="mt-80"></div>

      {/* Footer */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white border-t border-gray-100 mt-24">
        <footer className="max-w-6xl mx-auto pt-12 pb-6 px-4 bg-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
            <div className="min-w-[180px] mb-8 md:mb-0">
              <div className="font-bold text-lg mb-2">Cassius</div>
              <div className="flex items-center text-gray-500 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Sydney, Australia
              </div>
            </div>
            <div className="flex flex-1 flex-wrap gap-12 justify-between">
              <div>
                <div className="font-semibold mb-2">For companies</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Get in touch</div>
                <div className="font-semibold mt-4 mb-2">Human data</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Guide</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Process</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Data pipelines</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Incentives</div>
              </div>
              <div>
                <div className="font-semibold mb-2">For creators</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Getting started</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Opportunities</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Information</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Resources</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Careers</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Privacy policy</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">Worker terms</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Support</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">cassius.com/guide</div>
                <div className="text-gray-600 text-sm mb-1 cursor-pointer hover:underline">support@cassius.com</div>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mt-10 gap-4">
            <div className="text-gray-400 text-sm">© 2025 Cassius Business Corporation.<br></br>"Cassius" and the Cassius logo are registered trademarks of the company.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Landing;
