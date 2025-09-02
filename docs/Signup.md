# Signup Flow Documentation

## Overview

The Cassius AI signup flow is a sophisticated multi-step process that creates a new user account and automatically initializes a complete marketing ecosystem tailored to the user's business. This document provides comprehensive technical documentation of all components, background tasks, and data flows involved in the signup process.

## Table of Contents

1. [User Experience Flow](#user-experience-flow)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Architecture](#backend-architecture)
4. [Background Task Orchestration](#background-task-orchestration)
5. [Data Flow Diagram](#data-flow-diagram)
6. [Service Initialization Details](#service-initialization-details)
7. [Error Handling & Recovery](#error-handling--recovery)
8. [Security Considerations](#security-considerations)
9. [Configuration & Environment](#configuration--environment)

## User Experience Flow

### Signup Form Options

Users can sign up through two distinct paths:

#### Path 1: With Website URL

1. User provides first name, email, password
2. User enters their company website URL
3. System automatically extracts company information from the website

#### Path 2: Without Website URL

1. User provides first name, email, password
2. User clicks "no website?" link
3. User manually enters:
   - Company name
   - Company description
   - Target market

### Post-Signup Journey

1. User receives JWT access token
2. Automatic redirect to `/dashboard`
3. **Real-time progress notifications** begin immediately via SSE connection
4. First-time users flagged with `isNewUser` localStorage flag
5. Redirected to Guide page for onboarding
6. **Background task progress** visible throughout via toast notifications

> **✨ New Feature**: The signup flow now includes real-time progress updates via Server-Sent Events (SSE). Users see immediate feedback as background tasks (like Reddit leads generation) progress, eliminating the need for page refreshes. See [SSE Real-Time Updates Documentation](SSE-RealTimeUpdates.md) for complete technical details.

## Frontend Implementation

### SignUp Component (`/frontend/src/pages/SignUp.jsx`)

#### State Management

```javascript
const [formData, setFormData] = useState({
  // User details
  first_name: '',
  email: '',
  password: '',
  website_url: 'https://',
  // Company details (optional)
  company_name: '',
  company_description: '',
  company_target_market: '',
});
```

#### Validation Logic

- **Email**: Valid email format required
- **Password**: Minimum 6 characters
- **Website URL**: Valid URL format or "No website yet"
- **Company Fields**: Required only when no website provided

#### API Request Structure

**With Website:**

```json
{
  "first_name": "John",
  "email": "john@example.com",
  "password": "securepassword",
  "company_website_url": "https://example.com"
}
```

**Without Website:**

```json
{
  "first_name": "John",
  "email": "john@example.com",
  "password": "securepassword",
  "company_name": "Example Corp",
  "company_description": "We provide...",
  "company_target_market": "Small businesses..."
}
```

#### Response Handling

```javascript
// Store authentication token
localStorage.setItem('access_token', data.access_token);

// Flag new user for onboarding
localStorage.setItem('isNewUser', 'true');

// Navigate to dashboard
navigate('/dashboard');
```

## Backend Architecture

### API Endpoint (`/users/signup`)

**Route Definition:** `/backend/src/features/user_auth/routes.py`

```python
@router.post("/signup", response_model=UserSignupResponse)
async def signup(user_data: UserSignupRequest, db: AsyncSession = Depends(get_db)):
    return await services.signup(user_data, db)
```

### Signup Service (`/backend/src/features/user_auth/services.py`)

The signup process involves several critical steps:

#### 1. User Creation

```python
async def signup(payload: UserSignupRequest, db: AsyncSession):
    # Check for existing user
    existing = await get_user_by_email(payload.email, db)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists.")
    
    # Create new user
    new_user = await create_user(
        payload.email, 
        payload.password, 
        payload.first_name, 
        db
    )
```

#### 2. Company Creation

```python
    # Create company with provided or extracted information
    new_company = await create_company(
        CompanyCreateRequest(
            user_id=new_user.id,
            website_url=payload.company_website_url,
            name=payload.company_name,
            description=payload.company_description,
            target_market=payload.company_target_market,
        ),
        db,
    )
    
    await db.commit()
```

#### 3. Context Warming

```python
    # Warm Redis cache with business context
    asyncio.create_task(warm_context_for(new_user.id))
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": new_user.email})
```

### Company Service (`/backend/src/features/company/services.py`)

The company creation process handles website analysis and resource initialization:

#### Website Analysis (if URL provided)

```python
async def create_company(payload: CompanyCreateRequest, db: AsyncSession):
    llm_website_summary = None
    
    if payload.website_url:
        # Fetch and analyze website content
        website_content = await fetch_website_content(payload.website_url)
        company_name, llm_website_summary = await get_website_info(
            website_content, 
            payload.website_url
        )
        payload.name = company_name  # Override with extracted name
```

#### AWS S3 Bucket Creation

```python
    # Create unique S3 bucket for company files
    bucket_name = await make_aws_bucket(payload.name)
    # Format: company-name-uuid4
```

#### Database Record Creation

```python
    new_company = Company(
        admin_user_id=payload.user_id,
        website_url=payload.website_url,
        name=payload.name,
        description=payload.description,
        target_market=payload.target_market,
        file_bucket=bucket_name,
        llm_website_summary=llm_website_summary,
    )
    db.add(new_company)
    await db.flush()
```

#### Background Task Initialization

```python
    # Launch background initialization with progress tracking
    asyncio.create_task(
        init_company_resources(
            new_company.id,
            llm_website_summary,
            payload.description,
            payload.target_market,
            new_company.website_url,
            payload.user_id,  # Pass user_id for progress tracking
        )
    )
```

> **Real-time Updates**: Background tasks now include progress tracking that provides real-time feedback to users via SSE. Users see live progress indicators for Reddit leads generation and other initialization tasks.

## Background Task Orchestration

### Master Initialization Function

The `init_company_resources` function orchestrates all background initialization tasks:

```python
async def init_company_resources(
    company_id: str,
    llm_website_summary: str,
    description: str,
    target_market: str,
    website_url: str,
    user_id: str = None,  # New parameter for progress tracking
):
    # Prepare business context
    if not llm_website_summary:
        business_context = f"Company description: {description}\nTarget market: {target_market}"
    else:
        business_context = llm_website_summary
    
    # Launch initialization tasks with progress tracking
    if user_id:
        # Use tracked version for Reddit leads (provides real-time updates)
        from src.features.progress.services import progress_tracker
        reddit_task_id = await progress_tracker.start_task(
            task_type=TaskType.REDDIT_LEADS,
            user_id=user_id,
            total_steps=10,
            trigger="signup"
        )
        asyncio.create_task(init_reddit_tracked(company_id, business_context, reddit_task_id))
    else:
        # Fallback to regular version (no progress tracking)
        asyncio.create_task(init_reddit(company_id, business_context))
    
    # Other initialization tasks
    asyncio.create_task(init_geo(company_id, business_context, website_url))
    asyncio.create_task(init_partnerships(business_context, company_id))
    asyncio.create_task(init_subreddits_for_company(company_id, business_context))
```

### Parallel Task Execution

All initialization tasks run concurrently as background tasks:

1. **Reddit Lead Generation** (`init_reddit_tracked`) - **✨ With real-time progress updates**
2. **SEO/GEO Initialization** (`init_geo`)
3. **Partnership Discovery** (`init_partnerships`)
4. **Subreddit Discovery** (`init_subreddits_for_company`)
5. **Context Caching** (`warm_context_for`)

> **Real-time Progress**: During signup, Reddit lead generation provides live progress updates through SSE, showing users exactly what's happening in the background. Users see progress indicators like "Batch 3 of 10" and "Finding leads for query: 'marketing automation software'" in real-time.

## Service Initialization Details

### 1. Reddit Lead Generation (`init_reddit`)

**Purpose:** Generate initial Reddit leads for marketing engagement

**Process:**

```python
async def init_reddit(company_id: str, business_context: str):
    # Generate 10 search queries using AI
    search_queries = await generate_search_queries(business_context, num_queries=10)
    
    # For each query:
    for query in search_queries:
        # Search Google for Reddit links
        links = await search_google(query, num_links=10)
        
        # Fetch content from each Reddit post
        for link in links:
            content = await fetch_reddit_content(link)
            
            # Save to database
            reddit_lead = RedditLeads(
                link=link,
                title=content.title,
                body=content.body,
                company_id=company_id,
                relevance_score=content.relevance
            )
            db.add(reddit_lead)
```

**Output:**

- ~100 Reddit leads (10 queries × 10 results)
- Stored in `reddit_leads` table
- Includes relevance scoring

### 2. SEO/GEO Initialization (`init_geo`)

**Purpose:** Create initial SEO content and track search rankings

**Process:**

```python
async def init_geo(company_id: str, business_context: str, website_url: str):
    # Generate 10 search terms
    search_terms = await get_search_terms(business_context)
    
    # Check Google rankings for each term
    for term in search_terms:
        rank = find_site_rank_google_api(term, website_url)
        new_term = SearchTerm(
            term=term, 
            rank=rank,  # 1-20 or None
            company_id=company_id
        )
        db.add(new_term)
    
    # Generate 2 initial blog posts
    blog_posts = await get_initial_blog_posts(business_context)
    
    # Create blog post 1
    new_post1 = BlogPost(
        title=blog_posts.title_1,
        content=blog_posts.content_1,  # 800-1200 words
        company_id=company_id,
        slug=create_slug_from_title(blog_posts.title_1)
    )
    
    # Create blog post 2
    new_post2 = BlogPost(
        title=blog_posts.title_2,
        content=blog_posts.content_2,  # 800-1200 words
        company_id=company_id,
        slug=create_slug_from_title(blog_posts.title_2)
    )
```

**Output:**

- 10 search terms with current Google rankings
- 2 SEO-optimized blog posts (800-1200 words each)
- Stored in `search_terms` and `blog_posts` tables

### 3. Partnership Discovery (`init_partnerships`)

**Purpose:** Identify relevant micro-influencers for partnerships

**Process:**

```python
async def init_partnerships(business_context: str, company_id: str):
    # Get influencers using AI + web search
    influencers = await get_ig_influencers(business_context, use_web_search=True)
    
    # Store each influencer
    for inf in influencers:
        new_influencer = Influencers(
            company_id=company_id,
            name=inf.get("name"),
            handle=inf.get("handle"),
            followers=inf.get("followers"),
            bio=inf.get("bio"),
            contact_email=inf.get("contact_email"),
            website=inf.get("website"),
            category=inf.get("category"),
            engagement_rate=inf.get("engagement_rate"),
        )
        db.add(new_influencer)
```

**Output:**

- 10-20 relevant micro-influencers
- Contact information and metrics
- Stored in `influencers` table

### 4. Subreddit Discovery (`init_subreddits_for_company`)

**Purpose:** Find relevant subreddits for community engagement

**Process:**

```python
async def init_subreddits_for_company(company_id: str, business_context: str):
    # Get company admin user
    company = await get_company_by_company_id(company_id, db)
    
    # Discover relevant subreddits
    await discover_and_add_subreddits_for_user(
        str(company.admin_user_id), 
        business_context, 
        db
    )
```

**Fallback Subreddits:**

```python
fallback_subreddits = [
    "startups", "entrepreneur", "smallbusiness",
    "business", "marketing", "SaaS", 
    "webdev", "programming"
]
```

**Output:**

- 5-15 relevant subreddits
- Stored in user's subreddit preferences

### 5. Context Caching (`warm_context_for`)

**Purpose:** Pre-cache business context in Redis for fast access

**Process:**

```python
async def warm_context_for(tenant_id: str):
    async with AsyncSessionLocal() as db:
        # Build comprehensive context
        ctx = await build_context_from_db(db, tenant_id)
        
        # Cache in Redis with TTL
        await set_app_context(tenant_id, ctx)
```

**Cached Context Structure:**

```python
{
    "business_context": "Full business description...",
    "company_name": "Example Corp",
    "website_url": "https://example.com",
    "target_market": "Small businesses",
    "core_business": "SaaS platform",
    "value_proposition": "We help...",
    "products_services": "Product A, Service B",
    "key_differentiators": "Unique feature X",
    "industry": "Technology",
    "business_goals": "Scale to 1000 customers",
    "pain_points_solved": "Time management",
    "brief_description": "SaaS platform for small businesses"
}
```

**Cache Settings:**

- TTL: 3600 seconds (1 hour)
- Storage: Redis
- Key format: `context:{user_id}`

## Data Flow Diagram

```plaintext
                        SIGNUP FLOW
┌─────────────────────────────────────────────────────────┐
│                   Frontend (SignUp.jsx)                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │  User Input:                                    │    │
│  │  • First Name, Email, Password                  │    │
│  │  • Website URL OR Company Details               │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────┘
                         │ POST /users/signup
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Signup Service                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │  1. Create User Record                          │    │
│  │  2. Hash Password                               │    │
│  │  3. Generate User ID                            │    │
│  └─────────────────────────────────────────────────┘    │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │  4. Create Company Record                       │    │
│  │     • Fetch Website (if URL provided)           │    │
│  │     • Extract Company Info via AI               │    │
│  │     • Create AWS S3 Bucket                      │    │
│  │     • Store in Database                         │    │
│  └─────────────────────────────────────────────────┘    │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │  5. Commit Transaction                          │    │
│  │  6. Generate JWT Token                          │    │
│  │  7. Return Response                             │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────┘
                         │
     ┌───────────────────┼───────────────────┐
     │                   │                   │
     ▼                   ▼                   ▼
┌──────────┐     ┌──────────────┐    ┌──────────────┐
│  Redis   │     │  Background  │    │   Frontend   │
│  Cache   │     │    Tasks     │    │   Redirect   │
│          │     │              │    │              │
│ Context  │     │ • Reddit     │    │  Dashboard   │
│ Warming  │     │ • SEO/GEO    │    │      +       │
│          │     │ • Partners   │    │    Guide     │
│          │     │ • Subreddits │    │              │
└──────────┘     └──────────────┘    └──────────────┘

              BACKGROUND TASK DETAILS
┌─────────────────────────────────────────────────────────┐
│                  init_company_resources                  │
│                    (Master Orchestrator)                 │
└────────────────────────┬─────────────────────────────────┘
                         │
     ┌───────────────────┼─────────────────────┐
     │                   │                     │
     ▼                   ▼                     ▼
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Reddit  │     │   SEO/GEO    │     │ Partnerships │
│          │     │              │     │              │
│ Generate │     │ • Search     │     │ • Find       │
│ 10 Query │     │   Terms      │     │   Influencers│
│    ↓     │     │ • Check      │     │ • Store      │
│ Search   │     │   Rankings   │     │   Contacts   │
│ Google   │     │ • Generate   │     │ • Calculate  │
│    ↓     │     │   2 Blog     │     │   Metrics    │
│ Fetch    │     │   Posts      │     │              │
│ Reddit   │     │              │     │              │
│ Content  │     │              │     │              │
│    ↓     │     │              │     │              │
│ Store    │     │              │     │              │
│ ~100     │     │              │     │              │
│ Leads    │     │              │     │              │
└──────────┘     └──────────────┘     └──────────────┘
```

## Error Handling & Recovery

### Frontend Error Handling

```javascript
// Validation errors
if (!validateStep1()) return;

// API errors
try {
    const response = await fetch(API_ENDPOINTS.signup, {...});
    if (!response.ok) {
        const errorData = await response.json();
        setErrors({ general: errorData.detail || 'Failed to create account' });
    }
} catch (error) {
    setErrors({ general: error.message || 'Something went wrong' });
}
```

### Backend Error Handling

#### Transaction Rollback

```python
try:
    new_user = await create_user(...)
    new_company = await create_company(...)
    await db.commit()
except Exception as e:
    await db.rollback()
    raise HTTPException(status_code=500, detail=str(e))
```

#### Background Task Failure Isolation

```python
# Each background task has independent error handling
async def init_partnerships(business_context, company_id):
    try:
        influencers = await get_ig_influencers(business_context)
        # Process influencers...
    except Exception as e:
        logger.exception("init_partnerships failed: %s", e)
        return []  # Fail silently, don't crash signup
```

### Fallback Mechanisms

1. **Website Fetching Failure**: User can manually enter company details
2. **AI Analysis Failure**: Falls back to user-provided description
3. **S3 Bucket Creation Failure**: Generates unique bucket name with UUID
4. **Influencer Discovery Failure**: Returns empty list, doesn't block signup
5. **Subreddit Discovery Failure**: Uses hardcoded fallback list

## Security Considerations

### Password Security

- **Hashing**: Passlib with bcrypt
- **Minimum Length**: 6 characters
- **Storage**: Only hashed passwords stored

### JWT Token Security

```python
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
```

### Input Validation

- Email format validation
- URL format validation
- XSS prevention through input sanitization
- SQL injection prevention via SQLAlchemy ORM

### AWS S3 Security

- Unique bucket names with UUID
- Bucket ownership verification
- Access control through IAM policies

## Configuration & Environment

### Required Environment Variables

**Backend:**

```bash
# Authentication
JWT_SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...
CTX_TTL_SECONDS=3600

# OpenAI
OPENAI_API_KEY=your-openai-key

# Google APIs
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CSE_ID=your-custom-search-engine-id

# AWS
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_DEFAULT_REGION=us-east-1
```

**Frontend:**

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### Database Tables Created

During signup, records are created in the following tables:

1. **users** - User account information
2. **companies** - Company profile and metadata
3. **reddit_leads** - ~100 Reddit marketing opportunities
4. **search_terms** - 10 SEO search terms with rankings
5. **blog_posts** - 2 initial SEO blog posts
6. **influencers** - 10-20 relevant micro-influencers
7. **user_subreddits** - Relevant subreddit preferences

### Performance Metrics

**Typical Initialization Times:**

- User & Company Creation: ~500ms
- Website Analysis: 2-5 seconds
- Reddit Lead Generation: 30-60 seconds
- SEO Initialization: 10-20 seconds
- Partnership Discovery: 15-30 seconds
- Total Background Processing: 1-2 minutes

**Note:** All background tasks run asynchronously and don't block the signup process. Users can immediately access the dashboard while initialization continues.

## Monitoring & Debugging

### Key Log Points

```python
# Company creation
print(f"Creating AWS bucket: {bucket_name}")

# Reddit initialization
print(f"*** Initialising Reddit for company {company_id}")

# Partnership initialization
print(f"*** Initialising partnerships for company {company_id}")

# Error logging
logger.exception("init_partnerships failed: %s", e)
```

### Redis Cache Inspection

```bash
# Check cached context
redis-cli GET context:{user_id}

# Check TTL
redis-cli TTL context:{user_id}
```

### Database Verification

```sql
-- Check user creation
SELECT * FROM users WHERE email = 'user@example.com';

-- Check company initialization
SELECT * FROM companies WHERE admin_user_id = 'user-id';

-- Verify background task completion
SELECT COUNT(*) FROM reddit_leads WHERE company_id = 'company-id';
SELECT COUNT(*) FROM search_terms WHERE company_id = 'company-id';
SELECT COUNT(*) FROM blog_posts WHERE company_id = 'company-id';
SELECT COUNT(*) FROM influencers WHERE company_id = 'company-id';
```

## Common Issues & Solutions

### Issue 1: Signup Succeeds but No Data Appears

**Cause:** Background tasks failed silently
**Solution:** Check logs for task exceptions, verify API keys

### Issue 2: Website Analysis Takes Too Long

**Cause:** Large website or slow response
**Solution:** Website content is truncated to 5000 characters

### Issue 3: S3 Bucket Creation Fails

**Cause:** Bucket name collision or AWS permissions
**Solution:** UUID is appended to ensure uniqueness

### Issue 4: User Can't Access Features After Signup

**Cause:** Background tasks still processing
**Solution:** Features become available as tasks complete (1-2 minutes)

---

*This documentation provides a complete technical overview of the Cassius AI signup flow, including all synchronous and asynchronous operations, error handling, and system initialization processes.*
