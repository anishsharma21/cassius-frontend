import React from 'react';
import ClickableLink from './ClickableLink';

// Example usage of ClickableLink component
const ClickableLinkExamples = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">ClickableLink Component Examples</h2>
      
      {/* Basic usage */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Link</h3>
        <ClickableLink href="https://example.com">
          This is a basic clickable link
        </ClickableLink>
      </div>

      {/* With custom className */}
      <div>
        <h3 className="text-lg font-semibold mb-2">With Custom Styling</h3>
        <ClickableLink 
          href="https://example.com" 
          className="text-lg underline"
        >
          Link with custom styling
        </ClickableLink>
      </div>

      {/* Different target */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Same Window Link</h3>
        <ClickableLink 
          href="https://example.com" 
          target="_self"
        >
          Opens in same window
        </ClickableLink>
      </div>

      {/* With onClick handler */}
      <div>
        <h3 className="text-lg font-semibold mb-2">With Click Handler</h3>
        <ClickableLink 
          href="https://example.com"
          onClick={() => alert('Link clicked!')}
        >
          Link with click handler
        </ClickableLink>
      </div>

      {/* Reddit-style post title */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Reddit Post Title Style</h3>
        <ClickableLink href="https://www.reddit.com/r/example">
          Why is this component so useful for building consistent links?
        </ClickableLink>
      </div>
    </div>
  );
};

export default ClickableLinkExamples;
