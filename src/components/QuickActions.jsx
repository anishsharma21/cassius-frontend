import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';
import cassiusLogo from '../assets/cassius.png';

const guideLink = { name: 'Guide', path: 'guide', description: 'Learn how to use Cassius' };

const quickAccessLinks = [
  { name: 'Reddit Hub', path: 'reddit', description: 'Engage with communities' },
  { name: 'SEO Hub', path: 'geo', description: 'Generate optimized content' },
  { name: 'Partnerships Hub', path: 'partnerships', description: 'Discover influencers' },
  { name: 'Company Profile', path: 'company-profile', description: 'Manage your profile' }
];

const comingSoonLinks = [
  { name: 'Lead Warming Agent', description: 'Nurture potential customers' },
  { name: 'DM\'ing Agent', description: 'Automate direct messaging' },
  { name: 'Sentiment Analysis', description: 'Monitor brand perception' },
  { name: 'SEO Auditor', description: 'Analyze website performance' },
  { name: 'Publication Outreach Agent', description: 'Connect with media outlets' },
  { name: 'GEO Hub', description: 'Geographic targeting tools' },
  { name: 'Online Forum Seeding', description: 'Strategic forum engagement' },
  { name: 'Voice Training', description: 'Train your brand voice' },
  { name: 'More Partnerships', description: 'Expand partnership network' }
];

function QuickActions() {
  const [thumbsUpFeatures, setThumbsUpFeatures] = useState(new Set());
  const [showComingSoon, setShowComingSoon] = useState(false);
  const posthog = usePostHog();

  // Handle thumbs up for coming soon features
  const handleThumbsUp = useCallback((featureName) => {
    setThumbsUpFeatures(prev => {
      const newSet = new Set(prev);
      const isCurrentlyLiked = newSet.has(featureName);
      
      if (isCurrentlyLiked) {
        newSet.delete(featureName);
        // Track thumbs down event
        posthog?.capture('coming_soon_feature_thumbs_down', {
          feature_name: featureName,
          action: 'remove_vote'
        });
      } else {
        newSet.add(featureName);
        // Track thumbs up event
        posthog?.capture('coming_soon_feature_thumbs_up', {
          feature_name: featureName,
          action: 'add_vote'
        });
      }
      return newSet;
    });
  }, [posthog]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={cassiusLogo} alt="Cassius" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">Cassius Intelligence</h1>
          <p className="text-xl text-gray-600 mb-2">Your AI Marketing Copilot</p>
          <p className="text-base text-gray-500">Use the chat on the right to ask about your marketing strategy</p>
        </div>

        {/* Quick Access Links */}
        <div className="w-full max-w-4xl mx-auto space-y-8">
          
          {/* Guide Card - Own Row */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <NavLink
                to={`/dashboard/${guideLink.path}`}
                className="group block p-4 bg-blue-50 rounded-lg shadow-sm border-2 border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-base font-medium text-blue-900 group-hover:text-blue-700 mb-1">
                    {guideLink.name}
                  </div>
                  <div className="text-sm text-blue-700">
                    {guideLink.description}
                  </div>
                </div>
              </NavLink>
            </div>
          </div>

          {/* Working Hub Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccessLinks.map(({ name, path, description }) => (
              <NavLink
                key={path}
                to={`/dashboard/${path}`}
                className="group block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="text-base font-medium text-black group-hover:text-blue-600 mb-1">
                  {name}
                </div>
                <div className="text-sm text-gray-600">
                  {description}
                </div>
              </NavLink>
            ))}
          </div>

          {/* What's Coming Dropdown */}
          <div className="relative border border-gray-200 rounded-lg bg-white shadow-sm">
            <button
              onClick={() => setShowComingSoon(!showComingSoon)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
            >
              <div>
                <div className="text-base font-medium text-gray-900">What's Coming</div>
                <div className="text-sm text-gray-600">Upcoming features and tools</div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${showComingSoon ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showComingSoon && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {comingSoonLinks.map(({ name, description }) => (
                      <div
                        key={name}
                        className="relative p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-300"
                      >
                        <div className="text-base font-medium text-gray-500 mb-1">
                          {name}
                        </div>
                        <div className="text-sm text-gray-400 mb-3">
                          {description}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Coming Soon
                          </div>
                          <button
                            onClick={() => handleThumbsUp(name)}
                            className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                              thumbsUpFeatures.has(name)
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700'
                            }`}
                            title={thumbsUpFeatures.has(name) ? 'Remove vote' : 'Vote for this feature'}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom spacing - only when dropdown is open */}
        {showComingSoon && <div className="min-h-[10vh] py-8"></div>}
      </div>
    </div>
  );
}

export default QuickActions;