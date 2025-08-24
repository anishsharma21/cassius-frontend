import { useMutation, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blogPostId, title, content }) => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Only include fields that are provided (not undefined/null)
      const payload = {
        blog_post_id: blogPostId
      };

      if (title !== undefined && title !== null) {
        payload.title = title;
      }

      if (content !== undefined && content !== null) {
        payload.content = content;
      }

      const response = await fetch(API_ENDPOINTS.updateBlogPost, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Failed to update blog post';
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch blog posts to show updated data
      queryClient.invalidateQueries({ queryKey: ['geoBlogPosts'] });
    },
  });
};
