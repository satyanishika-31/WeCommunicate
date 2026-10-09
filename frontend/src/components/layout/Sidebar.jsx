import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  PlusCircle,
  Megaphone,
  Calendar,
  Wrench,
  Store,
  Bell,
  User,
  Settings,
  ShieldCheck,
  Building2,
  FileText,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Logo from '../common/Logo';

const Sidebar = () => {
  const { user, role, logout, theme, toggleTheme } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const mainNavItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Explore', path: '/explore', icon: Search },
    { label: 'Create', path: '/create-post', icon: PlusCircle, highlight: true },
    { label: 'Notices', path: '/notices', icon: Megaphone },
    { label: 'Records & Bylaws', path: '/records', icon: FileText },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Complaints', path: '/complaints', icon: Wrench },
    { label: 'Businesses', path: '/businesses', icon: Store },
  ];

  const secondaryNavItems = [
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (role === 'ADMIN') {
    secondaryNavItems.unshift({
      label: 'Admin Panel',
      path: '/admin',
      icon: ShieldCheck,
      isAdminBadge: true,
    });
  }

  if (role === 'COMMUNITY_HEAD') {
    secondaryNavItems.unshift({
      label: 'Community Head Desk',
      path: '/admin',
      icon: ShieldCheck,
      isAdminBadge: true,
    });
  }

  if (role === 'BLOCK_MANAGER') {
    secondaryNavItems.unshift({
      label: 'Block Dashboard',
      path: '/manager',
      icon: Building2,
      isManagerBadge: true,
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 h-screen w-64 lg:w-72 min-w-0 overflow-hidden bg-[#3f2a14] text-[#FFFFFF] backdrop-blur-xl border-r border-[#542612]/15 z-40 p-4 transition-all duration-300 select-none shadow-xl shadow-[#542612]/10">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 py-3 mb-4">
        <NavLink to="/" className="flex items-center gap-3 group">
          <Logo className="group-hover:scale-105 transition-transform duration-300" />
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-white block leading-none">
              WE <span className="text-white">COMMUNICATE</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 mt-1 block font-sans">
              Residential Society
            </span>
          </div>
        </NavLink>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          className="p-2 rounded-xl text-[#542612] hover:text-[#542612] hover:bg-[#E5D3AF]/40 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1 space-y-6 custom-scrollbar font-sans">
        {/* Main Section */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/80 mb-2">
            Community Hub
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="relative group flex items-center px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 rounded-2xl bg-[#E5D3AF]/40 border border-[#542612]/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: item.highlight ? 90 : 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative z-10 mr-3.5"
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-white/80 group-hover:text-white'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`relative z-10 font-semibold ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-white/90 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.highlight && (
                    <span className="relative z-10 ml-auto flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#542612] opacity-30"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#542612]"></span>
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Secondary Section */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/80 mb-2">
            Account & System
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="relative group flex items-center px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 rounded-2xl bg-[#E5D3AF]/40 border border-[#542612]/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="relative z-10 mr-3.5"
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-white/80 group-hover:text-white'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`relative z-10 font-semibold ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-white/90 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Badge Pill */}
                  {item.badge > 0 && (
                    <span className="relative z-10 ml-auto bg-[#542612] text-[#FFFFFF] text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.isAdminBadge && (
                    <span className="relative z-10 ml-auto bg-[#542612]/10 text-[#542612] dark:text-[#F7F0DF] text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-[#542612]/20">
                      ADMIN
                    </span>
                  )}
                  {item.isManagerBadge && (
                    <span className="relative z-10 ml-auto bg-[#542612]/15 text-[#542612] dark:text-[#F7F0DF] text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-[#542612]/20">
                      MGR
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>


      </div>

      {/* Sidebar Footer User Profile */}
      <div className="pt-3 mt-auto border-t border-[#542612]/15 font-sans">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-[#E5D3AF]/40 hover:bg-[#E5D3AF]/70 transition-colors">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
          >
            <Avatar
              src={user?.profileImage}
              name={user?.name || 'Rahul Sharma'}
              size="md"
              showStatus
            />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-white truncate block">
                {user?.name || 'Rahul Sharma'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-white/80 font-medium truncate">
                  {user?.house?.houseNumber || 'A-101'}
                </span>
                <Badge type={role} size="sm" className="text-[9px] py-0 px-1" />
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-[#542612]/70 hover:text-[#542612] hover:bg-[#E5D3AF]/60 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
