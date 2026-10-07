import React from 'react';
import { ShieldCheck, UserCheck, Megaphone, Calendar, Store, MessageSquare, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const Badge = ({ type = 'GENERAL', text, size = 'sm', className = '' }) => {
  const base = 'inline-flex items-center gap-1 font-semibold rounded-full select-none font-sans';
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const getStyleAndIcon = () => {
    switch (type?.toUpperCase()) {
      case 'NOTICE':
        return {
          style: 'bg-[#542612]/15 text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/20',
          icon: Megaphone,
          defaultText: 'Notice',
        };
      case 'EVENT':
        return {
          style: 'bg-[#542612]/15 text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/20',
          icon: Calendar,
          defaultText: 'Event',
        };
      case 'BUSINESS':
        return {
          style: 'bg-[#F7F0DF]/25 text-[#542612] dark:text-[#F7F0DF] border border-[#F7F0DF]/30',
          icon: Store,
          defaultText: 'Business',
        };
      case 'GENERAL':
      case 'COMMUNITY':
        return {
          style: 'bg-[#542612]/10 text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/20',
          icon: MessageSquare,
          defaultText: 'Community',
        };
      case 'PENDING':
        return {
          style: 'bg-[#F7F0DF]0/15 text-[#542612] dark:text-[#542612] border border-[#542612]/30',
          icon: Clock,
          defaultText: 'Pending',
        };
      case 'IN_PROGRESS':
        return {
          style: 'bg-[#542612]/15 text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/30',
          icon: AlertCircle,
          defaultText: 'In Progress',
        };
      case 'RESOLVED':
        return {
          style: 'bg-[#542612]/15 text-[#542612] dark:text-[#542612] border border-[#542612]/30',
          icon: CheckCircle2,
          defaultText: 'Resolved',
        };
      case 'ADMIN':
        return {
          style: 'bg-[#542612] text-white font-bold',
          icon: ShieldCheck,
          defaultText: 'Admin',
        };
      case 'BLOCK_MANAGER':
        return {
          style: 'bg-[#542612] text-white font-semibold',
          icon: UserCheck,
          defaultText: 'Block Manager',
        };
      case 'OWNER':
        return {
          style: 'bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/20',
          icon: null,
          defaultText: 'Owner',
        };
      case 'TENANT':
        return {
          style: 'bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#542612]/60 border border-[#542612]/20',
          icon: null,
          defaultText: 'Tenant',
        };
      default:
        return {
          style: 'bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#542612]/60 border border-[#542612]/20',
          icon: null,
          defaultText: text || type,
        };
    }
  };

  const { style, icon: Icon, defaultText } = getStyleAndIcon();

  return (
    <span className={`${base} ${sizeStyles[size]} ${style} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{text || defaultText}</span>
    </span>
  );
};

export default Badge;
