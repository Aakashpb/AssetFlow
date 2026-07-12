import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mainBg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Route protection
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-mainBg text-textPrimary">
      {/* Sidebar navigation */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <Navbar 
          toggleSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        {/* Main Workspace content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
