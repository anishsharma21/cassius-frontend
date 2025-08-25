import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeoBlogPosts } from '../hooks/useGeoBlogPosts';
import { useCreateBlogPost } from '../hooks/useCreateBlogPost';
import GeoBlogTile from '../components/GeoBlogTile';
import KeywordTile from '../components/KeywordTile';
import { useQueryClient } from '@tanstack/react-query';
import API_ENDPOINTS from '../config/api';

function GEO() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch blog posts using React Query
  const { data: blogPosts, isLoading, error } = useGeoBlogPosts();
  
  // Create blog post mutation
  const createBlogPostMutation = useCreateBlogPost();

  // Sample SEO keywords data with ranks (1 = best, higher = worse)
  const sampleKeywords = [
    { keyword: "Geographic Information Systems", rank: 1 },
    { keyword: "Spatial Analytics", rank: 2 },
    { keyword: "Remote Sensing", rank: 3 },
    { keyword: "Cartography", rank: 4 },
    { keyword: "Geospatial Data", rank: 5 },
    { keyword: "Satellite Imagery", rank: 6 },
    { keyword: "Environmental Monitoring", rank: 7 },
    { keyword: "Urban Planning", rank: 8 },
    { keyword: "Climate Mapping", rank: 9 },
    { keyword: "Data Visualization", rank: 10 },
    { keyword: "Topographic Analysis", rank: 11 },
    { keyword: "Geodetic Surveying", rank: 12 }
  ];

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

  const handleKeywordClick = (keyword) => {
    console.log(`Keyword clicked: ${keyword}`);
    // Handle keyword filtering or search
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
          <h1 className="text-3xl font-bold mb-2">GEO Hub</h1>
          <p className="text-gray-600">Create generative-engine-optimized content for your business</p>
        </div>

        {/* Keywords Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Search Terms</h2>
          <div className="flex flex-wrap gap-3">
            {sampleKeywords.map((item, index) => (
              <KeywordTile
                key={index}
                keyword={item.keyword}
                rank={item.rank}
                onClick={() => handleKeywordClick(item.keyword)}
              />
            ))}
          </div>
        </div>

        {/* Blog Posts Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-semibold">Blog Posts</h2>
            <div className="relative group">
              <button
                onClick={handleCreateBlogPost}
                disabled={createBlogPostMutation.isPending}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {createBlogPostMutation.isPending ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path fill="#0F0F0F" d="M11 8a1 1 0 1 1 2 0v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8Z"/>
                    <path fill="#0F0F0F" fill-rule="evenodd" d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11ZM3.007 12a8.993 8.993 0 1 0 17.986 0 8.993 8.993 0 0 0-17.986 0Z" clip-rule="evenodd"/>
                  </svg>
                )}
              </button>
              
              {/* Custom Tooltip */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                New blog post
              </div>
            </div>
          </div>
          
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