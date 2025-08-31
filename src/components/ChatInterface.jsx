import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({ 
  conversation, 
  onSubmit, 
  placeholder = "Ask Cassius", 
  className = "",
  showHeader = false,
  headerTitle = "Chat with Cassius Intelligence",
  onClear = null,
  height = "auto",
  fixedBottomInput = false,
  inputHeight = "h-16" // New prop for customizing input height
}) => {
  const [prompt, setPrompt] = useState('');
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const conversationRef = useRef(null);

  // Calculate bottom offset for conversation area based on input height
  const getBottomOffset = () => {
    const heightMap = {
      'h-16': '88px', // 64px + 24px (py-3)
      'h-20': '104px', // 80px + 24px (py-3)
      'h-24': '120px', // 96px + 24px (py-3)
      'h-28': '136px', // 112px + 24px (py-3)
    };
    return heightMap[inputHeight] || '88px'; // default to h-16 equivalent
  };

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      const trimmedPrompt = prompt.trim();
      setPrompt(''); // Clear immediately
      await onSubmit(trimmedPrompt);
    }
  };

  // Function to render text with Markdown formatting
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    const normalizedText = text
      .replace(/\\n/g, '\n')
      .replace(/\\\d+\\/g, (match) => {
        return match.replace(/\\/g, '');
      });
    
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>
          {normalizedText}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`${fixedBottomInput ? 'relative h-full' : 'flex flex-col h-full'} ${className}`}>
      {/* Header - Optional */}
      {showHeader && (
        <div className={`flex justify-between -mt-1 items-center p-4 ${fixedBottomInput ? 'absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200' : ''}`}>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-black">{headerTitle}</h3>
          </div>
          {onClear && (
            <div className="relative">
              <button 
                className="cursor-pointer"
                onMouseEnter={() => setShowClearTooltip(true)}
                onMouseLeave={() => setShowClearTooltip(false)}
                onClick={onClear}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 9 0 0 0 15 6.708L21 16m0-4A9 9 0 0 0 6 5.292L3 8m18 13v-5m0 0h-5M3 3v5m0 0h5"/>
                </svg>
              </button>
              
              {showClearTooltip && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  Clear chat
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Conversation Area - Always render for layout */}
      <div
        className={`overflow-y-auto ${
          fixedBottomInput 
            ? `absolute ${showHeader ? 'top-16' : 'top-0'} left-0 right-0 px-4 py-4` 
            : `flex-1 min-h-0 ${conversation.length > 0 ? 'px-4 py-4' : ''}`
        }`}
        style={{ 
          height: height !== "auto" && !fixedBottomInput ? height : undefined,
          bottom: fixedBottomInput ? getBottomOffset() : undefined
        }}
        ref={conversationRef}
      >
        {conversation.length > 0 && (
          conversation.map((message) => (
            <div key={message.id} className="mb-4">
              {message.type === 'user' ? (
                // User message bubble
                <div className="flex justify-end">
                  <div className="rounded-lg bg-gray-200 p-4 max-w-[85%]">
                    <p className="text-base font-normal text-black">{message.content}</p>
                  </div>
                </div>
              ) : (
                // AI message bubble
                <div className="flex justify-start">
                  <div className={`rounded-lg w-full ${message.isStreaming && (!message.content || message.content === 'Thinking' || message.content === 'Generating blog content') ? 'p-0' : 'bg-white p-4'}`}>
                    <div className="text-base font-normal text-black leading-relaxed font-sans">
                      {message.isStreaming && (!message.content || message.content === 'Thinking' || message.content === 'Generating blog content') ? (
                        // Show streaming message with shining effect (no background)
                        <div className="relative overflow-hidden">
                          <span className="text-gray-600 font-medium">
                            {message.content || 'Thinking'}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine"></div>
                        </div>
                      ) : (
                        // Show regular content (with background)
                        (message.displayContent || message.content) && (
                          <div className="markdown-content">
                            {renderFormattedText(message.displayContent || message.content)}
                            
                            {/* Show "Copy and go to Reddit" button for Reddit reply messages */}
                            {message.type === 'ai' && !message.isStreaming && message.redditLink && message.contentType && (
                              <div className="mt-3">
                                <button
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(message.content);
                                      window.open(message.redditLink, '_blank');
                                    } catch (error) {
                                      console.error('Failed to copy to clipboard:', error);
                                      window.open(message.redditLink, '_blank');
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 1024 1024">
                                    <path d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64h64z"/>
                                    <path d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64H384zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64z"/>
                                  </svg>
                                  Copy & go to Reddit
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chat Input Box */}
      <div className={`${fixedBottomInput ? 'absolute bottom-0 left-0 right-0 bg-gray-50 z-20' : 'flex-shrink-0'} px-3 py-3`}>
        <div className={`relative ${inputHeight} border bg-gray-100 border-gray-200 rounded-lg focus-within:border-black focus-within:border`}>
          <form onSubmit={handleSubmit} className="h-full text-base font-normal text-black pr-12 pl-3 pt-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="w-full outline-none bg-transparent resize-none h-full overflow-y-auto text-base font-normal text-black placeholder-gray-500 focus:border-gray-400"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              className="absolute bottom-2 right-2 bg-black cursor-pointer text-white rounded-md flex items-center justify-center"
              style={{ width: '25px', height: '25px' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;