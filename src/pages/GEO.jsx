import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeoBlogPosts } from '../hooks/useGeoBlogPosts';
import { useCreateBlogPost } from '../hooks/useCreateBlogPost';
import GeoBlogTile from '../components/GeoBlogTile';
import SearchTerm from '../components/SearchTerm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

function GEO() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch blog posts using React Query
  const { data: blogPosts, isLoading, error } = useGeoBlogPosts();
  
  // Create blog post mutation
  const createBlogPostMutation = useCreateBlogPost();

  // Fetch search terms using React Query
  const { data: searchTerms, isLoading: isLoadingTerms, error: termsError } = useQuery({
    queryKey: ['geoSearchTerms'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.geoSearchTerms, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch search terms');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleBlogClick = (blogPost) => {
    // Pre-fetch the blog post data before navigation for faster loading
    queryClient.prefetchQuery({
      queryKey: ['blogPost', blogPost.slug],
      queryFn: async () => {
        const response = await fetch(`${API_ENDPOINTS.getBlogPost}/slug/${blogPost.slug}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        return response.json();
      },
    });
    
    // Navigate directly to the blog post editor route using slug
    navigate(`/dashboard/geo/${blogPost.slug}`);
  };

  const handleTermClick = (term) => {
    console.log(`Search term clicked: ${term.term}`);
    // TODO: Handle filtering or actions for the selected search term
  };

  const handleCreateBlogPost = async () => {
    try {
      const newBlogPost = await createBlogPostMutation.mutateAsync();
      
      // Store the created blog post in the geoBlogPosts cache
      queryClient.setQueryData(['geoBlogPosts'], (oldData) => {
        if (!oldData) return [newBlogPost];
        return [newBlogPost, ...oldData];
      });
      
      // Store the individual blog post data in the cache for the editor
      queryClient.setQueryData(['blogPost', newBlogPost.slug], newBlogPost);
      
      // Navigate directly to the new blog post editor using slug
      navigate(`/dashboard/geo/${newBlogPost.slug}`);
    } catch (error) {
      console.error('Failed to create blog post:', error);
      // You could add a toast notification here
    }
  };

  return (
    <div className="h-full">
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-1">SEO Hub</h1>
          <p className="text-gray-600">Create search-engine-optimised content for your business</p>
        </div>

        {/* Keywords Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-1">Search Terms</h2>
          <p className="text-gray-600 mb-6">See how your website ranks online</p>
          {isLoadingTerms && (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-3xl px-8 py-4 bg-gray-200 animate-pulse" />
              ))}
            </div>
          )}
          {termsError && (
            <div className="text-red-600">Failed to load search terms</div>
          )}
          {searchTerms && searchTerms.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {searchTerms
                .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
                .map((item, index) => {
                  console.log(`SearchTerm ${index}: term="${item.term}", rank=${item.rank}, type=${typeof item.rank}`);
                  return (
                    <SearchTerm
                      key={item.id || `${item.term}-${index}`}
                      term={item.term}
                      rank={item.rank}
                      onClick={() => handleTermClick(item)}
                    />
                  );
                })}
            </div>
          )}
        </div>

        {/* Blog Posts Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-semibold">Blog Posts</h2>
            <div className="relative group">
              <button
                onClick={handleCreateBlogPost}
                disabled={createBlogPostMutation.isPending}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {createBlogPostMutation.isPending ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 21 21"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4.5H5.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V11"/><path d="M17.5 3.467a1.462 1.462 0 0 1-.017 2.05L10.5 12.5l-3 1 1-3 6.987-7.046a1.409 1.409 0 0 1 1.885-.104zM15.5 5.5l.953 1"/></g></svg>
                )}
              </button>
              
              {/* Custom Tooltip */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                New blog post
              </div>
            </div>
            
          </div>
          <p className="text-gray-600 mb-6">Add blog posts to your website to increase visibility</p>
          
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Loading Skeleton 1 */}
              <div className="bg-gray-200 rounded-xl animate-pulse h-24"></div>
              
              {/* Loading Skeleton 2 */}
              <div className="bg-gray-200 rounded-xl animate-pulse h-24"></div>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading blog posts: {error.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}
          
          {blogPosts && blogPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts
                .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                .map((blog) => (
                  <GeoBlogTile
                    key={blog.id}
                    title={blog.title}
                    lastUpdated={blog.updated_at}
                    onClick={() => handleBlogClick(blog)}
                  />
                ))}
            </div>
          )}
          
          {blogPosts && blogPosts.length === 0 && !isLoading && !error && (
            <div className="text-center py-8">
              <p className="text-gray-600">No blog posts found. Create your first blog post to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GEO;