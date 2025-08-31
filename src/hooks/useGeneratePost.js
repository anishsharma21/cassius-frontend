import { useState } from 'react';
import API_ENDPOINTS from '../config/api';

export function useGeneratePost() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePost = async (subredditName, userDescription, onChunk, onComplete) => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(API_ENDPOINTS.generatePost, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subreddit_name: subredditName,
          user_description: userDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                // Send chunk to local UI handler
                if (onChunk) {
                  onChunk(data.content);
                }

              } else if (data.type === 'complete') {
                // Send to local UI handler
                if (onComplete) {
                  onComplete(data.post);
                }
                break;

              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error generating post:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePost, isGenerating, error };
}