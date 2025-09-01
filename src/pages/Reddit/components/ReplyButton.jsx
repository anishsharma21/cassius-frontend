import React, { useEffect, useContext, useState } from 'react';
import Tooltip from './Tooltip';
import { useUpdateRedditRepliedTo } from '../../../hooks/useUpdateRedditRepliedTo';
import { useRedditReply } from '../../../hooks/useRedditReply';
import { ChatContext } from '../../../contexts/ChatContextTypes';

const ReplyButton = ({ text = "Reply", iconID = "chat", onClick, isReplied = false, content = "", contentType = "post", link = "", postContent = "", leadId = "", onReplyUpdate }) => {
  const updateRepliedTo = useUpdateRedditRepliedTo();
  const { generateReply, isGenerating } = useRedditReply();
  const { isStreaming } = useContext(ChatContext);
  
  // Local state to track if this specific button is generating
  const [isLocallyGenerating, setIsLocallyGenerating] = useState(false);
  
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
    // Early return if this button should be disabled - this should never happen due to disabled state
    if (shouldDisableButton || isThisButtonGenerating) {
      console.log('⚠️ Reply generation already in progress, ignoring click');
      return;
    }
    
    console.log('🔴 ReplyButton clicked with data:', { content, contentType, link, postContent, leadId, isReplied });
    console.log('🔄 Setting isLocallyGenerating to true');
    
    // Set local generating state immediately for ANY button click
    setIsLocallyGenerating(true);
    
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
          
          // Reset local generating state
          setIsLocallyGenerating(false);
          
          // Call the original onClick handler
          if (onClick) {
            onClick();
          }
        } catch (error) {
          console.error('❌ Failed to generate reply:', error);
          
          // Reset local generating state on error
          setIsLocallyGenerating(false);
          
          // Dispatch completion event to reset streaming state on error
          window.dispatchEvent(new CustomEvent('redditReplyStream', {
            detail: {
              content: '',
              timestamp: new Date().toISOString(),
              isStreaming: false,
              isComplete: true,
              isError: true
            }
          }));
          
          // Revert the optimistic update on error
          if (onReplyUpdate) {
            onReplyUpdate(isReplied);
          }
        }
      } else {
        // If isReplied = true, we're just toggling back to unreplied, no API call needed
        // Reset the generating state immediately
        console.log('🔄 isReplied=true, resetting isLocallyGenerating to false');
        setIsLocallyGenerating(false);
      }
    
    // Now update the backend in the background (don't await)
    if (leadId) {
      updateRepliedTo.mutate({ 
        leadId, 
        repliedTo: !isReplied 
      });
    }
  };

  // Check if any reply is being generated (for disabling all buttons) 
  const isAnyReplyGenerating = isStreaming;
  
  // Check if THIS specific button is generating (use both hook state and local state)
  const isThisButtonGenerating = isGenerating || isLocallyGenerating;
  
  // A button should be disabled if ANY reply is generating, unless it's the one currently generating
  const shouldDisableButton = isAnyReplyGenerating && !isThisButtonGenerating;
  
  // Debug logging
  useEffect(() => {
    console.log(`🔍 ReplyButton [${leadId}] state update:`, {
      isStreaming,
      isGenerating, 
      isAnyReplyGenerating,
      isThisButtonGenerating,
      shouldDisableButton,
      buttonText: isThisButtonGenerating ? 'Generating...' : text,
      buttonStyle: isThisButtonGenerating ? 'BLUE_GENERATING' : shouldDisableButton ? 'GRAY_DISABLED' : 'NORMAL',
      contentPreview: content.substring(0, 30) + '...'
    });
  }, [isStreaming, isGenerating, isAnyReplyGenerating, isThisButtonGenerating, shouldDisableButton, leadId, content, text]);

  if (isReplied) {
    return (
      <button 
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm border bg-green-50 border-green-200 text-green-700 gap-1 transition-colors ${
          shouldDisableButton 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-green-100'
        }`}
        onClick={shouldDisableButton ? undefined : handleReplyClick}
        disabled={shouldDisableButton}
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
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors ${
        isThisButtonGenerating
          ? 'bg-blue-100 text-blue-600 cursor-wait' // Changed from cursor-not-allowed to cursor-wait
          : shouldDisableButton 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-50' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
      }`}
      onClick={shouldDisableButton ? undefined : handleReplyClick} // Allow click on generating button for debugging
      disabled={shouldDisableButton} // Don't disable the generating button
    >
      <span>{isThisButtonGenerating ? 'Generating...' : text}</span>
      {isThisButtonGenerating ? (
        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        getIcon(iconID)
      )}
    </button>
  );
};

export default ReplyButton;