import { useState } from 'react';
import API_ENDPOINTS from '../config/api';
import { useAuthFetch } from './useAuthFetch';

export function useUpdatePost() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const { fetchWithAuth } = useAuthFetch();

  const updatePost = async (postId, updates) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const url = `${API_ENDPOINTS.updateGeneratedPost}/${postId}`;
      const response = await fetchWithAuth(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update post: ${response.status}`);
      }

      const updatedPost = await response.json();
      return updatedPost;
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const markAsPosted = async (postId) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const url = `${API_ENDPOINTS.markPostAsPosted}/${postId}/mark-posted`;
      const response = await fetchWithAuth(url, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark post as posted: ${response.status}`);
      }

      const updatedPost = await response.json();
      return updatedPost;
    } catch (err) {
      console.error('Error marking post as posted:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const markAsDraft = async (postId) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const url = `${API_ENDPOINTS.markPostAsDraft}/${postId}/mark-draft`;
      const response = await fetchWithAuth(url, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark post as draft: ${response.status}`);
      }

      const updatedPost = await response.json();
      return updatedPost;
    } catch (err) {
      console.error('Error marking post as draft:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updatePost, markAsPosted, markAsDraft, isUpdating, error };
}