import React, { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const CommentSection = ({ comments = [], onAddComment, onDeleteComment, postAuthorId }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');

  const currentUserId = user?._id || user?.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (onAddComment) onAddComment(commentText);
    setCommentText('');
  };

  return (
    <div className="pt-4 border-t border-[#542612]/15 dark:border-[#F7F0DF]/20/80 space-y-4">
      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {comments.map((c, i) => {
            const commentAuthorId = c.user?._id || c.user?.id || c.user;
            const canDelete =
              currentUserId &&
              (commentAuthorId?.toString() === currentUserId?.toString() ||
                postAuthorId?.toString() === currentUserId?.toString() ||
                user?.role === 'ADMIN');

            return (
              <div key={c._id || i} className="flex gap-2.5 text-xs group/comment">
                <Avatar
                  src={c.user?.profileImage}
                  name={c.user?.name || 'Resident'}
                  size="sm"
                />
                <div className="flex-1 bg-[#F7F0DF] dark:bg-[#542612]/60 p-3 rounded-2xl border border-[#542612]/15 dark:border-[#F7F0DF]/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#542612] dark:text-white">
                      {c.user?.name || 'Resident'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#542612]/60">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this comment?')) {
                              onDeleteComment && onDeleteComment(c._id || c.id);
                            }
                          }}
                          className="opacity-60 hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-0.5 rounded cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[#542612] dark:text-[#F7F0DF] leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar src={user?.profileImage} name={user?.name} size="sm" />
        <div className="relative flex-1">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs text-[#542612] dark:text-white placeholder-[#542612] border border-transparent focus:border-[#542612] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#542612] dark:text-[#F7F0DF] disabled:opacity-40 hover:scale-110 transition-transform"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
