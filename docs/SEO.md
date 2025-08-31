# SEO Module Documentation

## Overview

The SEO module (internally referred to as "GEO" throughout the codebase) is a core feature in Cassius AI that helps businesses create search-engine-optimized content and track their search rankings. The module provides two main functionalities: **Search Term Tracking** and **SEO Blog Post Creation**.

## User Experience

### SEO Hub Landing Page

The SEO Hub (`/dashboard/geo`) serves as the central interface for all SEO activities:

1. **Search Terms Section**: Displays Google search ranking data for business-relevant keywords
2. **Blog Posts Section**: Lists and manages SEO-optimized blog posts with creation capabilities

### Search Term Tracking Flow

1. **Automatic Discovery**: Search terms are automatically generated based on business context during company initialization
2. **Real-time Ranking**: Each term shows current Google search ranking (1-20 or "20+")
3. **Interactive Terms**: Clicking any search term opens a Google search for that term in a new tab
4. **Visual Ranking System**: Color-coded ranking indicators with consistent styling

### Blog Post Creation & Management Flow

1. **Manual Creation**: Click the "+" button to create a new blog post
2. **AI-Powered Content**: New blog posts are automatically populated with SEO-optimized content via streaming
3. **Rich Editor**: Full-featured blog post editor with title editing, markdown content, and live preview
4. **Content Management**: Edit, save, and delete blog posts with optimistic UI updates
5. **SEO Optimization**: All content is generated with search engine optimization in mind

### Key User Benefits

- **Automated SEO Intelligence**: AI generates search terms and optimized content based on business context
- **Real-time Search Rankings**: Live tracking of Google search positions for relevant keywords
- **Professional Blog Content**: AI creates 700-900 word SEO-optimized blog posts in markdown format
- **Streamlined Publishing**: Easy-to-use editor with live preview and auto-save functionality
- **Performance Tracking**: Monitor search term rankings and content performance over time

## Frontend Architecture

### Component Structure

```plaintext
src/pages/GEO.jsx                    # Main SEO hub page
src/pages/BlogPostEditorPage.jsx     # Blog post editor interface
src/components/
├── GeoBlogTile.jsx                  # Individual blog post display
├── SearchTerm.jsx                   # Search term ranking display
├── TextEdit.jsx                     # Blog editor text input
├── Preview.jsx                      # Blog content preview
└── DeletePopup.jsx                  # Delete confirmation modal

src/hooks/
├── useGeoBlogPosts.js              # Fetch blog posts
├── useCreateBlogPost.js            # Create new blog post
├── useUpdateBlogPost.js            # Update existing blog post
└── useDeleteBlogPost.js            # Delete blog post
```

### Main Components

#### `GEO.jsx` - SEO Hub Page

The primary interface for SEO functionality, displaying search terms and blog posts.

**Key Features:**

- React Query for data fetching with 5-minute cache
- Search terms fetched from `/companies/search-terms`
- Blog posts fetched via `useGeoBlogPosts` hook
- Optimistic UI updates for blog post creation
- Real-time cache prefetching for faster navigation

**State Management:**

```javascript
// Search terms query
const { data: searchTerms, isLoading: isLoadingTerms, error: termsError } = useQuery({
  queryKey: ['geoSearchTerms'],
  // ... configuration
});

// Blog posts query via custom hook
const { data: blogPosts, isLoading, error } = useGeoBlogPosts();

// Blog creation mutation
const createBlogPostMutation = useCreateBlogPost();
```

**Navigation & Caching:**

- Pre-fetches blog post data before navigation for instant loading
- Optimistically updates cache when creating new blog posts
- Direct navigation to editor using blog post slug

#### `BlogPostEditorPage.jsx` - Content Editor

Rich blog post editor with streaming content support and auto-save functionality.

**Key Features:**

- Real-time content streaming for AI-generated posts
- Auto-save functionality for streamed content
- Manual save with change detection
- Live preview with markdown rendering
- Slug-based routing and caching
- Loading states and error handling

**Streaming Content System:**

```javascript
// Monitor localStorage for streaming content updates
const startContentStream = () => {
  const interval = setInterval(async () => {
    const currentContent = localStorage.getItem(`blogPostContent_${blogPost.slug}`);
    if (currentContent && newContentLength !== lastContentLength) {
      setContent(currentContent);
      // Auto-save when streaming completes
      await autoSaveBlogPost(currentContent);
    }
  }, 100);
};
```

**State Management:**

```javascript
const [content, setContent] = useState('');
const [title, setTitle] = useState('');
const [isEditing, setIsEditing] = useState(true);
const [isReceivingContent, setIsReceivingContent] = useState(false);
const [isManualSaving, setIsManualSaving] = useState(false);
```

#### `SearchTerm.jsx` - Ranking Display Component

Displays individual search terms with ranking information and Google search integration.

**Features:**

- **Ranking Display**: Shows numerical rank (1-20) or "20+" for unranked terms
- **Color System**: Three-color palette based on term hash for consistent visual identity
- **Interactive Search**: Clicking opens Google search in new tab
- **Consistent Styling**: Rounded pills with rank badges

**Color Generation:**

```javascript
const getColors = (text) => {
  const colors = [
    { bg: '#2C4068', text: '#FFFFFF' },      // Dark navy blue
    { bg: '#90C8E8', text: '#2C4068' },      // Light sky blue  
    { bg: '#F09640', text: '#FFFFFF' }       // Medium orange
  ];
  // Hash-based color selection for consistency
};
```

#### `GeoBlogTile.jsx` - Blog Post Display

Individual blog post card with formatted date display and click navigation.

**Features:**

- **Smart Date Formatting**: Relative dates (Today, Yesterday, X days ago, etc.)
- **Hover Effects**: Interactive styling for better UX
- **Consistent Layout**: Title, date, and status information
- **Navigation Ready**: Optimized for quick editor access

### React Query Integration

#### Cache Keys & Configuration

```javascript
// Primary cache keys
['geoSearchTerms']     // Search terms data
['geoBlogPosts']       // Blog posts list
['blogPost', slug]     // Individual blog post by slug

// Cache configuration
staleTime: 5 * 60 * 1000        // 5 minutes
refetchOnWindowFocus: false      // Disabled for better UX
```

#### Optimistic Updates

```javascript
// Blog post creation - immediate cache update
queryClient.setQueryData(['geoBlogPosts'], (oldData) => {
  if (!oldData) return [newBlogPost];
  return [newBlogPost, ...oldData];
});

// Pre-fetch individual blog post for instant editor loading
queryClient.setQueryData(['blogPost', newBlogPost.slug], newBlogPost);
```

### Custom Hooks

#### `useGeoBlogPosts()`

Fetches and manages blog posts list with authentication and error handling.

```javascript
export const useGeoBlogPosts = () => {
  return useQuery({
    queryKey: ['geoBlogPosts'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.geoBlogPosts, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
```

#### `useCreateBlogPost()`

Handles blog post creation with cache invalidation.

```javascript
export const useCreateBlogPost = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(API_ENDPOINTS.createBlogPost, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['geoBlogPosts']);
    }
  });
};
```

#### `useUpdateBlogPost()` & `useDeleteBlogPost()`

Manage blog post updates and deletion with comprehensive cache management.

## API Integration

### Endpoints

| Method | Endpoint | Description | Frontend Usage |
|--------|----------|-------------|----------------|
| GET | `/companies/blog_posts` | Fetch all blog posts | `useGeoBlogPosts` hook |
| GET | `/companies/blog_posts/{id}` | Get blog post by ID | Individual post fetching |
| GET | `/companies/blog_posts/slug/{slug}` | Get blog post by slug | Editor page data loading |
| POST | `/companies/create-blog-post` | Create new blog post | `useCreateBlogPost` hook |
| POST | `/companies/update-blog-post` | Update blog post | `useUpdateBlogPost` hook |
| DELETE | `/companies/delete-blog-post` | Delete blog post | `useDeleteBlogPost` hook |
| GET | `/companies/search-terms` | Fetch search terms | SEO Hub search terms |

### API Configuration

Located in `src/config/api.js`:

```javascript
{
  geoBlogPosts: `${API_BASE_URL}/companies/blog_posts`,
  createBlogPost: `${API_BASE_URL}/companies/create-blog-post`,
  updateBlogPost: `${API_BASE_URL}/companies/update-blog-post`,
  deleteBlogPost: `${API_BASE_URL}/companies/delete-blog-post`,
  getBlogPost: `${API_BASE_URL}/companies/blog_posts`,
  geoSearchTerms: `${API_BASE_URL}/companies/search-terms`
}
```

## Backend Integration

### Database Schema

#### `search_terms` Table

Stores Google search ranking data for business-relevant keywords.

```sql
CREATE TABLE search_terms (
    id VARCHAR PRIMARY KEY,
    term VARCHAR NOT NULL,           -- Search keyword/phrase
    rank INTEGER,                    -- Google search ranking (1-20, NULL if >20)
    company_id VARCHAR NOT NULL      -- Foreign key to companies table
);
```

#### `blog_posts` Table

Stores SEO-optimized blog content with metadata.

```sql
CREATE TABLE blog_posts (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,          -- Blog post title
    slug VARCHAR NOT NULL UNIQUE,    -- URL-friendly slug
    content TEXT NOT NULL,           -- Markdown blog content
    company_id VARCHAR NOT NULL,     -- Foreign key to companies table
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Backend Services

#### SEO Initialization (`backend/src/features/geo/services.py`)

**Key Functions:**

1. **`init_geo()`**: Company initialization function
   - Generates 10 business-relevant search terms using AI
   - Fetches Google search rankings for each term
   - Creates 2 initial SEO-optimized blog posts (800-1200 words each)
   - All content based on business context from company profile

2. **`get_search_terms()`**: AI-powered search term generation
   - Uses GPT-4 to analyze business context
   - Generates relevant search terms users would use to find the business
   - Excludes company name to focus on product/service searches

3. **`get_initial_blog_posts()`**: Creates comprehensive starter blog content
   - Generates 2 professional SEO-optimized blog posts using AI
   - Posts are 800-1200 words each with proper H2/H3 structure
   - Titles optimized for search engines (under 60 characters)
   - Content includes educational value and call-to-actions

#### Blog Management Services

**1. Blog Post CRUD Operations:**

```python
async def create_blog_post(user_id: str, db: AsyncSession):
    # Creates blog post with unique title and slug
    # Returns immediately for streaming content population
    
async def update_blog_post(user_id: str, payload: BlogPostUpdateRequest, db: AsyncSession):
    # Updates title and/or content
    # Regenerates slug if title changes
    # Validates user permissions

async def delete_blog_post(user_id: str, blog_post_id: str, db: AsyncSession):
    # Deletes blog post with permission validation
```

**2. Slug Management:**

```python
def create_slug_from_title(title: str) -> str:
    # Converts title to URL-friendly slug
    # Handles special characters, spaces, and duplicates
    # Returns "untitled-blog-post" as fallback
```

#### Search Ranking Integration

**Google Custom Search API Integration:**

Located in `backend/src/features/geo/search_terms.py`:

```python
def find_site_rank_google_api(query: str, target_url: str, num_results: int = 20):
    # Fetches first 2 pages (20 results) from Google Custom Search
    # Matches against company website URL
    # Returns rank (1-20) or None if not found
    # Supports both exact URL matching and domain-level matching
```

**Features:**
- **Domain Normalization**: Handles www, https, trailing slashes
- **Registered Domain Matching**: Matches blog.example.com with example.com
- **Two-Page Search**: Covers top 20 Google results
- **Timeout Protection**: 10-second request timeout
- **Error Resilience**: Continues if API calls fail

### AI-Powered Content Generation

#### Enhanced Chat Integration for Blog Creation

SEO blog posts can be created through the chat interface using the `CREATE_GEO_BLOG` intent with comprehensive SEO optimization:

```python
async def create_geo_blog_post_stream(payload: ChatMessageRequest, user_id: str):
    # 1. Extract comprehensive business context (company name, core business, etc.)
    # 2. Create empty blog post in database
    # 3. Generate SEO-optimized content with structured business information
    # 4. Dynamic word count (800-1200 or 1500-2000 based on topic complexity)
    # 5. Include proper headings, internal/external links, and CTAs
    # 6. Generate SEO title and meta description
    # 7. Returns professionally formatted markdown content
```

**Enhanced SEO Features:**
- **Business Context Integration**: Uses structured company profile information
- **Keyword Optimization**: Natural integration of primary and secondary keywords
- **Professional Structure**: H1/H2/H3 headings with keyword-rich titles
- **Link Strategy**: Internal links to company website and external authority links
- **Call-to-Action**: Customized CTAs based on business type and goals
- **Meta Optimization**: SEO title (~60 chars) and meta description (~155 chars)

**Streaming Protocol:**
- `---CACHE_BLOG_POST:{id}:{slug}:{title}---` - Cache new post
- `---REDIRECT_BLOG_POST_EDITOR:{slug}---` - Navigate to editor  
- `---LOAD_STREAM_BLOG_POST_EDITOR:{slug}---` - Start content streaming
- `---STREAM_START---` - Begin content delivery
- Content chunks streamed in real-time
- `---STREAM_END---` - Completion signal

### Google Search Integration

#### Search Term Discovery Process

1. **Business Analysis**: AI analyzes company description, website summary, and business context
2. **Keyword Generation**: GPT-4 generates 10 relevant search terms
3. **Ranking Check**: Google Custom Search API checks current rankings
4. **Database Storage**: Terms and rankings stored for tracking

#### Ranking Update System

Search rankings are fetched during company initialization and can be refreshed through:
- Manual ranking updates (planned feature)
- Periodic background jobs (planned feature)
- API-triggered updates

## Data Flow

### Company Initialization Flow

```plaintext
Company Creation → init_geo() → AI Search Term Generation
                            → Google Ranking Check
                            → 2 Initial Blog Posts Creation
                            → Database Storage
                            → SEO Hub Ready
```

### Blog Post Creation Flow

```plaintext
User Creates Post → Empty Post in DB → AI Content Streaming
                                   → Real-time Editor Updates  
                                   → Auto-save When Complete
                                   → Published Blog Post
```

### Search Term Ranking Flow

```plaintext
Business Context → AI Term Generation → Google Custom Search API
                                    → Ranking Analysis (1-20)
                                    → Database Storage
                                    → SEO Hub Display
```

## Streaming Content System

### Frontend Streaming Implementation

The blog editor uses a sophisticated streaming system for AI-generated content:

**1. Content Monitoring:**
```javascript
// Check localStorage every 100ms for new content
const interval = setInterval(async () => {
  const currentContent = localStorage.getItem(`blogPostContent_${blogPost.slug}`);
  if (currentContent && contentChanged) {
    setContent(currentContent);
    // Auto-save when streaming stops
  }
}, 100);
```

**2. Auto-Save Logic:**
- Detects when streaming completes (no updates for 1 second)
- Automatically saves content to database
- Cleans up localStorage
- Updates UI state

**3. Streaming States:**
- `isReceivingContent` - Tracks active streaming
- Content length monitoring for completion detection
- Fallback mechanisms for failed streams

### Backend Streaming Architecture

**1. SSE Stream Generation:**
```python
async def create_geo_blog_post_stream():
    # Create empty blog post
    yield f"---CACHE_BLOG_POST:{post.id}:{post.slug}:{post.title}---"
    
    # Stream AI content
    async for chunk in openai_stream:
        yield chunk.choices[0].delta.content
    
    yield f"---STREAM_END---"
```

**2. Content Optimization:**
- Business context integration
- 700-900 word target length
- SEO-focused prompts
- Markdown formatting

## Security & Performance

### Security Measures

1. **Authentication**: All endpoints require Bearer token authentication
2. **User Isolation**: Blog posts and search terms isolated by company
3. **Permission Validation**: CRUD operations verify user-company relationship
4. **Input Sanitization**: Blog content and titles properly escaped
5. **API Rate Limiting**: Google Custom Search API usage controlled

### Performance Optimizations

1. **React Query Caching**: 5-minute stale time reduces API calls
2. **Optimistic Updates**: Immediate UI feedback for better UX
3. **Pre-fetching**: Blog posts pre-loaded before navigation
4. **Lazy Loading**: Search terms loaded on-demand
5. **Content Streaming**: Real-time content delivery without blocking
6. **Slug-based Routing**: SEO-friendly URLs with fast lookups
7. **Database Indexing**: Company-based queries optimized

## Error Handling

### Frontend Error Management

1. **Network Errors**: Retry mechanisms with user feedback
2. **Authentication Failures**: Automatic redirect to login
3. **Content Loading**: Graceful fallbacks and loading states
4. **Streaming Failures**: Fallback to manual content creation
5. **Cache Errors**: Local state management with error boundaries

### Backend Error Responses

```python
# Standard error format
{
    "detail": "Error message"
}

# HTTP Status Codes
400: Bad Request (validation errors)
401: Unauthorized (auth failures)  
403: Forbidden (permission denied)
404: Not Found (resource missing)
500: Internal Server Error
```

### Specific Error Scenarios

**Blog Post Management:**
- Duplicate title prevention
- Permission validation for all operations
- Graceful handling of missing blog posts
- Slug generation collision resolution

**Search Term Management:**
- Google API failure handling
- Rate limit management
- Domain matching edge cases

## Environment Configuration

### Required Environment Variables

**Backend:**
```bash
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CSE_API_KEY=your_google_custom_search_api_key  
GOOGLE_CSE_ID=your_custom_search_engine_id
```

**Frontend:**
```bash
VITE_API_BASE_URL=your_backend_api_url
```

### Google Custom Search Setup

1. Create Google Cloud Project
2. Enable Custom Search API
3. Create Custom Search Engine
4. Configure search parameters
5. Add API credentials to environment

## Future Enhancements

### Planned Features

1. **Advanced SEO Analytics:**
   - Ranking history tracking
   - Keyword performance metrics
   - Content performance analysis
   - Competitor comparison

2. **Content Optimization:**
   - SEO score calculation
   - Keyword density analysis
   - Meta description generation
   - Social media preview optimization

3. **Automated Publishing:**
   - Direct website integration
   - WordPress plugin support
   - Scheduled publishing
   - Multi-platform distribution

4. **Enhanced Search Tracking:**
   - Additional search engines (Bing, Yahoo)
   - Local search tracking
   - Mobile vs desktop rankings
   - Geographic ranking variations

5. **Content Management:**
   - Blog post categories and tags
   - Content calendar integration
   - Template system
   - Bulk operations

### Technical Improvements

1. **Real-time Features:**
   - WebSocket integration for live updates
   - Real-time collaboration
   - Live preview during streaming

2. **Performance Enhancements:**
   - Content CDN integration
   - Image optimization
   - Lazy loading improvements
   - Background sync capabilities

3. **SEO Intelligence:**
   - Automated keyword suggestions
   - Content gap analysis
   - Backlink tracking
   - Site speed monitoring

## Testing Considerations

### Unit Tests

- **Frontend Components**: Component rendering, state management, error handling
- **Custom Hooks**: Data fetching, caching, mutations
- **Utility Functions**: Date formatting, slug generation, content processing
- **Backend Services**: CRUD operations, AI integration, ranking algorithms

### Integration Tests

- **API Endpoints**: Full request/response cycles
- **Database Operations**: CRUD with relationship validation
- **Search Integration**: Google API interaction
- **Streaming System**: Content delivery and auto-save

### E2E Tests

- **Complete SEO Workflow**: Search term discovery → Blog creation → Content editing
- **User Journey Testing**: Navigation, error recovery, performance
- **Cross-browser Compatibility**: Different browsers and devices

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliance for ranking displays
- **Focus Management**: Proper focus handling in modals and navigation
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces

---

*This documentation provides a comprehensive overview of the SEO module implementation, covering both the user-facing features and the underlying technical architecture that powers search engine optimization capabilities in Cassius AI.*