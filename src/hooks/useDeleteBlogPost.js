import { useMutation, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';
import { handleUnauthorizedResponse } from '../utils/auth';

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogPostId) => {
      const response = await fetch(`${API_ENDPOINTS.deleteBlogPost}?blog_post_id=${blogPostId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorizedResponse(queryClient);
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch blog posts to remove the deleted one
      queryClient.invalidateQueries(['geoBlogPosts']);
    },
  });
};
