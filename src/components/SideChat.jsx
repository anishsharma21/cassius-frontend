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
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [generatingBlogSlug, setGeneratingBlogSlug] = useState(null);
  const conversationRef = useRef(null);
  const queryClient = useQueryClient();
  const messageIdCounter = useRef(0);
  const navigate = useNavigate();



  // Listen for new Reddit post messages and guide prompts
  useEffect(() => {
    const handleGuidePrompt = async (content) => {
      const userMessage = {
        id: `user_${Date.now()}_${++messageIdCounter.current}`,
        type: 'user',
        content: content,
        timestamp: new Date()
      };
      
      // Add user message to conversation
      setConversation(prev => [...prev, userMessage]);
      
      // Generate AI response
      await generateAIResponse(content);
    };

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

  // Cleanup generating blog state when component unmounts or when streaming stops
  useEffect(() => {
    const handleStorageChange = () => {
      // Check if streaming has stopped for any blog post
      const streamingBlogPost = localStorage.getItem('streamingBlogPost');
      if (!streamingBlogPost && isGeneratingBlog) {
        console.log('✅ Streaming stopped, cleaning up "Generating blog content" state and adding success message');
        
        // Add success message to the conversation when streaming stops
        const successMessage = {
          id: `success_${Date.now()}_${++messageIdCounter.current}`,
          type: 'ai',
          content: 'Successfully created a new blog post!',
          timestamp: new Date(),
          isStreaming: false
        };
        
        setConversation(prev => {
          const newConversation = [...prev, successMessage];
          console.log('✅ Success message added to conversation via cleanup:', {
            messageId: successMessage.id,
            messageContent: successMessage.content,
            conversationLength: newConversation.length,
            timestamp: successMessage.timestamp,
            allMessages: newConversation.map(msg => ({ id: msg.id, type: msg.type, content: msg.content }))
          });
          return newConversation;
        });
        
        setIsGeneratingBlog(false);
        setGeneratingBlogSlug(null);
        console.log('✅ Cleaned up "Generating blog content" state - no active streaming');
      }
      
      // Also check if the current generating blog post is still streaming
      if (isGeneratingBlog && generatingBlogSlug) {
        const currentStreaming = localStorage.getItem('streamingBlogPost');
        if (currentStreaming) {
          try {
            const { slug, isStreaming } = JSON.parse(currentStreaming);
            if (slug !== generatingBlogSlug || !isStreaming) {
              console.log('✅ Blog post streaming stopped, cleaning up state and adding success message');
              
              // Add success message to the conversation when streaming stops
              const successMessage = {
                id: `success_${Date.now()}_${++messageIdCounter.current}`,
                type: 'ai',
                content: 'Successfully created a new blog post!',
                timestamp: new Date(),
                isStreaming: false
              };
              
              setConversation(prev => {
                const newConversation = [...prev, successMessage];
                console.log('✅ Success message added to conversation via streaming cleanup:', {
                  messageId: successMessage.id,
                  messageContent: successMessage.content,
                  conversationLength: newConversation.length,
                  timestamp: successMessage.timestamp,
                  allMessages: newConversation.map(msg => ({ id: msg.id, type: msg.type, content: msg.content }))
                });
                return newConversation;
              });
              
              setIsGeneratingBlog(false);
              setGeneratingBlogSlug(null);
              console.log('✅ Cleaned up "Generating blog content" state - blog post no longer streaming');
            }
          } catch (e) {
            // If parsing fails, clean up
            setIsGeneratingBlog(false);
            setGeneratingBlogSlug(null);
            console.log('✅ Cleaned up "Generating blog content" state - invalid streaming data');
          }
        }
      }
    };

    // Check immediately
    handleStorageChange();

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isGeneratingBlog, generatingBlogSlug]);

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
  const generateAIResponse = useCallback(async (userPrompt) => {
    // Create AI message placeholder early so it's available in catch block
    const aiMessageId = `ai_${Date.now()}_${++messageIdCounter.current}`;
    const aiMessage = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };
    
    // Add AI message to conversation
    setConversation(prev => [...prev, aiMessage]);
    
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
                  // Check if this is a special REFETCH_BLOG_POSTS message
                  if (data.content.startsWith('REFETCH_BLOG_POSTS:')) {
                    // Extract the blog post ID, slug, and title
                    const parts = data.content.split(':');
                    const blogPostId = parts[1];
                    const blogPostSlug = parts[2];
                    const blogPostTitle = parts[3] || 'Untitled Blog Post';
                    console.log('Received REFETCH_BLOG_POSTS message for post:', blogPostId, 'with slug:', blogPostSlug, 'and title:', blogPostTitle);
                    
                    // Create a temporary blog post object with basic info
                    const tempBlogPost = {
                      id: blogPostId,
                      slug: blogPostSlug,
                      title: blogPostTitle, // Use the actual title from backend
                      content: '', // Will be populated by streaming
                      company_id: null, // Will be set when saved
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };
                    
                    // Store the temporary blog post in the cache so the editor can load immediately
                    queryClient.setQueryData(['blogPost', blogPostSlug], tempBlogPost);
                    console.log('📋 Temporary blog post cached for immediate editor loading with title:', blogPostTitle);
                    
                    // Store the blog post info BEFORE navigating so content can continue streaming
                    localStorage.setItem('streamingBlogPost', JSON.stringify({
                      id: blogPostId,
                      slug: blogPostSlug,
                      timestamp: Date.now(),
                      isStreaming: true
                    }));
                    
                    // Set state to show "Generating blog content" message
                    setIsGeneratingBlog(true);
                    setGeneratingBlogSlug(blogPostSlug);
                    
                    // Stop the "Thinking..." state since we're now generating blog content
                    setConversation(prev => 
                      prev.map(msg => 
                        msg.id === aiMessageId
                          ? { ...msg, isStreaming: false }
                          : msg
                      )
                    );
                    
                    // Don't add success message here - wait for actual stream completion
                    // This ensures the message appears when SideChat is visible
                    
                    // Don't add the message to conversation - only show the flashing message below
                    // const generatingMessage = `Generating blog content...`;
                    // fullResponse += generatingMessage;
                    
                    // Update the AI message content in real-time (without the generating message)
                    setConversation(prev => 
                      prev.map(msg => 
                        msg.id === aiMessageId
                          ? { ...msg, content: fullResponse }
                          : msg
                      )
                    );
                    
                    // Navigate immediately to the blog post editor for instant access
                    navigate(`/dashboard/geo/${blogPostSlug}`);
                  } else if (data.content.startsWith('---SWITCH STREAM ENDPOINT-BLOG-SLUG:')) {
                    // Extract the blog post slug for content streaming
                    const slugMatch = data.content.match(/---SWITCH STREAM ENDPOINT-BLOG-SLUG:(.+)---/);
                    if (slugMatch) {
                      const blogPostSlug = slugMatch[1];
                      console.log('Switching stream endpoint to blog post editor:', blogPostSlug);
                      
                      // Store the blog post slug and start streaming content to localStorage
                      localStorage.setItem('streamingBlogPost', JSON.stringify({
                        slug: blogPostSlug,
                        timestamp: Date.now(),
                        isStreaming: true
                      }));
                      
                      // Continue streaming content to SideChat until completion
                      // This ensures SideChat receives completion signals and shows success message
                      console.log('📝 Continuing stream to SideChat for completion signals');
                    }
                  } else if (data.content.startsWith('---BLOG_CONTENT_START:')) {
                    // Extract the blog post slug for content streaming
                    const slugMatch = data.content.match(/---BLOG_CONTENT_START:(.+)---/);
                    if (slugMatch) {
                      const blogPostSlug = slugMatch[1];
                      console.log('Blog content streaming started for:', blogPostSlug);
                      
                      // Initialize the content storage for this blog post
                      localStorage.setItem(`blogPostContent_${blogPostSlug}`, '');
                    }
                  } else if (data.content.startsWith('---BLOG_CONTENT_END:')) {
                    // Extract the blog post slug for content streaming
                    const slugMatch = data.content.match(/---BLOG_CONTENT_END:(.+)---/);
                    if (slugMatch) {
                      const blogPostSlug = slugMatch[1];
                      console.log('🎯 BLOG_CONTENT_END marker received for:', blogPostSlug);
                      
                      // Mark that we've received the end marker, but don't stop processing yet
                      // This will be handled by BlogPostEditorPage for proper completion detection
                      localStorage.setItem(`blogPostEndMarker_${blogPostSlug}`, 'true');
                      console.log('📝 End marker stored for BlogPostEditorPage to process');
                      
                      // Stop showing "Generating blog content" message for this blog post
                      if (generatingBlogSlug === blogPostSlug) {
                        setIsGeneratingBlog(false);
                        setGeneratingBlogSlug(null);
                        console.log('✅ Stopped "Generating blog content" message for:', blogPostSlug);
                        
                        // Add success message to the conversation
                        const successMessage = {
                          id: `success_${Date.now()}_${++messageIdCounter.current}`,
                          type: 'ai',
                          content: 'Successfully created a new blog post!',
                          timestamp: new Date(),
                          isStreaming: false
                        };
                        
                        setConversation(prev => {
                          const newConversation = [...prev, successMessage];
                          console.log('✅ Success message added to conversation:', {
                            messageId: successMessage.id,
                            messageContent: successMessage.content,
                            conversationLength: newConversation.length,
                            timestamp: successMessage.timestamp,
                            allMessages: newConversation.map(msg => ({ id: msg.id, type: msg.type, content: msg.content }))
                          });
                          return newConversation;
                        });
                        console.log('✅ Added success message to conversation');
                      }
                    }
                  } else {
                    // Regular content, check if we're streaming to a blog post editor FIRST
                    const streamingBlogPost = localStorage.getItem('streamingBlogPost');
                    if (streamingBlogPost) {
                      try {
                        const { slug, isStreaming } = JSON.parse(streamingBlogPost);
                        if (isStreaming) {
                          // Get existing content and append new content
                          const existingContent = localStorage.getItem(`blogPostContent_${slug}`) || '';
                          const newContent = existingContent + data.content;
                          
                          // Stream content to the blog post editor via localStorage
                          localStorage.setItem(`blogPostContent_${slug}`, newContent);
                          console.log('📝 Streaming content to blog post editor:', slug);
                          console.log('📊 Content length:', newContent.length);
                          console.log('📄 Content preview:', newContent.substring(0, 100) + '...');
                          console.log('🔄 Chunk size:', data.content.length);
                          console.log('💾 localStorage Update:', {
                            key: `blogPostContent_${slug}`,
                            newLength: newContent.length,
                            chunkSize: data.content.length,
                            lastChunk: data.content,
                            timestamp: new Date().toISOString()
                          });
                          
                          // Track if this might be the final chunk
                          if (data.content.length <= 3) {
                            console.log('⚠️ POTENTIAL FINAL CHUNK DETECTED:', {
                              chunk: data.content,
                              chunkLength: data.content.length,
                              totalContentLength: newContent.length,
                              timestamp: new Date().toISOString(),
                              note: 'This small chunk might be the final content - ensuring it gets processed'
                            });
                          }
                          
                          // EXTENSIVE LOGGING: Track every word and character
                          console.log('🔍 EXTENSIVE CONTENT ANALYSIS:', {
                            // Current chunk details
                            currentChunk: data.content,
                            currentChunkLength: data.content.length,
                            currentChunkWords: data.content.split(/\s+/).filter(word => word.length > 0),
                            
                            // Total content analysis
                            totalContentLength: newContent.length,
                            totalContentWords: newContent.split(/\s+/).filter(word => word.length > 0).length,
                            totalContentCharacters: newContent.length,
                            
                            // Content boundaries
                            last50Chars: newContent.substring(Math.max(0, newContent.length - 50)),
                            last100Chars: newContent.substring(Math.max(0, newContent.length - 100)),
                            last200Chars: newContent.substring(Math.max(0, newContent.length - 200)),
                            
                            // Word-by-word analysis
                            last10Words: newContent.split(/\s+/).filter(word => word.length > 0).slice(-10),
                            last20Words: newContent.split(/\s+/).filter(word => word.length > 0).slice(-20),
                            
                            // Character analysis
                            lastChar: newContent.charAt(newContent.length - 1),
                            last5Chars: newContent.substring(Math.max(0, newContent.length - 5)),
                            last10Chars: newContent.substring(Math.max(0, newContent.length - 10)),
                            
                            // Content integrity check
                            endsWithPeriod: newContent.endsWith('.'),
                            endsWithSpace: newContent.endsWith(' '),
                            endsWithNewline: newContent.endsWith('\n'),
                            endsWithPunctuation: /[.!?;:,]$/.test(newContent),
                            
                            timestamp: new Date().toISOString()
                          });
                          
                          // IMPORTANT: Don't add to chat conversation - this content is for the blog editor only
                          // Skip the rest of the processing for this chunk
                          console.log('🚫 Content NOT added to chat - forwarded to blog editor only');
                          continue;
                        }
                      } catch (error) {
                        console.error('Error parsing streaming blog post data:', error);
                      }
                    }
                    
                    // Only add to chat conversation if we're NOT streaming to a blog post editor
                    fullResponse += data.content;
                    console.log('💬 Content added to chat conversation:', data.content.substring(0, 50) + '...');
                    
                    // Update the AI message content in real-time
                    setConversation(prev => 
                      prev.map(msg => 
                        msg.id === aiMessageId
                          ? { ...msg, content: fullResponse }
                          : msg
                      )
                    );
                  }
                  
                } else if (data.type === 'complete') {
                  // Stream is complete - but don't mark anything as complete here
                  // Let the BlogEditor handle completion when it sees BLOG_CONTENT_END
                  console.log('🎯 Stream completion signal received (data.type === "complete")');
                  console.log('📤 Passing completion handling to BlogEditor - SideChat will continue streaming until BlogEditor processes BLOG_CONTENT_END');
                  
                  // Stop showing "Generating blog content" message if we have one active
                  if (isGeneratingBlog) {
                    setIsGeneratingBlog(false);
                    setGeneratingBlogSlug(null);
                    console.log('✅ Stopped "Generating blog content" message on stream completion');
                    
                    // Add success message to the conversation
                    const successMessage = {
                      id: `success_${Date.now()}_${++messageIdCounter.current}`,
                      type: 'ai',
                      content: 'Successfully created a new blog post!',
                      timestamp: new Date(),
                      isStreaming: false
                    };
                    
                    setConversation(prev => {
                      const newConversation = [...prev, successMessage];
                      console.log('✅ Success message added to conversation on stream completion:', {
                        messageId: successMessage.id,
                        messageContent: successMessage.content,
                        conversationLength: newConversation.length,
                        timestamp: successMessage.timestamp,
                        allMessages: newConversation.map(msg => ({ id: msg.id, type: msg.type, content: msg.content }))
                      });
                      return newConversation;
                    });
                    console.log('✅ Added success message to conversation on stream completion');
                  }
                  
                  // Don't mark streaming as complete - let BlogEditor handle it
                  // This ensures all content including final chunks reaches the editor
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
  }, [queryClient]);

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
                    {message.content && (
                      <div className="markdown-content">
                        {renderFormattedText(message.content)}
                      </div>
                    )}
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
        
        {/* Show "Generating blog content" message when streaming blog content */}
        {isGeneratingBlog && (
          <div className="mb-4">
            <div className="flex justify-start">
              <div className="rounded-lg bg-white w-full">
                <div className="text-base font-normal text-black leading-relaxed font-sans">
                  <div className="relative overflow-hidden">
                    <span className="text-gray-600 font-medium">Generating blog content</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
