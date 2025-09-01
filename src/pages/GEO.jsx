import React, { useState, useEffect } from 'react';
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Fetch blog posts using React Query
  const { data: blogPosts, isLoading, error } = useGeoBlogPosts();
  
  // Create blog post mutation
  const createBlogPostMutation = useCreateBlogPost();

  // ESC key handler for info modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showInfoModal) {
        setShowInfoModal(false);
      }
    };

    if (showInfoModal) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [showInfoModal]);

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">SEO Hub</h1>
              <p className="text-gray-600">Create search-engine-optimised content for your business</p>
            </div>
            
            {/* Information button */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
              title="Learn about SEO strategy"
            >
              <span className="text-sm">How to use</span>
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-xs font-bold">?</span>
              </div>
            </button>
          </div>
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

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}} onClick={() => setShowInfoModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">SEO</h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                SEO is one of the most effective long-term growth strategies for any product. The keywords shown here are the ones you should be targeting, so use Cassius Intelligence to generate blogs that rank for them.
              </p>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Why this matters:</h4>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Search intent:</strong> These keywords are exactly what your potential customers are Googling.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Local relevance:</strong> Location-specific content (like "computer parts in Sydney") is critical if people search with geography in mind.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Compounding returns:</strong> SEO isn't dead, despite what people say. The more quality blogs you publish, the more your traffic grows over time.</span>
                </li>
              </ul>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Tips for usage:</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Ask Cassius Intelligence for blog ideas around the suggested keywords, then let Cassius write them for you.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Prioritize both general and location-based blogs for maximum reach.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Publish consistently, as SEO compounds the more content you have out there.</span>
                </li>
              </ul>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Coming soon:</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>One-click publishing:</strong> Direct integration with your CMS or web provider so blogs upload instantly.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>SEO Audit Agent:</strong> Scan your site, see how your current content is ranking, and get automated improvements.</span>
                </li>
              </ul>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 font-medium">
                  In short, keep writing and publishing blogs. This is a compounding, long-term growth lever that every serious business needs.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GEO;