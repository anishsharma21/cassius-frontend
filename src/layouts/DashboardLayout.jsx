import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SideChat from '../components/SideChat';
import useChatConversation from '../hooks/useChatConversation';



const DashboardLayout = () => {
  const [chatWidth, setChatWidth] = useState(40); // Percentage - increased default width
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
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

  // Automatically expand chat when transitioning from central Strategy view to side view (only once)
  useEffect(() => {
    if (isStrategyPage && conversation.length > 0 && isChatCollapsed && !hasAutoExpanded) {
      // User just submitted a message from Strategy page central chat for the first time
      // Ensure side chat opens in expanded mode
      setIsChatCollapsed(false);
      setHasAutoExpanded(true);
    }
  }, [isStrategyPage, conversation.length, isChatCollapsed, hasAutoExpanded]);

  // Reset auto-expand flag when returning to central view (no conversation)
  useEffect(() => {
    if (showCentralStrategyView) {
      setHasAutoExpanded(false);
    }
  }, [showCentralStrategyView]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const container = document.querySelector('.dashboard-container');
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

  const toggleChatCollapse = () => {
    setIsChatCollapsed(!isChatCollapsed);
  };

  // Add document-level event listeners for smooth dragging
  useEffect(() => {
    if (isDragging) {
      const handleDocMouseMove = (e) => handleMouseMove(e);
      const handleDocMouseUp = () => setIsDragging(false);
      
      document.addEventListener('mousemove', handleDocMouseMove);
      document.addEventListener('mouseup', handleDocMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleDocMouseMove);
        document.removeEventListener('mouseup', handleDocMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  // Calculate effective chat width - collapsed chat takes minimal space
  const effectiveChatWidth = isChatCollapsed ? 4 : chatWidth; // 4% for collapsed state

  return (
    <div className="flex h-screen bg-gray-100">
        {/* Sidebar Component */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

      {/* Main Content Area - Floating white sections */}
      <div 
        className="flex-1 flex flex-col dashboard-container"
      >
        <div className="flex flex-1 p-2 min-h-0">
          {/* Main Page - Floating white section */}
          <div 
            className="-ml-2 px-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col flex-1"
            style={{ width: shouldHideSideChat ? '100%' : undefined }}
          >
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </div>
          
          {/* Draggable Divider - Hide when showing central Strategy view or chat is collapsed */}
          {!shouldHideSideChat && !isChatCollapsed && (
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
              className={`bg-white rounded-xl shadow-sm overflow-hidden ml-auto ${
                !isDragging ? 'transition-all duration-300 ease-in-out' : ''
              }`}
              style={{ 
                width: `${effectiveChatWidth}%`
              }}
            >
              <SideChat 
                isCollapsed={isChatCollapsed}
                onToggleCollapse={toggleChatCollapse}
                isDragging={isDragging}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;