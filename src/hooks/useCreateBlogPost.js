import { useMutation, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(API_ENDPOINTS.createBlogPost, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch blog posts to show the new one
      queryClient.invalidateQueries(['geoBlogPosts']);
    },
  });
};
