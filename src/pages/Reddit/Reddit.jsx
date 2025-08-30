import React, { useState, useEffect } from 'react';
import { useRedditPosts } from '../../hooks/useRedditPosts';
import { useRedditComments } from '../../hooks/useRedditComments';
import PageHeader from './components/PageHeader';
import RedditMetrics from './components/RedditMetrics';
import RedditTableConfig from './components/RedditTableConfig';
import RedditTableActions from './components/RedditTableActions';
import DataTable from './components/DataTable';
import ReplyButton from './components/ReplyButton';
import ClickableLink from './components/ClickableLink';
import API_ENDPOINTS from '../../config/api';

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

// Posts Tab Content Component (Placeholder for now)
const PostsTabContent = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-900">Create Reddit Posts</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            New Post
          </button>
        </div>
      </div>
      
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Reddit Post</h3>
          <p className="text-gray-500 mb-6">
            Generate AI-powered Reddit posts tailored to your business and target subreddits.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
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

  const handleReplyCountUpdate = () => {
    // Update the local counts when API call succeeds
    // This will be called by the ReplyButton after successful API update
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
      <div>
        <ClickableLink href={post.link}>
          {post.body.split('\n')[0]}
        </ClickableLink>
      </div>
    ),
    fullPostContent: post.body.split('\n').slice(1).join('\n'),
    postLink: post.link,
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                0
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
