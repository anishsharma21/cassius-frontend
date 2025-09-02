import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { jwtDecode } from 'jwt-decode';

const POSTHOG_IDENTIFIED_KEY = 'posthog_user_identified';

export function usePostHogIdentify() {
  const posthog = usePostHog();

  const identifyUser = (userEmail) => {
    // Check if PostHog is available
    if (!posthog) {
      console.warn('PostHog not available for user identification');
      return;
    }

    // Check if already identified this session
    if (sessionStorage.getItem(POSTHOG_IDENTIFIED_KEY) === userEmail) {
      console.log('User already identified in PostHog this session');
      return;
    }

    try {
      posthog.identify(userEmail, {
        email: userEmail,
      });

      // Mark as identified for this session
      sessionStorage.setItem(POSTHOG_IDENTIFIED_KEY, userEmail);
      console.log('User identified in PostHog:', userEmail);

    } catch (error) {
      console.warn('Failed to identify user in PostHog:', error);
    }
  };

  const identifyFromToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const decodedToken = jwtDecode(token);
      const userEmail = decodedToken.sub;

      // Check token expiry
      const expired = Date.now() >= decodedToken.exp * 1000;
      if (expired) return;

      identifyUser(userEmail);
    } catch (error) {
      console.warn('Failed to decode token for PostHog identification:', error);
    }
  };

  const clearIdentification = () => {
    sessionStorage.removeItem(POSTHOG_IDENTIFIED_KEY);
  };

  return {
    identifyUser,
    identifyFromToken,
    clearIdentification,
  };
}

// Auto-identify hook to be used at app initialization
export function useAutoPostHogIdentify() {
  const { identifyFromToken } = usePostHogIdentify();

  useEffect(() => {
    // Only run once on mount
    identifyFromToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once
}