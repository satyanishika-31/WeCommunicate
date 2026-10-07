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
          <Badge type={complaint.category} size="sm" />
          <Badge type={complaint.status} size="sm" />
        </div>

        <h3 className="font-extrabold text-base sm:text-lg text-[#542612] dark:text-white tracking-tight mb-2 line-clamp-1">
          {complaint.title}
        </h3>

        <p className="text-xs text-[#542612] dark:text-[#542612]/60 line-clamp-2 leading-relaxed mb-4">
          {complaint.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[#542612]/15 dark:border-[#F7F0DF]/20/80 flex items-center justify-between text-xs text-[#542612]/70 dark:text-[#542612]/60">
        <div className="flex items-center gap-1.5 font-semibold text-[#542612] dark:text-[#F7F0DF]">
          <MapPin className="w-3.5 h-3.5 text-[#542612]" />
          <span>
            {complaint.block?.name || 'Block A'} • {complaint.house?.houseNumber || 'Flat 203'}
          </span>
        </div>

        <span className="flex items-center gap-1 text-[#542612] dark:text-[#F7F0DF] font-bold group-hover:translate-x-1 transition-transform">
          Timeline & Status <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
};

export default ComplaintCard;
