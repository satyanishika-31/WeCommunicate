import React from 'react';

const Logo = ({ className = '' }) => {
  return (
    <div
      className={`w-10 h-10 rounded-2xl bg-[#F5EFE1] text-[#542612] flex items-center justify-center shadow-md ${className}`}
      aria-label="We Communicate"
    >
      <span className="font-serif text-2xl font-bold leading-none">W</span>
    </div>
  );
};

export default Logo;
