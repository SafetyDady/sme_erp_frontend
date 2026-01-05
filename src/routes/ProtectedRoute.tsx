import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ROLE_HIERARCHY = ["viewer", "staff", "admin", "super_admin"];
const ROLE_DISPLAY_MAP: Record<string, string> = {
  viewer: "VIEWER",
  staff: "STAFF",
  admin: "ADMIN",
  super_admin: "SUPER_ADMIN",
};

const hasRequiredRole = (userRole: string, requiredRole: string): boolean => {
  // Convert display roles to backend roles
  const backendUserRole = userRole.toLowerCase();
  const backendRequiredRole = requiredRole.toLowerCase();

  const userLevel = ROLE_HIERARCHY.indexOf(backendUserRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(backendRequiredRole);
  return userLevel >= requiredLevel;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You need{" "}
            {ROLE_DISPLAY_MAP[requiredRole.toLowerCase()] || requiredRole}+ role
            to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
