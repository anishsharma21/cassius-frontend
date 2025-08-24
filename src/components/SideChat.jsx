import React, { useState, useEffect, useRef } from 'react';
import rewindIcon from '../assets/rewind.svg';
import API_ENDPOINTS from '../config/api';

const SideChat = () => {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const conversationRef = useRef(null);

  // Listen for new Reddit post messages and guide prompts
  useEffect(() => {
    const handleStorageChange = () => {
      // Check for guide prompts
      const guidePrompt = localStorage.getItem('guidePrompt');
      if (guidePrompt) {
        const promptData = JSON.parse(guidePrompt);
        // Clear the guide prompt from localStorage
        localStorage.removeItem('guidePrompt');
        
        // Immediately submit the guide prompt without populating input
        handleGuidePrompt(promptData.content);
      }
    };

    // Check for existing messages on mount
    handleStorageChange();

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for new messages
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  // Handle guide prompt submission
  const handleGuidePrompt = async (content) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content,
      timestamp: new Date()
    };
    
    // Add user message to conversation
    setConversation(prev => [...prev, userMessage]);
    
    // Generate AI response
    await generateAIResponse(content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: prompt,
        timestamp: new Date()
      };
      
      // Add user message to conversation
      setConversation(prev => [...prev, userMessage]);
      
      // Clear the prompt immediately after adding to conversation
      setPrompt('');
      
      // Generate AI response
      await generateAIResponse(prompt);
    }
  };

  // Generate AI response from API with streaming
  const generateAIResponse = async (userPrompt) => {
    try {
      // Build chat history from conversation (last 6 messages)
      const chatHistory = conversation
        .slice(-6)
        .map(msg => {
          if (msg.type === 'user') {
            return `User: ${msg.content}`;
          } else {
            return `Cassius: ${msg.content}`;
          }
        })
        .join('\n');

      const requestBody = {
        message: userPrompt,
        chat_history: chatHistory
      };

      const response = await fetch(API_ENDPOINTS.chatMessage, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Create AI message placeholder
      const aiMessageId = Date.now();
      const aiMessage = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };
      
      // Add AI message to conversation
      setConversation(prev => [...prev, aiMessage]);
      
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
                
                if (data.type === 'chunk' && data.content) {
                  // Add to full response
                  fullResponse += data.content;
                  
                  // Update the AI message content in real-time
                  setConversation(prev => 
                    prev.map(msg => 
                      msg.id === aiMessageId
                        ? { ...msg, content: fullResponse }
                        : msg
                    )
                  );
                  
                } else if (data.type === 'complete') {
                  // Stream is complete
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.content);
                }
              } catch (parseError) {
                // If JSON parsing fails, treat the line as plain text
                const content = line.slice(6);
                if (content && content !== '{"content": "", "type": "complete"}') {
                  fullResponse += content;
                  
                  // Update the AI message content
                  setConversation(prev => 
                    prev.map(msg => 
                      msg.id === aiMessageId
                        ? { ...msg, content: fullResponse }
                        : msg
                    )
                  );
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Finalize the streaming message
      setConversation(prev => 
        prev.map(msg => 
          msg.id === aiMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Error calling chat API:', error);
      
      // Update the AI message with error
      setConversation(prev => 
        prev.map(msg => 
          msg.id === aiMessageId
            ? { ...msg, content: 'Sorry, I encountered an error while processing your request. Please try again.', isStreaming: false }
            : msg
        )
      );
    }
  };

  // Function to render text with formatting
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // First, normalize the text to handle escaped newlines and other formatting
    let normalizedText = text
      .replace(/\\n/g, '\n')  // Convert \n to actual newlines
      .replace(/\\\d+\\/g, (match) => {
        // Convert \1\, \6\ etc. to just the number
        return match.replace(/\\/g, '');
      });
    
    // Split by newlines and process each line
    const lines = normalizedText.split('\n');
    return lines.map((line, lineIndex) => {
      // Handle bold text (**text**) and quoted text (\"text\")
      const boldRegex = /\*\*(.*?)\*\*/g;
      const quotedRegex = /\\"(.*?)\\"/g;
      let boldMatches = [];
      let quotedMatches = [];
      let match;
      
      // Find all bold matches
      while ((match = boldRegex.exec(line)) !== null) {
        boldMatches.push({
          text: match[1],
          start: match.index,
          end: match.index + match[0].length,
          type: 'bold'
        });
      }
      
      // Find all quoted matches
      while ((match = quotedRegex.exec(line)) !== null) {
        quotedMatches.push({
          text: match[1],
          start: match.index,
          end: match.index + match[0].length,
          type: 'quoted'
        });
      }
      
      // Combine and sort all matches by position
      const allMatches = [...boldMatches, ...quotedMatches].sort((a, b) => a.start - b.start);
      
      if (allMatches.length > 0) {
        const parts = [];
        let lastIndex = 0;
        
        allMatches.forEach((formatMatch, index) => {
          // Add text before formatted section
          if (formatMatch.start > lastIndex) {
            parts.push(line.substring(lastIndex, formatMatch.start));
          }
          
          // Add formatted text
          if (formatMatch.type === 'bold') {
            parts.push(
              <strong key={`format-${lineIndex}-${index}`} className="font-semibold">
                {formatMatch.text}
              </strong>
            );
          } else if (formatMatch.type === 'quoted') {
            parts.push(
              <em key={`format-${lineIndex}-${index}`} className="italic">
                "{formatMatch.text}"
              </em>
            );
          }
          
          lastIndex = formatMatch.end;
        });
        
        // Add remaining text after last formatted section
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }
        
        return (
          <React.Fragment key={lineIndex}>
            {parts}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      return (
        <React.Fragment key={lineIndex}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  // Clear chat function
  const clearChat = () => {
    setConversation([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between -mt-1 items-center p-4">
        <h3 className="text-base font-normal text-black">Chat</h3>
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
            <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-base font-normal px-2 py-1 rounded whitespace-nowrap z-10">
              Clear Chat
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
                    {message.content && renderFormattedText(message.content)}
                    {!message.content && message.isStreaming && (
                      <div className="relative overflow-hidden">
                        <span className="text-gray-600 font-medium">Thinking</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Prompt Box */}
      <div className="mt-auto px-3 py-3">
        <div className="relative h-26 border bg-gray-100 border-gray-200 rounded-lg">
          <form onSubmit={handleSubmit} className="h-full text-base font-normal text-black pr-12 pl-3 pt-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Cassius"
              className="w-full outline-none bg-transparent resize-none h-full overflow-y-auto text-base font-normal text-black placeholder-gray-500"
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
