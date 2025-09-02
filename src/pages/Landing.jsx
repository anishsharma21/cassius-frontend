import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';

import LandingPromptBox from '../components/LandingPromptBox';
import Footer from '../components/Footer';
import API_ENDPOINTS from '../config/api';


function Landing() {
  
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [promptInput, setPromptInput] = useState('');
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const featuresRef = useRef(null);

  const validateUrl = (url) => {
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!promptInput.trim()) {
      setError('Please enter a website URL');
      posthog?.capture('landing_scrape_failed', {
        error: 'empty_url',
        action: 'validation_error'
      });
      return;
    }

    // Validate URL format
    let urlToSend = promptInput.trim();
    if (!urlToSend.startsWith('http://') && !urlToSend.startsWith('https://')) {
      urlToSend = 'https://' + urlToSend;
    }

    if (!validateUrl(urlToSend)) {
      setError('Please enter a valid website URL');
      posthog?.capture('landing_scrape_failed', {
        error: 'invalid_url_format',
        action: 'validation_error'
      });
      return;
    }

    posthog?.capture('landing_scrape_started', {
      url_domain: new URL(urlToSend).hostname,
      action: 'website_scrape_initiated'
    });

    setIsLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      const response = await fetch(API_ENDPOINTS.webScrapeWebsite, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlToSend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        posthog?.capture('landing_scrape_failed', {
          url_domain: new URL(urlToSend).hostname,
          error: errorData.detail || 'api_error',
          action: 'scrape_api_error'
        });
        
        throw new Error(errorData.detail || 'Failed to scrape website');
      }

      const data = await response.json();
      
      posthog?.capture('landing_scrape_success', {
        url_domain: new URL(urlToSend).hostname,
        action: 'website_scraped'
      });
      
      setScrapedData(data);
    } catch (err) {
      posthog?.capture('landing_scrape_error', {
        url_domain: urlToSend ? new URL(urlToSend).hostname : 'unknown',
        error: err.message,
        action: 'scrape_network_error'
      });
      
      setError(err.message || 'An error occurred while scraping the website');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeaturesClick = (e) => {
    e.stopPropagation();
    posthog?.capture('landing_features_dropdown_toggled', {
      is_opening: !showFeaturesDropdown,
      action: 'features_dropdown_clicked'
    });
    setShowFeaturesDropdown(!showFeaturesDropdown);
  };

  const handleFeatureNavigation = (route) => {
    posthog?.capture('landing_feature_navigation', {
      destination: route,
      action: 'feature_clicked'
    });
    setShowFeaturesDropdown(false);
    navigate(route);
  };

  const handleNavigation = (route) => {
    posthog?.capture('landing_navigation', {
      destination: route,
      action: 'navigation_clicked'
    });
    navigate(route);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (featuresRef.current && !featuresRef.current.contains(event.target)) {
        setShowFeaturesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen pr-60 pl-60 bg-white flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <nav className="w-full mx-auto flex justify-between py-4 bg-white">
        <div>
          <p className="mt-2 font-bold text-black text-2xl">CASSIUS</p>
        </div>
        <ul className="flex mx-auto gap-12 text-lg pt-4 font-sm text-gray-800">
          <li className="relative" ref={featuresRef}>
            <div 
              className="cursor-pointer text-black text-base font-medium hover:text-gray-800 transition-colors"
              onClick={handleFeaturesClick}
            >
              Features
            </div>
            {showFeaturesDropdown && (
              <div 
                className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-sm z-50"
              >
                <div className="py-2">
                  <div 
                    className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFeatureNavigation('/strategy')}
                  >
                    Strategy
                  </div>
                  <div 
                    className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFeatureNavigation('/social-media')}
                  >
                    Social Media
                  </div>
                  <div 
                    className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFeatureNavigation('/geo')}
                  >
                    GEO
                  </div>
                  <div 
                    className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFeatureNavigation('/reddit')}
                  >
                    Reddit
                  </div>
                </div>
              </div>
            )}
          </li>
          <li 
            className="cursor-pointer text-black text-base font-medium hover:text-gray-800 transition-colors"
            onClick={() => handleNavigation('/pricing')}
          >
            Pricing
          </li>
          <li 
            className="cursor-pointer text-black text-base font-medium hover:text-gray-800 transition-colors"
            onClick={() => handleNavigation('/blog')}
          >
            Blog
          </li>
        </ul>
        <button
          className="bg-gray-900 text-white px-4 rounded-lg text-base font-medium shadow hover:bg-gray-800 transition-colors hover:cursor-pointer"
          onClick={() => navigate('/login')}
        >
          Get started
        </button>
      </nav>
      
      <div className="pr-25 pl-25 text-center mt-20">
        <h1 className="text-5xl font-semibold leading-tight text-black">
          Cassius does your marketing. All of it.
        </h1>
        <p className="pl-35 pr-35 pt-8 text-lg text-gray-700">
          Link your website and watch Cassius create your campaign. Strategy, content, engagement, and more. Ready in minutes.
        </p>
      </div>

      {/* Prompt Section */}
      <LandingPromptBox
        input={promptInput}
        setInput={setPromptInput}
        handleSubmit={handleSubmit}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
            Scraping website...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Scraped Data Display */}
      {scrapedData && (
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-black mb-4">Website Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Basic Information</h3>
                {scrapedData.title && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Title:</span>
                    <p className="text-black">{scrapedData.title}</p>
                  </div>
                )}
                {scrapedData.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-black">{scrapedData.description}</p>
                  </div>
                )}
                {scrapedData.url && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">URL:</span>
                    <p className="text-black break-all">{scrapedData.url}</p>
                  </div>
                )}
              </div>

              {/* Content Analysis */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Content Analysis</h3>
                {scrapedData.keywords && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Keywords:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {scrapedData.keywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {scrapedData.word_count && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Word Count:</span>
                    <p className="text-black">{scrapedData.word_count}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Full Content */}
            {scrapedData.content && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Content Preview</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {scrapedData.content.length > 500 
                      ? `${scrapedData.content.substring(0, 500)}...` 
                      : scrapedData.content
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-80"></div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
