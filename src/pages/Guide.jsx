import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Guide = () => {
  const { user: userData } = useAuth();

  const handleTryItOut = () => {
    // Use localStorage to communicate with SideChat component
    const messageData = {
      type: 'guide_prompt',
      content: "Hey Cassius, what are your first thoughts on how we can improve our marketing?",
      timestamp: new Date()
    };
    
    // Store the message in localStorage for SideChat to pick up
    localStorage.setItem('guidePrompt', JSON.stringify(messageData));
    
    // Trigger a storage event to notify SideChat
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'guidePrompt',
      newValue: JSON.stringify(messageData)
    }));
  };

  const navigate = useNavigate();

  return (
    <div>
      <p className="text-2xl font-bold">Welcome to the Cassius beta!</p>
      <br></br>
      <p className="text-base">Hey {userData?.display_name}, we're so excited for you to try out Cassius.</p>
      <p className="text-base">In this beta, you'll access the main features we've used to grow our waitlist to &gt; 1K businesses.</p>
      <p className="text-base">We're confident you'll see similar results and can't wait to hear your feedback.</p>
      <p className="text-base">We've put together a short guide to help you get started, below.</p>
      <p className="ml-4 mt-2 text-base">~ Jock, Gaurav, and Jason</p>
      <br></br>
      <br></br>

      <p className="text-2xl font-bold">Guide</p>
      <br></br>
      <p className="text-lg font-semibold">Quick Start</p>
      <p className="ml-2 mt-2 text-base">• Cassius is your AI CMO who's absolutely obsessed with growing your business.</p>
      <div className="ml-2 flex items-center gap-1">
        <p className="text-base">
         • Using the information you provided, Cassius is already onboarded and ready to go.{' '}
          <button
            onClick={handleTryItOut}
            className="inline-flex items-center text-blue-600 text-base cursor-pointer transition-colors hover:text-blue-600 underline"
          >
            Ask Cassius anything.
          </button>{' '}
        </p>
      </div>
      <br></br>
      <p className="text-lg font-semibold">Profile Library</p>
      <p className="ml-2 mt-2 text-base">• Cassius uses the{' '}
        <button
          onClick={() => navigate('/dashboard/profile-library')}
          className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors"
        >
          profile library
        </button>
        {' '}to understand and grow your business.</p>
      <p className="ml-2 text-base">• Upload relevant documents, images, and urls to improve Cassius' knowledge and performance.</p>
      <p className="ml-2 text-base">• We strongly recommend doing this at the start and updating as you go.</p>
      <br></br>
      <p className="text-lg font-semibold">Strategy</p>
      <br></br>
      <p className="text-lg font-semibold">Reddit</p>
      <br></br>
      <p className="text-lg font-semibold">GEO</p>
      <br></br>
      <p className="text-lg font-semibold">Partnerships</p>
    </div>
  );
};

export default Guide;
