import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Phone, Clock, MapPin, Tag } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const categoryIcons = {
  BAKING: '🧁',
  TUITION: '📚',
  TAILORING: '🧵',
  BEAUTY: '💄',
  FITNESS: '🏋️',
  ART: '🎨',
  FOOD: '🍱',
  OTHER: '🏪',
};

const BusinessCard = ({ business, onClick }) => {
  const iconEmoji = categoryIcons[business.category] || '🏪';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      onClick={() => onClick && onClick(business)}
      className="group relative bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-5 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm hover:shadow-2xl hover:shadow-[#542612]/10 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between"
    >
      {/* Background Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7F0DF]/50 via-transparent to-[#F7F0DF]/50 dark:from-[#542612]/20 dark:to-[#542612] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        {/* Cover Thumbnail / Emoji header */}
        <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-[#F7F0DF] dark:bg-[#542612]">
          {business.images && business.images.length > 0 ? (
            <img
              src={business.images[0]}
              alt={business.businessName}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-[#F7F0DF] dark:bg-[#542612]/60">
              {iconEmoji}
            </div>
          )}

          {/* Rating Pill */}
          <div className="absolute top-3 right-3 bg-[#F5EFE1]/95 dark:bg-[#542612]/95 backdrop-blur-md rounded-xl px-2.5 py-1 shadow-md flex items-center gap-1 text-xs font-bold text-[#542612]">
            <Star className="w-3.5 h-3.5 fill-[#542612] text-[#542612]" />
            <span>{business.rating || 4.9}</span>
            <span className="text-[10px] text-[#542612]/60 font-medium">({business.reviewsCount || 12})</span>
          </div>

          <div className="absolute top-3 left-3 bg-[#F5EFE1]/95 dark:bg-[#542612]/95 backdrop-blur-md text-[#542612] dark:text-white rounded-xl px-2.5 py-1 text-base shadow-md">
            {iconEmoji}
          </div>
        </div>

        {/* Business Title & Owner info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-base text-[#542612] dark:text-white tracking-tight group-hover:text-[#542612] dark:group-hover:text-[#F7F0DF] transition-colors line-clamp-1">
              {business.businessName}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#542612]/70 dark:text-[#542612]/60">
            <Avatar
              src={business.owner?.profileImage}
              name={business.owner?.name}
              size="sm"
            />
            <span className="font-semibold text-[#542612] dark:text-[#F7F0DF]">
              {business.owner?.name || 'Resident'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-[#542612] dark:text-[#F7F0DF] font-medium">
              <MapPin className="w-3 h-3" />
              {business.owner?.house || 'Block B'}
            </span>
          </div>

          <p className="text-xs text-[#542612] dark:text-[#542612]/60 line-clamp-2 leading-relaxed pt-1">
            {business.description}
          </p>

          {/* Services Tag Pill Preview */}
          {business.services && business.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {business.services.slice(0, 2).map((srv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF] px-2.5 py-0.5 rounded-lg border border-[#542612]/20/60 dark:border-[#F7F0DF]/30/60"
                >
                  <Tag className="w-3 h-3 text-[#542612]" />
                  {srv.name} {srv.price ? `(₹${srv.price})` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-4 mt-3 border-t border-[#542612]/15 dark:border-[#F7F0DF]/20/80 flex items-center justify-between">
        <span className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View Business Details
          <ArrowRight className="w-4 h-4" />
        </span>
        <Badge type={business.category} size="sm" />
      </div>
    </motion.div>
  );
};

export default BusinessCard;
