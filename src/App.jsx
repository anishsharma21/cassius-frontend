import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import { BackgroundTasksProvider } from './contexts/BackgroundTasksContext';
import { useAutoPostHogIdentify } from './hooks/usePostHogIdentify';

import PrivateRoute from './components/route_guards/PrivateRoute';
import PublicRoute from './components/route_guards/PublicRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DashboardLayout from './layouts/DashboardLayout';
import Reddit from './pages/Reddit/Reddit';
import Strategy from './pages/Strategy';
import GEO from './pages/GEO';
import Partnerships from './pages/Partnerships';
import CompanyProfile from './pages/CompanyProfile';
import Guide from './pages/Guide';
import Feedback from './pages/Feedback';
import BlogPostEditorPage from './pages/BlogPostEditorPage';
import UniversalProgressIndicator from './components/UniversalProgressIndicator';
import { resetRedirectFlag, logout } from './utils/auth';
import { setupApiInterceptor } from './utils/apiInterceptor';
import { TASK_TYPE } from './contexts/BackgroundTasksContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 errors - user will be logged out
        if (error?.status === 401 || error?.message === 'Unauthorized') {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      onError: (error) => {
        // Handle 401 errors globally
        if (error?.status === 401 || error?.message === 'Unauthorized') {
          console.log('React Query 401 error detected, logging out user');
          logout();
        }
      },
    },
    mutations: {
      onError: (error) => {
        // Handle 401 errors globally for mutations
        if (error?.status === 401 || error?.message === 'Unauthorized') {
          console.log('React Query mutation 401 error detected, logging out user');
          logout();
        }
      },
    },
  },
});

// Make queryClient globally available for auth utilities
if (typeof window !== 'undefined') {
  window.queryClient = queryClient;
}

function App() {
  // Auto-identify user with PostHog if authenticated
  useAutoPostHogIdentify();
  
  // Reset redirect flag and setup API interceptor when app mounts
  React.useEffect(() => {
    resetRedirectFlag();
    setupApiInterceptor();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <BackgroundTasksProvider>
          <ChatProvider>
          <Routes>
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            
            <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="strategy" replace />} />
              <Route path="geo" element={<GEO />} />
              <Route path="geo/:blogPostSlug" element={<BlogPostEditorPage />} />
              <Route path="partnerships" element={<Partnerships />} />
              <Route path="reddit" element={<Reddit />} />
              <Route path="strategy" element={<Strategy />} />
              <Route path="guide" element={<Guide />} />
              <Route path="company-profile" element={<CompanyProfile />} />
              <Route path="feedback" element={<Feedback />} />
            </Route>
            
          </Routes>
          
          {/* Global progress indicator for Reddit leads during signup */}
          <UniversalProgressIndicator 
            taskType={TASK_TYPE.REDDIT_LEADS}
            title="Finding Reddit Leads"
            position="top-right"
          />
          </ChatProvider>
        </BackgroundTasksProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
