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
  const [isReceivingContent, setIsReceivingContent] = useState(false); // Track if actively receiving content
  const [isManualSaving, setIsManualSaving] = useState(false); // Track only manual save operations

  
  const updateBlogPostMutation = useUpdateBlogPost();
  const deleteBlogPostMutation = useDeleteBlogPost();

  // Fetch the specific blog post
  const { data: blogPost, isLoading, error } = useQuery({
    queryKey: ['blogPost', blogPostSlug],
    queryFn: async () => {
      console.log('🔍 Fetching blog post:', blogPostSlug);
      // First, check if we have pre-fetched data in the cache
      const cachedData = queryClient.getQueryData(['blogPost', blogPostSlug]);
      if (cachedData) {
        console.log('Using cached data for:', blogPostSlug);
        return cachedData;
      }
      
      console.log('Fetching from database for:', blogPostSlug);
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
      const data = await response.json();
      console.log('✅ Fetched data from database:', data);
      return data;
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
    if (blogPost && blogPost.content === '' && blogPost.company_id === null) {
      // This is a new blog post waiting for AI content, start listening for content updates
      console.log('✅ Starting content stream for new blog post:', blogPost.slug);
      setIsReceivingContent(true);
      const cleanup = startContentStream();
      return cleanup; // Return cleanup function to useEffect
    } else {
      console.log('🔍 Blog post has content or is not new, no streaming needed');
      setIsReceivingContent(false);
    }
  }, [blogPost]);

  // Simplified content stream function
  const startContentStream = () => {
    let lastContentLength = 0;
    let noUpdateCount = 0;
    
    // Check for content updates every 100ms
    const interval = setInterval(async () => {
      // Check for content updates
      const currentContent = localStorage.getItem(`blogPostContent_${blogPost.slug}`);
      if (currentContent) {
        const newContentLength = currentContent.length;
        
        if (newContentLength !== lastContentLength) {
          // Content has been updated
          setContent(currentContent);
          setOriginalContent(currentContent);
          lastContentLength = newContentLength;
          noUpdateCount = 0; // Reset no-update counter
          console.log('📝 Content updated:', newContentLength, 'characters');
        } else {
          // No new content, increment counter
          noUpdateCount++;
          
          // If no updates for 1 second (10 * 100ms), assume streaming is complete
          if (noUpdateCount >= 10) {
            console.log('🎯 No content updates for 1 second, assuming streaming complete');
            
            if (currentContent && currentContent.length > 0) {
              console.log('📝 Final content found, calling autoSaveBlogPost');
              console.log('📊 Content length:', currentContent.length);
              console.log('📄 Content preview:', currentContent.substring(0, 100) + '...');
              
              // Call auto-save and wait for it to complete
              await autoSaveBlogPost(currentContent);
              
              // Clean up after auto-save is complete
              localStorage.removeItem(`blogPostContent_${blogPost.slug}`);
              
              // Reset streaming state
              setIsReceivingContent(false);
              
              clearInterval(interval);
              console.log('🧹 Cleanup completed for slug:', blogPost.slug);
            } else {
              console.log('⚠️ No content found, stopping stream monitoring');
              setIsReceivingContent(false);
              clearInterval(interval);
            }
          }
        }
      } else {
        // No content in localStorage, increment counter
        noUpdateCount++;
        
        // If no content for 1 second (10 * 100ms), stop monitoring
        if (noUpdateCount >= 10) {
          console.log('⚠️ No content found in localStorage, stopping stream monitoring');
          setIsReceivingContent(false);
          clearInterval(interval);
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
      console.log('🔄 Starting auto-save for blog post:', blogPost.id);
      
      // Update local state to reflect the final content
      setContent(content);
      setOriginalContent(content);
      
      console.log('✅ Content updated in editor, now saving to database...');
      
      // Save the content to the database without redirecting
      console.log('🔄 Calling updateBlogPostMutation.mutateAsync...');
      const result = await updateBlogPostMutation.mutateAsync({
        blogPostId: blogPost.id,
        content: content,
      });
      
      console.log('✅ Auto-save completed successfully - content saved to database:', result);
      
      // Auto-save completed silently - no status message needed
      
    } catch (error) {
      console.error('❌ Failed to auto-save blog post:', error);
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
        // No changes to save, show message and stay on page
        console.log('✅ No changes to save - content already auto-saved');
        // You could show a toast notification here: "No changes to save"
        return;
      }
      
      // Call the update API with only changed fields
      await updateBlogPostMutation.mutateAsync({
        blogPostId: blogPost.id,
        title: hasTitleChanged ? title : undefined,
        content: hasContentChanged ? content : undefined,
      });
      
      // The useUpdateBlogPost hook already handles cache invalidation in onSuccess
      // Navigate immediately after successful mutation
      navigate('/dashboard/geo');
      
    } catch (error) {
      console.error('Failed to save blog post:', error);
      // Error is already displayed in the UI via the mutation error state
    }
  };

  const handleCancel = () => {
    // Navigate immediately - no need to invalidate cache for cancel
    navigate('/dashboard/geo');
  };

  const handleDelete = () => {
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBlogPostMutation.mutateAsync(blogPost.id);
      setShowDeletePopup(false);
      
      // Navigate immediately after successful deletion
      // The delete mutation hook should handle cache invalidation
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

  // Blog post not found - only show this if we're not loading and definitely don't have a blog post
  if (!blogPost && !isLoading && !error) {
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
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
              ) : (
                blogPost?.title || 'Untitled Blog Post'
              )}
            </h2>
          </div>
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
            {updateBlogPostMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Save'
            )}
          </button>
          

          
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
          isLoading={isLoading}
        />

        {/* Preview Section */}
        <Preview content={content} isLoading={isLoading} />
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
