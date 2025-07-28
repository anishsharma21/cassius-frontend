const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
    login: `${API_BASE_URL}/users/login-get-token`,
    verifyToken: `${API_BASE_URL}/users/verify-token`,
};

export default API_ENDPOINTS; 