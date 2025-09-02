# Server-Sent Events (SSE) Real-Time Updates System

## Overview

The SSE Real-Time Updates System provides instant feedback to users about background tasks (like Reddit leads generation) without requiring page refreshes. This system uses Server-Sent Events (SSE) to stream progress updates from the backend to the frontend, enabling a responsive and modern user experience.

## Table of Contents

1. [User Experience](#user-experience)
2. [System Architecture](#system-architecture)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [Authentication & Security](#authentication--security)
6. [Task Types & Configuration](#task-types--configuration)
7. [Error Handling & Reconnection](#error-handling--reconnection)
8. [Development & Debugging](#development--debugging)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting](#troubleshooting)

## User Experience

### What Users See

**During Signup:**

1. User completes signup and lands on dashboard
2. **Immediately**: Progress toast appears showing "Finding Reddit Leads"
3. **Real-time**: Progress bar and percentage updates as work progresses
4. **Live updates**: "Step 3 of 10" with current batch information
5. **Completion**: "✅ Completed! 47 items found" notification
6. **Auto-update**: Reddit table populates with new leads without refresh

**During Manual Actions:**

1. User clicks "Find More Leads" on Reddit page
2. **Instant feedback**: Loading spinner and progress indicator appear
3. **Live progress**: Real-time batch progress with query information
4. **Auto-refresh**: Table updates automatically as new leads are found

### Key Benefits

- **No Page Refreshes**: Everything updates live
- **Immediate Feedback**: Users know work is happening instantly
- **Progress Transparency**: Clear progress indicators with percentages
- **Background Processing**: Users can navigate while tasks continue
- **Error Visibility**: Clear error messages if something goes wrong
- **Mobile Friendly**: Works seamlessly on all devices

## System Architecture

### High-Level Flow

```
┌─────────────┐    SSE Connection    ┌──────────────┐
│  Frontend   │◄──────────────────────►│   Backend    │
│             │                       │              │
│ Progress UI │                       │ Progress     │
│ Components  │                       │ Tracker      │
└─────────────┘                       └──────────────┘
       ▲                                       ▲
       │                                       │
   Cache Updates                         Redis Pub/Sub
       │                                       │
       ▼                                       ▼
┌─────────────┐                       ┌──────────────┐
│ React Query │                       │    Redis     │
│   Cache     │                       │   Messages   │
└─────────────┘                       └──────────────┘
```

### Component Architecture

```
App Level:
├── BackgroundTasksProvider (Universal SSE Context)
│   ├── SSE Connection Management
│   ├── Progress Signal Processing  
│   ├── React Query Cache Invalidation
│   └── Task State Management
│
├── UniversalProgressIndicator (Global Toast)
│   ├── Task-specific Styling
│   ├── Expandable Details
│   └── Connection Status
│
└── Page Level Components
    ├── useBackgroundTask (Individual Task Hook)
    ├── useBackgroundTasks (General Hook)
    └── Page-specific Progress UI
```

## Frontend Implementation

### Core Context: BackgroundTasksContext.jsx

The `BackgroundTasksContext` is the heart of the SSE system:

#### Key Features

```javascript
// Universal context that handles all background task types
export const BackgroundTasksProvider = ({ children }) => {
  // SSE connection management
  const eventSourceRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Task state for all active tasks
  const [activeTasks, setActiveTasks] = useState({});
  
  // Automatic cache invalidation
  const queryClient = useQueryClient();
}
```

#### SSE Connection Setup

```javascript
const connectToSSE = useCallback(async () => {
  const token = getAuthToken();
  
  // EventSource with query parameter authentication
  const eventSource = new EventSource(`${API_ENDPOINTS.progressStream}?token=${token}`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'progress' && data.signal) {
      handleProgressSignal(data.signal);
    }
  };
}, []);
```

#### Progress Signal Processing

```javascript
const handleProgressSignal = useCallback((signal) => {
  // Parse signal format: ---PROGRESS_UPDATE:{task_type}:{task_id}:{event_type}:{current}:{total}:{custom_data}---
  const match = signal.match(/---PROGRESS_UPDATE:(.+):(.+):(.+):(\d+):(\d+):(.+)---/);
  
  const [, taskType, taskId, eventType, current, total, customDataJson] = match;
  
  // Update UI state
  setActiveTasks(prev => ({
    ...prev,
    [taskType]: progressData
  }));
  
  // Auto-invalidate React Query caches on completion
  if (eventType === 'completed') {
    invalidateCacheForTask(taskType);
  }
}, []);
```

#### Automatic Cache Invalidation

```javascript
const invalidateCacheForTask = useCallback((taskType) => {
  const CACHE_INVALIDATION_MAP = {
    [TASK_TYPE.REDDIT_LEADS]: ['redditPosts', 'reddit_metrics'],
    [TASK_TYPE.SEO_INIT]: ['geoBlogPosts', 'geoSearchTerms'],
    [TASK_TYPE.PARTNERSHIPS]: ['influencers', 'partnerships'],
    // ... more mappings
  };
  
  const keysToInvalidate = CACHE_INVALIDATION_MAP[taskType] || [];
  
  keysToInvalidate.forEach(queryKey => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  });
}, [queryClient]);
```

### Custom Hooks

#### useBackgroundTask (Individual Task)

```javascript
// Hook for monitoring a specific task type
export const useBackgroundTask = (taskType) => {
  const context = useBackgroundTasks();
  
  return {
    activeTask: context.getActiveTask(taskType),
    isLoading: context.isTaskActive(taskType), 
    progress: context.getTaskProgress(taskType),
    isConnected: context.isConnected,
    connectionError: context.connectionError
  };
};
```

#### useBackgroundTasks (General)

```javascript
// Hook for accessing all background task functionality
export const useBackgroundTasks = () => {
  const context = useContext(BackgroundTasksContext);
  
  return {
    activeTasks,
    isConnected,
    startRedditLeadsTask,
    getActiveTask,
    isTaskActive,
    // ... more methods
  };
};
```

### UI Components

#### UniversalProgressIndicator

```javascript
const UniversalProgressIndicator = ({ 
  taskType, 
  title, 
  position = 'top-right',
  showInModal = false 
}) => {
  const { activeTask, isLoading, progress, isConnected } = useBackgroundTask(taskType);
  
  // Auto-show when task is active
  const [isVisible, setIsVisible] = useState(false);
  
  // Task-specific styling and icons
  const getTaskInfo = () => {
    const taskConfigs = {
      [TASK_TYPE.REDDIT_LEADS]: {
        title: 'Finding Reddit Leads',
        icon: '🔍',
        color: 'blue'
      },
      // ... more configs
    };
    return taskConfigs[taskType];
  };
};
```

#### Page Integration Example

```javascript
// In Reddit.jsx
function Reddit() {
  const { startRedditLeadsTask } = useBackgroundTasks();
  const { activeTask, isLoading: isGeneratingLeads } = useBackgroundTask(TASK_TYPE.REDDIT_LEADS);
  
  const handleFindMoreLeads = async () => {
    try {
      await startRedditLeadsTask('manual');
      // No need to manually update UI - SSE handles it
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };
  
  return (
    <div>
      <button 
        onClick={handleFindMoreLeads}
        disabled={isGeneratingLeads}
      >
        {isGeneratingLeads ? 'Finding...' : 'Find More Leads'}
      </button>
      
      <UniversalProgressIndicator 
        taskType={TASK_TYPE.REDDIT_LEADS}
        position="top-right"
      />
    </div>
  );
}
```

## Backend Implementation

### Progress Tracking Service

#### Core ProgressTracker Class

```python
class ProgressTracker:
    """Universal progress tracking system for background tasks"""
    
    def __init__(self, redis_client: Redis = None):
        self.redis = redis_client or redis
        
    async def start_task(
        self, 
        task_type: TaskType, 
        user_id: str, 
        total_steps: int,
        trigger: str = "manual"
    ) -> str:
        """Start tracking a new background task"""
        task_id = str(uuid.uuid4())
        
        task = BackgroundTask(
            task_id=task_id,
            task_type=task_type,
            status=TaskStatus.PENDING,
            progress=TaskProgress(current=0, total=total_steps),
            # ... more fields
        )
        
        await self._store_task(task)
        await self._publish_update(user_id, task, "started")
        
        return task_id
```

#### Progress Updates

```python
async def update_progress(
    self, 
    task_id: str, 
    current_step: int, 
    results: Dict[str, Any] = None
) -> None:
    """Update task progress"""
    task = await self._get_task(task_id)
    
    task.progress.current = current_step
    task.status = TaskStatus.IN_PROGRESS
    
    if results:
        if "custom_data" in results:
            task.results.custom_data.update(results["custom_data"])
    
    await self._store_task(task)
    await self._publish_update(task.metadata.user_id, task, "progress")
```

#### Redis Pub/Sub Integration

```python
async def _publish_update(self, user_id: str, task: BackgroundTask, event_type: str):
    """Publish task update to Redis pub/sub"""
    channel = f"progress:updates:{user_id}"
    update_data = {
        "event_type": event_type,
        "task": task.to_dict()
    }
    
    result = await self.redis.publish(channel, json.dumps(update_data))
    print(f"📊 Redis publish result: {result} subscribers received the message")
```

#### SSE Signal Formatting

```python
def _format_progress_signal(self, update_data: Dict[str, Any]) -> str:
    """Format progress update as SSE signal"""
    task = update_data["task"]
    event_type = update_data["event_type"]
    
    # Format: ---PROGRESS_UPDATE:{task_type}:{task_id}:{event_type}:{current}:{total}:{custom_data}---
    custom_data = json.dumps(task["results"]["custom_data"])
    
    signal = (f"---PROGRESS_UPDATE:{task['task_type']}:{task['task_id']}:"
             f"{event_type}:{task['progress']['current']}:{task['progress']['total']}:"
             f"{custom_data}---")
    
    return signal
```

### SSE Endpoint Implementation

#### Stream Route

```python
@router.get("/stream")
async def stream_progress_updates(
    user_id: str = Depends(user_auth_services.verify_sse_token),
):
    """Stream real-time progress updates via SSE"""
    
    async def stream_updates():
        # Send connection confirmation
        yield f"data: {json.dumps({'type': 'connected', 'user_id': user_id})}\n\n"
        
        # Stream progress updates
        async for signal in progress_tracker.subscribe_to_updates(user_id):
            yield f"data: {json.dumps({'type': 'progress', 'signal': signal})}\n\n"
    
    return StreamingResponse(
        stream_updates(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )
```

#### Task Integration Example

```python
# In Reddit services
async def init_reddit_tracked(company_id: str, business_context: str, task_id: str = None):
    """Reddit initialization with progress tracking"""
    
    for batch_idx, query in enumerate(search_queries, start=1):
        # ... do work ...
        
        # Update progress
        if progress_tracker and task_id:
            await progress_tracker.update_progress(
                task_id,
                current_step=batch_idx,
                results={
                    "items_created": total_inserted,
                    "custom_data": {
                        "batch_completed": batch_idx,
                        "batch_leads": batch_inserted,
                        "current_query": query
                    }
                }
            )
    
    # Mark complete
    await progress_tracker.complete_task(task_id, final_results)
```

## Authentication & Security

### SSE Authentication Challenge

**Problem**: EventSource API cannot send custom headers, but FastAPI JWT auth expects `Authorization: Bearer <token>` header.

**Solution**: Custom SSE authentication that reads tokens from query parameters.

#### Custom SSE Authentication

```python
async def verify_sse_token(
    request: Request, db: AsyncSession = Depends(get_db)
) -> str:
    """Custom authentication for SSE endpoints"""
    
    # Extract token from query parameter
    token = request.query_params.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    
    # Same JWT validation as standard auth
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    email = payload.get("sub")
    
    user = await get_user_by_email(email, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user.id
```

#### Frontend Token Passing

```javascript
// EventSource with query parameter auth (only option available)
const eventSource = new EventSource(`${API_ENDPOINTS.progressStream}?token=${token}`);

// Standard API calls use header auth
const response = await fetch(API_ENDPOINTS.startTask, {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

### Security Measures

1. **Token Validation**: Same JWT validation as all other endpoints
2. **User Isolation**: Users only receive updates for their own tasks  
3. **Connection Limits**: EventSource naturally limits to one connection per origin
4. **Token Expiration**: Standard JWT expiration applies (60 minutes)
5. **HTTPS Only**: Production uses HTTPS for encrypted communication

## Task Types & Configuration

### Supported Task Types

```javascript
export const TASK_TYPE = {
  REDDIT_LEADS: 'reddit_leads',        // Reddit lead generation
  SEO_INIT: 'seo_init',               // SEO blog post creation  
  PARTNERSHIPS: 'partnerships',        // Influencer discovery
  GEO_BLOGS: 'geo_blogs',             // Geographic blog content
  SUBREDDIT_DISCOVERY: 'subreddit_discovery'  // Subreddit finding
};
```

### Task Registry Configuration

```python
# Backend task configuration
TASK_CONFIGS = {
    TaskType.REDDIT_LEADS: {
        "display_name": "Reddit Leads Generation",
        "description": "Finding relevant Reddit discussions for marketing opportunities",
        "typical_duration": "1-2 minutes",
        "cache_keys_to_refresh": ["redditPosts", "reddit_metrics"]
    },
    TaskType.SEO_INIT: {
        "display_name": "SEO Content Creation", 
        "description": "Generating blog posts and tracking keywords",
        "typical_duration": "2-3 minutes",
        "cache_keys_to_refresh": ["geoBlogPosts", "geoSearchTerms"]
    },
    # ... more configs
}
```

### Adding New Task Types

1. **Add to Enum** (both frontend and backend)
2. **Add to Task Registry** with configuration
3. **Add to Cache Invalidation Map** in frontend context
4. **Add to Progress Indicator Configs** for UI styling
5. **Implement progress tracking** in the actual task function

#### Example: Adding a new task type

```javascript
// Frontend - Add to TASK_TYPE enum
export const TASK_TYPE = {
  // ... existing types
  EMAIL_CAMPAIGNS: 'email_campaigns',  // New task type
};

// Add to cache invalidation map
const CACHE_INVALIDATION_MAP = {
  // ... existing mappings
  [TASK_TYPE.EMAIL_CAMPAIGNS]: ['emailTemplates', 'campaigns'],
};

// Add to progress indicator configs
const taskConfigs = {
  // ... existing configs
  [TASK_TYPE.EMAIL_CAMPAIGNS]: {
    title: 'Creating Email Campaigns',
    description: 'Generating personalized email templates...',
    icon: '📧',
    color: 'green'
  },
};
```

```python
# Backend - Add to TaskType enum
class TaskType(str, Enum):
    # ... existing types
    EMAIL_CAMPAIGNS = "email_campaigns"

# Add to task registry
TASK_CONFIGS = {
    # ... existing configs
    TaskType.EMAIL_CAMPAIGNS: {
        "display_name": "Email Campaign Creation",
        "description": "Generating personalized email templates and sequences",
        "typical_duration": "30-60 seconds",
        "cache_keys_to_refresh": ["emailTemplates", "campaigns"]
    }
}
```

## Error Handling & Reconnection

### Frontend Error Handling

#### Connection Errors

```javascript
eventSource.onerror = (error) => {
  console.error('❌ SSE connection error:', error);
  setIsConnected(false);
  
  if (eventSource.readyState === EventSource.CLOSED) {
    scheduleReconnect();
  }
};
```

#### Exponential Backoff Reconnection

```javascript
const scheduleReconnect = useCallback(() => {
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
  reconnectAttempts.current += 1;
  
  reconnectTimeoutRef.current = setTimeout(() => {
    connectToSSE();
  }, delay);
}, [connectToSSE]);
```

#### Error Recovery Strategies

1. **Authentication Failures**: Clear invalid tokens, redirect to login
2. **Network Errors**: Exponential backoff reconnection (up to 30 seconds)
3. **Parse Errors**: Log and continue (don't crash on malformed signals)
4. **Cache Errors**: Graceful degradation (continue without cache updates)

### Backend Error Handling  

#### Task Failure Handling

```python
async def fail_task(self, task_id: str, error_message: str) -> None:
    """Mark task as failed"""
    task = await self._get_task(task_id)
    
    task.status = TaskStatus.FAILED
    task.error_message = error_message
    task.updated_at = datetime.now(timezone.utc)
    
    await self._store_task(task)
    await self._publish_update(task.metadata.user_id, task, "failed")
```

#### Connection Management

```python
async def subscribe_to_updates(self, user_id: str) -> AsyncGenerator[str, None]:
    """Subscribe to real-time task updates"""
    channel = self._get_updates_channel(user_id)
    pubsub = self.redis.pubsub()
    
    try:
        await pubsub.subscribe(channel)
        
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                signal = self._format_progress_signal(data)
                yield signal
                
    except Exception as e:
        print(f"Error in progress subscription: {e}")
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()
```

### Error Types & Recovery

| Error Type | Frontend Behavior | Backend Behavior | Recovery Strategy |
|------------|------------------|------------------|------------------|
| Auth Failure | Redirect to login | 401 response | Re-authenticate |
| Network Drop | Show disconnected state | N/A | Exponential backoff |
| Task Failure | Show error in UI | Log & publish failure | Manual retry available |
| Parse Error | Log & continue | N/A | Skip malformed signal |
| Redis Down | No real-time updates | Connection error | Polling fallback |

## Development & Debugging

### Frontend Debugging

#### Console Logs

The system provides detailed console logging:

```
🔄 BackgroundTasksContext initializing, token available: true
🔌 Connecting to background tasks SSE stream...
📍 SSE URL: http://localhost:8000/progress/stream?token=eyJhbG...
✅ Connected to background tasks SSE stream
📨 SSE message received: {"type":"connected","user_id":"123"}
📊 Progress signal received: ---PROGRESS_UPDATE:reddit_leads:uuid:progress:3:10:{"batch_completed":3}---
🎯 Processing progress signal: ---PROGRESS_UPDATE:...
📋 Signal parsed: {taskType: "reddit_leads", eventType: "progress", current: 3, total: 10}
📊 Progress update processed: {taskId: "uuid", progress: {current: 3, total: 10, percentage: 30}}
📝 Updated active tasks: {reddit_leads: {...}}
🔄 About to invalidate cache for task type: reddit_leads
🔄 Invalidating React Query cache: redditPosts
✅ Cache invalidated for task type: reddit_leads
```

#### React DevTools Integration

- **Background Tasks Context**: Inspect active tasks state
- **React Query DevTools**: View cache invalidation in real-time
- **Network Tab**: Monitor SSE connection and messages

#### Development Setup

```bash
# Enable verbose logging
VITE_LOG_LEVEL=debug

# Test SSE endpoint directly
curl -N -H "Accept: text/event-stream" \
  "http://localhost:8000/progress/stream?token=your-jwt-token"
```

### Backend Debugging

#### Detailed Logging

```python
# Progress tracking logs
print(f"📡 Publishing progress update to Redis channel {channel}: {event_type}")
print(f"📊 Redis publish result: {result} subscribers received the message")
print(f"🎯 Formatted SSE signal: {signal}")

# SSE connection logs  
print(f"🔄 Starting SSE stream for user {user_id}")
print(f"📡 Sending connection confirmation: {connection_data}")
print(f"📤 Sending progress update via SSE: {progress_data}")
```

#### Redis Monitoring

```bash
# Monitor Redis pub/sub activity
redis-cli MONITOR

# Check active tasks
redis-cli KEYS "progress:task:*"

# Check user subscribers
redis-cli PUBSUB CHANNELS "progress:updates:*"
```

#### Database Inspection

```sql
-- Check active tasks (if using DB storage)
SELECT task_id, task_type, status, progress, updated_at 
FROM background_tasks 
WHERE status IN ('pending', 'in_progress')
ORDER BY updated_at DESC;
```

### Testing

#### Unit Tests

```javascript
// Frontend tests
describe('BackgroundTasksContext', () => {
  test('processes progress signals correctly', () => {
    const signal = '---PROGRESS_UPDATE:reddit_leads:123:progress:5:10:{}---';
    const result = parseProgressSignal(signal);
    expect(result.progress.percentage).toBe(50);
  });
});
```

```python
# Backend tests
def test_progress_tracker():
    tracker = ProgressTracker(mock_redis)
    task_id = await tracker.start_task(TaskType.REDDIT_LEADS, "user123", 10)
    await tracker.update_progress(task_id, 5)
    
    task = await tracker.get_task(task_id)
    assert task["progress"]["current"] == 5
```

#### Integration Tests

```javascript
// Test SSE connection and message handling
test('SSE connection handles progress updates', async () => {
  const mockEventSource = new MockEventSource();
  
  // Simulate progress message
  mockEventSource.onmessage({
    data: JSON.stringify({
      type: 'progress',
      signal: '---PROGRESS_UPDATE:reddit_leads:123:progress:3:10:{}---'
    })
  });
  
  expect(screen.getByText('30%')).toBeInTheDocument();
});
```

#### Load Testing

```bash
# Test SSE connection limits
for i in {1..100}; do
  curl -N -H "Accept: text/event-stream" \
    "http://localhost:8000/progress/stream?token=$TOKEN" &
done
```

## Performance Considerations

### Frontend Performance

#### Memory Management

```javascript
// Cleanup on unmount
useEffect(() => {
  return () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };
}, []);
```

#### Efficient State Updates

```javascript
// Batched state updates
setActiveTasks(prev => {
  const updated = { ...prev, [taskType]: progressData };
  return updated;
});

// Debounced cache invalidation
const debouncedInvalidate = debounce(invalidateCacheForTask, 100);
```

#### React Query Optimization

```javascript
// Efficient query invalidation
queryClient.invalidateQueries({ 
  queryKey: [queryKey],
  exact: false  // Invalidate all matching variations
});

// Prevent unnecessary refetches
const { data } = useQuery({
  queryKey: ['redditPosts', pageNumber],
  refetchOnMount: 'always',  // Always refetch on mount for live data
  staleTime: 0,             // Always consider data stale
});
```

### Backend Performance

#### Redis Optimization

```python
# Connection pooling
redis_pool = ConnectionPool.from_url(REDIS_URL, max_connections=20)
redis_client = Redis(connection_pool=redis_pool)

# Efficient pub/sub
async def _publish_update(self, user_id: str, task: BackgroundTask, event_type: str):
    # Only serialize once
    update_data = {
        "event_type": event_type,
        "task": task.to_dict()
    }
    message = json.dumps(update_data)
    
    # Publish to user-specific channel
    channel = f"progress:updates:{user_id}"
    await self.redis.publish(channel, message)
```

#### SSE Connection Management  

```python
# Automatic cleanup of stale connections
@router.on_event("shutdown")
async def cleanup_connections():
    # Close all SSE connections
    for connection in active_connections:
        await connection.close()
```

#### Task Storage Optimization

```python
# TTL for task storage (24 hours)
await self.redis.setex(task_key, 86400, task_data)

# Cleanup completed tasks automatically
async def _cleanup_completed_task(self, user_id: str, task_id: str):
    await asyncio.sleep(30)  # Keep for UI transitions
    await self._remove_from_user_tasks(user_id, task_id)
```

### Scalability Considerations

#### Horizontal Scaling

- **Redis Cluster**: Distribute pub/sub across multiple Redis instances
- **Load Balancer**: Sticky sessions required for SSE connections
- **WebSocket Alternative**: Consider WebSockets for high-concurrency needs

#### Resource Limits

- **Connection Limits**: Monitor concurrent SSE connections
- **Redis Memory**: Set appropriate TTL for task storage
- **Bandwidth**: Optimize signal payload size

## Troubleshooting

### Common Issues

#### Issue 1: SSE Connection Fails

**Symptoms:**

- Browser console shows "SSE connection error"
- No progress updates appear
- Toast notifications don't show

**Debugging:**

```javascript
// Check browser Network tab for SSE request
// Look for 401, 403, or 500 responses
console.log('SSE URL:', eventSource.url);
console.log('SSE ready state:', eventSource.readyState);
```

**Solutions:**

1. Verify JWT token is valid and not expired
2. Check backend SSE endpoint is running
3. Verify CORS headers allow EventSource
4. Check network connectivity

#### Issue 2: Progress Updates Not Appearing

**Symptoms:**

- SSE connection established
- No UI updates despite backend activity
- Console shows signal parsing errors

**Debugging:**

```javascript
// Check signal format
console.log('Raw signal:', signal);
console.log('Parsed result:', parseResult);

// Verify task type mapping
console.log('Task configs:', taskConfigs);
console.log('Cache invalidation map:', CACHE_INVALIDATION_MAP);
```

**Solutions:**

1. Verify signal format matches regex pattern
2. Check task type is registered in frontend
3. Confirm cache invalidation keys are correct
4. Verify React Query is working properly

#### Issue 3: Authentication Errors

**Symptoms:**

- 401 Unauthorized responses
- SSE connection immediately closes
- "Token required" error messages

**Debugging:**

```python
# Backend: Check token parsing
token = request.query_params.get("token")
print(f"Received token: {token[:20]}...")

# Verify JWT decode
payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
print(f"Token payload: {payload}")
```

**Solutions:**

1. Ensure frontend passes token in query parameter
2. Verify JWT secret key matches between services
3. Check token expiration time
4. Confirm user exists in database

#### Issue 4: Memory Leaks

**Symptoms:**

- Browser memory usage grows over time
- EventSource connections not closing
- React state updates on unmounted components

**Debugging:**

```javascript
// Check for connection cleanup
useEffect(() => {
  console.log('Component mounting, creating SSE connection');
  
  return () => {
    console.log('Component unmounting, cleaning up SSE');
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };
}, []);
```

**Solutions:**

1. Ensure EventSource connections are closed on unmount
2. Clear reconnection timeouts properly
3. Remove event listeners when components unmount
4. Monitor browser DevTools for memory leaks

#### Issue 5: Real-time Updates Lag

**Symptoms:**

- Delays between backend progress and frontend updates
- Inconsistent update timing
- Some updates missed

**Debugging:**

```python
# Backend: Check Redis pub/sub performance
result = await self.redis.publish(channel, message)
print(f"Subscribers received message: {result}")

# Check Redis connection health
await self.redis.ping()
```

**Solutions:**

1. Monitor Redis performance and memory usage
2. Check network latency between services
3. Verify SSE connection stability
4. Consider WebSocket alternative for critical timing

### Performance Monitoring

#### Key Metrics to Track

1. **SSE Connection Count**: Number of active connections
2. **Message Throughput**: Messages per second through Redis
3. **Connection Duration**: How long connections stay open
4. **Error Rate**: Failed connections / authentication errors
5. **Latency**: Time from backend event to frontend update

#### Monitoring Setup

```python
# Backend metrics collection
import time
from prometheus_client import Counter, Histogram

sse_connections = Counter('sse_connections_total', 'Total SSE connections')
message_latency = Histogram('sse_message_latency_seconds', 'SSE message latency')

@router.get("/stream")
async def stream_progress_updates(user_id: str = Depends(verify_sse_token)):
    sse_connections.inc()
    
    async def stream_updates():
        async for signal in progress_tracker.subscribe_to_updates(user_id):
            start_time = time.time()
            yield f"data: {json.dumps({'type': 'progress', 'signal': signal})}\n\n"
            message_latency.observe(time.time() - start_time)
```

```javascript
// Frontend monitoring
const trackSSEPerformance = () => {
  const connectionStart = performance.now();
  
  eventSource.onopen = () => {
    const connectionTime = performance.now() - connectionStart;
    console.log(`SSE connection established in ${connectionTime}ms`);
  };
  
  eventSource.onmessage = (event) => {
    const messageTime = performance.now();
    console.log(`Message received at ${messageTime}`);
  };
};
```

---

## Conclusion

The SSE Real-Time Updates System provides a robust, scalable solution for real-time user feedback during background operations. Key benefits include:

✅ **Zero Page Refreshes**: Everything updates automatically  
✅ **Universal Design**: Single system handles all background task types  
✅ **Excellent UX**: Immediate feedback with detailed progress information  
✅ **Reliable**: Auto-reconnection, error handling, and graceful degradation  
✅ **Secure**: JWT authentication with user isolation  
✅ **Performant**: Efficient Redis pub/sub with optimized frontend updates  
✅ **Developer Friendly**: Comprehensive logging and debugging tools  

The system successfully delivers on the core requirement of providing immediate user feedback during signup and other background operations, eliminating the need for manual page refreshes while maintaining excellent performance and reliability.

---

*This documentation covers the complete implementation of the SSE Real-Time Updates System. For additional questions or improvements, refer to the development team or contribute to the codebase.*
