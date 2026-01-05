import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const ROLE_HIERARCHY = ["viewer", "staff", "admin", "super_admin"];

const hasRequiredRole = (userRole: string, requiredRole: string): boolean => {
  const normalizedUserRole = userRole.toLowerCase();
  const normalizedRequiredRole = requiredRole.toLowerCase();
  const userLevel = ROLE_HIERARCHY.indexOf(normalizedUserRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(normalizedRequiredRole);
  return userLevel >= requiredLevel;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", role: "viewer" },
    { path: "/items", label: "Items", role: "viewer" },
    { path: "/locations", label: "Locations", role: "viewer" },
    { path: "/transactions", label: "Transactions", role: "staff" },
    { path: "/reports", label: "Reports", role: "viewer" },
    { path: "/users", label: "Users", role: "admin" },
    { path: "/settings", label: "Settings", role: "super_admin" },
  ];

  const visibleMenuItems = menuItems.filter(
    (item) => user && hasRequiredRole(user.role, item.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                SME ERP
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {visibleMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    location.pathname.startsWith(item.path)
                      ? "text-blue-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-colors duration-200`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email} ({user?.role?.toUpperCase()})
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 pt-2 pb-3 space-y-1">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${
                location.pathname.startsWith(item.path)
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
