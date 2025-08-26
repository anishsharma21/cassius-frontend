import { useCallback } from 'react';
import { authFetch } from '../utils/auth';

/**
 * Custom hook that provides authenticated fetch functionality
 * Automatically handles 401 responses by redirecting to login
 * Can be used throughout the app for API calls
 */
export const useAuthFetch = () => {
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    // Add authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    // Use the global authFetch wrapper
    return await authFetch(url, options);
  }, []);

  return { fetchWithAuth };
};

export default useAuthFetch;
