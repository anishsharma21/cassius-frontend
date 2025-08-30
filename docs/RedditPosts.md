# Reddit Post Generation Feature

## ✅ FEATURE COMPLETE

This comprehensive feature allows users to generate AI-powered Reddit posts for their business with real-time streaming, editing capabilities, and full post management.

## User Experience

### How It Works for Users

1. **Navigate to Posts Tab**: Go to Reddit Hub → Posts tab
2. **Select Subreddit**: Choose from pre-configured subreddits (8 default subreddits added automatically on signup)
3. **Add Context** (Optional): Provide additional context or specific points to emphasize
4. **Generate Post**: Click "Generate Post" to start AI-powered creation
5. **Watch Real-time Generation**: Content streams live in both the main interface and SideChat
6. **Review Generated Content**: AI creates both title and body content formatted for Reddit
7. **Edit if Needed**: Use the built-in editor to modify title and content
8. **Preview Post**: View Reddit-style preview to see how it will appear
9. **Manage Status**: Mark as "Posted" after manually posting to Reddit

### Key User Benefits

- **Authentic Content**: AI generates genuine, valuable posts that naturally promote the business
- **Real-time Feedback**: Watch content being generated with streaming updates
- **Full Control**: Edit, preview, and manage all generated posts
- **Business Context**: Automatically uses stored business context for relevant content
- **Post History**: Track all generated posts with status management

## Technical Architecture

### System Overview

The Reddit Post Generation feature is built as a full-stack implementation with:

- **Backend**: Python/FastAPI with SQLAlchemy ORM
- **Frontend**: React with custom hooks and real-time streaming
- **Database**: PostgreSQL with two new tables
- **AI Integration**: OpenAI GPT-4 with streaming responses
- **Real-time Updates**: Server-sent events and custom events for SideChat

### Business Logic

- **Default Subreddits**: 8 default subreddits automatically added on user signup (startups, entrepreneur, smallbusiness, business, marketing, SaaS, webdev, programming)
- **Business Context Integration**: Uses existing `get_app_context()` to pull user's business context for personalized content
- **Post Lifecycle**: Posts start as "draft" status, can be marked "posted" by user after manual posting to Reddit
- **Content Format**: AI generates both title and body content in structured format
- **Authenticity**: Posts designed to provide genuine value while naturally promoting the business

## Database Schema

Two new tables were added via Alembic migration `7f92f224a4c9`:

### `user_subreddits` Table

Stores user's target subreddits for post generation.

```sql
CREATE TABLE user_subreddits (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    subreddit_name VARCHAR(100) NOT NULL,
    subscriber_count INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, subreddit_name),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### `reddit_generated_posts` Table

Stores all AI-generated Reddit posts with full metadata.

```sql
CREATE TABLE reddit_generated_posts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    subreddit_name VARCHAR(100) NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    user_description TEXT, -- Additional context from user
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'posted'
    business_context TEXT, -- Snapshot of business context used
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Implementation Details

### Backend Files Modified/Created

#### `backend/src/features/reddit/models.py`

Added two new SQLAlchemy models:

- `UserSubreddit`: Manages user's target subreddits with activation status
- `RedditGeneratedPost`: Stores generated posts with full metadata and status tracking

#### `backend/src/features/reddit/schemas.py`

Added Pydantic schemas for API validation:

- `UserSubredditResponse`: Response format for subreddit data
- `GeneratePostRequest`: Request format for post generation
- `RedditPostGenerateResponse`: Response format for generated posts
- `UpdatePostRequest`: Request format for post updates
- `PostHistoryResponse`: Response format for paginated post history

#### `backend/src/features/reddit/services.py`

Added 8 new service functions:

- `get_user_subreddits()`: Fetch user's configured subreddits for dropdown
- `add_default_subreddits_for_user()`: Add 8 default subreddits on signup
- `generate_reddit_post_stream()`: AI-powered streaming post generation using GPT-4
- `parse_generated_post()`: Parse AI response into title and content
- `save_generated_post()`: Save generated content to database
- `update_generated_post()`: Edit existing posts with optimistic locking
- `get_user_generated_posts()`: Paginated post history with count
- `mark_post_as_posted()`: Update post status to "posted"

#### `backend/src/features/reddit/routes.py`

Added 5 new FastAPI endpoints:

- `GET /reddit/user-subreddits`: Get user's subreddits for dropdown
- `POST /reddit/generate-post`: Generate new post with streaming response
- `GET /reddit/generated-posts`: Get paginated post history
- `PUT /reddit/generated-posts/{id}`: Update existing post
- `POST /reddit/generated-posts/{id}/mark-posted`: Mark post as posted

#### `backend/src/features/user_auth/services.py`

Modified the `signup()` function to automatically add default subreddits for new users.

### API Endpoints

| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| GET | `/reddit/user-subreddits` | Get user's configured subreddits | Returns active subreddits for dropdown |
| POST | `/reddit/generate-post` | Generate new Reddit post | **Streaming response**, auto-saves to DB |
| GET | `/reddit/generated-posts` | Get user's generated posts | **Paginated**, includes status and metadata |
| PUT | `/reddit/generated-posts/{id}` | Update generated post | Edit title, content, description |
| POST | `/reddit/generated-posts/{id}/mark-posted` | Mark post as manually posted | Status management |

### Frontend Files Created/Modified

#### `frontend/src/config/api.js`

Added 5 new API endpoint configurations:

- `userSubreddits`: Get user's configured subreddits
- `generatePost`: Generate new Reddit post with streaming
- `generatedPosts`: Get paginated post history
- `updateGeneratedPost`: Update existing post
- `markPostAsPosted`: Mark post as posted

#### `frontend/src/hooks/useUserSubreddits.js` *(New File)*

Custom hook for subreddit management:

- Fetches user's active subreddits for dropdown population
- Handles loading and error states
- Includes refetch functionality

#### `frontend/src/hooks/useGeneratePost.js` *(New File)*

Custom hook for post generation with streaming:

- Manages streaming post generation with server-sent events
- Integrates with SideChat via custom events
- Handles chunk processing and completion callbacks
- Includes comprehensive error handling

#### `frontend/src/hooks/useGeneratedPosts.js` *(New File)*

Custom hook for post history management:

- Fetches paginated post history
- Supports optimistic updates for new posts
- Includes loading states and error handling
- Provides helper functions for adding/updating posts

#### `frontend/src/hooks/useUpdatePost.js` *(New File)*

Custom hook for post modifications:

- Handles post editing with API integration
- Manages "Mark as Posted" functionality
- Includes loading states and error handling

#### `frontend/src/pages/Reddit/Reddit.jsx`

Modified existing Reddit component to add Posts tab functionality:

- **PostsTabContent Component**: Complete post generation interface with:
  - Generation form with subreddit dropdown and context input
  - Real-time streaming display during generation
  - Post history table with status badges
  - Edit modal for post content modification
  - **Reddit-style preview modal** with authentic Reddit UI
- **Tab System**: Enhanced existing tab system to include Posts tab with dynamic count
- **State Management**: Comprehensive state management for all post operations

### Key Frontend Features

#### Real-time Streaming UI

- Live content display during AI generation
- Progress indicators and loading states
- Integration with SideChat for dual-display streaming

#### Post Management Interface

- **Edit Modal**: Full-featured editor for title and content
- **Preview Modal**: Reddit-style preview with authentic styling
- **Status Management**: Visual status badges and action buttons
- **History Table**: Paginated display with post metadata

#### SideChat Integration

- Custom events for streaming integration (`redditReplyPrompt`, `redditReplyStream`)
- Real-time content streaming to chat interface
- Completion and error handling through custom events

## How It Works (Technical Flow)

### 1. User Registration

When a user signs up, the system automatically:

- Calls `add_default_subreddits_for_user()` in the signup flow
- Adds 8 default subreddits to their `user_subreddits` table
- Makes them immediately available for post generation

### 2. Post Generation Process

1. **User Input**: User selects subreddit and provides optional context
2. **API Call**: Frontend calls `POST /reddit/generate-post` with streaming
3. **Business Context**: Backend retrieves user's business context via `get_app_context()`
4. **AI Generation**: OpenAI GPT-4 generates content with structured prompt
5. **Streaming Response**: Content streams via server-sent events to both main UI and SideChat
6. **Parsing**: Backend parses response into title and content using `parse_generated_post()`
7. **Database Storage**: Post automatically saved to `reddit_generated_posts` table
8. **UI Updates**: Frontend updates post history and shows generated content

### 3. Real-time Integration

- **Main UI**: Direct streaming display with progress indicators
- **SideChat**: Custom events (`redditReplyPrompt`, `redditReplyStream`) for parallel streaming
- **State Sync**: Both interfaces stay synchronized during generation

### 4. Post Management

- **Edit**: Users can modify title and content via modal interface
- **Preview**: Reddit-style preview modal shows authentic Reddit appearance
- **Status Tracking**: Posts move from "draft" to "posted" status
- **History**: Paginated post history with metadata and actions

## Feature Completeness

### ✅ Fully Implemented Components

**Backend (Python/FastAPI)**:

- ✅ Database schema and migration
- ✅ SQLAlchemy models with relationships
- ✅ Pydantic schemas for validation
- ✅ 8 service functions with business logic
- ✅ 5 REST API endpoints with streaming
- ✅ User registration integration

**Frontend (React)**:

- ✅ 4 custom hooks for API integration
- ✅ Complete UI components and forms
- ✅ Real-time streaming interface
- ✅ Post management and editing
- ✅ Reddit-style preview modal
- ✅ SideChat integration

**Integration**:

- ✅ Business context integration
- ✅ Real-time streaming via server-sent events
- ✅ Custom events for SideChat communication
- ✅ Comprehensive error handling
- ✅ Loading states and user feedback

## Future Enhancement Opportunities

### Direct Reddit API Integration

- **PRAW Integration**: Use Python Reddit API Wrapper for direct posting
- **OAuth Flow**: Implement Reddit authentication for seamless posting
- **Automatic Posting**: Post directly to Reddit without manual copy/paste
- **Engagement Tracking**: Monitor upvotes, comments, and performance metrics

### Advanced Features

- **Post Scheduling**: Queue posts for optimal timing
- **A/B Testing**: Test different versions of posts for better performance
- **Subreddit Research**: AI-powered subreddit discovery and recommendations
- **Analytics Dashboard**: Track post performance and engagement metrics
- **Template System**: Save and reuse successful post templates

### Automation & Intelligence

- **Smart Subreddit Discovery**: Automatically suggest relevant subreddits based on business context
- **Content Optimization**: Learn from successful posts to improve generation
- **Scheduled Generation**: Automatically generate posts on a schedule
- **Engagement Monitoring**: Real-time notifications for post performance

## Technical Architecture Notes

### Performance Considerations

- **Streaming Architecture**: Real-time content delivery via server-sent events
- **Database Optimization**: Proper indexing on `user_id` and `created_at` fields
- **Pagination**: Efficient pagination for post history
- **Caching Strategy**: User subreddits cached for better performance

### Security & Scalability

- **Input Validation**: All subreddit names validated to prevent injection
- **Rate Limiting**: Post generation protected against abuse
- **User Isolation**: Complete data isolation between users
- **Async Operations**: Non-blocking operations for all external API calls

### Integration Points

- **Business Context**: Seamless integration with existing `get_app_context()` system
- **SideChat**: Real-time streaming integration with existing chat infrastructure
- **User Registration**: Automatic setup during user onboarding flow

---

*This documentation serves as the comprehensive reference for the Reddit Post Generation feature - from user experience to technical implementation details.*
