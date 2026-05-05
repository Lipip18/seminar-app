import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  // ⏳ wait for auth
  if (loading) return null;

  // ❌ not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ normalize role
  const userRole = user.role?.toLowerCase();

  // ❌ role mismatch
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  // ✅ allow
  return children;
}