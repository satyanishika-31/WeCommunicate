import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const LikeButton = ({ isLiked, count = 0, onToggle }) => {
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(count);

  const handleClick = (e) => {
    e.stopPropagation();
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : prev - 1));
    if (onToggle) onToggle(nextState);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all ${
        liked
          ? 'bg-[#F7F0DF] dark:bg-[#542612]/40 text-[#542612] dark:text-[#F7F0DF]'
          : 'bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#542612]/60 hover:bg-[#F7F0DF] dark:hover:bg-[#542612]'
      }`}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-4 h-4 ${
            liked ? 'fill-[#542612] text-[#542612]' : 'text-current'
          }`}
        />
      </motion.div>
      <span>{likesCount}</span>
    </motion.button>
  );
};

export default LikeButton;
