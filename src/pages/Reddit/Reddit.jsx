import React, { useState, useEffect } from 'react';
import { useRedditPosts } from '../../hooks/useRedditPosts';
import { useUserSubreddits } from '../../hooks/useUserSubreddits';
import { useGeneratePost } from '../../hooks/useGeneratePost';
import { useGeneratedPosts } from '../../hooks/useGeneratedPosts';
import { useUpdatePost } from '../../hooks/useUpdatePost';
import RedditMetrics from './components/RedditMetrics';
import RedditTableConfig from './components/RedditTableConfig';
import RedditTableActions from './components/RedditTableActions';
import DataTable from './components/DataTable';
import ReplyButton from './components/ReplyButton';
import ClickableLink from './components/ClickableLink';
import CopyGoToRedditButton from '../../components/CopyGoToRedditButton';

// Leads Tab Content Component
const LeadsTabContent = ({ columns, tableData, actions, currentPage, totalPages, onPageChange, isLoading }) => {
  return (
    <DataTable
      title="Leads"
      columns={columns}
      data={tableData}
      actions={actions}
      showCheckboxes={true}
      expandableData={[]}
      externalPagination={true}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      isLoading={isLoading}
    />
  );
};

// Posts Tab Content Component
const PostsTabContent = () => {
  const [selectedSubreddit, setSelectedSubreddit] = useState('');
  const [customSubreddit, setCustomSubreddit] = useState('');
  const [subredditInputMode, setSubredditInputMode] = useState('dropdown'); // 'dropdown' or 'custom'
  const [userDescription, setUserDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  
  // ESC key handler for modals
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (editingPost) {
          setEditingPost(null);
        } else if (previewPost) {
          setPreviewPost(null);
        }
      }
    };

    if (editingPost || previewPost) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [editingPost, previewPost]);
  
  const { subreddits, loading: subredditsLoading } = useUserSubreddits();
  const { generatePost, isGenerating } = useGeneratePost();
  const { posts, loading: postsLoading, refetch: refetchPosts, addNewPost, updatePost } = useGeneratedPosts(1, 10);
  const { updatePost: updatePostAPI, markAsPosted, markAsDraft, isUpdating } = useUpdatePost();

  const handleGenerate = async () => {
    const targetSubreddit = subredditInputMode === 'custom' ? customSubreddit : selectedSubreddit;
    
    if (!targetSubreddit) {
      alert('Please select a subreddit or enter a custom one');
      return;
    }

    setGeneratedContent('');
    
    await generatePost(
      targetSubreddit,
      userDescription,
      (chunk) => {
        setGeneratedContent(prev => prev + chunk);
      },
      (postData) => {
        if (postData) {
          addNewPost(postData);
        }
        refetchPosts();
        setShowForm(false);
        setSelectedSubreddit('');
        setCustomSubreddit('');
        setUserDescription('');
        setGeneratedContent('');
      }
    );
  };

  const handleEdit = (post) => {
    setEditingPost({
      ...post,
      originalTitle: post.title,
      originalContent: post.content
    });
  };

  const handleSaveEdit = async () => {
    try {
      const updatedPost = await updatePostAPI(editingPost.id, {
        title: editingPost.title,
        content: editingPost.content,
        user_description: editingPost.user_description
      });
      updatePost(updatedPost);
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const handleMarkPosted = async (postId) => {
    try {
      const updatedPost = await markAsPosted(postId);
      updatePost(updatedPost);
    } catch (error) {
      console.error('Error marking post as posted:', error);
      alert('Failed to mark post as posted');
    }
  };

  const handleMarkDraft = async (postId) => {
    try {
      const updatedPost = await markAsDraft(postId);
      updatePost(updatedPost);
    } catch (error) {
      console.error('Error marking post as draft:', error);
      alert('Failed to mark post as draft');
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Post Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-900">Generate Reddit Post</h2>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {showForm ? 'Cancel' : 'New Post'}
            </button>
          </div>
        </div>
        
        {showForm && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Subreddit
                </label>
                
                {/* Toggle between dropdown and custom input */}
                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="subredditMode"
                      value="dropdown"
                      checked={subredditInputMode === 'dropdown'}
                      onChange={(e) => {
                        setSubredditInputMode(e.target.value);
                        setCustomSubreddit('');
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Choose from your subreddits</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="subredditMode"
                      value="custom"
                      checked={subredditInputMode === 'custom'}
                      onChange={(e) => {
                        setSubredditInputMode(e.target.value);
                        setSelectedSubreddit('');
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enter custom subreddit</span>
                  </label>
                </div>

                {subredditInputMode === 'dropdown' ? (
                  <select
                    value={selectedSubreddit}
                    onChange={(e) => setSelectedSubreddit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={subredditsLoading || isGenerating}
                  >
                    <option value="">Select a subreddit...</option>
                    {subreddits.map((subreddit) => (
                      <option key={subreddit.id} value={subreddit.subreddit_name}>
                        r/{subreddit.subreddit_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">r/</span>
                    </div>
                    <input
                      type="text"
                      value={customSubreddit}
                      onChange={(e) => setCustomSubreddit(e.target.value)}
                      placeholder="Enter subreddit name (e.g., AskReddit)"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  placeholder="Provide any additional context or specific points you'd like to emphasize..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={
                    (subredditInputMode === 'dropdown' && !selectedSubreddit) ||
                    (subredditInputMode === 'custom' && !customSubreddit.trim()) ||
                    isGenerating
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate Post'}
                </button>
              </div>
            </div>
            
            {/* Generation Output */}
            {(generatedContent || isGenerating) && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {isGenerating ? 'Generating Post...' : 'Generated Content'}
                </h3>
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {generatedContent}
                  {isGenerating && <span className="animate-pulse">|</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Posts History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Generated Posts</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {postsLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Generate your first Reddit post to get started.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-600">r/{post.subreddit_name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'posted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setPreviewPost(post)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400 transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleEdit(post)}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <CopyGoToRedditButton 
                      title={post.title}
                      content={post.content}
                      subredditName={post.subreddit_name}
                      className="text-sm"
                    />
                    {post.status === 'draft' ? (
                      <button
                        onClick={() => handleMarkPosted(post.id)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 cursor-pointer"
                      >
                        Mark Posted
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkDraft(post.id)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 cursor-pointer"
                      >
                        Mark as Draft
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}} onClick={() => setEditingPost(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Edit Post</h3>
              <button 
                onClick={() => setEditingPost(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}} onClick={() => setPreviewPost(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium text-gray-900">Post Preview</h3>
                  <span className="text-sm font-medium text-blue-600">r/{previewPost.subreddit_name}</span>
                </div>
                <button 
                  onClick={() => setPreviewPost(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Reddit-style preview */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">r/</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">r/{previewPost.subreddit_name}</div>
                    <div className="text-xs text-gray-500">Posted by u/yourcompany • now</div>
                  </div>
                </div>
                
                <h2 className="text-lg font-medium text-gray-900 mb-3">{previewPost.title}</h2>
                
                <div className="text-sm text-gray-700 whitespace-pre-wrap mb-4">
                  {previewPost.content}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Upvote
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
                    </svg>
                    Comments
                  </span>
                  <span>Share</span>
                  <span>Save</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Preview only - remember to manually post this to Reddit</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setPreviewPost(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPreviewPost(null);
                  handleEdit(previewPost);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Edit Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format dates
const formatPostDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMins > 0) {
    return `${diffMins}m ago`;
  } else {
    return 'just now';
  }
};

function Reddit() {
  const [currentPage, setCurrentPage] = useState(1);
  const [localReplyStates, setLocalReplyStates] = useState({});
  const [localCommentReplyStates, setLocalCommentReplyStates] = useState({});
  const [localTotalCount, setLocalTotalCount] = useState(0);
  const [localRepliedCount, setLocalRepliedCount] = useState(0);
  const [activeTab, setActiveTab] = useState('leads'); // New state for tab management

  // Fetch Reddit posts using React Query
  const { data: redditData, isLoading, error } = useRedditPosts(currentPage);
  
  // Fetch generated posts count for the posts tab
  const { totalCount: generatedPostsCount } = useGeneratedPosts(1, 1);
  
  // Extract posts and counts from the new response format
  const redditPosts = redditData?.posts || [];
  const totalPosts = redditData?.total_count || 0;
  const repliedPosts = redditData?.replied_count || 0;

  // Initialize local counts when API data changes
  useEffect(() => {
    if (redditData) {
      setLocalTotalCount(redditData.total_count || 0);
      setLocalRepliedCount(redditData.replied_count || 0);
    }
  }, [redditData]);

  // Reset current page if it's greater than total pages
  useEffect(() => {
    if (totalPosts > 0 && currentPage > Math.ceil(totalPosts / 10)) {
      setCurrentPage(1);
    }
  }, [totalPosts, currentPage]);



  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePostReplyUpdate = (postId, newStatus) => {
    setLocalReplyStates(prev => ({
      ...prev,
      [postId]: newStatus
    }));
    
    // Update local counts
    if (newStatus) {
      setLocalRepliedCount(prev => prev + 1);
    } else {
      setLocalRepliedCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleCommentReplyUpdate = (commentId, newStatus) => {
    setLocalCommentReplyStates(prev => ({
      ...prev,
      [commentId]: newStatus
    }));
    
    // Update local counts for comments
    if (newStatus) {
      setLocalRepliedCount(prev => prev + 1);
    } else {
      setLocalRepliedCount(prev => Math.max(0, prev - 1));
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Reddit Hub</h1>
            <p className="text-gray-600">Engage with potential customers on Reddit</p>
          </div>
          <RedditMetrics totalPosts={localTotalCount || 0} repliedPosts={localRepliedCount !== undefined ? localRepliedCount : 0} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium text-gray-900">Leads</h2>
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>

          {/* Table Headings */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-4">
              <div className="text-sm font-medium text-gray-700">Post</div>
              <div className="text-sm font-medium text-gray-700">Upvotes</div>
              <div className="text-sm font-medium text-gray-700">Comments</div>
              <div className="text-sm font-medium text-gray-700">Actions</div>
              <div className="text-sm font-medium text-gray-700">Expand</div>
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-200">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="px-6 py-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-white">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error loading Reddit posts: {error.message}</div>
        </div>
      </div>
    );
  }

  // Get data from reusable components
  const columns = RedditTableConfig();
  const actions = RedditTableActions();

  // Create table data with reply state management and UI components
  const tableData = (redditPosts || []).map((post) => ({
    id: post.id,
    post: (
      <div className="space-y-1">
        <div className="font-medium text-gray-900 text-sm leading-5 max-w-md">
          <div className="break-words overflow-hidden" title={post.body.split('\n')[0]}>
            <ClickableLink href={post.link}>
              {post.body.split('\n')[0]}
            </ClickableLink>
          </div>
        </div>
      </div>
    ),
    fullPostContent: post.body.split('\n').slice(1).join('\n'),
    postLink: post.link,
    post_date: (
      <span className="text-sm text-gray-500">
        {formatPostDate(post.created_at)}
      </span>
    ),
    post_upvotes: post.score,
    post_comments: post.num_comments,
    post_actions: (
      <div className="flex items-center justify-center gap-3">
        <ReplyButton 
          onClick={() => {
            console.log('🔴 Post ReplyButton clicked with link:', post.link);
          }}
          isReplied={localReplyStates[post.id] !== undefined ? localReplyStates[post.id] : post.replied_to}
          content={post.body}
          contentType="post"
          link={post.link}
          leadId={post.id}
          onReplyUpdate={(newStatus) => handlePostReplyUpdate(post.id, newStatus)}
        />
      </div>
    ),
    onCommentReplyUpdate: handleCommentReplyUpdate,
    localCommentReplyStates: localCommentReplyStates
  }));






  return (
    <div className="p-6 bg-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Reddit Hub</h1>
          <p className="text-gray-600">Engage with potential customers on Reddit</p>
        </div>
        <RedditMetrics totalPosts={localTotalCount || totalPosts} repliedPosts={localRepliedCount !== undefined ? localRepliedCount : repliedPosts} />
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leads
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {localTotalCount || totalPosts}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {generatedPostsCount || 0}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'leads' && (
        <LeadsTabContent
          columns={columns}
          tableData={tableData}
          actions={actions}
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(totalPosts / 10))}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'posts' && (
        <PostsTabContent />
      )}
    </div>
  );
}

export default Reddit;
