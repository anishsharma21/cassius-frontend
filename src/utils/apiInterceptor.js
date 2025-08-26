// Global API response interceptor for handling 401 Unauthorized responses
let isLoggingOut = false;

export function setupApiInterceptor() {
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Override fetch with our interceptor
  window.fetch = async function(...args) {
    try {
      // Call the original fetch
      const response = await originalFetch.apply(this, args);
      
      // Check for 401 Unauthorized
      if (response.status === 401 && !isLoggingOut) {
        isLoggingOut = true;
        console.log('🔒 401 Unauthorized detected, logging out user automatically');
        
        // Clear authentication data
        localStorage.removeItem('access_token');
        
        // Clear any React Query cache if available
        if (window.queryClient) {
          window.queryClient.clear();
        }
        
        // Redirect to login page
        window.location.href = '/login';
        
        // Reset flag after a delay to prevent multiple redirects
        setTimeout(() => {
          isLoggingOut = false;
        }, 1000);
      }
      
      return response;
    } catch (error) {
      // Re-throw the error
      throw error;
    }
  };
}

export function resetLogoutFlag() {
  isLoggingOut = false;
}
