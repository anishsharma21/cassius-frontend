import { PostHogProvider } from 'posthog-js/react'

const PostHogWrapper = ({ children }) => {
  // Check if we're in development mode or missing config
  const isDevelopment = import.meta.env.DEV
  const hasPostHogConfig = import.meta.env.VITE_PUBLIC_POSTHOG_KEY && import.meta.env.VITE_PUBLIC_POSTHOG_HOST

  // If in development or missing config, just render children without PostHog
  if (isDevelopment || !hasPostHogConfig) {
    return children
  }

  // In production with proper config, use PostHog
  const options = {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: '2025-05-24',
  }

  return (
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
      {children}
    </PostHogProvider>
  )
}

export default PostHogWrapper
