import { useState, useEffect, useCallback } from 'react';
import API_ENDPOINTS from '../config/api';
import { useAuthFetch } from './useAuthFetch';

export function useUserSubreddits() {
  const [subreddits, setSubreddits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithAuth } = useAuthFetch();

  const fetchSubreddits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(API_ENDPOINTS.userSubreddits);

      if (!response.ok) {
        throw new Error(`Failed to fetch subreddits: ${response.status}`);
      }

      const data = await response.json();
      setSubreddits(data);
    } catch (err) {
      console.error('Error fetching user subreddits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchSubreddits();
  }, [fetchSubreddits, fetchWithAuth]);

  const refetch = () => {
    fetchSubreddits();
  };

  return { subreddits, loading, error, refetch };
}