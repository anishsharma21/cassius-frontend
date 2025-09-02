import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBackgroundTask, TASK_STATUS, TASK_TYPE } from '../contexts/BackgroundTasksContext';

const UniversalProgressIndicator = ({ 
  taskType, 
  title, 
  showInModal = false, 
  position = 'top-right', 
  onComplete = null,
  className = '' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTask, isLoading, progress, isConnected, connectionError } = useBackgroundTask(taskType);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [completedTaskData, setCompletedTaskData] = useState(null);
  const [isManuallyDismissed, setIsManuallyDismissed] = useState(false);
  
  // Check if we're already on the Reddit Hub page
  const isOnRedditHub = location.pathname === '/dashboard/reddit';
  
  // LocalStorage key for dismissed tasks
  const getDismissedTasksKey = useCallback(() => `dismissed_tasks_${taskType}`, [taskType]);
  
  // Check if task is dismissed in localStorage
  const isTaskDismissedInStorage = (taskId) => {
    if (!taskId) return false;
    try {
      const dismissedTasks = JSON.parse(localStorage.getItem(getDismissedTasksKey()) || '{}');
      return dismissedTasks[taskId] || false;
    } catch {
      return false;
    }
  };
  
  // Store dismissed task in localStorage
  const storeDismissedTask = (taskId) => {
    if (!taskId) return;
    try {
      const dismissedTasks = JSON.parse(localStorage.getItem(getDismissedTasksKey()) || '{}');
      dismissedTasks[taskId] = Date.now(); // Store timestamp for cleanup
      localStorage.setItem(getDismissedTasksKey(), JSON.stringify(dismissedTasks));
    } catch (e) {
      console.warn('Failed to store dismissed task:', e);
    }
  };
  
  // Clean up old dismissed tasks (older than 1 hour)
  const cleanupDismissedTasks = useCallback(() => {
    try {
      const dismissedTasks = JSON.parse(localStorage.getItem(getDismissedTasksKey()) || '{}');
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const cleanedTasks = {};
      
      Object.entries(dismissedTasks).forEach(([taskId, timestamp]) => {
        if (timestamp > oneHourAgo) {
          cleanedTasks[taskId] = timestamp;
        }
      });
      
      localStorage.setItem(getDismissedTasksKey(), JSON.stringify(cleanedTasks));
    } catch (e) {
      console.warn('Failed to cleanup dismissed tasks:', e);
    }
  }, [getDismissedTasksKey]);
  
  // Handle task visibility and completion state
  useEffect(() => {
    if (isLoading || activeTask) {
      setIsVisible(true);
      setIsManuallyDismissed(false); // Reset manual dismiss when new task starts
      
      // Store completed task data when task completes
      if (activeTask && activeTask.eventType === TASK_STATUS.COMPLETED) {
        setCompletedTaskData(activeTask);
      }
    }
  }, [isLoading, activeTask]);
  
  // Handle manual dismiss
  const handleDismiss = () => {
    const displayTask = activeTask || completedTaskData;
    if (displayTask) {
      storeDismissedTask(displayTask.taskId);
    }
    
    setIsManuallyDismissed(true);
    setIsVisible(false);
    setIsExpanded(false);
    setCompletedTaskData(null);
  };
  
  // Call onComplete callback when task finishes
  useEffect(() => {
    if (activeTask && activeTask.eventType === TASK_STATUS.COMPLETED && onComplete) {
      onComplete(activeTask);
    }
  }, [activeTask, onComplete]);
  
  // Clean up old dismissed tasks on mount
  useEffect(() => {
    cleanupDismissedTasks();
  }, [cleanupDismissedTasks]);
  
  // Don't show if manually dismissed or not visible
  if (isManuallyDismissed || (!isVisible && !completedTaskData && !showInModal)) {
    return null;
  }
  
  // Use either active task or completed task data
  const displayTask = activeTask || completedTaskData;
  
  // Check if current task is dismissed in localStorage
  if (displayTask && isTaskDismissedInStorage(displayTask.taskId)) {
    return null;
  }
  
  // Get task display information
  const getTaskInfo = () => {
    const taskConfigs = {
      [TASK_TYPE.REDDIT_LEADS]: {
        title: 'Finding Reddit Leads',
        description: 'Discovering relevant Reddit discussions...',
        icon: '🔍',
        color: 'blue'
      },
      [TASK_TYPE.SEO_INIT]: {
        title: 'SEO Initialization',
        description: 'Creating blog posts and tracking keywords...',
        icon: '📝',
        color: 'green'
      },
      [TASK_TYPE.PARTNERSHIPS]: {
        title: 'Finding Partners',
        description: 'Discovering potential partnership opportunities...',
        icon: '🤝',
        color: 'purple'
      },
      [TASK_TYPE.GEO_BLOGS]: {
        title: 'Creating Blog Content',
        description: 'Generating SEO-optimized content...',
        icon: '✍️',
        color: 'orange'
      },
      [TASK_TYPE.SUBREDDIT_DISCOVERY]: {
        title: 'Finding Subreddits',
        description: 'Discovering relevant communities...',
        icon: '🌐',
        color: 'red'
      }
    };
    
    return taskConfigs[taskType] || {
      title: title || 'Background Task',
      description: 'Processing...',
      icon: '⚙️',
      color: 'gray'
    };
  };
  
  const taskInfo = getTaskInfo();
  // Show 100% progress for completed tasks
  const progressPercentage = displayTask && displayTask.eventType === TASK_STATUS.COMPLETED 
    ? 100 
    : (progress ? progress.percentage : 0);
  const currentStep = displayTask && displayTask.eventType === TASK_STATUS.COMPLETED 
    ? (progress ? progress.total : 100)
    : (progress ? progress.current : 0);
  const totalSteps = progress ? progress.total : 100;
  
  // Get status display with task-specific terminology
  const getStatusInfo = () => {
    if (!displayTask) {
      return { status: 'Starting...', color: 'text-blue-600' };
    }
    
    // Get task-specific item terminology
    const getItemLabel = (count) => {
      switch (taskType) {
        case TASK_TYPE.REDDIT_LEADS:
          return count === 1 ? 'lead' : 'leads';
        case TASK_TYPE.SEO_INIT:
          return count === 1 ? 'blog post' : 'blog posts';
        case TASK_TYPE.PARTNERSHIPS:
          return count === 1 ? 'partner' : 'partners';
        case TASK_TYPE.GEO_BLOGS:
          return count === 1 ? 'blog post' : 'blog posts';
        case TASK_TYPE.SUBREDDIT_DISCOVERY:
          return count === 1 ? 'subreddit' : 'subreddits';
        default:
          return count === 1 ? 'item' : 'items';
      }
    };
    
    switch (displayTask.eventType) {
      case TASK_STATUS.PENDING:
        return { status: 'Starting...', color: 'text-blue-600' };
      case TASK_STATUS.IN_PROGRESS: {
        const customData = displayTask.customData || {};
        const batchInfo = customData.batch_completed ? 
          ` (Batch ${customData.batch_completed}/${customData.total_batches})` : '';
        
        // Show running total for Reddit leads if available in custom_data
        if (taskType === TASK_TYPE.REDDIT_LEADS && customData.total_posts > 0) {
          return { 
            status: `Processing${batchInfo}... ${customData.total_posts} ${getItemLabel(customData.total_posts)} found`, 
            color: 'text-blue-600' 
          };
        }
        
        // Fallback to items_created for backwards compatibility or other cases
        if (taskType === TASK_TYPE.REDDIT_LEADS && customData.items_created > 0) {
          return { 
            status: `Processing${batchInfo}... ${customData.items_created} ${getItemLabel(customData.items_created)} found`, 
            color: 'text-blue-600' 
          };
        }
        
        return { 
          status: `Processing${batchInfo}...`, 
          color: 'text-blue-600' 
        };
      }
      case TASK_STATUS.COMPLETED: {
        const completedData = displayTask.customData || {};
        
        // For Reddit leads, prefer total_posts count
        let itemsCreated;
        if (taskType === TASK_TYPE.REDDIT_LEADS && completedData.total_posts !== undefined) {
          itemsCreated = completedData.total_posts;
        } else {
          // Try to get items_created directly (from enhanced SSE signal)
          itemsCreated = completedData.items_created;
          
          // Fallback: extract from completion_message for Reddit leads
          if (!itemsCreated && taskType === TASK_TYPE.REDDIT_LEADS && completedData.completion_message) {
            const match = completedData.completion_message.match(/Found (\d+)/);
            if (match) {
              itemsCreated = parseInt(match[1]);
            }
          }
          
          // Final fallback to generic fields
          if (!itemsCreated) {
            itemsCreated = completedData.total_objects || 0;
          }
        }
        
        return { 
          status: `Completed! ${itemsCreated} ${getItemLabel(itemsCreated)} found`, 
          color: 'text-green-600' 
        };
      }
      case TASK_STATUS.FAILED:
        return { status: 'Failed', color: 'text-red-600' };
      default:
        return { status: 'Processing...', color: 'text-blue-600' };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Modal version - only render if explicitly requested
  if (showInModal === true) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="text-4xl mb-4">{taskInfo.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{taskInfo.title}</h3>
            <p className="text-gray-600 mb-4">{taskInfo.description}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className={`bg-${taskInfo.color}-500 h-2 rounded-full transition-all duration-300`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {/* Progress text */}
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{currentStep} / {totalSteps}</span>
              <span>{progressPercentage}%</span>
            </div>
            
            {/* Status */}
            <p className={`text-sm ${statusInfo.color} mb-2`}>
              {statusInfo.status}
            </p>
            
            {/* Show leads found count for Reddit tasks */}
            {taskType === TASK_TYPE.REDDIT_LEADS && displayTask && displayTask.customData && displayTask.customData.total_posts !== undefined && (
              <p className="text-sm text-gray-600 font-medium mb-4">
                {displayTask.customData.total_posts} leads found so far
              </p>
            )}
            
            {/* Navigation button for Reddit leads (only show if not already on Reddit Hub) */}
            {taskType === TASK_TYPE.REDDIT_LEADS && !isOnRedditHub && (
              <button
                onClick={() => navigate('/dashboard/reddit')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Go to Reddit Hub
              </button>
            )}
            
            {/* Connection status */}
            {!isConnected && (
              <p className="text-xs text-red-500 mt-2">
                {connectionError ? `Connection error: ${connectionError}` : 'Disconnected'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Floating indicator version
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };
  
  return (
    <div className={`fixed ${positionClasses[position]} z-40 ${className}`}>
      <div className={`bg-white rounded-lg shadow-lg border transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-64'
      }`}>
        {/* Header */}
        <div 
          className="p-3 cursor-pointer hover:bg-gray-50 rounded-t-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{taskInfo.icon}</span>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {taskInfo.title}
                </h4>
                <p className={`text-xs ${statusInfo.color}`}>
                  {statusInfo.status}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Dismiss button for completed tasks */}
              {displayTask && displayTask.eventType === TASK_STATUS.COMPLETED && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {isConnected ? (
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full" title="Disconnected" />
              )}
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Compact progress bar (always visible) */}
        <div className="px-3 pb-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`bg-${taskInfo.color}-500 h-1 rounded-full transition-all duration-300`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Expanded content */}
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-600 mb-3">
              {taskInfo.description}
            </p>
            
            {/* Detailed progress */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{progressPercentage}%</span>
            </div>
            
            {/* Show leads found count for Reddit tasks */}
            {taskType === TASK_TYPE.REDDIT_LEADS && displayTask && displayTask.customData && (
              <div className="space-y-1 mb-3">
                {displayTask.customData.total_posts !== undefined && (
                  <p className="text-xs text-gray-600 font-medium">
                    {displayTask.customData.total_posts} leads found so far
                  </p>
                )}
              </div>
            )}
            
            {/* Navigation button for Reddit leads (only show if not already on Reddit Hub) */}
            {taskType === TASK_TYPE.REDDIT_LEADS && !isOnRedditHub && (
              <div className="mt-3">
                <button
                  onClick={() => navigate('/dashboard/reddit')}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Go to Reddit Hub
                </button>
              </div>
            )}
            
            {/* Show completion message if available */}
            {displayTask && displayTask.customData && displayTask.customData.completion_message && (
              <div className="mt-2">
                <p className="text-xs text-green-600 font-medium">
                  {displayTask.customData.completion_message}
                </p>
              </div>
            )}
            
            {/* Connection error */}
            {connectionError && (
              <p className="text-xs text-red-500 mt-2">
                Connection error: {connectionError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalProgressIndicator;