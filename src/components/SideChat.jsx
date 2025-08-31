import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import useChatConversation from '../hooks/useChatConversation';
import useChatAPI from '../hooks/useChatAPI';

const SideChat = () => {
  const [prompt, setPrompt] = useState('');
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  
  const conversationRef = useRef(null);
  
  // Use the shared conversation hooks
  const {
    conversation,
    createUserMessage,
    createAIMessage,
    clearConversation
  } = useChatConversation();

  const {
    generateAIResponse,
    resetStreamingState
  } = useChatAPI();





  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  // Log conversation changes for debugging
  useEffect(() => {
    console.log('🔄 Conversation updated:', {
      totalMessages: conversation.length,
      messages: conversation.map(msg => ({ id: msg.id, type: msg.type, content: msg.content.substring(0, 50) + '...' })),
      lastMessage: conversation[conversation.length - 1] ? {
        id: conversation[conversation.length - 1].id,
        type: conversation[conversation.length - 1].type,
        content: conversation[conversation.length - 1].content.substring(0, 100) + '...'
      } : null,
      timestamp: new Date().toISOString()
    });
  }, [conversation]);

  // Cleanup streaming state when component unmounts
  useEffect(() => {
    // Reset streaming state when component unmounts
    return () => {
      resetStreamingState();
      console.log('✅ Cleaned up streaming state on unmount');
    };
  }, [resetStreamingState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Create user message
      createUserMessage(prompt);
      
      // Create AI message placeholder
      const aiMessageId = createAIMessage();
      
      // Clear the prompt immediately after adding to conversation
      setPrompt('');
      
      // Generate AI response
      await generateAIResponse(prompt, aiMessageId);
    }
  };




  // Function to render text with Markdown formatting using react-markdown
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // Normalize the text to handle escaped newlines and other formatting
    const normalizedText = text
      .replace(/\\n/g, '\n')  // Convert \n to actual newlines
      .replace(/\\\d+\\/g, (match) => {
        // Convert \1\, \6\ etc. to just the number
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

  // Clear chat function
  const clearChat = () => {
    clearConversation();
    resetStreamingState();
    console.log('🧹 Chat history cleared - conversation, streaming states, and context reset');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between -mt-1 items-center p-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-medium text-black">Chat with Cassius Intelligence</h3>
        </div>
        <div className="relative">
          <button className="cursor-pointer"
            onMouseEnter={() => setShowClearTooltip(true)}
            onMouseLeave={() => setShowClearTooltip(false)}
            onClick={clearChat}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 0 0 15 6.708L21 16m0-4A9 9 0 0 0 6 5.292L3 8m18 13v-5m0 0h-5M3 3v5m0 0h5"/></svg>
          </button>
          
          {/* Clear Chat Tooltip */}
          {showClearTooltip && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              Clear chat
            </div>
          )}
        </div>
      </div>

      {/* Conversation Area */}
      <div
        className="px-4 py-4 overflow-y-auto"
        style={{ height: '760px' }}
        ref={conversationRef}
      >
        {conversation.map((message) => (
          <div key={message.id} className="mb-4">
            {message.type === 'user' ? (
              // User message bubble
              <div className="flex justify-end">
                <div className="rounded-lg bg-gray-200 p-2 max-w-[85%]">
                  <p className="text-base font-normal text-black">{message.content}</p>
                </div>
              </div>
            ) : (
              // AI message bubble
              <div className="flex justify-start">
                <div className="rounded-lg bg-white w-full">
                  <div className="text-base font-normal text-black leading-relaxed font-sans">
                    {message.isStreaming && (!message.content || message.content === 'Thinking' || message.content === 'Generating blog content') ? (
                      // Show streaming message with shining effect (only for placeholder messages)
                      <div className="relative overflow-hidden">
                        <span className="text-gray-600 font-medium">
                          {message.content || 'Thinking'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine"></div>
                      </div>
                    ) : (
                      // Show regular content (including streaming content that's not placeholder text)
                      (message.displayContent || message.content) && (
                        <div className="markdown-content">
                          {renderFormattedText(message.displayContent || message.content)}
                          
                          {/* Show "Copy and go to Reddit" button for Reddit reply messages after AI response */}
                          {message.type === 'ai' && !message.isStreaming && message.redditLink && message.contentType && (
                            <div className="mt-3">
                              <button
                                onClick={async () => {
                                  try {
                                    // Copy the full content (including prefix) for clipboard
                                    await navigator.clipboard.writeText(message.content);
                                    console.log('✅ Response copied to clipboard');
                                    // Open Reddit link after copying
                                    window.open(message.redditLink, '_blank');
                                  } catch (error) {
                                    console.error('❌ Failed to copy to clipboard:', error);
                                    // Still open Reddit link even if copying fails
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
        )        )}
        


      </div>

      {/* Chat Prompt Box */}
      <div className="mt-auto px-3 py-3">
        <div className="relative h-26 border bg-gray-100 border-gray-200 rounded-lg focus-within:border-black focus-within:border">
          <form onSubmit={handleSubmit} className="h-full text-base font-normal text-black pr-12 pl-3 pt-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Cassius"
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

export default SideChat;
