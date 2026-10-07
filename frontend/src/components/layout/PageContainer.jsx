import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const PageContainer = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#EFEAD9] dark:bg-[#EFEAD9] text-[#542612] dark:text-[#542612] flex flex-col transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 lg:ml-72 p-4 sm:p-6 lg:p-8 pb-12 min-w-0 overflow-x-hidden transition-all flex flex-col justify-between">
        {/* Decorative background shapes matching theme scheme */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#542612]/5 dark:bg-[#F7F0DF]/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slow" />
        <div className="fixed bottom-0 right-10 w-[400px] h-[400px] bg-[#F7F0DF]/10 dark:bg-[#542612]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-reverse" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`flex-1 ${className}`}
        >
          {children}
        </motion.div>

      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default PageContainer;
