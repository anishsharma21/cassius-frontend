import { useQuery } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

export const usePartnerships = () => {
  const { data: influencers, isLoading, error, refetch } = useQuery({
    queryKey: ['partnerships', 'influencers'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await fetch(API_ENDPOINTS.partnerships.getInfluencers, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch influencers data: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw partnerships data:', data);
        
        // Transform the data to match the expected frontend structure
        if (data && Array.isArray(data)) {
          const transformed = data.map(influencer => ({
            id: influencer.id,
            name: influencer.account_name,
            instagram: influencer.account_name,
            photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.account_name || 'Influencer')}&background=random`,
            followers: influencer.followers || 0,
            posts: Math.floor(Math.random() * 500) + 100, // Placeholder since not in backend
            engagementScore: Math.floor(Math.random() * 5) + 6, // Placeholder since not in backend
            description: influencer.description || 'No description available',
            location: influencer.location || 'Unknown location',
            bio: influencer.bio || 'No bio available'
          }));
          console.log('Transformed influencers:', transformed);
          return transformed;
        }
        
        console.log('No influencers data found or invalid format');
        return [];
      } catch (error) {
        console.error('Error fetching partnerships:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  return {
    influencers: influencers || [],
    isLoading,
    error,
    refetch
  };
};
