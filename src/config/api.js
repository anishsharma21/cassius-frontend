const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login-get-token`,
  googleLogin: `${API_BASE_URL}/users/google-login`,
  verifyToken: `${API_BASE_URL}/users/verify-token`,
};

export default API_ENDPOINTS;
