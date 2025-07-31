const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login-get-token`,
  createUserSocial: `${API_BASE_URL}/users/create-user-social`,
  createCompany: `${API_BASE_URL}/companies/create-company`,
  googleEntry: `${API_BASE_URL}/users/google-entry`,
  verifyToken: `${API_BASE_URL}/users/verify-token`,
};

export default API_ENDPOINTS;
