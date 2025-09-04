import { useQuery } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const useAllRedditPosts = () => {
  // Get token directly from localStorage
  const token = localStorage.getItem("access_token");

  return useQuery({
    queryKey: ['allRedditPosts'],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token');
      }

      // First, get the first page to know total count
      const firstPageResponse = await fetch(`${API_ENDPOINTS.redditPosts}?page_number=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!firstPageResponse.ok) {
        const errorText = await firstPageResponse.text();
        throw new Error(`Failed to fetch Reddit posts: ${firstPageResponse.status} - ${errorText}`);
      }

      const firstPageData = await firstPageResponse.json();
      const totalCount = firstPageData.total_count || 0;
      const repliedCount = firstPageData.replied_count || 0;
      
      // If there are 10 or fewer posts, just return the first page
      if (totalCount <= 10) {
        return {
          posts: firstPageData.posts || [],
          total_count: totalCount,
          replied_count: repliedCount
        };
      }

      // Calculate how many pages we need to fetch
      const totalPages = Math.ceil(totalCount / 10);
      
      // Fetch all remaining pages in parallel
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          fetch(`${API_ENDPOINTS.redditPosts}?page_number=${page}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }).then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch page ${page}`);
            }
            return response.json();
          })
        );
      }

      const remainingPages = await Promise.all(pagePromises);
      
      // Combine all posts
      const allPosts = [
        ...firstPageData.posts,
        ...remainingPages.flatMap(page => page.posts || [])
      ];

      return {
        posts: allPosts,
        total_count: totalCount,
        replied_count: repliedCount
      };
    },
    enabled: !!token,
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid excessive requests
    retry: 2,
  });
};