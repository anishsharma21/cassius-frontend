import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthStatus } from '../utils/auth';

export function useAuth() {
  const { isAuthenticated, tokenExpired } = getAuthStatus();
  
  // Get user data from React Query cache (no API calls, just reads cache)
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => null, // Dummy function since enabled: false
    enabled: false, // Don't fetch, just read from cache
    staleTime: Infinity,
  });
  
  // Get company data from React Query cache (no API calls, just reads cache)
  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: () => null, // Dummy function since enabled: false
    enabled: false, // Don't fetch, just read from cache
    staleTime: Infinity,
  });

  return {
    isAuthenticated,
    tokenExpired,
    user,
    company,
    isLoading: false, // Since we're not fetching, just reading cache
  };
}

export function useAuthActions() {
  const queryClient = useQueryClient();
  
  const logout = () => {
    // Clear access token from localStorage
    localStorage.removeItem('access_token');
    
    // Clear React Query cache
    queryClient.clear();
  };
  
  const updateUserData = (newUserData) => {
    queryClient.setQueryData(['user'], newUserData);
  };
  
  const updateCompanyData = (newCompanyData) => {
    queryClient.setQueryData(['company'], newCompanyData);
  };
  
  return {
    logout,
    updateUserData,
    updateCompanyData,
  };
}
