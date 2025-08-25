import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUpdateBlogPost } from '../hooks/useUpdateBlogPost';
import { useDeleteBlogPost } from '../hooks/useDeleteBlogPost';
import DeletePopup from '../components/DeletePopup';
import TextEdit from '../components/TextEdit';
import Preview from '../components/Preview';
import API_ENDPOINTS from '../config/api';
import { handleUnauthorizedResponse } from '../utils/auth';

const BlogPostEditorPage = () => {
  const { blogPostSlug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  
  const updateBlogPostMutation = useUpdateBlogPost();
  const deleteBlogPostMutation = useDeleteBlogPost();

  // Fetch the specific blog post
  const { data: blogPost, isLoading, error } = useQuery({
    queryKey: ['blogPost', blogPostSlug],
    queryFn: async () => {
      // First, check if we have pre-fetched data in the cache
      const cachedData = queryClient.getQueryData(['blogPost', blogPostSlug]);
      if (cachedData) {
        return cachedData;
      }
      
      // If no cached data, fetch from the database
      const response = await fetch(`${API_ENDPOINTS.getBlogPost}/slug/${blogPostSlug}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (response.status === 401) {
        handleUnauthorizedResponse(queryClient);
        throw new Error('Unauthorized');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!blogPostSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: (failureCount, error) => {
      // If we have cached data and the fetch fails, don't retry immediately
      // This prevents unnecessary retries for newly created posts that aren't in the DB yet
      const cachedData = queryClient.getQueryData(['blogPost', blogPostSlug]);
      if (cachedData && failureCount === 0) {
        return false;
      }
      // Otherwise, retry up to 2 times
      return failureCount < 2;
    }
  });

  useEffect(() => {
    if (blogPost) {
      // Check if this is a temporary blog post (just created, waiting for AI content)
      const isTemporary = blogPost.content === '' && blogPost.company_id === null;
      
      if (isTemporary) {
        // Don't set content yet - wait for AI streaming
        // But we can set the title since it comes from the backend
        setTitle(blogPost.title || '');
        setOriginalTitle(blogPost.title || '');
      } else {
        setTitle(blogPost.title || '');
        setContent(blogPost.content || '');
        setOriginalTitle(blogPost.title || '');
        setOriginalContent(blogPost.content || '');
      }
    }
  }, [blogPost]);

  // Check if this is a newly created blog post that should receive streaming content
  useEffect(() => {
    const streamingBlogPost = localStorage.getItem('streamingBlogPost');
    if (streamingBlogPost && blogPost) {
      try {
        const { slug, timestamp } = JSON.parse(streamingBlogPost);
        
        // Check if this is the same blog post and it was created recently
        if (slug === blogPost.slug && (Date.now() - timestamp) < 30000) {
          startContentStream();
        }
      } catch (error) {
        console.error('Error parsing streaming blog post data:', error);
        localStorage.removeItem('streamingBlogPost');
      }
    }
  }, [blogPost]);

  // Simple content stream function
  const startContentStream = () => {
    
    // Simple interval to check for content updates
    const interval = setInterval(() => {
      const streamingBlogPost = localStorage.getItem('streamingBlogPost');
      if (streamingBlogPost) {
        try {
          const { slug, isStreaming } = JSON.parse(streamingBlogPost);
          if (slug === blogPost.slug && isStreaming) {
            const currentContent = localStorage.getItem(`blogPostContent_${slug}`);
            if (currentContent) {
              setContent(currentContent);
              setOriginalContent(currentContent);
            }
          } else if (slug === blogPost.slug && !isStreaming) {
            // Streaming complete, save the blog post
            const finalContent = localStorage.getItem(`blogPostContent_${slug}`);
            if (finalContent) {
              autoSaveBlogPost(finalContent);
              
              // Clean up
              localStorage.removeItem('streamingBlogPost');
              localStorage.removeItem(`blogPostContent_${slug}`);
              localStorage.removeItem(`blogPostEndMarker_${slug}`);
              
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Error in content stream:', error);
        }
      }
    }, 100);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  };

  // Function to automatically save the blog post
  const autoSaveBlogPost = async (content) => {
    try {
      
      // Call the update API with the AI-generated content
      const updatedBlogPost = await updateBlogPostMutation.mutateAsync({
        blogPostId: blogPost.id,
        content: content,
      });
      
      
      // Explicitly update the cache to ensure GEO tiles are refreshed
      queryClient.setQueryData(['blogPost', blogPost.slug], updatedBlogPost);
      
      // Also update the geoBlogPosts cache to include the updated content
      queryClient.setQueryData(['geoBlogPosts'], (oldData) => {
        if (!oldData) return [updatedBlogPost];
        return oldData.map(post => 
          post.id === blogPost.id ? updatedBlogPost : post
        );
      });
      
      // Force a refetch of geoBlogPosts to ensure the tiles are updated
      // Add a small delay to ensure the API response is fully processed
      setTimeout(() => {
        queryClient.invalidateQueries(['geoBlogPosts']);
      }, 100);
      
      // Update local state to reflect the saved content
      setContent(content);
      setOriginalContent(content);
      
    } catch (error) {
      console.error('Failed to auto-save blog post:', error);
      // Don't show error to user since this is automatic
      // The user can still manually save if needed
    }
  };

  const handleSave = async () => {
    try {
      // Determine which fields have changed
      const hasTitleChanged = title !== originalTitle;
      const hasContentChanged = content !== originalContent;
      
      if (!hasTitleChanged && !hasContentChanged) {
        // No changes to save, redirect back to GEO page
        navigate('/dashboard/geo');
        return;
      }
      
      // Call the update API with only changed fields
      await updateBlogPostMutation.mutateAsync({
        blogPostId: blogPost.id,
        title: hasTitleChanged ? title : undefined,
        content: hasContentChanged ? content : undefined,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['geoBlogPosts']);
      queryClient.invalidateQueries(['blogPost', blogPostSlug]);
      
      // Ensure the cache is fresh before navigating back
      await queryClient.refetchQueries(['geoBlogPosts']);
      
      // Redirect back to GEO page
      navigate('/dashboard/geo');
      
    } catch (error) {
      console.error('Failed to save blog post:', error);
      // Error is already displayed in the UI via the mutation error state
    }
  };

  const handleCancel = () => {
    // Ensure the GEO cache is fresh before navigating back
    queryClient.invalidateQueries(['geoBlogPosts']);
    navigate('/dashboard/geo');
  };

  const handleDelete = () => {
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBlogPostMutation.mutateAsync(blogPost.id);
      setShowDeletePopup(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['geoBlogPosts']);
      
      // Redirect back to GEO page
      navigate('/dashboard/geo');
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      // Keep popup open if there's an error
    }
  };

  const handleDeleteCancel = () => {
    setShowDeletePopup(false);
  };

  // Handle content change
  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  // Handle title change and clear errors
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    // Clear error when user starts typing
    if (updateBlogPostMutation.error) {
      updateBlogPostMutation.reset();
    }
  };

  // Show loading state only if we don't have any data and are actually loading
  if (isLoading && !blogPost) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  // Show error state only if we don't have cached data
  if (error && !blogPost) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load blog post</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Blog post not found
  if (!blogPost) {
    return (
      <div className="bg-white h-full w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/geo')}
              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              title="Back to GEO Hub"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Blog Post Not Found</h2>
          </div>
        </div>

        {/* Not Found Content */}
        <div className="flex flex-1 p-6 gap-6">
          <div className="flex-1">
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Blog Post Not Found</h3>
                <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
                <button 
                  onClick={() => navigate('/dashboard/geo')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to GEO Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            title="Back to GEO Hub"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {blogPost.title || 'Untitled Blog Post'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={updateBlogPostMutation.isPending}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              updateBlogPostMutation.isPending
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {updateBlogPostMutation.isPending ? 'Saving...' : 'Save'}
            {isLoading && blogPost && !updateBlogPostMutation.isPending && (
              <span className="ml-2 inline-flex items-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}
          </button>
          
          {/* Auto-saved indicator */}
          {/* Removed as per edit hint */}
          
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteBlogPostMutation.isPending}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              deleteBlogPostMutation.isPending
                ? 'bg-red-400 text-white cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title="Delete blog post"
          >
            {deleteBlogPostMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            {isLoading && blogPost && !deleteBlogPostMutation.isPending && (
              <span className="ml-2 inline-flex items-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 p-6 gap-6">
        {/* Text Editor Section */}
        <TextEdit
          title={title}
          content={content}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          error={updateBlogPostMutation.error}
        />

        {/* Preview Section */}
        <Preview content={content} />
      </div>

      {/* Delete Confirmation Popup */}
      <DeletePopup
        isOpen={showDeletePopup}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog Post?"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteBlogPostMutation.isPending}
        loadingText="Deleting..."
      />
    </div>
  );
};

export default BlogPostEditorPage;
