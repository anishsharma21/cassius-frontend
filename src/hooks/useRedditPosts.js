import { useQuery } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const useRedditPosts = (pageNumber = 1) => {
  // Get token directly from localStorage
  const token = localStorage.getItem("access_token");

  return useQuery({
    queryKey: ['redditPosts', pageNumber],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_ENDPOINTS.redditPosts}?page_number=${pageNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch Reddit posts: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
