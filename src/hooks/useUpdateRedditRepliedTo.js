import { useMutation, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const useUpdateRedditRepliedTo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, repliedTo }) => {
      const token = localStorage.getItem('access_token');
      console.log('🔐 Token for API call:', token ? `${token.substring(0, 20)}...` : 'No token found');
      
      const response = await fetch(API_ENDPOINTS.updateRedditRepliedTo, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          lead_id: leadId,
          replied_to: repliedTo
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`Failed to update replied_to status: ${response.status} - ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Don't update cache counts since we're handling them locally in the component
      console.log('✅ Backend updated successfully:', data);
    },
  });
};
