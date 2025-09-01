import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';
import { handleUnauthorizedResponse } from '../utils/auth';
import { ChatContext } from './ChatContextTypes';

export const ChatProvider = ({ children }) => {
  // Conversation state
  const [conversation, setConversation] = useState([]);
  const messageIdCounter = useRef(0);
  
  // Streaming state
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLocation, setStreamLocation] = useState('SIDE_CHAT');
  const streamLocationRef = useRef('SIDE_CHAT');
  
  // React Query and navigation
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Keep ref in sync with state
  useEffect(() => {
    streamLocationRef.current = streamLocation;
  }, [streamLocation]);

  // Message management functions
  const createUserMessage = useCallback((content, redditLink = null, contentType = null) => {
    const userMessage = {
      id: `user_${Date.now()}_${++messageIdCounter.current}`,
      type: 'user',
      content,
      timestamp: new Date(),
      redditLink,
      contentType
    };
    
    setConversation(prev => [...prev, userMessage]);
    return userMessage;
  }, []);

  const createAIMessage = useCallback((redditLink = null, contentType = null) => {
    const aiMessageId = `ai_${Date.now()}_${++messageIdCounter.current}`;
    const aiMessage = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      redditLink,
      contentType
    };
    
    setConversation(prev => [...prev, aiMessage]);
    return aiMessageId;
  }, []);

  const updateAIMessage = useCallback((messageId, updates) => {
    setConversation(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          if (typeof updates === 'function') {
            return { ...msg, ...updates(msg) };
          }
          return { ...msg, ...updates };
        }
        return msg;
      })
    );
  }, []);

  const clearConversation = useCallback(() => {
    setConversation([]);
    messageIdCounter.current = 0;
    setStreamingMessageId(null);
    setIsStreaming(false);
    setStreamLocation('SIDE_CHAT');
    streamLocationRef.current = 'SIDE_CHAT';
  }, []);

  const getChatHistory = useCallback(() => {
    return conversation
      .slice(-6)
      .map(msg => {
        if (msg.type === 'user') {
          return `User: ${msg.content}`;
        } else {
          return `Cassius: ${msg.content}`;
        }
      })
      .join('\n');
  }, [conversation]);

  // API functions
  const generateAIResponse = useCallback(async (userPrompt, aiMessageId) => {
    try {
      // Build chat history
      const chatHistory = getChatHistory();

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
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk' && data.content) {
                  // Handle special backend messages
                  if (data.content.startsWith('---CACHE_BLOG_POST:')) {
                    // Cache the blog post
                    const match = data.content.match(/---CACHE_BLOG_POST:(.+)---/);
                    if (match) {
                      const [id, slug, title] = match[1].split(':');
                      const tempBlogPost = {
                        id,
                        slug,
                        title: title || 'Untitled Blog Post',
                        content: '',
                        company_id: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      };
                      queryClient.setQueryData(['blogPost', slug], tempBlogPost);
                    }
                  } else if (data.content.startsWith('---REDIRECT_BLOG_POST_EDITOR:')) {
                    // Redirect to blog post editor
                    const match = data.content.match(/---REDIRECT_BLOG_POST_EDITOR:(.+)---/);
                    if (match) {
                      const slug = match[1];
                      // Small delay to ensure stream location is fully set before redirect
                      setTimeout(() => {
                        console.log('🚀 Redirecting to blog post editor:', slug);
                        navigate(`/dashboard/geo/${slug}`);
                      }, 100);
                    }
                  } else if (data.content.startsWith('---LOAD_STREAM_BLOG_POST_EDITOR:')) {
                    // Switch stream to blog post editor
                    const match = data.content.match(/---LOAD_STREAM_BLOG_POST_EDITOR:(.+)---/);
                    if (match) {
                      const slug = match[1];
                      // Clear any existing content in localStorage for this slug
                      const existingContent = localStorage.getItem(`blogPostContent_${slug}`);
                      if (existingContent) {
                        console.log('🧹 Clearing existing localStorage content for slug:', slug, 'length:', existingContent.length);
                        localStorage.removeItem(`blogPostContent_${slug}`);
                      }
                      
                      // Update both state and ref immediately to ensure content routing works
                      console.log('🎯 Setting stream location to BLOG_POST:', slug);
                      setStreamLocation(`BLOG_POST:${slug}`);
                      streamLocationRef.current = `BLOG_POST:${slug}`;
                      console.log('✅ Stream location updated - streamLocationRef.current:', streamLocationRef.current);
                    }
                  } else if (data.content.startsWith('---STREAM_START---')) {
                    // Streaming has begun
                    setIsStreaming(true);
                    updateAIMessage(aiMessageId, { 
                      isStreaming: true, 
                      content: 'Generating blog content' 
                    });
                  } else if (data.content.startsWith('---STREAM_END---')) {
                    // Streaming has stopped
                    setIsStreaming(false);
                    
                    // Dispatch stream end event for blog post editor
                    if (streamLocationRef.current.startsWith('BLOG_POST:')) {
                      const blogPostSlug = streamLocationRef.current.split(':')[1];
                      console.log('🎯 Stream ended for blog post, dispatching streamEnd event');
                      window.dispatchEvent(new CustomEvent('streamEnd', { detail: { slug: blogPostSlug } }));
                    }
                    
                    updateAIMessage(aiMessageId, { 
                      isStreaming: false, 
                      content: 'Successfully created a new blog post!' 
                    });
                  } else if (data.content.startsWith('---LOAD_STREAM_SIDE_CHAT---')) {
                    // Reset stream back to chat
                    setStreamLocation('SIDE_CHAT');
                  } else {
                    // Regular content - route based on streamLocationRef
                    let shouldAddToChat = true;
                    
                    console.log('🔄 Content routing - streamLocationRef.current:', streamLocationRef.current, 'content length:', data.content.length);
                    
                    if (streamLocationRef.current.startsWith('BLOG_POST:')) {
                      // Route content to blog post editor
                      const blogPostSlug = streamLocationRef.current.split(':')[1];
                      const existingContent = localStorage.getItem(`blogPostContent_${blogPostSlug}`) || '';
                      console.log('🔍 Before write - existingContent length:', existingContent.length);
                      console.log('🔍 Before write - existingContent preview:', existingContent.substring(0, 200));
                      
                      const newContent = existingContent + data.content;
                      localStorage.setItem(`blogPostContent_${blogPostSlug}`, newContent);
                      
                      console.log('📝 Routed content to blog post editor:', blogPostSlug, 'total length:', newContent.length);
                      console.log('📝 New content added:', data.content.substring(0, 100));
                      shouldAddToChat = false;
                    }
                    
                    // Add to chat if not routed to blog editor
                    if (shouldAddToChat) {
                      fullResponse += data.content;
                      updateAIMessage(aiMessageId, { content: fullResponse });
                    }
                  }
                } else if (data.type === 'complete') {
                  // Stream is complete
                  if (isStreaming) {
                    setIsStreaming(false);
                  }
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.content);
                }
              } catch {
                // If JSON parsing fails, treat as plain text
                const content = line.slice(6);
                if (content && content !== '{"content": "", "type": "complete"}') {
                  fullResponse += content;
                  updateAIMessage(aiMessageId, { content: fullResponse });
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Finalize the streaming message
      updateAIMessage(aiMessageId, { isStreaming: false });

    } catch (error) {
      console.error('Error calling chat API:', error);
      updateAIMessage(aiMessageId, { 
        content: 'Sorry, I encountered an error while processing your request. Please try again.', 
        isStreaming: false 
      });
    }
  }, [queryClient, getChatHistory, updateAIMessage, navigate, isStreaming]);

  // Reddit event handling functions
  const handleGeneratedReply = useCallback((promptData, aiMessageId) => {
    updateAIMessage(aiMessageId, {
      content: `GENERATED REDDIT REPLY:\n\n${promptData.aiGeneratedReply}`,
      displayContent: promptData.aiGeneratedReply,
      isStreaming: false,
      redditLink: promptData.redditLink,
      contentType: promptData.contentType
    });
  }, [updateAIMessage]);

  const handleStreamingChunk = useCallback((chunkContent) => {
    if (streamingMessageId) {
      updateAIMessage(streamingMessageId, (prevMsg) => ({
        content: (() => {
          if (!prevMsg.content) {
            return `GENERATED REDDIT REPLY:\n\n${chunkContent}`;
          }
          return prevMsg.content + chunkContent;
        })(),
        displayContent: (() => {
          if (!prevMsg.content) {
            return chunkContent;
          }
          return (prevMsg.displayContent || '') + chunkContent;
        })()
      }));
    }
  }, [streamingMessageId, updateAIMessage]);

  const handleStreamingComplete = useCallback(() => {
    if (streamingMessageId) {
      updateAIMessage(streamingMessageId, { isStreaming: false });
      setStreamingMessageId(null);
    }
  }, [streamingMessageId, updateAIMessage]);

  const resetStreamingState = useCallback(() => {
    setIsStreaming(false);
    setStreamLocation('SIDE_CHAT');
    streamLocationRef.current = 'SIDE_CHAT';
  }, []);

  // Global Reddit event handling
  useEffect(() => {
    const handleRedditReplyPrompt = async (event) => {
      const promptData = event.detail;
      localStorage.removeItem('guidePrompt');
      
      if (promptData.isGeneratedReply && promptData.isStreaming) {
        createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
        const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
        setStreamingMessageId(aiMessageId);
      } else if (promptData.isGeneratedReply && promptData.aiGeneratedReply) {
        createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
        const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
        handleGeneratedReply(promptData, aiMessageId);
      } else {
        createUserMessage(promptData.content, promptData.redditLink, promptData.contentType);
        const aiMessageId = createAIMessage(promptData.redditLink, promptData.contentType);
        await generateAIResponse(promptData.content, aiMessageId, promptData.redditLink, promptData.contentType);
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
      }
    };

    // Check for existing messages on mount
    handleStorageChange();

    // Add event listeners
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

  const value = {
    // Conversation state
    conversation,
    setConversation,
    
    // Message management
    createUserMessage,
    createAIMessage,
    updateAIMessage,
    clearConversation,
    getChatHistory,
    
    // API functions
    generateAIResponse,
    
    // Reddit event handling
    handleGeneratedReply,
    handleStreamingChunk,
    handleStreamingComplete,
    resetStreamingState,
    
    // Streaming state
    streamingMessageId,
    setStreamingMessageId,
    isStreaming,
    streamLocation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};