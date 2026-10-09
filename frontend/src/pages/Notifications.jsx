import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Megaphone, Calendar, Store, Wrench } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const getNotifIcon = (type) => {
    switch (type) {
      case 'NEW_NOTICE':
        return <Megaphone className="w-4 h-4 text-[#542612]" />;
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-[#542612]" />;
      case 'NEW_BUSINESS':
        return <Store className="w-4 h-4 text-[#542612]" />;
      case 'COMPLAINT_UPDATE':
        return <Wrench className="w-4 h-4 text-[#542612]" />;
      default:
        return <Bell className="w-4 h-4 text-[#542612]" />;
    }
  };

  return (
    <PageContainer>
      <Header />

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#542612]/10 text-[#542612] dark:text-[#F7F0DF] flex items-center justify-center border border-[#542612]/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#542612] dark:text-white tracking-tight">
                Notifications Center
              </h1>
              <p className="text-xs text-[#542612]/70 dark:text-[#542612]/60">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCheck}
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You have no notifications right now."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n, idx) => (
              <motion.div
                key={n._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  !n.isRead
                    ? 'bg-white dark:bg-zinc-900 border-[#542612]/30 dark:border-amber-700/50 shadow-md ring-1 ring-[#542612]/10'
                    : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 shadow-sm opacity-90'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-zinc-800 text-[#542612] dark:text-[#EAA627] shadow-sm flex-shrink-0 mt-0.5 border border-amber-100 dark:border-zinc-700">
                  {getNotifIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-sm text-[#542612] dark:text-zinc-100">
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Notifications;
