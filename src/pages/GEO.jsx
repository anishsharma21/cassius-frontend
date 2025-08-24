import React, { useState } from 'react';
import GeoBlogTile from '../components/GeoBlogTile';
import KeywordTile from '../components/KeywordTile';
import BlogPostEditor from '../components/BlogPostEditor';

function GEO() {
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  
  // Sample blog post data with content
  const sampleBlogPosts = [
    {
      id: 1,
      title: "Understanding Geographic Data Analysis: A Comprehensive Guide to Spatial Analytics and Mapping Techniques",
      lastUpdated: "2024-01-15T10:30:00Z",
      content: "# Understanding Geographic Data Analysis\n\n## A Comprehensive Guide to Spatial Analytics and Mapping Techniques\n\nGeographic data analysis is a **fundamental aspect** of modern spatial sciences that combines traditional statistical methods with geographic information systems (GIS) to provide comprehensive insights into spatial patterns and relationships.\n\nThis comprehensive guide covers essential concepts including:\n\n### Core Components\n- **Spatial data collection and validation**\n- **Statistical analysis techniques** for geographic data\n- **Mapping and visualization** best practices\n- **Integration of multiple data sources**\n- **Quality assurance and accuracy assessment**\n\n### Advanced Techniques\n1. **Spatial autocorrelation analysis**\n2. **Hot spot detection and clustering**\n3. **Network analysis and routing**\n4. **3D spatial modeling**\n5. **Time-series spatial analysis**\n\n### Applications\nUnderstanding these techniques is crucial for professionals working in:\n\n- **Urban Planning** - City development and infrastructure\n- **Environmental Science** - Climate change and conservation\n- **Transportation** - Route optimization and traffic analysis\n- **Public Health** - Disease spread and healthcare access\n- **Agriculture** - Crop monitoring and yield prediction\n\n> **Pro Tip**: Always validate your spatial data before analysis to ensure accurate results.\n\nFor more information, visit our [GIS Resources Hub](https://example.com/gis-resources) or contact our [Spatial Analytics Team](mailto:analytics@example.com)."
    },
    {
      id: 2,
      title: "Advanced GIS Applications in Urban Planning: How Modern Cities Leverage Geographic Information Systems",
      lastUpdated: "2024-01-12T14:20:00Z",
      content: "# Advanced GIS Applications in Urban Planning\n\n## How Modern Cities Leverage Geographic Information Systems\n\nModern urban planning has been **revolutionized** by the integration of Geographic Information Systems (GIS), enabling planners to make data-driven decisions that improve city livability and sustainability.\n\n### Key Applications Include\n\n#### 🏗️ **Land Use & Zoning**\n- Land use planning and zoning analysis\n- Development density calculations\n- Zoning compliance monitoring\n- Land value assessment\n\n#### 🚗 **Transportation Planning**\n- Transportation network optimization\n- Traffic flow analysis\n- Public transit routing\n- Parking demand modeling\n\n#### 🌱 **Environmental Impact**\n- Environmental impact assessment\n- Green space planning\n- Air quality monitoring\n- Noise pollution mapping\n\n#### 🏢 **Infrastructure Management**\n- Infrastructure planning and management\n- Utility network mapping\n- Emergency response planning\n- Population density analysis\n\n### Benefits\n\n> **Data-Driven Decisions**: GIS provides real-time insights for better urban planning outcomes.\n\nThese GIS applications help create more **efficient**, **sustainable**, and **livable** urban environments that serve the needs of growing populations."
    },
    {
      id: 3,
      title: "Remote Sensing Technologies: Satellite Imagery and Aerial Photography in Environmental Monitoring",
      lastUpdated: "2024-01-10T09:15:00Z",
      content: "Remote sensing technologies provide invaluable tools for environmental monitoring, offering comprehensive coverage of large areas with high temporal resolution.\n\nThis technology encompasses:\n• Satellite imagery analysis and interpretation\n• Aerial photography and drone-based monitoring\n• Multi-spectral and hyper-spectral imaging\n• Change detection and time-series analysis\n• Integration with ground-based measurements\n\nApplications range from climate change monitoring to natural disaster assessment and agricultural management."
    },
    {
      id: 4,
      title: "Cartography Best Practices: Creating Effective and Beautiful Maps for Data Visualization",
      lastUpdated: "2024-01-08T16:45:00Z",
      content: "Effective cartography combines scientific accuracy with artistic design principles to create maps that are both informative and visually appealing.\n\nBest practices include:\n• Clear visual hierarchy and organization\n• Appropriate use of color and typography\n• Scale and projection considerations\n• Data classification and symbolization\n• Accessibility and user experience design\n• Integration of multiple data layers\n\nGood cartography ensures that complex spatial information is communicated clearly and effectively to diverse audiences."
    },
    {
      id: 5,
      title: "Geospatial Data Integration: Combining Multiple Sources for Comprehensive Analysis",
      lastUpdated: "2024-01-05T11:30:00Z",
      content: "Geospatial data integration is the process of combining multiple data sources to create comprehensive analyses that provide deeper insights than any single source could offer.\n\nIntegration techniques include:\n• Data format standardization and conversion\n• Coordinate system transformations\n• Temporal and spatial alignment\n• Quality assessment and validation\n• Metadata management and documentation\n• Interoperability standards compliance\n\nThis process enables more robust and comprehensive spatial analysis across multiple domains."
    },
    {
      id: 6,
      title: "Climate Change Mapping: Using Geographic Data to Track Environmental Patterns and Trends",
      lastUpdated: "2024-01-03T13:20:00Z",
      content: "Climate change mapping utilizes geographic data to visualize and analyze environmental changes over time, providing crucial information for policy-making and adaptation planning.\n\nKey mapping approaches include:\n• Temperature and precipitation trend analysis\n• Sea level rise and coastal vulnerability mapping\n• Vegetation change and ecosystem monitoring\n• Carbon footprint and emissions tracking\n• Climate impact assessment and modeling\n• Adaptation and mitigation planning support\n\nThese maps help scientists, policymakers, and communities understand and respond to climate change impacts."
    }
  ];

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
    const blogPost = sampleBlogPosts.find(blog => blog.id === blogId);
    setSelectedBlogPost(blogPost);
  };

  const handleBlogClose = () => {
    setSelectedBlogPost(null);
  };

  const handleBlogSave = (updatedBlogPost) => {
    // In a real app, this would save to a database
    console.log('Blog post saved:', updatedBlogPost);
    // Update the local state
    const updatedPosts = sampleBlogPosts.map(blog => 
      blog.id === updatedBlogPost.id ? updatedBlogPost : blog
    );
    // Note: In a real app, you'd update state properly or make an API call
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleBlogPosts.map((blog) => (
                <GeoBlogTile
                  key={blog.id}
                  title={blog.title}
                  lastUpdated={blog.lastUpdated}
                  onClick={() => handleBlogClick(blog.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GEO;