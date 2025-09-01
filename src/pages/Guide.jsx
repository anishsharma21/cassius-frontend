import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Guide = () => {
  const { user: userData } = useAuth();
  const [openSections, setOpenSections] = useState({
    welcome: true, // Keep welcome section open by default
    gettingStarted: false,
    features: false,
    roadmap: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="p-6 space-y-4">
      {/* Welcome Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('welcome')}
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg border-b border-gray-200 flex items-center justify-between"
        >
          <h2 className="text-xl font-semibold">Welcome to the Cassius beta!</h2>
          <svg
            className={`w-5 h-5 transform transition-transform ${openSections.welcome ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.welcome && (
          <div className="p-4 space-y-3">
            <p className="text-base">Hey {userData?.display_name},</p>
            <p className="text-base">You are one of the very first people to ever use Cassius! We are so excited for you to use v1, and can't wait to see how much it helps with your marketing.</p>
            <p className="text-base">We built this product because we spent years in early-stage businesses, doing every kind of marketing and distribution. It's manual, repetitive, time-consuming, and rarely fun (often, actually very painful).</p>
            <p className="text-base">Most startups fail at distribution because they don't have the time, skill, or resources to execute marketing at the quality and scale required to win. </p>
            <p className="text-base">So, we built the most intuitive and intelligent marketing platform in the world, which gives you expert and truly actionable strategies based on what works right now in marketing, and allows you to orchestrate everything through one chat interface.</p>
            <p className="text-base">Our hope is that Cassius makes marketing feel clearer, faster, much more enjoyable – and ultimately, drives incredible customers to your business.</p>
            <p className="text-base">Tell us what feels useful, what feels confusing, and what you'd like to see next (based on the core things you actually care about).</p>
            <p className="text-base">Your feedback at this stage will shape the future of Cassius more than anything else. Can't wait to hear your feedback and thoughts.</p>
            <p className="text-base ml-4">~ Jock, Gaurav, and Jason</p>
          </div>
        )}
      </div>

      {/* Getting Started Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('gettingStarted')}
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg border-b border-gray-200 flex items-center justify-between"
        >
          <h2 className="text-xl font-semibold">How to get started</h2>
          <svg
            className={`w-5 h-5 transform transition-transform ${openSections.gettingStarted ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.gettingStarted && (
          <div className="p-4 space-y-3">
            <p className="text-base">1. Please turn off your Adblock to make sure we can see how you use the platform</p>
            <p className="text-base">2. Fill out your Profile Library with as much detail as possible about your business</p>
            <p className="text-base">3. Ask Cassius for an initial strategy</p>
            <p className="text-base">4. Start executing the strategies in each hub</p>
            <p className="text-base">5. Track results</p>
            <p className="text-base">6. Share your feedback with us</p>
            <p className="text-base">You are helping us create something that we believe can change how small teams grow. We are so grateful to have you on this journey with us.</p>
            <p className="text-base">Happy marketing!</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('features')}
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg border-b border-gray-200 flex items-center justify-between"
        >
          <h2 className="text-xl font-semibold">What you can try right now</h2>
          <svg
            className={`w-5 h-5 transform transition-transform ${openSections.features ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.features && (
          <div className="p-4 space-y-3">
            <p className="text-base">This first version is light by design. We wanted to get it into your hands early, so we can learn from your experience using all the functionality before we refine the offering and expand.</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Reddit:</strong> Cassius finds the most relevant conversations for your product and suggests replies you can post.</li>
              <li><strong>SEO:</strong> Shows where you currently rank, and writes SEO friendly blogs that are structured to improve visibility.</li>
              <li><strong>Partnerships:</strong> Surfaces relevant micro influencers in your space with contact details and suggested outreach copy.</li>
              <li><strong>Profile Library:</strong> A place to upload docs, links, and resources so Cassius can understand your business and improve its recommendations.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Roadmap Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('roadmap')}
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg border-b border-gray-200 flex items-center justify-between"
        >
          <h2 className="text-xl font-semibold">What we're working towards</h2>
          <svg
            className={`w-5 h-5 transform transition-transform ${openSections.roadmap ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.roadmap && (
          <div className="p-4 space-y-3">
            <p className="text-base">The next version of Cassius will take a bigger step into execution. Soon, the agents will be able to post to Reddit for you, publish blogs directly to sites like WordPress and Webflow, and reach out to influencers on your behalf.</p>
            <p className="text-base">We will also introduce new hubs, including a GEO hub for LLM-optimised content, and expand the agents within existing hubs, including deeper SEO audits, influencer analytics, Reddit warming up agents and tons more.</p>
            <p className="text-base">We have also heard your non-negotiables, and we know that avoiding AI slop is huge for you. V2 is being built to learn from your documents, your brand style, the way you speak to it, and the revisions you make. </p>
            <p className="text-base">Right now, our focus is on building the best foundation. That means simple features that work well, and a workflow that feels natural. We are guided by you entirely on this pursuit. </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guide;
