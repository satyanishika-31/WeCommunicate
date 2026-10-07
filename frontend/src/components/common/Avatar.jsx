import React from 'react';

const Avatar = ({
  src,
  name = 'Resident',
  size = 'md', // sm | md | lg | xl
  showStatus = false,
  isOnline = true,
  role,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusSizeMap = {
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size]} rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-[#542612]`}
        />
      ) : (
        <div
          className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-[#542612] to-[#542612] text-white font-bold flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-[#542612]`}
        >
          {getInitials(name)}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ${
            isOnline ? 'bg-[#542612]' : 'bg-[#542612]'
          } ${statusSizeMap[size]} border-white dark:border-[#542612]`}
        />
      )}
    </div>
  );
};

export default Avatar;
