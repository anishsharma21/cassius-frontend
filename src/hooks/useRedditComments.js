import { useQuery } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

const fetchRedditComments = async (postId, token) => {
  const response = await fetch(`${API_ENDPOINTS.redditComments}?post_id=${postId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch comments: ${response.status} - ${errorText}`);
  }

  return response.json();
};

export const useRedditComments = (postId, enabled = false) => {
  const token = localStorage.getItem("access_token");

  return useQuery({
    queryKey: ['redditComments', postId],
    queryFn: () => fetchRedditComments(postId, token),
    enabled: enabled && !!token && !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
