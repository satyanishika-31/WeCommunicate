import React from 'react';
import { Sparkles } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'There are no items matching your criteria at this moment.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#F5EFE1]/60 dark:bg-[#542612]/60 rounded-3xl border border-dashed border-[#542612]/20 dark:border-[#F7F0DF]/20 my-4">
      <div className="w-16 h-16 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612]/60 flex items-center justify-center text-[#542612] dark:text-[#F7F0DF] mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-[#542612] dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#542612]/70 dark:text-[#542612]/60 max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
