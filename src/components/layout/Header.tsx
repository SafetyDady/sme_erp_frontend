import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../ui/Button";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center">
          {/* Breadcrumbs or page title can go here */}
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="text-sm text-gray-700">
                Welcome, {user.email} ({user.role})
              </span>
              <Button variant="secondary" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
