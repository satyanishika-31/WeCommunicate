import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Share2, Check, Clock } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { postService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const FeedCard = ({ post, onLikeToggle, onCommentAdded }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const isLiked = post.likes?.includes(user?._id) || false;

  const handleLike = async (nextLiked) => {
    if (user) {
      await postService.toggleLike(post._id, user._id);
    }
    if (onLikeToggle) onLikeToggle(post._id, nextLiked);
  };

  const handleAddComment = async (text) => {
    if (!user) return;
    const res = await postService.addComment(post._id, text, user);
    const newComment = {
      _id: 'c_' + Date.now(),
      user,
      text,
      createdAt: new Date().toISOString(),
    };
    setCommentsList((prev) => [...prev, newComment]);
    if (onCommentAdded) onCommentAdded(post._id, newComment);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-5 sm:p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm hover:shadow-xl hover:shadow-[#542612]/5 transition-all duration-300"
      >
        {/* Post Header: Author + Meta */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={post.author?.profileImage}
              name={post.author?.name || 'Community Admin'}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#542612] dark:text-white truncate">
                  {post.author?.name || 'Resident'}
                </span>
                {post.author?.role === 'ADMIN' && (
                  <Badge type="ADMIN" size="sm" className="text-[9px] py-0 px-1" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#542612]/70 dark:text-[#F7F0DF]/70 mt-0.5">
                <span>
                  {post.block?.name ? `${post.block.name} (Block ${post.block.blockNumber})` : 'All Society'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(post.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <Badge type={post.type} />
        </div>

        {/* Post Content */}
        <div className="space-y-3 mb-4">
          <h3 className="font-serif text-lg font-extrabold text-[#542612] dark:text-white tracking-tight leading-snug">
            {post.title}
          </h3>
          <p className="text-sm text-[#542612] dark:text-[#F7F0DF]/90 leading-relaxed whitespace-pre-line">
            {post.description}
          </p>

          {/* Optional Post Image - Rendered ONLY if post explicitly has an image */}
          {post.image && (
            <div
              onClick={() => setImageModalOpen(true)}
              className="relative overflow-hidden rounded-2xl cursor-pointer group my-3 bg-[#F7F0DF] dark:bg-[#542612] max-h-96 border border-[#542612]/10"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#542612]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-[#542612]/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-semibold">
                  Click to view full photo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Post Actions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#542612]/10 dark:border-[#F7F0DF]/15">
          <div className="flex items-center gap-2">
            <LikeButton
              isLiked={isLiked}
              count={post.likes?.length || 0}
              onToggle={handleLike}
            />

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF] hover:bg-[#F7F0DF]/40 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-current" />
              <span>{commentsList.length}</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-xs text-[#542612]/80 dark:text-[#F7F0DF]/80 hover:bg-[#F7F0DF] dark:hover:bg-[#542612] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#542612]" />
                <span className="text-[#542612]">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Comment Thread (Expandable) */}
        {showComments && (
          <div className="mt-4">
            <CommentSection
              comments={commentsList}
              onAddComment={handleAddComment}
            />
          </div>
        )}
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {imageModalOpen && post.image && (
          <div
            onClick={() => setImageModalOpen(false)}
            className="fixed inset-0 z-50 bg-[#542612]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={post.image}
              alt={post.title}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedCard;
