import React from 'react';
import { usePostHog } from 'posthog-js/react';

const CopyGoToRedditButton = ({ title, content, subredditName, className = "" }) => {
  const posthog = usePostHog();

  const handleCopyAndGoToReddit = async () => {
    // Track the copy and go to Reddit action
    posthog?.capture('copy_go_to_reddit_clicked', {
      subreddit_name: subredditName,
      post_title: title?.substring(0, 100), // Limit title length for analytics
      action: 'copy_and_navigate'
    });

    try {
      // Format content for Reddit posting (title + content)
      const redditContent = `${title}\n\n${content}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(redditContent);
      console.log('✅ Post content copied to clipboard');
      
      // Track successful copy
      posthog?.capture('copy_to_clipboard_success', {
        subreddit_name: subredditName,
        content_length: redditContent.length
      });
      
      // Open Reddit subreddit in new tab
      const redditUrl = `https://reddit.com/r/${subredditName}`;
      window.open(redditUrl, '_blank');
    } catch (error) {
      console.error('❌ Failed to copy to clipboard:', error);
      
      // Track copy failure
      posthog?.capture('copy_to_clipboard_failed', {
        subreddit_name: subredditName,
        error: error.message
      });
      
      // Still open Reddit even if copying fails
      const redditUrl = `https://reddit.com/r/${subredditName}`;
      window.open(redditUrl, '_blank');
    }
  };

  return (
    <button
      onClick={handleCopyAndGoToReddit}
      className={`px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2 ${className}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 1024 1024">
        <path d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64h64z"/>
        <path d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64H384zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64z"/>
      </svg>
      Copy & go to Reddit
    </button>
  );
};

export default CopyGoToRedditButton;