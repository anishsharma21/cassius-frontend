import { useQuery } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const useGeoBlogPosts = () => {
  // Get token directly from localStorage
  const token = localStorage.getItem("access_token");

  console.log('useGeoBlogPosts hook called, token:', token ? 'exists' : 'missing');
  console.log('API endpoint:', API_ENDPOINTS.geoBlogPosts);

  return useQuery({
    queryKey: ['geoBlogPosts'],
    queryFn: async () => {
      console.log('Starting to fetch blog posts...');
      
      if (!token) {
        console.error('No authentication token');
        throw new Error('No authentication token');
      }

      console.log('Making request to:', API_ENDPOINTS.geoBlogPosts);
      
      const response = await fetch(API_ENDPOINTS.geoBlogPosts, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to fetch blog posts: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched blog posts data:', data);
      return data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
