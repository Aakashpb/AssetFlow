import React, { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { mockApi } from '../../services/mockApi';
import { 
  Menu, 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  ChevronDown, 
  LogOut,
  Settings
} from 'lucide-react';

const Navbar = ({ toggleSidebarCollapse }) => {
  const { user, changeSimulatedRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const profileRef = useRef(null);
  const notifyRef = useRef(null);

  useEffect(() => {
    setNotifications(mockApi.getNotifications());
    
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbName = (path) => {
    if (path === '/') return 'Dashboard';
    const cleanPath = path.replace('/', '');
    return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1).replace('-', ' ');
  };

  const handleRoleChange = (e) => {
    changeSimulatedRole(e.target.value);
    setProfileOpen(false);
    navigate('/');
  };

  const handleMarkRead = (id) => {
    mockApi.markNotificationRead(id);
    setNotifications(mockApi.getNotifications());
  };

  const handleClearNotifications = () => {
    mockApi.clearNotifications();
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-cardBg border-b border-borderCol flex items-center justify-between px-6 h-[70px] z-40 transition-colors duration-300">
      <div className="flex items-center gap-5">
        <button 
          onClick={toggleSidebarCollapse}
          className="border border-borderCol text-textPrimary p-2 rounded-md hover:bg-hoverBg cursor-pointer transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <nav className="hidden sm:flex items-center gap-2 text-xs font-semibold text-textSecondary uppercase tracking-wider">
          <span>System</span>
          <span className="text-textMuted">/</span>
          <span className="text-textPrimary font-bold">{getBreadcrumbName(location.pathname)}</span>
        </nav>

        <div className="relative w-48 lg:w-72 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-4 h-4" />
          <input 
            type="text" 
            placeholder="Global search serials, tags..."
            className="w-full pl-9 pr-4 py-2 bg-mainBg border border-borderCol rounded-md text-textPrimary text-sm focus:border-primary focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="border border-borderCol text-textPrimary p-2 rounded-md hover:bg-hoverBg cursor-pointer transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifyRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="border border-borderCol text-textPrimary p-2 rounded-md hover:bg-hoverBg cursor-pointer transition-colors relative"
            title="View Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 bg-cardBg border border-borderCol rounded-md shadow-lg w-80 py-2 z-50">
              <div className="px-4 py-2 border-b border-borderCol flex justify-between items-center">
                <span className="font-semibold text-sm text-textPrimary">Recent Alerts</span>
                <button 
                  onClick={handleClearNotifications}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="max-height-[260px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-textSecondary">No alerts found</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`px-4 py-3 border-b border-borderCol last:border-b-0 cursor-pointer hover:bg-hoverBg flex flex-col gap-1 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-textPrimary">{n.title}</span>
                        <span className="text-[10px] text-textMuted">{n.time}</span>
                      </div>
                      <p className="text-xs text-textSecondary leading-normal">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Org Switcher */}
        <div className="hidden sm:flex items-center gap-2 border border-borderCol px-3 py-1.5 rounded-md text-sm font-medium text-textPrimary hover:bg-hoverBg cursor-pointer transition-all">
          <Globe className="w-4 h-4 text-primary" />
          <span>HQ - Global Ops</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-hoverBg cursor-pointer transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-semibold text-xs flex items-center justify-center border-2 border-borderCol">
              {user?.avatar || 'AV'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-sm font-semibold text-textPrimary">{user?.name || 'Alex Vance'}</span>
              <span className="text-[10px] text-textMuted">{user?.role || 'Admin'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-textSecondary" />
          </div>

          {profileOpen && (
            <div className="absolute right-0 mt-2 bg-cardBg border border-borderCol rounded-md shadow-lg w-56 py-2 z-50">
              <div className="px-4 py-2 border-b border-borderCol flex flex-col gap-1">
                <span className="font-semibold text-xs text-textPrimary">Simulation Settings</span>
                <span className="text-[10px] text-textSecondary">View permission scopes:</span>
              </div>
              <div className="p-3 border-b border-borderCol">
                <select 
                  value={user?.role || 'Admin'}
                  onChange={handleRoleChange}
                  className="w-full p-2 border border-borderCol rounded-md bg-mainBg text-textPrimary text-xs focus:outline-none"
                >
                  <option value="Admin">Admin Dashboard</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Employee">Employee Portal</option>
                </select>
              </div>
              
              <NavLink 
                to="/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-textPrimary hover:bg-hoverBg"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="w-4 h-4 text-textSecondary" />
                <span>My Profile</span>
              </NavLink>

              <button 
                onClick={() => {
                  logout();
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-textPrimary hover:bg-hoverBg border-t border-borderCol mt-1 text-danger hover:text-danger"
              >
                <LogOut className="w-4 h-4 text-danger" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
