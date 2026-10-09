import React, { useState, useEffect } from 'react';
import { Megaphone, Filter, AlertTriangle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import FeedCard from '../components/feed/FeedCard';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { postService } from '../api/services';

const Notices = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotices = async () => {
    setLoading(true);
    const data = await postService.getAll();
    // Filter only notices or admin announcements
    const noticePosts = (data || []).filter((p) => p.type === 'NOTICE');
    setPosts(noticePosts);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = posts.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <Header onSearch={(q) => setSearchQuery(q)} />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#542612]/10 text-[#542612] dark:text-[#542612] flex items-center justify-center border border-[#542612]/20">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#542612] dark:text-white tracking-tight">
              Official Society Notices
            </h1>
            <p className="text-sm text-[#542612]/70 dark:text-[#542612]/60">
              Important announcements regarding maintenance, water supply, security rules, and AGM updates
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No active notices"
          description="There are currently no official notices published."
        />
      ) : (
        <div className="max-w-3xl space-y-5">
          {filteredNotices.map((post) => (
            <FeedCard
              key={post._id}
              post={post}
              onLikeToggle={fetchNotices}
              onCommentAdded={fetchNotices}
              onPostDeleted={fetchNotices}
              onPostPinned={fetchNotices}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Notices;
