import { useState, useCallback } from 'react';
import API_ENDPOINTS from '../config/api';

export const useRedditReply = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateReply = useCallback(async (content, contentType, redditLink, businessContext = '') => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.generateRedditReply, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          contentType,
          businessContext
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate reply: ${response.status} ${errorText}`);
      }

      // Stream the response to SideChat in real-time
      console.log('🔄 Starting to stream response to SideChat...');
      
      let fullResponse = '';
      
      try {
        // Check if response.body is a ReadableStream and supports streaming
        if (response.body && typeof response.body.getReader === 'function') {
          console.log('📖 Using streaming approach...');
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          try {
            while (true) {
              // Use a more explicit Promise-based approach
              let readResult;
              try {
                readResult = await new Promise((resolve, reject) => {
                  reader.read().then(resolve).catch(reject);
                });
              } catch (readError) {
                console.error('❌ Error reading from stream:', readError);
                break;
              }
              
              const { done, value } = readResult;
              
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
                    
                    if (data.type === 'chunk' && data.content) {
                      fullResponse += data.content;
                      console.log('📝 Received chunk:', data.content.substring(0, 50) + '...');
                      
                      // Stream this chunk to SideChat immediately
                      const streamData = {
                        content: data.content,
                        timestamp: new Date().toISOString(),
                        isStreaming: true,
                        isChunk: true
                      };
                      
                      // Dispatch streaming event to SideChat
                      window.dispatchEvent(new CustomEvent('redditReplyStream', {
                        detail: streamData
                      }));
                      
                    } else if (data.type === 'complete') {
                      // Stream is complete
                      console.log('✅ Stream complete, total response length:', fullResponse.length);
                      
                      // Send completion signal to SideChat
                      const completeData = {
                        content: '',
                        timestamp: new Date().toISOString(),
                        isStreaming: false,
                        isComplete: true
                      };
                      
                      window.dispatchEvent(new CustomEvent('redditReplyStream', {
                        detail: completeData
                      }));
                      
                      break;
                    } else if (data.type === 'error') {
                      throw new Error(data.content);
                    }
                  } catch {
                    // If JSON parsing fails, treat the line as plain text
                    const content = line.slice(6);
                    if (content && content !== '{"content": "", "type": "complete"}') {
                      fullResponse += content;
                      console.log('📝 Received plain text chunk:', content.substring(0, 50) + '...');
                      
                      // Stream this chunk to SideChat immediately
                      const streamData = {
                        content: content,
                        timestamp: new Date().toISOString(),
                        isStreaming: true,
                        isChunk: true
                      };
                      
                      window.dispatchEvent(new CustomEvent('redditReplyStream', {
                        detail: streamData
                      }));
                    }
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
            console.log('🔒 Reader lock released');
          }
        } else {
          // Fallback: try to get the response as text
          console.log('📖 Using fallback text approach...');
          fullResponse = await response.text();
          console.log('📝 Received full response as text:', fullResponse.substring(0, 100) + '...');
        }
      } catch (streamError) {
        console.error('❌ Streaming failed, trying fallback:', streamError);
        try {
          // Last resort: try to get response as text
          fullResponse = await response.text();
          console.log('📝 Received fallback response as text:', fullResponse.substring(0, 100) + '...');
        } catch (fallbackError) {
          console.error('❌ All approaches failed:', fallbackError);
          throw new Error('Failed to read response from server');
        }
      }

      console.log('🎯 Final AI-generated reply:', fullResponse.substring(0, 100) + '...');
      // Return the full AI-generated reply text
      return fullResponse;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateReply,
    isGenerating,
    error,
    clearError: () => setError(null)
  };
};
