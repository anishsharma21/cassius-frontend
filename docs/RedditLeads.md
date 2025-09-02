# Reddit Leads Discovery & Engagement Feature

## Overview

The Reddit Leads feature automatically discovers and surfaces potential customers from Reddit who are discussing topics relevant to your business. It uses AI-powered search and filtering to identify high-value engagement opportunities, presenting them in a streamlined interface for easy response generation and tracking.

## User Experience

### How It Works for Users

1. **Automatic Discovery**: Leads are automatically discovered when a company is created
2. **Navigate to Reddit Hub**: Go to Reddit Hub → Leads tab to view discovered leads
3. **Browse Leads**: View paginated list of Reddit posts identified as potential leads
4. **View Details**: Expand posts to see associated comments
5. **Generate Replies**: Click "Reply" to generate AI-powered responses
6. **Edit & Customize**: Modify generated replies to match your voice
7. **Copy & Engage**: Copy the reply and go directly to Reddit
8. **Track Progress**: Mark leads as "replied to" for engagement tracking
9. **Monitor Metrics**: View total leads and reply progress in real-time

### Key User Benefits

- **Automated Discovery**: No manual searching - leads are found automatically
- **Pre-filtered Quality**: AI filters ensure only relevant leads are shown
- **Recent-First Ordering**: Most recent Reddit posts appear first for timely engagement
- **Context-Aware Replies**: Generated responses use your business context
- **Engagement Tracking**: Monitor which leads have been replied to
- **Time Efficiency**: Streamlined workflow from discovery to engagement
- **Metrics Dashboard**: Real-time tracking of lead engagement progress

## Technical Architecture

### System Overview

The Reddit Leads feature consists of:

- **Backend**: Python/FastAPI with async background tasks
- **Discovery Engine**: Google Search API + Reddit API (PRAW)
- **AI Filtering**: OpenAI GPT-4 for relevance filtering
- **Database**: PostgreSQL with JSONB for flexible context storage
- **Frontend**: React with React Query for data fetching
- **Real-time Updates**: Optimistic UI updates with backend sync

### Data Flow Architecture

```
Company Creation
       ↓
Background Task: init_reddit()
       ↓
Generate Search Queries (AI)
       ↓
Search Google for Reddit Links
       ↓
Fetch Reddit Posts + Comments
       ↓
Filter with AI for Relevance
       ↓
Store in reddit_leads Table
       ↓
API: GET /reddit/next-10-posts
       ↓
Frontend Display (Paginated)
```

## Database Schema

### `reddit_leads` Table

Stores discovered Reddit posts and comments identified as potential leads.

```sql
CREATE TABLE reddit_leads (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_type ENUM('POST', 'COMMENT') NOT NULL,
    score INTEGER NOT NULL,              -- Reddit upvotes
    num_comments INTEGER NOT NULL,       -- Comment count
    created_at TIMESTAMP NOT NULL,       -- Reddit creation time
    link VARCHAR NOT NULL,                -- Reddit URL
    context JSONB NOT NULL,              -- Flexible context data
    body TEXT NOT NULL,                   -- Post/comment content
    replied_to BOOLEAN DEFAULT FALSE,     -- Engagement status
    company_id VARCHAR NOT NULL,         -- Multi-tenancy
    
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

### Context Field Structure

For **Posts**:

```json
{
  "post_id": "abc123"
}
```

For **Comments**:

```json
{
  "post_id": "abc123",
  "comment_ids": ["def456", "ghi789"]
}
```

## Implementation Details

### Backend Components

#### Lead Discovery Process (`backend/src/features/reddit/services.py`)

**1. Query Generation**

```python
async def generate_search_queries(business_context: str, num_queries: int = 10)
```

- Uses OpenAI to generate relevant search queries
- Based on business context and target market
- Returns list of optimized search terms

**2. Reddit Link Discovery**

```python
async def google_search_reddit_links(query: str, num_links: int = 10)
```

- Uses Google Discovery Engine API
- Searches specifically for Reddit discussions
- Returns relevant Reddit post URLs

**3. Content Fetching**

```python
async def fetch_post_with_comments(url: str)
```

- Uses PRAW (Python Reddit API Wrapper)
- Fetches post content and top 5 comments
- Includes metadata (scores, timestamps, etc.)

**4. AI Filtering**

```python
async def filter_reddit_posts_llm(list_of_post_titles: list, business_context: str)
```

- Uses GPT-4 to identify relevant leads
- Filters based on business context
- Returns only high-potential leads

**5. Database Storage**

```python
async def _save_reddit_objects(company_id: str, new_objects: List[Dict])
```

- Batch inserts leads into database
- Uses PostgreSQL upsert for idempotency
- Maintains data integrity

#### API Endpoints (`backend/src/features/reddit/routes.py`)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/reddit/next-10-posts` | Get paginated Reddit leads (sorted by recency) | Posts array, counts |
| GET | `/reddit/comments` | Get comments for a post (sorted by recency) | Comments array |
| PUT | `/reddit/update-replied-to` | Update lead reply status | Success status |
| POST | `/reddit/generate-reply` | Generate AI reply | Streaming response |

### Frontend Components

#### Data Fetching Hook (`frontend/src/hooks/useRedditPosts.js`)

```javascript
export const useRedditPosts = (pageNumber = 1) => {
  return useQuery({
    queryKey: ['redditPosts', pageNumber],
    queryFn: async () => {
      // Fetches from /reddit/next-10-posts
      // Returns: { posts: [...], total_count: X, replied_count: Y }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

#### Main UI Component (`frontend/src/pages/Reddit/Reddit.jsx`)

**LeadsTabContent Component**:

- Displays paginated data table with recent posts first
- Shows post creation dates with relative time formatting
- Expandable rows for comments
- Reply button integration
- Real-time metric updates

**Key Features**:

- **Recent-First Display**: Posts sorted by creation time (newest first)
- **Date Column**: Shows "2h ago", "1d ago", or absolute dates for older posts
- **Optimistic Updates**: Local state updates before backend confirmation
- **Pagination**: Server-side pagination with 10 items per page
- **Expandable Content**: Click to view full post content and comments
- **Reply Management**: Integrated reply generation and tracking

#### Reply Generation Flow

1. **User Clicks Reply**: Triggers reply generation modal
2. **Context Gathering**: Sends post/comment content to backend
3. **AI Generation**: Backend generates context-aware reply
4. **Streaming Display**: Real-time display of generated content
5. **Edit Capability**: User can modify before copying
6. **Status Update**: Mark as replied when engagement complete

## Business Logic

### Lead Discovery Triggers

**Automatic Initialization**:

- Triggered during company creation
- Runs as background task via `asyncio.create_task()`
- No user intervention required

**Discovery Parameters**:

- Default: 10 search queries
- Default: 10 Reddit links per query
- Processes in sequential batches for efficiency

### Relevance Scoring

**AI Filtering Criteria**:

- Business context alignment
- Problem-solution fit
- Target audience match
- Engagement potential

**Ranking Factors**:

- **Post recency** (primary sort - most recent first)
- Reddit score (upvotes)
- Comment count
- Content relevance

### Reply Generation

**Context Components**:

- Business description
- Website URL
- User-provided context
- Original post/comment content

**Generation Strategy**:

- Authentic, value-first approach
- Natural business integration
- Community-appropriate tone
- Helpful, non-promotional style

## Performance & Scalability

### Optimization Strategies

**Backend**:

- Async/await for all I/O operations
- Batch database insertions
- Connection pooling for external APIs
- Background task processing

**Frontend**:

- React Query caching (5-minute stale time)
- Optimistic UI updates
- Paginated data loading
- Lazy loading for comments

### Rate Limiting & Quotas

**External APIs**:

- Google Discovery Engine: Project quotas apply
- Reddit API: 60 requests/minute via PRAW
- OpenAI: Standard rate limits apply

**Internal Protections**:

- Company-based data isolation
- User authentication required
- Pagination limits (10 items/page)

## Integration Points

### Company Creation Flow

```python
async def init_company_resources(company_id, ...):
    # Called during company creation
    asyncio.create_task(init_reddit(company_id, business_context))
```

### Business Context Integration

- Uses `get_app_context()` for user context
- Maintains context consistency across features
- Snapshot context stored with generated content

### Authentication & Authorization

- Bearer token authentication
- Company-based multi-tenancy
- User ID verification for all operations

## Monitoring & Metrics

### Key Metrics Tracked

**Lead Discovery**:

- Total leads discovered
- Leads per company
- Discovery success rate
- AI filtering accuracy

**User Engagement**:

- Reply rate (replied_count / total_count)
- Time to first reply
- Generated reply usage
- Lead conversion tracking

### UI Metrics Display

```jsx
<RedditMetrics 
  totalPosts={localTotalCount} 
  repliedPosts={localRepliedCount} 
/>
```

## Error Handling

### Backend Error Management

- Try-catch blocks for external API calls
- Graceful degradation for failed discoveries
- Detailed logging for debugging
- User-friendly error messages

### Frontend Error States

- Loading states during data fetching
- Error boundaries for component failures
- Retry mechanisms for failed requests
- User feedback for actions

## Future Enhancement Opportunities

### Advanced Discovery

- **Real-time Monitoring**: WebSocket updates for new leads
- **Custom Search Parameters**: User-defined discovery criteria
- **Subreddit Targeting**: Focus on specific communities
- **Competitor Monitoring**: Track competitor mentions

### Engagement Features

- **Bulk Reply Generation**: Generate multiple replies at once
- **Reply Templates**: Save and reuse successful replies
- **Direct Reddit Posting**: OAuth integration for direct posting
- **Follow-up Tracking**: Monitor reply engagement

### Analytics & Intelligence

- **Lead Scoring Model**: ML-based lead quality scoring
- **Conversion Tracking**: Monitor lead-to-customer journey
- **Reply Performance**: Track which replies drive engagement
- **Trend Analysis**: Identify emerging topics and opportunities

### Automation

- **Scheduled Discovery**: Regular lead refresh cycles
- **Auto-reply Suggestions**: Proactive reply recommendations
- **Workflow Automation**: Trigger actions based on lead characteristics
- **Integration Webhooks**: Connect with CRM and marketing tools

## Recent Updates (Latest)

### Chronological Sorting Implementation

**Backend Changes** (`backend/src/features/reddit/services.py`):

- Modified `get_next_10_posts()` to sort by `created_at DESC` instead of `score DESC`
- Updated `get_post_comments()` to use consistent chronological sorting
- Comments now also display in recent-first order

**Frontend Enhancements** (`frontend/src/pages/Reddit/`):

- Added "Posted" column to Reddit leads table
- Implemented smart date formatting:
  - "just now", "2m ago", "1h ago" for recent posts
  - "2d ago", "3d ago" for posts within a week
  - "Nov 15", "Dec 3" format for older posts
- Enhanced `RedditTableConfig.jsx` with new date column
- Added `formatPostDate()` helper function for relative time display

**User Experience Improvements**:

- **Freshest Leads First**: Users see the most recent discussions for timely engagement
- **Visual Date Context**: Clear indication of when posts were created
- **Better Engagement Timing**: Focus on recent conversations with higher engagement potential
- **Consistent Sorting**: Both posts and comments follow the same chronological order

This update ensures users engage with the freshest leads first, improving response timing and engagement success rates.

## Technical Notes

### Data Consistency

- Idempotent operations using PostgreSQL upserts
- UUID-based IDs for distributed systems compatibility
- JSONB for flexible schema evolution
- Proper foreign key constraints

### Security Considerations

- Input sanitization for all user inputs
- SQL injection prevention via parameterized queries
- Rate limiting on expensive operations
- Secure API key management

### Testing Recommendations

- Unit tests for discovery logic
- Integration tests for API endpoints
- Mock external API responses
- Frontend component testing

---

*This documentation provides a comprehensive overview of the Reddit Leads Discovery & Engagement feature, covering everything from user experience to technical implementation details.*
