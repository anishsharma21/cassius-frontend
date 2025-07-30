const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login-get-token`,
  createUser: `${API_BASE_URL}/users/create-user`,
  googleLogin: `${API_BASE_URL}/users/google-login`,
  verifyToken: `${API_BASE_URL}/users/verify-token`,
  getUserAdminCompanies: `${API_BASE_URL}/users/{user_id}/admin-companies`,
};

export default API_ENDPOINTS;
