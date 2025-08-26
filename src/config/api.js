const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
};

export default API_ENDPOINTS;
