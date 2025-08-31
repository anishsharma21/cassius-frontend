import React, { useState, useCallback, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';
import ChatInterface from '../components/ChatInterface';
import useChatConversation from '../hooks/useChatConversation';
import useChatAPI from '../hooks/useChatAPI';
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

function Strategy() {
  const [showConversation, setShowConversation] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [thumbsUpFeatures, setThumbsUpFeatures] = useState(new Set());
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const posthog = usePostHog();
  
  const {
    conversation,
    createUserMessage,
    createAIMessage,
    updateAIMessage,
    clearConversation,
    getChatHistory
  } = useChatConversation();

  // API hook with updated callback
  const updateAIMessageCallback = useCallback((messageId, updates) => {
    if (typeof updates === 'function') {
      // Handle function-based updates
      updateAIMessage(messageId, (_prevMsg) => {
        const currentMsg = conversation.find(msg => msg.id === messageId) || {};
        return updates(currentMsg);
      });
    } else {
      // Handle direct updates
      updateAIMessage(messageId, updates);
    }
  }, [updateAIMessage, conversation]);

  const {
    generateAIResponse,
    handleGeneratedReply,
    handleStreamingChunk,
    handleStreamingComplete,
    resetStreamingState
  } = useChatAPI({
    onUpdateAIMessage: updateAIMessageCallback,
    getChatHistory,
    streamingMessageId,
    setStreamingMessageId
  });

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

  // Handle chat submission
  const handleChatSubmit = useCallback(async (prompt) => {
    // Create user message
    createUserMessage(prompt);
    
    // Create AI message placeholder
    const aiMessageId = createAIMessage();
    
    // Show conversation if it's the first message
    if (conversation.length === 0) {
      setShowConversation(true);
    }
    
    // Generate AI response
    await generateAIResponse(prompt, aiMessageId);
  }, [createUserMessage, createAIMessage, generateAIResponse, conversation.length]);

  // Handle clearing conversation
  const handleClearConversation = useCallback(() => {
    clearConversation();
    resetStreamingState();
    setShowConversation(false);
  }, [clearConversation, resetStreamingState]);

  // Listen for Reddit reply events (similar to SideChat)
  useEffect(() => {
    const handleRedditReplyPrompt = async (event) => {
      const promptData = event.detail;
      localStorage.removeItem('guidePrompt');
      
      if (promptData.isGeneratedReply && promptData.isStreaming) {
        const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
        createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
        setStreamingMessageId(aiMessageId);
        setShowConversation(true);
      } else if (promptData.isGeneratedReply && promptData.aiGeneratedReply) {
        const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
        createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
        handleGeneratedReply(promptData, aiMessageId);
        setShowConversation(true);
      } else {
        createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
        const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
        await generateAIResponse(promptData.content, aiMessageId, promptData.redditLink, promptData.contentType);
        setShowConversation(true);
      }
    };

    const handleRedditReplyStream = (event) => {
      const streamData = event.detail;
      if (streamData.isChunk) {
        handleStreamingChunk(streamData.content);
      } else if (streamData.isComplete) {
        handleStreamingComplete();
      }
    };

    const handleStorageChange = () => {
      const guidePrompt = localStorage.getItem('guidePrompt');
      if (guidePrompt) {
        const promptData = JSON.parse(guidePrompt);
        localStorage.removeItem('guidePrompt');
        
        if (promptData.isGeneratedReply) {
          if (promptData.isStreaming) {
            const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
            createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
            setStreamingMessageId(aiMessageId);
          } else if (promptData.aiGeneratedReply) {
            const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
            createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
            handleGeneratedReply(promptData, aiMessageId);
          }
        } else {
          createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
          const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
          generateAIResponse(promptData.content, aiMessageId, promptData.redditLink, promptData.contentType);
        }
        setShowConversation(true);
      }
    };

    handleStorageChange();
    window.addEventListener('redditReplyPrompt', handleRedditReplyPrompt);
    window.addEventListener('redditReplyStream', handleRedditReplyStream);
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('redditReplyPrompt', handleRedditReplyPrompt);
      window.removeEventListener('redditReplyStream', handleRedditReplyStream);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [createUserMessage, createAIMessage, generateAIResponse, handleGeneratedReply, handleStreamingChunk, handleStreamingComplete]);

  return (
    <div className="h-full flex flex-col">
      {!showConversation ? (
        // Landing page view
        <div className="flex-1 flex flex-col">
          {/* Spacer to push chat section down */}
          <div className="flex-grow"></div>
          
          {/* Centered Chat Section */}
          <div className="flex flex-col items-center justify-center px-8 py-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img src={cassiusLogo} alt="Cassius" className="w-16 h-16" />
              </div>
              <h1 className="text-4xl font-bold text-black mb-2">Cassius Intelligence</h1>
              <p className="text-xl text-gray-600 mb-2">Your AI Marketing Copilot</p>
              <p className="text-base text-gray-500">Ask me anything about your marketing strategy</p>
            </div>

            {/* Central Chat Interface */}
            <div className="w-full max-w-2xl">
              <ChatInterface
                conversation={[]}
                onSubmit={handleChatSubmit}
                placeholder="Ask Cassius anything..."
                className="border-2 border-gray-200 rounded-2xl shadow-lg bg-white"
                fixedBottomInput={false}
              />
            </div>
          </div>

          {/* Spacer to balance the layout */}
          <div className="flex-grow"></div>

          {/* Quick Access Links - Fixed at bottom */}
          <div className="flex-shrink-0 px-8 pb-12">
            <div className="w-full max-w-6xl mx-auto space-y-8">
              
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
          </div>
        </div>
      ) : (
        // Full conversation view
        <div className="flex-1 flex flex-col">
          {/* Header with back button */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowConversation(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                  <img src={cassiusLogo} alt="Cassius" className="w-8 h-8" />
                  <h2 className="text-lg font-semibold text-black">Cassius Intelligence</h2>
                </div>
              </div>
              <button
                onClick={handleClearConversation}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 9 0 0 0 15 6.708L21 16m0-4A9 9 0 0 0 6 5.292L3 8m18 13v-5m0 0h-5M3 3v5m0 0h5"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-gray-50 overflow-hidden">
            <ChatInterface
              conversation={conversation}
              onSubmit={handleChatSubmit}
              placeholder="Ask Cassius anything..."
              className="h-full"
              fixedBottomInput={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Strategy;