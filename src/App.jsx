import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './components/route_guards/PrivateRoute';
import PublicRoute from './components/route_guards/PublicRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Reddit from './pages/Reddit';
import Strategy from './pages/Strategy';
import GEO from './pages/GEO';
import Partnerships from './pages/Partnerships';
import CompanyProfile from './pages/CompanyProfile';
import Guide from './pages/Guide';
import Feedback from './pages/Feedback';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
          
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="strategy" replace />} />
            <Route path="geo" element={<GEO />} />
            <Route path="partnerships" element={<Partnerships />} />
            <Route path="reddit" element={<Reddit />} />
            <Route path="strategy" element={<Strategy />} />
            <Route path="guide" element={<Guide />} />
            <Route path="company-profile" element={<CompanyProfile />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>
          
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
