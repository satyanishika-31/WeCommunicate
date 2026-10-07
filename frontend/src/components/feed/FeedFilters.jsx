import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { id: 'ALL', label: 'All' },
  { id: 'NOTICE', label: 'Notices' },
  { id: 'EVENT', label: 'Events' },
  { id: 'BUSINESS', label: 'Services' },
  { id: 'GENERAL', label: 'Community' },
  { id: 'COMPLAINT', label: 'Complaints' },
];

const FeedFilters = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none my-4 font-sans">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="relative px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-colors select-none flex-shrink-0"
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterPill"
                className="absolute inset-0 rounded-2xl bg-[#542612] dark:bg-[#F7F0DF] shadow-md shadow-[#542612]/15"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors ${
                isActive
                  ? 'text-[#FFFFFF] dark:text-[#542612] font-bold'
                  : 'text-[#542612] dark:text-[#F7F0DF] hover:text-[#542612] dark:hover:text-white hover:bg-[#F7F0DF] dark:hover:bg-[#542612]/60 rounded-2xl'
              }`}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FeedFilters;
