import React from 'react';

const CopyGoToRedditButton = ({ title, content, subredditName, className = "" }) => {
  const handleCopyAndGoToReddit = async () => {
    try {
      // Format content for Reddit posting (title + content)
      const redditContent = `${title}\n\n${content}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(redditContent);
      console.log('✅ Post content copied to clipboard');
      
      // Open Reddit subreddit in new tab
      const redditUrl = `https://reddit.com/r/${subredditName}`;
      window.open(redditUrl, '_blank');
    } catch (error) {
      console.error('❌ Failed to copy to clipboard:', error);
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