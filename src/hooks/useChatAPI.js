import React, { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';
import { handleUnauthorizedResponse } from '../utils/auth';

const useChatAPI = ({ 
  onUpdateAIMessage, 
  getChatHistory,
  streamingMessageId,
  setStreamingMessageId 
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLocation, setStreamLocation] = useState('SIDE_CHAT');
  const streamLocationRef = useRef('SIDE_CHAT');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Keep ref in sync with state
  React.useEffect(() => {
    streamLocationRef.current = streamLocation;
  }, [streamLocation]);

  // Generate AI response from API with streaming
  const generateAIResponse = useCallback(async (userPrompt, aiMessageId, redditLink = null, contentType = null) => {
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
                      navigate(`/dashboard/geo/${slug}`);
                    }
                  } else if (data.content.startsWith('---LOAD_STREAM_BLOG_POST_EDITOR:')) {
                    // Switch stream to blog post editor
                    const match = data.content.match(/---LOAD_STREAM_BLOG_POST_EDITOR:(.+)---/);
                    if (match) {
                      const slug = match[1];
                      setStreamLocation(`BLOG_POST:${slug}`);
                    }
                  } else if (data.content.startsWith('---STREAM_START---')) {
                    // Streaming has begun
                    setIsStreaming(true);
                    onUpdateAIMessage(aiMessageId, { 
                      isStreaming: true, 
                      content: 'Generating blog content' 
                    });
                  } else if (data.content.startsWith('---STREAM_END---')) {
                    // Streaming has stopped
                    setIsStreaming(false);
                    onUpdateAIMessage(aiMessageId, { 
                      isStreaming: false, 
                      content: 'Successfully created a new blog post!' 
                    });
                  } else if (data.content.startsWith('---LOAD_STREAM_SIDE_CHAT---')) {
                    // Reset stream back to chat
                    setStreamLocation('SIDE_CHAT');
                  } else {
                    // Regular content - route based on streamLocationRef
                    let shouldAddToChat = true;
                    
                    if (streamLocationRef.current.startsWith('BLOG_POST:')) {
                      // Route content to blog post editor
                      const blogPostSlug = streamLocationRef.current.split(':')[1];
                      const existingContent = localStorage.getItem(`blogPostContent_${blogPostSlug}`) || '';
                      const newContent = existingContent + data.content;
                      localStorage.setItem(`blogPostContent_${blogPostSlug}`, newContent);
                      shouldAddToChat = false;
                    }
                    
                    // Add to chat if not routed to blog editor
                    if (shouldAddToChat) {
                      fullResponse += data.content;
                      onUpdateAIMessage(aiMessageId, { content: fullResponse });
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
                  onUpdateAIMessage(aiMessageId, { content: fullResponse });
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Finalize the streaming message
      onUpdateAIMessage(aiMessageId, { isStreaming: false });

    } catch (error) {
      console.error('Error calling chat API:', error);
      onUpdateAIMessage(aiMessageId, { 
        content: 'Sorry, I encountered an error while processing your request. Please try again.', 
        isStreaming: false 
      });
    }
  }, [queryClient, isStreaming, streamLocation, getChatHistory, onUpdateAIMessage, navigate]);

  // Handle generated reply (for Reddit)
  const handleGeneratedReply = useCallback((promptData, aiMessageId) => {
    onUpdateAIMessage(aiMessageId, {
      content: `GENERATED REDDIT REPLY:\n\n${promptData.aiGeneratedReply}`,
      displayContent: promptData.aiGeneratedReply,
      isStreaming: false,
      redditLink: promptData.redditLink,
      contentType: promptData.contentType
    });
  }, [onUpdateAIMessage]);

  // Handle streaming chunk
  const handleStreamingChunk = useCallback((chunkContent) => {
    if (streamingMessageId) {
      onUpdateAIMessage(streamingMessageId, (prevMsg) => ({
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
  }, [streamingMessageId, onUpdateAIMessage]);

  // Handle streaming complete
  const handleStreamingComplete = useCallback(() => {
    if (streamingMessageId) {
      onUpdateAIMessage(streamingMessageId, { isStreaming: false });
      setStreamingMessageId(null);
    }
  }, [streamingMessageId, onUpdateAIMessage, setStreamingMessageId]);

  // Reset streaming state
  const resetStreamingState = useCallback(() => {
    setIsStreaming(false);
    setStreamLocation('SIDE_CHAT');
    streamLocationRef.current = 'SIDE_CHAT';
  }, []);

  return {
    generateAIResponse,
    handleGeneratedReply,
    handleStreamingChunk,
    handleStreamingComplete,
    resetStreamingState,
    isStreaming,
    streamLocation
  };
};

export default useChatAPI;