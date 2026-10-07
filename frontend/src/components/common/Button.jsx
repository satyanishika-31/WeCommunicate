import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary', // primary | secondary | outline | danger | ghost
  size = 'md', // sm | md | lg
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none font-sans';

  const variants = {
    primary:
      'bg-gradient-to-r from-[#542612] via-[#542612] to-[#542612] hover:from-[#542612] hover:to-[#542612] text-[#FFFFFF] shadow-md focus:ring-[#542612] border border-[#F7F0DF]/20',
    secondary:
      'bg-[#F7F0DF] hover:bg-[#F7F0DF]/40 dark:bg-[#542612] dark:hover:bg-[#542612] text-[#542612] dark:text-[#FFFFFF] focus:ring-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30',
    outline:
      'border-2 border-[#542612]/40 hover:border-[#542612] text-[#542612] dark:text-[#F7F0DF] hover:bg-[#542612]/10 focus:ring-[#542612]',
    danger:
      'bg-gradient-to-r from-[#542612] to-[#542612] hover:from-[#542612] hover:to-[#542612] text-white shadow-md focus:ring-[#542612]',
    ghost:
      'text-[#542612] dark:text-[#F7F0DF] hover:bg-[#F7F0DF] dark:hover:bg-[#542612]/60 focus:ring-[#542612]',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-4.5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </motion.button>
  );
};

export default Button;
