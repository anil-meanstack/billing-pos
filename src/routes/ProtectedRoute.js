import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../features/auth/authApi";

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
