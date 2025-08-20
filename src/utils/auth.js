import { jwtDecode } from "jwt-decode";

export function logout() {
  // Clear only the access token from localStorage
  localStorage.removeItem('access_token');
  
  // Clear React Query cache if queryClient is available
  // This will be called from components that have access to queryClient
  if (typeof window !== 'undefined' && window.queryClient) {
    window.queryClient.clear();
  }
}

export function clearQueryCache(queryClient) {
  // This function clears all React Query cached data
  if (queryClient) {
    queryClient.clear(); // Clear all queries
    console.log('React Query cache cleared');
  }
}

export function getAuthStatus() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return { isAuthenticated: false, tokenExpired: false };
  }

  try {
    const { exp } = jwtDecode(token);
    const expired = Date.now() >= exp * 1000;

    if (expired) {
      logout(); // clear storage and React Query cache
    }
    console.log('getAuthStatus: isAuthenticated', !expired);
    console.log('getAuthStatus: tokenExpired', expired);
    return {
      isAuthenticated: !expired,
      tokenExpired: expired,
    };
  } catch {
    return { isAuthenticated: false, tokenExpired: false };
  }
}
