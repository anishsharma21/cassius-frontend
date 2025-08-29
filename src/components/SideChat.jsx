import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';
import { handleUnauthorizedResponse } from '../utils/auth';

const SideChat = () => {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // true = streaming to blog editor, false = streaming to SideChat
  const [streamLocation, setStreamLocation] = useState('SIDE_CHAT'); // Controls content routing
  const [streamingMessageId, setStreamingMessageId] = useState(null); // ID of the message being streamed
  
  // Use ref to track streamLocation synchronously for content routing
  const streamLocationRef = useRef('SIDE_CHAT');
  
  const conversationRef = useRef(null);
  const queryClient = useQueryClient();
  const messageIdCounter = useRef(0);
  const navigate = useNavigate();

  // Keep ref in sync with state
  useEffect(() => {
    streamLocationRef.current = streamLocation;
    console.log('streamLocation state changed to:', streamLocation);
    console.log('streamLocationRef.current updated to:', streamLocationRef.current);
  }, [streamLocation]);




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
      if (isStreaming) {
        setIsStreaming(false);
        setStreamLocation('SIDE_CHAT');
        streamLocationRef.current = 'SIDE_CHAT';
        console.log('✅ Cleaned up streaming state on unmount');
      }
    };
  }, [isStreaming]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      const userMessage = {
        id: `user_${Date.now()}_${++messageIdCounter.current}`,
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
  const generateAIResponse = useCallback(async (userPrompt, redditLink = null, contentType = null) => {
    // Create AI message placeholder early so it's available in catch block
    const aiMessageId = `ai_${Date.now()}_${++messageIdCounter.current}`;
    const aiMessage = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      redditLink: redditLink,
      contentType: contentType
    };
    
    console.log('🤖 Creating AI message with Reddit context:', { redditLink, contentType });
    
    // Add AI message to conversation
    setConversation(prev => [...prev, aiMessage]);
    
    try {
      // Build chat history from conversation (last 6 messages)
      // Get current conversation state to ensure it's up-to-date after clearChat
      const currentConversation = conversation;
      const chatHistory = currentConversation
        .slice(-6)
        .map(msg => {
          if (msg.type === 'user') {
            return `User: ${msg.content}`;
          } else {
            return `Cassius: ${msg.content}`;
          }
        })
        .join('\n');

      console.log('📚 Building chat history:', {
        totalMessages: currentConversation.length,
        chatHistory: chatHistory || 'No chat history',
        timestamp: new Date().toISOString()
      });

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
      
      if (response.status === 401) {
        handleUnauthorizedResponse(queryClient);
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
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
                  // Handle special backend messages
                  if (data.content.startsWith('---CACHE_BLOG_POST:')) {
                    // Step 1: Cache the blog post
                    const match = data.content.match(/---CACHE_BLOG_POST:(.+)---/);
                    if (match) {
                      const [id, slug, title] = match[1].split(':');
                      console.log('📋 Caching blog post:', { id, slug, title });
                      
                      // Create temporary blog post object
                      const tempBlogPost = {
                        id,
                        slug,
                        title: title || 'Untitled Blog Post',
                        content: '',
                        company_id: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      };
                      
                      // Cache in React Query
                      queryClient.setQueryData(['blogPost', slug], tempBlogPost);
                      console.log('✅ Blog post cached successfully');
                    }
                  } else if (data.content.startsWith('---REDIRECT_BLOG_POST_EDITOR:')) {
                    // Step 2: Redirect to blog post editor
                    const match = data.content.match(/---REDIRECT_BLOG_POST_EDITOR:(.+)---/);
                    if (match) {
                      const slug = match[1];
                      console.log('🔄 Redirecting to blog post editor:', slug);
                      
                      // Navigate to editor
                      navigate(`/dashboard/geo/${slug}`);
                      console.log('✅ Redirected to blog post editor');
                    }
                  } else if (data.content.startsWith('---LOAD_STREAM_BLOG_POST_EDITOR:')) {
                    // Step 3: Switch stream to blog post editor
                    const match = data.content.match(/---LOAD_STREAM_BLOG_POST_EDITOR:(.+)---/);
                    if (match) {
                      const slug = match[1];
                      console.log('🎯 Switching stream to blog post editor:', slug);
                      
                      // Set streamLocation to route content to blog editor
                      setStreamLocation(`BLOG_POST:${slug}`);
                      console.log('✅ Stream switched to blog post editor');
                    }
                  } else if (data.content.startsWith('---STREAM_START---')) {
                    // Step 4: Streaming has begun - set isStreaming to true
                    console.log('🚀 Streaming started');
                    
                    // Set isStreaming to true to show streaming state
                    setIsStreaming(true);
                    
                    // Change "Thinking..." to "Generating blog content..." with flashing effect
                    setConversation(prev => 
                      prev.map(msg => 
                        msg.id === aiMessageId
                          ? { ...msg, isStreaming: true, content: 'Generating blog content' }
                          : msg
                      )
                    );
                  } else if (data.content.startsWith('---STREAM_END---')) {
                    // Step 5: Streaming has stopped
                    console.log('🛑 Streaming ended');
                    
                    // Hide streaming state
                    setIsStreaming(false);
                    
                    // Replace "Generating blog content" with success message on the same line
                    setConversation(prev => 
                      prev.map(msg => 
                        msg.id === aiMessageId
                          ? { ...msg, isStreaming: false, content: 'Successfully created a new blog post!' }
                          : msg
                      )
                    );
                    
                    console.log('✅ Stream ended and success message displayed');
                  } else if (data.content.startsWith('---LOAD_STREAM_SIDE_CHAT---')) {
                    // Step 6: Confirm stream back to SideChat - reset streamLocation
                    console.log('🔄 Confirming stream back to SideChat');
                    
                    // Reset streamLocation to stop content routing
                    setStreamLocation('SIDE_CHAT');
                    console.log('✅ Stream reset to SideChat');
                  } else {
                    // Regular content - route based on streamLocationRef.current (synchronous)
                    let shouldAddToChat = true;
                    
                    console.log('🎯 Processing content chunk:', {
                      content: data.content.substring(0, 50) + '...',
                      streamLocation: streamLocationRef.current,
                      streamLocationState: streamLocation,
                      isStreaming,
                      timestamp: new Date().toISOString()
                    });
                    
                    if (streamLocationRef.current.startsWith('BLOG_POST:')) {
                      // Route content to blog post editor
                      const blogPostSlug = streamLocationRef.current.split(':')[1];
                      console.log('📝 Streaming content to blog post editor:', blogPostSlug);
                      
                      // Get existing content and append new content
                      const existingContent = localStorage.getItem(`blogPostContent_${blogPostSlug}`) || '';
                      const newContent = existingContent + data.content;
                      
                      // Store in localStorage for blog editor to read
                      localStorage.setItem(`blogPostContent_${blogPostSlug}`, newContent);
                      console.log('📊 Content length:', newContent.length);
                      
                      // Don't add to chat conversation
                      shouldAddToChat = false;
                      console.log('🚫 Content forwarded to blog editor only');
                    } else {
                      console.log('💬 Content will go to SideChat');
                    }
                    
                    // Add to chat if not routed to blog editor
                    if (shouldAddToChat) {
                      fullResponse += data.content;
                      console.log('💬 Content added to chat conversation');
                      
                      // Update the AI message content in real-time
                      setConversation(prev => 
                        prev.map(msg => 
                          msg.id === aiMessageId
                            ? { ...msg, content: fullResponse }
                            : msg
                        )
                      );
                    }
                    
                    // Log routing decision
                    console.log('🎯 Content routing decision:', {
                      content: data.content.substring(0, 50) + '...',
                      shouldAddToChat,
                      destination: shouldAddToChat ? 'SideChat' : 'BlogEditor',
                      streamLocation: streamLocationRef.current,
                      streamLocationState: streamLocation,
                      isStreaming,
                      timestamp: new Date().toISOString()
                    });
                  }
                  
                } else if (data.type === 'complete') {
                  // Stream is complete - handle completion
                  console.log('🎯 Stream completion signal received (data.type === "complete")');
                  console.log('🔄 Current streaming state:', { isStreaming, streamLocation });
                  
                  // Reset streaming state
                  if (isStreaming) {
                    setIsStreaming(false);
                    console.log('✅ Reset isStreaming to false');
                  }
                  
                  // Break out of the loop since stream is complete
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.content);
                }
              } catch {
                // If JSON parsing fails, treat the line as plain text
                const content = line.slice(6);
                if (content && content !== '{"content": "", "type": "complete"}') {
                  // Regular content, add to response
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
  }, [queryClient, isStreaming, streamLocation, conversation]);

  // Define functions using useCallback to avoid dependency issues
  const handleGuidePrompt = useCallback(async (content, redditLink = null, contentType = null) => {
    console.log('📝 Creating user message with Reddit info:', { content, redditLink, contentType });
    const userMessage = {
      id: `user_${Date.now()}_${++messageIdCounter.current}`,
      type: 'user',
      content: content,
      timestamp: new Date(),
      redditLink: redditLink,
      contentType: contentType
    };
    
    console.log('👤 User message created:', userMessage);
    
    // Add user message to conversation
    setConversation(prev => [...prev, userMessage]);
    
    // Generate AI response
    await generateAIResponse(content, redditLink, contentType);
  }, [generateAIResponse]);

  const handleGeneratedReply = useCallback(async (promptData) => {
    console.log('🎯 Handling generated reply:', promptData);
    
    // Create user message
    const userMessage = {
      id: `user_${Date.now()}_${++messageIdCounter.current}`,
      type: 'user',
      content: promptData.content,
      timestamp: new Date(),
      redditLink: promptData.redditLink,
      contentType: promptData.contentType
    };
    
    // Add user message to conversation
    setConversation(prev => [...prev, userMessage]);
    
    // Create AI message with the pre-generated reply and prefix
    const aiMessage = {
      id: `ai_${Date.now()}_${++messageIdCounter.current}`,
      type: 'ai',
      content: `GENERATED REDDIT REPLY:\n\n${promptData.aiGeneratedReply}`,
      displayContent: promptData.aiGeneratedReply, // Display content without prefix
      timestamp: new Date(),
      isStreaming: false,
      redditLink: promptData.redditLink,
      contentType: promptData.contentType
    };
    
    // Add AI message to conversation
    setConversation(prev => [...prev, aiMessage]);
    
    console.log('✅ AI-generated reply added to conversation');
  }, []);

  const handleStreamingReply = useCallback(async (promptData) => {
    console.log('🎯 Starting streaming reply:', promptData);
    
    // Create user message for Reddit reply (this will be displayed in chat history)
    const userMessage = {
      id: `user_${Date.now()}_${++messageIdCounter.current}`,
      type: 'user',
      content: promptData.content,
      timestamp: new Date(),
      redditLink: promptData.redditLink,
      contentType: promptData.contentType
    };
    
    // Add user message to conversation
    setConversation(prev => [...prev, userMessage]);
    
    // Create AI message placeholder for streaming
    const aiMessageId = `ai_${Date.now()}_${++messageIdCounter.current}`;
    const aiMessage = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      displayContent: '', // Initialize display content separately
      timestamp: new Date(),
      isStreaming: true,
      redditLink: promptData.redditLink,
      contentType: promptData.contentType
    };
    
    // Add AI message to conversation
    setConversation(prev => [...prev, aiMessage]);
    
    // Store the AI message ID for streaming updates
    setStreamingMessageId(aiMessageId);
    
    console.log('✅ Streaming reply started, AI message ID:', aiMessageId);
  }, []);

  const handleStreamingChunk = useCallback((chunkContent) => {
    console.log('📝 Handling streaming chunk:', chunkContent.substring(0, 50) + '...');
    
    if (streamingMessageId) {
      setConversation(prev => 
        prev.map(msg => 
          msg.id === streamingMessageId
            ? { 
                ...msg, 
                content: (() => {
                  // If this is the first chunk, add the prefix
                  if (!msg.content) {
                    return `GENERATED REDDIT REPLY:\n\n${chunkContent}`;
                  }
                  // Otherwise, just append the chunk
                  return msg.content + chunkContent;
                })(),
                // Store the prefix separately for display purposes
                displayContent: (() => {
                  // If this is the first chunk, don't show the prefix
                  if (!msg.content) {
                    return chunkContent;
                  }
                  // Otherwise, just append the chunk
                  return (msg.displayContent || '') + chunkContent;
                })()
              }
            : msg
        )
      );
    }
  }, [streamingMessageId]);

  const handleStreamingComplete = useCallback(() => {
    console.log('✅ Streaming complete');
    
    if (streamingMessageId) {
      setConversation(prev => 
        prev.map(msg => 
          msg.id === streamingMessageId
            ? { 
                ...msg, 
                isStreaming: false
              }
            : msg
        )
      );
      
      // Clear the streaming message ID
      setStreamingMessageId(null);
    }
  }, [streamingMessageId]);

  // Listen for new Reddit post messages and guide prompts
  useEffect(() => {
    const handleRedditReplyPrompt = async (event) => {
      console.log('🔴 Reddit reply prompt received:', event.detail);
      const promptData = event.detail;
      // Clear the guide prompt from localStorage
      localStorage.removeItem('guidePrompt');
      
      if (promptData.isGeneratedReply && promptData.isStreaming) {
        // Handle streaming reply - start the streaming process
        await handleStreamingReply(promptData);
      } else if (promptData.isGeneratedReply && promptData.aiGeneratedReply) {
        // Handle generated reply - display the AI-generated reply directly
        await handleGeneratedReply(promptData);
      } else {
        // Handle regular guide prompt - generate AI response
        handleGuidePrompt(promptData.content, promptData.redditLink, promptData.contentType);
      }
    };

    const handleRedditReplyStream = (event) => {
      console.log('🌊 Reddit reply stream received:', event.detail);
      const streamData = event.detail;
      
      if (streamData.isChunk) {
        // Handle streaming chunk - append to current AI message
        handleStreamingChunk(streamData.content);
      } else if (streamData.isComplete) {
        // Handle streaming completion
        handleStreamingComplete();
      }
    };

    const handleStorageChange = () => {
      // Check for guide prompts
      const guidePrompt = localStorage.getItem('guidePrompt');
      if (guidePrompt) {
        console.log('📦 Guide prompt from localStorage:', guidePrompt);
        const promptData = JSON.parse(guidePrompt);
        // Clear the guide prompt from localStorage
        localStorage.removeItem('guidePrompt');
        
        // Check if this is a generated reply or a regular guide prompt
        if (promptData.isGeneratedReply) {
          // Handle Reddit reply - don't call chat API
          if (promptData.isStreaming) {
            // Handle streaming reply - start the streaming process
            handleStreamingReply(promptData);
          } else if (promptData.aiGeneratedReply) {
            // Handle generated reply - display the AI-generated reply directly
            handleGeneratedReply(promptData);
          }
        } else {
          // Handle regular guide prompt - generate AI response
          handleGuidePrompt(promptData.content, promptData.redditLink, promptData.contentType);
        }
      }
    };

    // Check for existing messages on mount
    handleStorageChange();

    // Listen for custom Reddit reply events (instant)
    window.addEventListener('redditReplyPrompt', handleRedditReplyPrompt);
    
    // Listen for Reddit reply streaming events
    window.addEventListener('redditReplyStream', handleRedditReplyStream);
    
    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for new messages
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('redditReplyPrompt', handleRedditReplyPrompt);
      window.removeEventListener('redditReplyStream', handleRedditReplyStream);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [handleGuidePrompt, handleGeneratedReply, handleStreamingReply, handleStreamingChunk, handleStreamingComplete]);

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
    setConversation([]);
    setIsStreaming(false);
    setStreamLocation('SIDE_CHAT');
    streamLocationRef.current = 'SIDE_CHAT';
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
