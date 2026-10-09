import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, CheckCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import Logo from '../common/Logo';

const Header = ({ onSearch }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/home';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Resident';

  // On non-home pages, render a sleek, compact top navigation bar without the large "Good morning" banner card
  if (!isHomePage) {
    return (
      <header className="relative z-30 mb-6 flex items-center justify-between gap-4 bg-transparent font-sans">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#542612]/60 dark:text-[#F7F0DF]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search the community..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/80 dark:bg-zinc-800/80 text-sm text-[#542612] dark:text-white placeholder-[#542612]/50 dark:placeholder-zinc-400 border border-[#542612]/15 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#542612] shadow-2xs backdrop-blur-sm"
          />
        </div>

        {/* Action icons (Notifications & Avatar) */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="relative p-2 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-[#542612]/15 dark:border-zinc-700 text-[#542612] dark:text-white hover:bg-white transition-colors shadow-2xs"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#542612] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            <AnimatePresence>
              {showNotifPopover && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden font-sans"
                >
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#542612] dark:text-[#EAA627]" />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        Notifications
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#542612] dark:text-[#EAA627] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400">
                        No notifications yet!
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className={`p-3.5 text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                            !n.isRead ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                            {n.title}
                          </div>
                          <div className="text-zinc-600 dark:text-zinc-400 leading-snug">
                            {n.message}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 text-center border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setShowNotifPopover(false);
                        navigate('/notifications');
                      }}
                      className="text-xs font-bold text-[#542612] dark:text-[#EAA627] hover:underline"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            onClick={() => navigate('/profile')}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Avatar
              src={user?.profileImage}
              name={user?.name || 'Resident'}
              size="md"
              showStatus
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-30 mb-6 rounded-3xl p-6 lg:p-8 bg-[#F5EFE1] dark:bg-[#EFEAD9] border border-[#542612]/15 dark:border-[#542612]/20 shadow-sm"
    >
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#F7F0DF]/30 dark:bg-[#542612]/50 rounded-full blur-3xl pointer-events-none overflow-hidden" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Greeting section */}
        <div>
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 rounded-xl" />
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#542612] dark:text-[#542612] tracking-tight">
              {getGreeting()}, {firstName} 👋
            </h1>
          </div>
          <p className="text-[#542612]/80 dark:text-[#F7F0DF]/90 font-medium text-sm lg:text-base mt-1 font-sans">
            What's happening in your community today?
          </p>
        </div>

        {/* Search bar & Notification actions */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#542612]/60 dark:text-[#F7F0DF]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search the community..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white placeholder-[#542612]/50 dark:placeholder-[#F7F0DF]/50 border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612] transition-all shadow-sm font-sans"
            />
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="relative p-2.5 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-[#F7F0DF] hover:bg-[#F7F0DF]/40 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#542612] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-[#FFFFFF] dark:ring-[#542612] shadow-md font-sans">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            {/* Notification Popover */}
            <AnimatePresence>
              {showNotifPopover && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden font-sans"
                >
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#542612] dark:text-[#EAA627]" />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        Notifications
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#542612] dark:text-[#EAA627] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400">
                        No notifications yet!
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className={`p-3.5 text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                            !n.isRead ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                            {n.title}
                          </div>
                          <div className="text-zinc-600 dark:text-zinc-400 leading-snug">
                            {n.message}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 text-center border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setShowNotifPopover(false);
                        navigate('/notifications');
                      }}
                      className="text-xs font-bold text-[#542612] dark:text-[#EAA627] hover:underline"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Avatar Link */}
          <div
            onClick={() => navigate('/profile')}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Avatar
              src={user?.profileImage}
              name={user?.name || 'Rahul Sharma'}
              size="md"
              showStatus
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
