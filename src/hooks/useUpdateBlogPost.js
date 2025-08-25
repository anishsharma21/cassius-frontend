import { useMutation, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';
import { handleUnauthorizedResponse } from '../utils/auth';

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

      if (response.status === 401) {
        handleUnauthorizedResponse(queryClient);
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Failed to update blog post';
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      console.log('🔄 useUpdateBlogPost onSuccess triggered, updating caches');
      
      // Update the specific blog post cache with the new data
      if (data && data.slug) {
        queryClient.setQueryData(['blogPost', data.slug], data);
        console.log('✅ Updated blog post cache for slug:', data.slug);
      }
      
      // Also update the geoBlogPosts cache directly to ensure immediate updates
      queryClient.setQueryData(['geoBlogPosts'], (oldData) => {
        if (!oldData) return [data];
        return oldData.map(post => 
          post.id === data.id ? data : post
        );
      });
      console.log('✅ Updated geoBlogPosts cache directly');
      
      // Invalidate and refetch geoBlogPosts cache to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['geoBlogPosts'] });
      console.log('✅ geoBlogPosts cache invalidation completed');
    },
  });
};
