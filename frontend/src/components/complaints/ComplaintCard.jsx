import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

const ComplaintCard = ({ complaint, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onClick={() => onClick && onClick(complaint)}
      className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-5 sm:p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm hover:shadow-xl hover:shadow-[#542612]/5 cursor-pointer transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#542612]/10 dark:bg-white/10 text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/15">
              {complaint.ticketId || `#CMP-${complaint._id?.slice(-4)}`}
            </span>
            <Badge type={complaint.category} size="sm" />
          </div>
          <Badge type={complaint.status} size="sm" />
        </div>

        <h3 className="font-extrabold text-base sm:text-lg text-[#542612] dark:text-white tracking-tight mb-2 line-clamp-1">
          {complaint.title}
        </h3>

        <p className="text-xs text-[#542612] dark:text-[#542612]/60 line-clamp-2 leading-relaxed mb-4">
          {complaint.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[#542612]/15 dark:border-[#F7F0DF]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-[#542612]/70 dark:text-[#F7F0DF]/70">
        <div className="flex items-center gap-1.5 font-semibold text-[#542612] dark:text-[#F7F0DF]">
          <MapPin className="w-3.5 h-3.5 text-[#542612]" />
          <span>
            {complaint.flatNumber || complaint.house?.houseNumber || 'Flat 203'}
            {complaint.intakeRoute === 'SECURITY_GUARD' && ' • via Gate Guard'}
            {complaint.intakeRoute === 'PHONE_ESCALATION' && ' • via Phone Call'}
          </span>
        </div>

        <span className="flex items-center gap-1 text-[#542612] dark:text-[#F7F0DF] font-bold group-hover:translate-x-1 transition-transform">
          {complaint.assignedHandlerName ? `Tech: ${complaint.assignedHandlerName}` : 'Track Status'} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
};

export default ComplaintCard;
