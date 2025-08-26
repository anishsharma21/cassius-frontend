import React from 'react';
import Tooltip from './Tooltip';
import { useUpdateRedditRepliedTo } from '../../../hooks/useUpdateRedditRepliedTo';

const ReplyButton = ({ text = "Reply", iconID = "chat", onClick, isReplied = false, content = "", contentType = "post", link = "", postContent = "", leadId = "", onReplyUpdate }) => {
  const updateRepliedTo = useUpdateRedditRepliedTo();
  
  // Icon mapping based on iconID
  const getIcon = (iconID) => {
    switch (iconID) {
      case 'external-link':
        return (
          <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
      case 'arrow-right':
        return (
          <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
          </svg>
        );
      case 'chat':
        return (
          <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleReplyClick = async () => {
    console.log('🔴 ReplyButton clicked with data:', { content, contentType, link, postContent, leadId, isReplied });
    
    // Immediately update the UI for optimistic response
    if (onReplyUpdate) {
      onReplyUpdate(!isReplied);
    }
    
    // Only send message to SideChat if we're marking as replied (not unreplied)
    if (!isReplied) {
      // Send message to SideChat INSTANTLY (don't wait for API)
      let messageContent;
      if (contentType === "comment") {
        messageContent = `Reply to this Reddit comment: "${content}"\n\nThe comment was for this post: "${postContent}"`;
      } else {
        messageContent = `Reply to this Reddit ${contentType}: "${content}"`;
      }
      
      const promptData = {
        content: messageContent,
        timestamp: new Date().toISOString(),
        redditLink: link,
        contentType: contentType
      };
      
      console.log('📤 Sending prompt data to SideChat INSTANTLY:', promptData);
      
      // Set localStorage as fallback
      localStorage.setItem('guidePrompt', JSON.stringify(promptData));
      
      // Dispatch custom event for instant response
      window.dispatchEvent(new CustomEvent('redditReplyPrompt', {
        detail: promptData
      }));
      
      console.log('✅ Custom event dispatched INSTANTLY');
      
      // Call the original onClick handler
      if (onClick) {
        onClick();
      }
    }
    
    // Now update the backend in the background (don't await)
    if (leadId) {
      updateRepliedTo.mutate({ 
        leadId, 
        repliedTo: !isReplied 
      }).catch(error => {
        console.error('❌ Failed to update replied_to status:', error);
        
        // Revert the optimistic update on error
        if (onReplyUpdate) {
          onReplyUpdate(isReplied);
        }
      });
    }
  };

  if (isReplied) {
    return (
      <button 
        className="inline-flex items-center px-3 py-1 rounded-full text-sm border bg-green-50 border-green-200 text-green-700 gap-1 cursor-pointer hover:bg-green-100 transition-colors"
        onClick={handleReplyClick}
      >
        Replied
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    );
  }



  return (
    <button 
      className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors cursor-pointer"
      onClick={handleReplyClick}
    >
      <span>{text}</span>
      {getIcon(iconID)}
    </button>
  );
};

export default ReplyButton;