import React from 'react';
import StatusLabel from './StatusLabel';
import ReplyButton from './ReplyButton';

// Reusable function to truncate text to first line
const truncateText = (text, maxLength = 100) => {
  // Get the first line by splitting on newlines and taking the first part
  const firstLine = text.split('\n')[0];
  
  // If first line is longer than maxLength, truncate it
  if (firstLine.length > maxLength) {
    return firstLine.substring(0, maxLength) + '...';
  }
  
  return firstLine;
};

const RedditTableData = () => {
  const tableData = [
    {
      post: (
        <div>
          <div className="font-bold text-gray-800">Why is the food so horrible in Airlie Beach?</div>
          <div className="text-gray-600 text-sm">
            {truncateText("My friend and I have been in Airlie for 5 days now, and have eaten approximately 8 meals at 8 different restaurants. All have been tasteless and stale.")}
          </div>
        </div>
      ),
      revenue: "18,200",
      sales: "450,600",
      actions: (
        <div className="flex items-center gap-3">
          <ReplyButton text="Reply" iconID="external-link" />
        </div>
      )
    },
    {
      post: (
        <div>
          <div className="font-bold text-gray-800">Holiday Shopping Guide</div>
          <div className="text-gray-600 text-sm">
            {truncateText("holidayguide.com/shopping")}
          </div>
        </div>
      ),
      revenue: "12,800",
      sales: "320,400",
      actions: (
        <div className="flex items-center gap-3">
          <ReplyButton text="Reply" iconID="external-link" />
        </div>
      )
    },
    {
      post: (
        <div>
          <div className="font-bold text-gray-800">Black Friday Specials</div>
          <div className="text-gray-600 text-sm">
            {truncateText("blackfriday.com/specials")}
          </div>
        </div>
      ),
      revenue: "9,600",
      sales: "280,200",
      actions: (
        <div className="flex items-center gap-3">
          <ReplyButton text="Reply" iconID="external-link" />
        </div>
      )
    }
  ];

  const expandableData = [
    [
      {
        author: "running_enthusiast",
        timestamp: "2 hours ago",
        upvotes: 15,
        content: "These shoes look amazing! I've been looking for a good pair of running shoes. How do they perform on trails?",
        status: <StatusLabel text="Replied" variant="success" />
      },
      {
        author: "fitness_guru",
        timestamp: "1 hour ago",
        upvotes: 8,
        content: "I've had these for 6 months and they're still going strong. Great for both road and trail running.",
        status: <StatusLabel text="Replied" variant="success" />
      }
    ],
    [
      {
        author: "shopping_pro",
        timestamp: "3 hours ago",
        upvotes: 22,
        content: "This guide saved me so much money! The comparison charts are incredibly helpful.",
        status: <StatusLabel text="Replied" variant="success" />
      }
    ],
    [
      {
        author: "deal_hunter",
        timestamp: "4 hours ago",
        upvotes: 31,
        content: "Already got my cart ready for these deals. Can't wait for the sale to start!",
        status: <StatusLabel text="Replied" variant="success" />
      },
      {
        author: "budget_shopper",
        timestamp: "2 hours ago",
        upvotes: 12,
        content: "The early bird pricing is definitely worth it. I've been tracking these items for weeks.",
        status: <StatusLabel text="Replied" variant="success" />
      }
    ]
  ];

  return { tableData, expandableData };
};

export default RedditTableData;
