# RedditTableData - Backend Integration Ready

This component now contains only pure data without any UI components, making it ready for backend integration.

## Data Structure

### Table Data
Each post in `tableData` contains:
```javascript
{
  postTitle: "String - The title of the Reddit post",
  postUrl: "String - URL to the Reddit post",
  fullPostContent: "String - Full content of the post",
  post_upvotes: "String - Number of upvotes",
  post_comments: "String - Number of comments"
}
```

### Expandable Data
Each comment in `expandableData` contains:
```javascript
{
  timestamp: "String - When the comment was posted",
  upvotes: "Number - Number of upvotes on the comment",
  comments: "Number - Number of replies to the comment",
  content: "String - The comment content"
}
```

## Backend Integration

### API Response Format
Your backend API should return data in this exact format:

```javascript
// GET /api/reddit/posts
{
  "tableData": [
    {
      "postTitle": "Why is the food so horrible in Airlie Beach?",
      "postUrl": "https://www.reddit.com/r/example/comments/123",
      "fullPostContent": "Full post content here...",
      "post_upvotes": "18",
      "post_comments": "45"
    }
  ],
  "expandableData": [
    [
      {
        "timestamp": "2 hours ago",
        "upvotes": 15,
        "comments": 3,
        "content": "Comment content here..."
      }
    ]
  ]
}
```

### Usage in Frontend
The Reddit page transforms this pure data into UI components:
- `postTitle` + `postUrl` → Clickable link using `ClickableLink` component
- `post_upvotes` + `post_comments` → Displayed as-is
- `post_actions` → Generated dynamically with reply buttons
- `status` in comments → Generated dynamically with reply buttons

## Benefits

1. **Separation of Concerns**: Data is separate from presentation
2. **Backend Ready**: Easy to replace with API calls
3. **Maintainable**: UI logic is centralized in the Reddit page
4. **Testable**: Pure data is easier to test
5. **Flexible**: Easy to modify data structure without touching UI
