import { jwtDecode } from "jwt-decode";
import posthog from 'posthog-js';

// Global flag to prevent multiple redirects
let isRedirecting = false;

export function logout() {
  // Clear only the access token from localStorage
  localStorage.removeItem('access_token');
  
  // Reset PostHog user identification
  try {
    posthog.reset();
  } catch (error) {
    console.warn('Failed to reset PostHog:', error);
  }
  
  // Clear React Query cache if queryClient is available
  if (typeof window !== 'undefined' && window.queryClient) {
    window.queryClient.clear();
  }
  
  // Redirect to login page
  window.location.href = '/login';
}

export function clearQueryCache(queryClient) {
  // This function clears all React Query cached data
  if (queryClient) {
    queryClient.clear(); // Clear all queries
    console.log('React Query cache cleared');
  }
}

export function handleUnauthorizedResponse(queryClient) {
  console.log('Unauthorized response received, logging out user');
  
  // Clear access token
  localStorage.removeItem('access_token');
  
  // Reset PostHog user identification
  try {
    posthog.reset();
  } catch (error) {
    console.warn('Failed to reset PostHog:', error);
  }
  
  // Clear React Query cache
  if (queryClient) {
    queryClient.clear();
  }
  
  // Redirect to login page
  window.location.href = '/login';
}

// Global fetch wrapper that automatically handles 401 responses
export async function authFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    // Check for 401 Unauthorized
    if (response.status === 401) {
      if (!isRedirecting) {
        isRedirecting = true;
        console.log('401 Unauthorized detected, redirecting to login');
        
        // Clear auth data
        localStorage.removeItem('access_token');
        
        // Reset PostHog user identification
        try {
          posthog.reset();
        } catch (error) {
          console.warn('Failed to reset PostHog:', error);
        }
        
        // Redirect to login
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    
    return response;
  } catch (error) {
    if (error.message === 'Unauthorized') {
      throw error;
    }
    // Re-throw other errors
    throw error;
  }
}

// Function to reset redirect flag (useful after successful login)
export function resetRedirectFlag() {
  isRedirecting = false;
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
      logout(); // clear storage, PostHog, and React Query cache
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
