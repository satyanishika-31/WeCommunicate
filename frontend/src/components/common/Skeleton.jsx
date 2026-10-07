import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm animate-pulse space-y-4">
    <div className="flex items-center space-x-3">
      <div className="w-11 h-11 bg-[#F7F0DF] dark:bg-[#542612] rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-[#F7F0DF] dark:bg-[#542612] rounded w-1/3" />
        <div className="h-3 bg-[#F7F0DF] dark:bg-[#542612] rounded w-1/4" />
      </div>
    </div>
    <div className="h-5 bg-[#F7F0DF] dark:bg-[#542612] rounded w-3/4" />
    <div className="space-y-2">
      <div className="h-3.5 bg-[#F7F0DF] dark:bg-[#542612] rounded w-full" />
      <div className="h-3.5 bg-[#F7F0DF] dark:bg-[#542612] rounded w-5/6" />
    </div>
    <div className="h-48 bg-[#F7F0DF] dark:bg-[#542612] rounded-2xl w-full" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-8 bg-[#F7F0DF] dark:bg-[#542612] rounded-xl w-24" />
      <div className="h-8 bg-[#F7F0DF] dark:bg-[#542612] rounded-xl w-24" />
    </div>
  </div>
);

export const BusinessSkeleton = () => (
  <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-2xl p-5 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm animate-pulse space-y-3">
    <div className="h-40 bg-[#F7F0DF] dark:bg-[#542612] rounded-xl w-full" />
    <div className="h-5 bg-[#F7F0DF] dark:bg-[#542612] rounded w-2/3" />
    <div className="h-3.5 bg-[#F7F0DF] dark:bg-[#542612] rounded w-1/2" />
    <div className="h-10 bg-[#F7F0DF] dark:bg-[#542612] rounded-xl w-full mt-4" />
  </div>
);

export const EventSkeleton = () => (
  <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-2xl overflow-hidden border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm animate-pulse">
    <div className="h-44 bg-[#F7F0DF] dark:bg-[#542612] w-full" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-[#F7F0DF] dark:bg-[#542612] rounded w-3/4" />
      <div className="h-3.5 bg-[#F7F0DF] dark:bg-[#542612] rounded w-1/2" />
      <div className="h-10 bg-[#F7F0DF] dark:bg-[#542612] rounded-xl w-full" />
    </div>
  </div>
);
