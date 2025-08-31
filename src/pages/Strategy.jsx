import React, { useState, useCallback, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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

function Strategy() {
  const [showConversation, setShowConversation] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  
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
      updateAIMessage(messageId, (prevMsg) => {
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
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
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
          <div className="w-full max-w-2xl mb-12">
            <ChatInterface
              conversation={[]}
              onSubmit={handleChatSubmit}
              placeholder="Ask Cassius anything..."
              className="border-2 border-gray-200 rounded-2xl shadow-lg bg-white"
              fixedBottomInput={false}
            />
          </div>

          {/* Quick Access Links */}
          <div className="w-full max-w-4xl">
            
            {/* Guide Card - Featured Row */}
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-sm">
                <NavLink
                  to={`/dashboard/${guideLink.path}`}
                  className="group block p-6 bg-blue-50 rounded-lg shadow-sm border-2 border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-900 group-hover:text-blue-700 mb-2">
                      {guideLink.name}
                    </div>
                    <div className="text-sm text-blue-700">
                      {guideLink.description}
                    </div>
                  </div>
                </NavLink>
              </div>
            </div>

            {/* Other Hub Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
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