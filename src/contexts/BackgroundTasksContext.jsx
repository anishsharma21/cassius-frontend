import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';
import { handleUnauthorizedResponse } from '../utils/auth';

// Create context
const BackgroundTasksContext = createContext();

// Task status constants
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Task type constants
export const TASK_TYPE = {
  REDDIT_LEADS: 'reddit_leads',
  SEO_INIT: 'seo_init',
  PARTNERSHIPS: 'partnerships',
  GEO_BLOGS: 'geo_blogs',
  SUBREDDIT_DISCOVERY: 'subreddit_discovery'
};

export const BackgroundTasksProvider = ({ children }) => {
  // State for all active tasks
  const [activeTasks, setActiveTasks] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // SSE connection ref
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  
  // React Query client for cache invalidation
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Event callbacks
  const taskStartCallbacks = useRef([]);
  const taskUpdateCallbacks = useRef([]);
  const taskCompleteCallbacks = useRef([]);
  
  // Helper function to get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('access_token');
  }, []);
  
  // Connect to SSE stream
  const connectToSSE = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      console.log('🚫 No auth token available for background tasks SSE');
      return;
    }
    
    try {
      // Close existing connection
      if (eventSourceRef.current) {
        console.log('🔌 Closing existing SSE connection...');
        eventSourceRef.current.close();
      }
      
      // Avoid logging token in production; log only token length
      console.log('📍 SSE URL:', `${API_ENDPOINTS.progressStream}?token=[token length: ${token.length}]`);
      
      const eventSource = new EventSource(`${API_ENDPOINTS.progressStream}?token=${token}`);
      eventSourceRef.current = eventSource;
      
      eventSource.onopen = (event) => {
        console.log('✅ Connected to background tasks SSE stream');
        console.log('🔍 SSE ready state:', eventSource.readyState);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };
      
      eventSource.onmessage = (event) => {
        console.log('📨 SSE message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            console.log(`📡 SSE connected for user: ${data.user_id}`);
            return;
          }
          
          if (data.type === 'progress' && data.signal) {
            console.log('📊 Progress signal received:', data.signal);
            handleProgressSignal(data.signal);
          }
          
          if (data.type === 'error') {
            console.error('❌ SSE error:', data.message);
            setConnectionError(data.message);
          }
          
        } catch (error) {
          console.error('Error parsing SSE message:', error, 'Raw data:', event.data);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        console.log('🔍 SSE ready state on error:', eventSource.readyState);
        console.log('🔍 SSE URL was:', eventSource.url);
        setIsConnected(false);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('🔄 SSE connection closed, attempting to reconnect...');
          scheduleReconnect();
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          console.log('🔄 SSE still connecting, will retry...');
          scheduleReconnect();
        }
      };
      
    } catch (error) {
      console.error('Error connecting to SSE:', error);
      setConnectionError(error.message);
      scheduleReconnect();
    }
  }, [getAuthToken]);
  
  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current += 1;
    
    console.log(`🔄 Scheduling reconnect attempt ${reconnectAttempts.current} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connectToSSE();
    }, delay);
  }, [connectToSSE]);
  
  // Invalidate React Query caches based on task type
  const invalidateCacheForTask = useCallback((taskType) => {
    const CACHE_INVALIDATION_MAP = {
      [TASK_TYPE.REDDIT_LEADS]: ['redditPosts', 'reddit_metrics'],
      [TASK_TYPE.SEO_INIT]: ['geoBlogPosts', 'geoSearchTerms'],
      [TASK_TYPE.PARTNERSHIPS]: ['influencers', 'partnerships'],
      [TASK_TYPE.GEO_BLOGS]: ['geoBlogPosts'],
      [TASK_TYPE.SUBREDDIT_DISCOVERY]: ['userSubreddits']
    };
    
    const keysToInvalidate = CACHE_INVALIDATION_MAP[taskType] || [];
    
    keysToInvalidate.forEach(queryKey => {
      try {
        console.log(`🔄 Invalidating React Query cache: ${queryKey}`);
        // Use queryKey alone to match all variations (including paginated queries)
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      } catch (error) {
        console.warn(`⚠️ Error invalidating cache for ${queryKey}:`, error);
      }
    });
    
    console.log(`✅ Cache invalidated for task type: ${taskType}`);
  }, [queryClient]);
  
  // Handle progress signals from SSE
  const handleProgressSignal = useCallback((signal) => {
    console.log('🎯 Processing progress signal:', signal);
    
    // Format: ---PROGRESS_UPDATE:{task_type}:{task_id}:{event_type}:{current}:{total}:{custom_data}---
    const match = signal.match(/---PROGRESS_UPDATE:(.+):(.+):(.+):(\d+):(\d+):(.+)---/);
    
    if (!match) {
      console.warn('⚠️ Invalid progress signal format:', signal);
      return;
    }
    
    const [, taskType, taskId, eventType, current, total, customDataJson] = match;
    console.log('📋 Signal parsed:', { taskType, taskId, eventType, current, total, customDataJson });
    
    let customData = {};
    try {
      customData = JSON.parse(customDataJson);
    } catch (e) {
      console.warn('⚠️ Invalid custom data JSON in progress signal:', customDataJson);
    }
    
    const progressData = {
      taskId,
      taskType,
      eventType,
      progress: {
        current: parseInt(current),
        total: parseInt(total),
        percentage: total > 0 ? Math.round((parseInt(current) / parseInt(total)) * 100) : 0
      },
      customData,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Progress update processed:', progressData);
    
    // Update active tasks state
    setActiveTasks(prev => {
      const updated = {
        ...prev,
        [taskType]: progressData
      };
      console.log('📝 Updated active tasks:', updated);
      return updated;
    });
    
    // Trigger callbacks based on event type
    if (eventType === 'started') {
      console.log('🚀 Task started, triggering callbacks');
      taskStartCallbacks.current.forEach(callback => {
        try {
          callback(progressData);
        } catch (error) {
          console.error('Error in task start callback:', error);
        }
      });
    } else if (eventType === 'progress') {
      console.log('📈 Task progress, triggering callbacks');
      taskUpdateCallbacks.current.forEach(callback => {
        try {
          callback(progressData);
        } catch (error) {
          console.error('Error in task update callback:', error);
        }
      });
      
      // Check if this progress update indicates new items were created
      const itemsCreated = customData?.batch_leads || 0;
      if (itemsCreated > 0) {
        console.log(`🔄 Progress update shows ${itemsCreated} new items created, invalidating cache`);
        invalidateCacheForTask(taskType);
      }
    } else if (eventType === 'completed') {
      console.log('✅ Task completed, triggering callbacks and cache invalidation');
      taskCompleteCallbacks.current.forEach(callback => {
        try {
          callback(progressData);
        } catch (error) {
          console.error('Error in task complete callback:', error);
        }
      });
      
      // Invalidate relevant React Query caches
      console.log('🔄 About to invalidate cache for task type:', taskType);
      invalidateCacheForTask(taskType);
      
      // Remove from active tasks after a delay (for UI transitions)
      setTimeout(() => {
        console.log('🧹 Cleaning up completed task from active tasks');
        setActiveTasks(prev => {
          const updated = { ...prev };
          delete updated[taskType];
          return updated;
        });
      }, 3000);
    } else if (eventType === 'failed') {
      console.error(`❌ Task ${taskType} (${taskId}) failed:`, customData);
      
      // Keep failed tasks for a bit longer to show error state
      setTimeout(() => {
        setActiveTasks(prev => {
          const updated = { ...prev };
          delete updated[taskType];
          return updated;
        });
      }, 10000);
    }
  }, [invalidateCacheForTask]);
  
  // Fetch active tasks from API
  const fetchActiveTasks = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.progressTasks, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        handleUnauthorizedResponse(queryClient);
        return;
      }
      
      if (response.ok) {
        const tasks = await response.json();
        
        // Convert array to object keyed by task type
        const tasksMap = {};
        tasks.forEach(task => {
          tasksMap[task.task_type] = {
            taskId: task.task_id,
            taskType: task.task_type,
            eventType: task.status,
            progress: task.progress,
            customData: task.results.custom_data,
            timestamp: task.updated_at,
            metadata: task.metadata
          };
        });
        
        setActiveTasks(tasksMap);
        console.log('📋 Loaded active tasks:', tasksMap);
      }
    } catch (error) {
      console.error('Error fetching active tasks:', error);
    }
  }, [getAuthToken, queryClient]);
  
  // Initialize connection and fetch tasks
  useEffect(() => {
    const token = getAuthToken();
    console.log('🔄 BackgroundTasksContext initializing, token available:', !!token);
    
    if (token) {
      console.log('✅ Token found, fetching active tasks and connecting SSE');
      fetchActiveTasks();
      connectToSSE();
    } else {
      console.log('❌ No token found, skipping SSE connection');
    }
    
    return () => {
      if (eventSourceRef.current) {
        console.log('🧹 Cleaning up SSE connection on unmount');
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  // Separate effect to handle token changes and retry connection
  useEffect(() => {
    const token = getAuthToken();
    if (token && !eventSourceRef.current) {
      console.log('🔄 Token available and no existing SSE connection, connecting...');
      try {
        connectToSSE();
        fetchActiveTasks();
      } catch (error) {
        console.error('❌ Error during SSE initialization:', error);
      }
    }
  }, [getAuthToken, connectToSSE, fetchActiveTasks]);
  
  // Effect to handle navigation to dashboard - ensure SSE connects
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard')) {
      const token = getAuthToken();
      if (token && !eventSourceRef.current) {
        console.log('🔄 User navigated to dashboard, ensuring SSE connection...');
        setTimeout(() => {
          try {
            connectToSSE();
            fetchActiveTasks();
          } catch (error) {
            console.error('❌ Error connecting SSE on dashboard navigation:', error);
          }
        }, 100); // Small delay to ensure other contexts are ready
      }
    }
  }, [location.pathname, getAuthToken, connectToSSE, fetchActiveTasks]);
  
  // API functions
  const startRedditLeadsTask = useCallback(async (trigger = 'manual') => {
    const token = getAuthToken();
    if (!token) return null;
    
    try {
      const response = await fetch(API_ENDPOINTS.startRedditLeadsTask, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trigger })
      });
      
      if (response.status === 401) {
        handleUnauthorizedResponse(queryClient);
        return null;
      }
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Started Reddit leads task:', result);
        return result.task_id;
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error('Error starting Reddit leads task:', error);
      throw error;
    }
  }, [getAuthToken, queryClient]);
  
  // Helper functions
  const getActiveTask = useCallback((taskType) => {
    return activeTasks[taskType] || null;
  }, [activeTasks]);
  
  const isTaskActive = useCallback((taskType) => {
    const task = activeTasks[taskType];
    return task && (task.eventType === TASK_STATUS.PENDING || task.eventType === TASK_STATUS.IN_PROGRESS);
  }, [activeTasks]);
  
  const getTaskProgress = useCallback((taskType) => {
    const task = activeTasks[taskType];
    return task ? task.progress : null;
  }, [activeTasks]);
  
  // Event subscription functions
  const onTaskStart = useCallback((callback) => {
    taskStartCallbacks.current.push(callback);
    return () => {
      taskStartCallbacks.current = taskStartCallbacks.current.filter(cb => cb !== callback);
    };
  }, []);
  
  const onTaskUpdate = useCallback((callback) => {
    taskUpdateCallbacks.current.push(callback);
    return () => {
      taskUpdateCallbacks.current = taskUpdateCallbacks.current.filter(cb => cb !== callback);
    };
  }, []);
  
  const onTaskComplete = useCallback((callback) => {
    taskCompleteCallbacks.current.push(callback);
    return () => {
      taskCompleteCallbacks.current = taskCompleteCallbacks.current.filter(cb => cb !== callback);
    };
  }, []);
  
  const value = {
    // State
    activeTasks,
    isConnected,
    connectionError,
    
    // Task queries
    getActiveTask,
    isTaskActive,
    getTaskProgress,
    
    // API functions
    startRedditLeadsTask,
    
    // Event subscriptions
    onTaskStart,
    onTaskUpdate,
    onTaskComplete,
    
    // Utility
    fetchActiveTasks,
    connectToSSE
  };
  
  return (
    <BackgroundTasksContext.Provider value={value}>
      {children}
    </BackgroundTasksContext.Provider>
  );
};

// Custom hook to use the context
export const useBackgroundTasks = () => {
  const context = useContext(BackgroundTasksContext);
  if (!context) {
    throw new Error('useBackgroundTasks must be used within a BackgroundTasksProvider');
  }
  return context;
};

// Specialized hook for individual task types
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