import { jwtDecode } from "jwt-decode";

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("user");
}

export function getAuthStatus() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return { isAuthenticated: false, tokenExpired: false };
  }

  try {
    const { exp } = jwtDecode(token);
    const expired = Date.now() >= exp * 1000;

    if (expired) {
      logout(); // clear storage
    }
    console.log('getAuthStatus: isAuthenticated', !expired);
    console.log('getAuthStatus: tokenExpired', expired);
    return {
      isAuthenticated: !expired,
      tokenExpired: expired,
    };
  } catch {
    return { isAuthenticated: false, tokenExpired: false };
  }
}
