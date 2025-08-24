import React, { useState } from 'react';
import { useGeoBlogPosts } from '../hooks/useGeoBlogPosts';
import GeoBlogTile from '../components/GeoBlogTile';
import KeywordTile from '../components/KeywordTile';
import BlogPostEditor from '../components/BlogPostEditor';

function GEO() {
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  
  // Fetch blog posts using React Query
  const { data: blogPosts, isLoading, error } = useGeoBlogPosts();
  
  // Debug logging
  console.log('GEO component - blogPosts:', blogPosts);
  console.log('GEO component - isLoading:', isLoading);
  console.log('GEO component - error:', error);
  
  // Log individual blog post data for debugging
  if (blogPosts && blogPosts.length > 0) {
    console.log('First blog post data:', blogPosts[0]);
    console.log('First blog post updated_at:', blogPosts[0].updated_at);
  }

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

  const handleBlogClick = (blogId) => {
    const blogPost = blogPosts?.find(blog => blog.id === blogId);
    setSelectedBlogPost(blogPost);
  };

  const handleBlogClose = () => {
    setSelectedBlogPost(null);
  };

  const handleBlogSave = (updatedBlogPost) => {
    console.log('Blog post saved:', updatedBlogPost);
    // The blog post has been updated via the API, so we can close the editor
    setSelectedBlogPost(null);
  };

  const handleKeywordClick = (keyword) => {
    console.log(`Keyword clicked: ${keyword}`);
    // Handle keyword filtering or search
  };

  return (
    <div className="h-full">
      {selectedBlogPost ? (
        <BlogPostEditor
          blogPost={selectedBlogPost}
          onClose={handleBlogClose}
          onSave={handleBlogSave}
        />
      ) : (
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
            <h2 className="text-2xl font-semibold mb-4">Blog Posts</h2>
            
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
                      onClick={() => handleBlogClick(blog.id)}
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
      )}
    </div>
  );
}

export default GEO;