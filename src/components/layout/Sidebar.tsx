import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  CubeIcon,
  MapPinIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { path: "/items", label: "Items", icon: CubeIcon },
  { path: "/locations", label: "Locations", icon: MapPinIcon },
  { path: "/transactions", label: "Transactions", icon: ArrowsRightLeftIcon },
  { path: "/reports", label: "Reports", icon: ChartBarIcon },
  { path: "/users", label: "Users", icon: UsersIcon },
  { path: "/settings", label: "Settings", icon: CogIcon },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-60 bg-gray-900 text-white flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">SME ERP</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
