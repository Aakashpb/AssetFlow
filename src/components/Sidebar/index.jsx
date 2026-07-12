import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  GitPullRequest, 
  Calendar, 
  Wrench, 
  ClipboardCheck, 
  Building2, 
  LineChart, 
  Bell, 
  LogOut,
  User
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const { user, logout } = useAuth();
  const userRole = user?.role || 'Admin';

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Asset Registry', path: '/registry', icon: Package, roles: ['Admin', 'Asset Manager'] },
    { name: 'Allocations', path: '/allocations', icon: GitPullRequest, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { name: 'Resource Bookings', path: '/bookings', icon: Calendar, roles: ['Admin', 'Department Head', 'Employee'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Employee'] },
    { name: 'Audits & Checks', path: '/audits', icon: ClipboardCheck, roles: ['Admin', 'Asset Manager'] },
    { name: 'Organization Setup', path: '/organization', icon: Building2, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { name: 'Analytics Reports', path: '/analytics', icon: LineChart, roles: ['Admin', 'Asset Manager'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Profile Settings', path: '/profile', icon: User, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={`bg-sidebarBg border-r border-borderCol flex flex-col text-sidebarText transition-all duration-300 z-50 relative ${isCollapsed ? 'w-20' : 'w-64'} h-screen`}>
      <div className="flex items-center justify-between p-5 h-[70px] border-b border-white/5">
        <NavLink to="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_0_10px_rgba(37,99,235,0.3)]">
            AF
          </div>
          {!isCollapsed && (
            <span className="font-heading text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent transition-opacity duration-300">
              AssetFlow
            </span>
          )}
        </NavLink>
      </div>

      <ul className="list-none p-4 flex flex-col gap-1.5 flex-grow overflow-y-auto">
        {filteredMenuItems.map(item => (
          <li key={item.name} className="w-full">
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-3.5 py-3 rounded-md text-[14px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer hover:bg-white/5 hover:text-white ${
                  isActive ? 'bg-sidebarActiveBg text-sidebarActiveText font-semibold' : 'text-sidebarText'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-3.5 py-3 w-full border border-white/10 rounded-md text-[14px] font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
