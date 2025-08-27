import React, { useEffect } from 'react';
import Tooltip from './Tooltip';
import { useUpdateRedditRepliedTo } from '../../../hooks/useUpdateRedditRepliedTo';
import { useRedditReply } from '../../../hooks/useRedditReply';

const ReplyButton = ({ text = "Reply", iconID = "chat", onClick, isReplied = false, content = "", contentType = "post", link = "", postContent = "", leadId = "", onReplyUpdate }) => {
  const updateRepliedTo = useUpdateRedditRepliedTo();
  const { generateReply } = useRedditReply();
  
  // Check if there was an error updating the backend
  const hasBackendError = updateRepliedTo.isError;
  
  // Handle backend errors and revert optimistic updates
  useEffect(() => {
    if (hasBackendError && onReplyUpdate) {
      console.log('🔄 Reverting optimistic update due to backend error');
      onReplyUpdate(isReplied);
    }
  }, [hasBackendError, onReplyUpdate, isReplied]);
  
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
    
          // Only generate reply if we're marking as replied (not unreplied)
      if (!isReplied) {
        try {
          // Generate reply using the backend API
          // For posts: use content as business context
          // For comments: use postContent as business context (the post the comment was made on)
          const businessContext = contentType === "comment" ? postContent : content;
          console.log('🚀 Calling generateReply with:', { content: content.substring(0, 100), contentType, businessContext: businessContext.substring(0, 100) });
          
          // Create a message to send to SideChat to start the streaming
          const messageContent = `Reply to this Reddit ${contentType}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
          
          const promptData = {
            content: messageContent,
            timestamp: new Date().toISOString(),
            redditLink: link,
            contentType: contentType,
            isGeneratedReply: true, // Flag to indicate this is a generated reply
            isStreaming: true // Flag to indicate this will be streamed
          };
          
          console.log('📤 Starting streaming reply to SideChat:', promptData);
          
          // Dispatch custom event to start streaming (no localStorage fallback needed)
          window.dispatchEvent(new CustomEvent('redditReplyPrompt', {
            detail: promptData
          }));
          
          // Now call the backend to generate the reply (this will stream to SideChat via events)
          const aiGeneratedReply = await generateReply(content, contentType, link, businessContext);
          console.log('📨 Received from generateReply:', typeof aiGeneratedReply, aiGeneratedReply ? aiGeneratedReply.substring(0, 100) : 'null');
          
          console.log('✅ Generated reply streaming completed');
          
          // Call the original onClick handler
          if (onClick) {
            onClick();
          }
        } catch (error) {
          console.error('❌ Failed to generate reply:', error);
          
          // Revert the optimistic update on error
          if (onReplyUpdate) {
            onReplyUpdate(isReplied);
          }
        }
      }
    
    // Now update the backend in the background (don't await)
    if (leadId) {
      updateRepliedTo.mutate({ 
        leadId, 
        repliedTo: !isReplied 
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