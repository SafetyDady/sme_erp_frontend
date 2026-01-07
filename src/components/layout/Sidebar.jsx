import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside 
      className={`
        fixed left-0 top-0 z-40 h-screen bg-white/90 backdrop-blur-sm border-r border-slate-200
        transition-all duration-300 ease-in-out flex flex-col shadow-sm
        ${isOpen ? 'w-64' : 'w-16'}
      `}
    >
      {/* Logo Section */}
      <div className={`h-14 flex items-center px-3 border-b border-slate-100 ${!isOpen && 'justify-center'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[32px] h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          {isOpen && (
            <span className="font-bold text-lg text-slate-800 tracking-tight whitespace-nowrap">
              Smart<span className="text-blue-600">ERP</span>
            </span>
          )}
        </div>
        {isOpen && (
          <button 
            onClick={toggleSidebar}
            className="ml-auto p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-2.5 py-2 rounded-md transition-all duration-200 group whitespace-nowrap
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
                ${!isOpen && 'justify-center px-0'}
              `}
              title={!isOpen ? item.label : ''}
            >
              <item.icon 
                size={18} 
                className={`
                  min-w-[18px]
                  ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                  transition-colors
                `} 
              />
              <span className={`ml-3 text-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Collapse Button (Mobile) */}
      <div className="p-2 border-t border-slate-100">
        {!isOpen && (
          <button 
            onClick={toggleSidebar}
            className="w-full flex justify-center p-2 rounded-md hover:bg-slate-100 text-slate-400 transition-colors mb-1"
          >
            <ChevronRight size={18} />
          </button>
        )}
        
        <button 
          className={`
            flex items-center w-full px-2.5 py-2 rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group whitespace-nowrap
            ${!isOpen && 'justify-center px-0'}
          `}
          title="Logout"
        >
          <LogOut size={18} className="min-w-[18px] text-slate-400 group-hover:text-red-500 transition-colors" />
          <span className={`ml-3 text-sm font-medium transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
