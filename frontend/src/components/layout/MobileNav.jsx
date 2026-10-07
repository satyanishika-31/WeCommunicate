import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Wrench, User, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const MobileNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Explore', path: '/explore', icon: Search },
    { label: 'Create', path: '/create-post', icon: PlusCircle, isMainAction: true },
    { label: 'Complaints', path: '/complaints', icon: Wrench },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#542612]/95 text-[#FFFFFF] backdrop-blur-lg border-t border-[#F7F0DF]/20 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isMainAction) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative -top-5 flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#542612] text-[#FFFFFF] flex items-center justify-center shadow-lg shadow-[#542612]/40                 border-4 border-[#542612] active:scale-95 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-[#F7F0DF] font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
