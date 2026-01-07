import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const TopBar = ({ sidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header 
      className={`
        fixed top-0 right-0 z-30 h-14 bg-white/90 backdrop-blur-sm border-b border-slate-200
        transition-all duration-300 ease-in-out flex items-center justify-between px-4
        ${sidebarOpen ? 'left-64' : 'left-16'}
      `}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="
              block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md leading-5 bg-slate-50/50 
              text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 
              focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3 ml-4">
        {/* Date Display */}
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
            {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
          <span className="text-xs font-bold text-slate-700 leading-none">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

        {/* Notifications */}
        <button className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white"></span>
        </button>

        {/* Help */}
        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <HelpCircle size={18} />
        </button>

        {/* User Profile */}
        <div className="relative ml-1 pl-2 border-l border-slate-200">
          <button className="flex items-center space-x-2 hover:bg-slate-50 rounded-full p-1 pr-2 transition-colors border border-transparent hover:border-slate-100">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
              <span className="font-medium text-xs">
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-slate-700 leading-none">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {user?.role || 'Staff'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
