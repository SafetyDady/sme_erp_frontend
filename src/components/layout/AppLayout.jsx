import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* TopBar */}
      <TopBar sidebarOpen={sidebarOpen} />

      {/* Main Content Wrapper */}
      <div 
        className={`
          transition-all duration-300 ease-in-out pt-14
          ${sidebarOpen ? 'pl-64' : 'pl-16'}
        `}
      >
        <main className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
