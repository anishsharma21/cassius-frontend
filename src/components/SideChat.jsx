import React, { useState, useEffect, useRef } from 'react';
import rewindIcon from '../assets/rewind.svg';
import API_ENDPOINTS from '../config/api';

const SideChat = () => {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const conversationRef = useRef(null);

  // Listen for new Reddit post messages
  useEffect(() => {
    const handleStorageChange = () => {
      const newMessage = localStorage.getItem('newRedditMessage');
      if (newMessage) {
        const messageData = JSON.parse(newMessage);
        const userMessage = {
          type: 'user',
          content: `Hey Cassius, draft a response to this potential customer on Reddit. Here's their message: ${messageData.description}`,
          timestamp: new Date()
        };
        
        // Add user message to conversation
        setConversation(prev => {
          const newConversation = [...prev, userMessage];
          
          // Add AI response placeholder
          const aiMessage = {
            type: 'ai',
            content: '',
            timestamp: new Date(),
            isTyping: false
          };
          
          const finalConversation = [...newConversation, aiMessage];
          
          // Show loading dots for 3 seconds, then generate AI response
          setTimeout(async () => {
            const aiResponse = await generateAIResponse(messageData.description);
            const aiMessageIndex = finalConversation.length - 1;
            typeResponse(aiResponse, aiMessageIndex);
          }, 3000);
          
          return finalConversation;
        });
        
        // Clear the message from localStorage
        localStorage.removeItem('newRedditMessage');
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

  // Typewriter effect for AI responses
  const typeResponse = (responseText, messageIndex) => {
    setIsTyping(true);
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < responseText.length) {
        setConversation(prev => {
          const newConversation = [...prev];
          newConversation[messageIndex] = {
            ...newConversation[messageIndex],
            content: responseText.substring(0, index + 1),
            isTyping: true
          };
          return newConversation;
        });
        index++;
      } else {
        setConversation(prev => {
          const newConversation = [...prev];
          newConversation[messageIndex] = {
            ...newConversation[messageIndex],
            isTyping: false
          };
          return newConversation;
        });
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 3); // Typing speed (lower = faster)
    return () => clearInterval(typeInterval);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      const userMessage = {
        type: 'user',
        content: prompt,
        timestamp: new Date()
      };
      
      // Add user message to conversation
      setConversation(prev => {
        const newConversation = [...prev, userMessage];
        
        // Add AI response placeholder
        const aiMessage = {
          type: 'ai',
          content: '',
          timestamp: new Date(),
          isTyping: false
        };
        
        const finalConversation = [...newConversation, aiMessage];
        
        // Generate AI response after a short delay
        setTimeout(async () => {
          const aiResponse = await generateAIResponse(prompt);
          const aiMessageIndex = finalConversation.length - 1;
          typeResponse(aiResponse, aiMessageIndex);
        }, 500);
        
        return finalConversation;
      });
      
      setPrompt('');
    }
  };

  // Generate AI response from API
  const generateAIResponse = async (userPrompt) => {
    try {
      // Build chat context from conversation history
      const chatContext = conversation.map(msg => {
        if (msg.type === 'user') {
          return `User: ${msg.content}`;
        } else {
          return `LLM: ${msg.content}`;
        }
      }).join('\n');

      const requestBody = {
        context: chatContext,
        message: userPrompt
      };

      const response = await fetch(API_ENDPOINTS.chatMessage, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.text();
      // Remove quotes if they exist at the beginning and end
      let cleanData = data;
      if (cleanData.startsWith('"') && cleanData.endsWith('"')) {
        cleanData = cleanData.slice(1, -1);
      } else if (cleanData.startsWith("'") && cleanData.endsWith("'")) {
        cleanData = cleanData.slice(1, -1);
      }
      return cleanData;
    } catch (error) {
      console.error('Error calling chat API:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
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
         <h3 className="text-sm text-black font-semibold">New chat</h3>
         <div className="relative">
           <button className="cursor-pointer"
             onMouseEnter={() => setShowClearTooltip(true)}
             onMouseLeave={() => setShowClearTooltip(false)}
             onClick={clearChat}
           >
             <img src={rewindIcon} alt="Rewind" className="w-4 h-4" />
           </button>
           
           {/* Clear Chat Tooltip */}
           {showClearTooltip && (
             <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
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
         {conversation.map((message, index) => (
           <div key={index} className="mb-4">
             {message.type === 'user' ? (
               // User message bubble
               <div className="flex justify-end">
                 <div className="rounded-lg bg-gray-200 p-2 max-w-[85%]">
                   <p className="text-sm text-black">{message.content}</p>
                 </div>
               </div>
             ) : (
               // AI message bubble
               <div className="flex justify-start">
                 <div className="rounded-lg bg-white w-full">
                   <div className="text-sm text-black leading-relaxed font-sans">
                     {message.content && renderFormattedText(message.content)}
                     {message.isTyping && <span className="animate-pulse">|</span>}
                     {!message.content && !message.isTyping && (
                       <div className="flex space-x-1">
                         <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                         <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          <form onSubmit={handleSubmit} className="h-full text-sm text-black pr-12 pl-3 pt-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Cassius"
              className="w-full outline-none bg-transparent resize-none h-full overflow-y-auto"
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
              className="absolute bottom-2 right-2 bg-black cursor-pointer text-white rounded-lg flex items-center justify-center"
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
