import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.role)) {
    return <div className="container">Access denied for your role.</div>;
  }
  return children;
}
