import { Navigate } from "react-router-dom";
import { useAuth, getHomePath } from "../context/AuthContext.jsx";

// Wrap a page with this to protect it.
// <ProtectedRoute role="OWNER"> ... </ProtectedRoute>
// This only hides pages. The real security is in Spring Boot, which checks the token on every call.
function ProtectedRoute({ role, children }) {
  const { isLoggedIn, role: userRole } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but this page is for the other role
  if (role && userRole !== role) {
    return <Navigate to={getHomePath(userRole)} replace />;
  }

  return children;
}

export default ProtectedRoute;
