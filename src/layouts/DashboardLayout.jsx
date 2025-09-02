import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SideChat from '../components/SideChat';
import useChatConversation from '../hooks/useChatConversation';



const DashboardLayout = () => {
  const [chatWidth, setChatWidth] = useState(40); // Percentage - increased default width
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { conversation } = useChatConversation();
  
  // Check if we're on Strategy page and if it should show central chat
  const isStrategyPage = location.pathname === '/dashboard/strategy';
  const showCentralStrategyView = isStrategyPage && conversation.length === 0;
  const shouldHideSideChat = showCentralStrategyView;
  
  // Check if user is new and redirect to guide
  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === 'true' && location.pathname === '/dashboard') {
      // Clear the flag and redirect to guide
      localStorage.removeItem('isNewUser');
      navigate('/dashboard/strategy', { replace: true });
    }
  }, [navigate, location.pathname]);

  // Automatically collapse sidebar when on Strategy page
  useEffect(() => {
    if (location.pathname === '/dashboard/strategy') {
      setIsSidebarCollapsed(true);
    }
  }, [location.pathname]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;
    const newChatWidth = ((containerWidth - x) / containerWidth) * 100;
    
    // Limit the chat width between 20% and 60%
    if (newChatWidth >= 20 && newChatWidth <= 60) {
      setChatWidth(newChatWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
        {/* Sidebar Component */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

      {/* Main Content Area - Floating white sections */}
      <div 
        className="flex-1 flex flex-col"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex flex-1 p-2 min-h-0">
          {/* Main Page - Floating white section */}
          <div 
            className="-ml-2 px-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
            style={{ width: shouldHideSideChat ? '100%' : `${100 - chatWidth}%` }}
          >
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </div>
          
          {/* Draggable Divider - Hide when showing central Strategy view */}
          {!shouldHideSideChat && (
            <div
              className="w-2 bg-gray-100 cursor-col-resize transition-colors relative"
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
            </div>
          )}
          
          {/* Chat Page - Floating white section - Hide when showing central Strategy view */}
          {!shouldHideSideChat && (
            <div 
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              style={{ width: `${chatWidth}%` }}
            >
              <SideChat />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;