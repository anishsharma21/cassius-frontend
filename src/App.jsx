import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './components/route_guards/PrivateRoute';
import PublicRoute from './components/route_guards/PublicRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import GoogleSignUp from './pages/GoogleSignUp';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import GEO from './pages/GEO';
import SocialMedia from './pages/SocialMedia';
import Reddit from './pages/Reddit';
import Strategy from './pages/Strategy';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/google-signup" element={<PublicRoute><GoogleSignUp /></PublicRoute>} />
        
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="geo" element={<GEO />} />
          <Route path="social-media" element={<SocialMedia />} />
          <Route path="reddit" element={<Reddit />} />
          <Route path="strategy" element={<Strategy />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;
