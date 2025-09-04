import { useMutation, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const useDeleteRedditLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId) => {
      const token = localStorage.getItem('access_token');
      console.log('🗑️ Deleting Reddit lead:', leadId);
      
      const response = await fetch(`${API_ENDPOINTS.deleteRedditLead}/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`Failed to delete Reddit lead: ${response.status} - ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data, leadId) => {
      console.log('✅ Reddit lead deleted successfully:', leadId);
      // Invalidate cache so the table and sidebar notification update
      queryClient.invalidateQueries({ queryKey: ['allRedditPosts'] });
    },
    onError: (error) => {
      console.error('❌ Failed to delete Reddit lead:', error);
    },
  });
};