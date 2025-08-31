import { useMutation } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: async (feedbackData) => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.feedback, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      return response.json();
    }
  });
};