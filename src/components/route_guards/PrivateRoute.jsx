import { Navigate } from "react-router-dom";
import { getAuthStatus } from "../../utils/auth";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, tokenExpired } = getAuthStatus();

  if (isAuthenticated) {
    return children;
  }

  // Redirect to /login and include state about token expiry
  console.log('PrivateRoute: tokenExpired', tokenExpired);
  return (
    <Navigate
      to="/login"
      replace
      state={{ tokenExpired }}
    />
  );
}