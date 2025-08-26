# Global 401 Unauthorized Handling

This app now automatically handles 401 Unauthorized responses from any API call by redirecting users to the login page.

## How It Works

### 1. Global QueryClient Configuration
The `QueryClient` in `App.jsx` is configured with global error handlers that:
- Detect 401 responses from React Query operations
- Automatically clear the auth token and React Query cache
- Redirect to `/login` page

### 2. Global Fetch Wrapper
The `authFetch` function in `utils/auth.js` provides:
- Automatic 401 detection for any fetch call
- Global redirect handling
- Prevention of multiple simultaneous redirects

### 3. Custom Hook
The `useAuthFetch` hook provides:
- Authenticated fetch with automatic token inclusion
- Built-in 401 handling
- Easy integration throughout the app

## Usage

### Option 1: Use the Custom Hook (Recommended)
```javascript
import { useAuthFetch } from '../hooks/useAuthFetch';

function MyComponent() {
  const { fetchWithAuth } = useAuthFetch();
  
  const handleApiCall = async () => {
    try {
      const response = await fetchWithAuth('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      // Handle success
    } catch (error) {
      // Handle other errors (401s are handled automatically)
    }
  };
}
```

### Option 2: Use authFetch Directly
```javascript
import { authFetch } from '../utils/auth';

const response = await authFetch('/api/endpoint', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Option 3: React Query (Automatic)
React Query automatically handles 401s through the global configuration:
```javascript
const { data } = useQuery({
  queryKey: ['myData'],
  queryFn: () => fetch('/api/endpoint').then(res => res.json())
  // 401s are handled automatically - no need to check response status
});
```

## Features

- **Automatic Redirect**: 401 responses trigger immediate login redirect
- **Cache Clearing**: React Query cache is cleared on unauthorized access
- **Token Management**: Access tokens are automatically removed
- **Prevent Loops**: Global flag prevents multiple simultaneous redirects
- **Global Coverage**: Works across all API calls, React Query operations, and manual fetch calls

## What Happens on 401

1. **Immediate Detection**: 401 status is detected in response
2. **Auth Cleanup**: Access token is removed from localStorage
3. **Cache Clear**: React Query cache is completely cleared
4. **Redirect**: User is redirected to `/login` page
5. **Flag Reset**: Redirect flag is reset after successful login

## Integration Notes

- **Existing Code**: No changes needed to existing React Query usage
- **Manual Fetch**: Replace `fetch()` with `authFetch()` or `useAuthFetch()` hook
- **Error Handling**: 401s are handled automatically, focus on other error types
- **Login Flow**: Redirect flag is reset after successful login

## Example Migration

### Before (Manual fetch with 401 handling)
```javascript
const response = await fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (response.status === 401) {
  handleUnauthorizedResponse(queryClient);
  return;
}
```

### After (Automatic 401 handling)
```javascript
const { fetchWithAuth } = useAuthFetch();
const response = await fetchWithAuth('/api/endpoint');
// 401s are handled automatically!
```

This system ensures consistent, reliable authentication handling across the entire application.
