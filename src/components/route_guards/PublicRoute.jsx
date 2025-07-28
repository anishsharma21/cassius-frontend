import { Navigate } from "react-router-dom";
import { getAuthStatus } from "../../utils/auth";

export default function PublicRoute({ children }) {
  const { isAuthenticated } = getAuthStatus();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}