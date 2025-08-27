const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login-get-token`,
  signup: `${API_BASE_URL}/users/signup`,
  getCompanyName: `${API_BASE_URL}/companies/get-company-name`,
  companyProfile: `${API_BASE_URL}/companies/profile`,
  updateCompany: `${API_BASE_URL}/companies/update-company`,
  uploadFile: `${API_BASE_URL}/companies/upload-file`,
  getCompanyFiles: `${API_BASE_URL}/companies/files`,
  deleteCompanyFile: `${API_BASE_URL}/companies/files`,
  verifyToken: `${API_BASE_URL}/users/verify-token`,
  userProfile: `${API_BASE_URL}/users/profile`,
  chatMessage: `${API_BASE_URL}/chat/message`,
  geoBlogPosts: `${API_BASE_URL}/companies/blog_posts`,
  updateBlogPost: `${API_BASE_URL}/companies/update-blog-post`,
  createBlogPost: `${API_BASE_URL}/companies/create-blog-post`,
  deleteBlogPost: `${API_BASE_URL}/companies/delete-blog-post`,
  getBlogPost: `${API_BASE_URL}/companies/blog_posts`,

  geoSearchTerms: `${API_BASE_URL}/companies/search-terms`,
  redditPosts: `${API_BASE_URL}/reddit/next-10-posts`,
  redditComments: `${API_BASE_URL}/reddit/comments`,
  updateRedditRepliedTo: `${API_BASE_URL}/reddit/update-replied-to`,
  generateRedditReply: `${API_BASE_URL}/reddit/generate-reply`,
  partnerships: {
    getInfluencers: `${API_BASE_URL}/partnerships/get-influencers`,
  },
};

export default API_ENDPOINTS;
