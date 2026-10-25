import React, { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  PlusCircle,
  Search,
  Calendar,
  Store,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import FeedFilters from '../components/feed/FeedFilters';
import FeedCard from '../components/feed/FeedCard';
import EventCard from '../components/events/EventCard';
import BusinessCard from '../components/businesses/BusinessCard';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import RaiseComplaintModal from '../components/complaints/RaiseComplaintModal';
import OpenBusinessModal from '../components/businesses/OpenBusinessModal';
import { postService, eventService, businessService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import useEventPolling from '../hooks/useEventPolling';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [raiseComplaintOpen, setRaiseComplaintOpen] = useState(false);
  const [openBusinessOpen, setOpenBusinessOpen] = useState(false);

 

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pList, eList, bList] = await Promise.all([
        postService.getAll().catch((err) => {
          console.error('Failed to fetch posts:', err);
          return [];
        }),
        eventService.getAll().catch((err) => {
          console.error('Failed to fetch events:', err);
          return [];
        }),
        businessService.getAll().catch((err) => {
          console.error('Failed to fetch businesses:', err);
          return [];
        }),
      ]);
      setPosts(pList || []);
      setEvents(eList || []);
      setBusinesses(bList || []);
    } catch (err) {
      console.error('Unexpected error in Home fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEventsUpdated = useCallback((data) => {
    setEvents(data || []);
  }, []);

  useEventPolling(handleEventsUpdated);

  const handleSearch = (q) => {
    setSearchQuery(q);
  };

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery?.toLowerCase().trim();
    const matchesSearch =
      !q ||
      post.title?.toLowerCase().includes(q) ||
      post.description?.toLowerCase().includes(q) ||
      post.author?.name?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'NOTICE') return post.type === 'NOTICE';
    if (activeCategory === 'GENERAL') return post.type === 'GENERAL';
    if (activeCategory === 'COMPLAINT') return post.type === 'NOTICE' || post.isUrgent;
    return false;
  });

  const filteredEvents = events.filter((ev) => {
    const q = searchQuery?.toLowerCase().trim();
    return (
      !q ||
      ev.title?.toLowerCase().includes(q) ||
      ev.description?.toLowerCase().includes(q) ||
      ev.venue?.toLowerCase().includes(q)
    );
  });

  const filteredBusinesses = businesses.filter((b) => {
    const q = searchQuery?.toLowerCase().trim();
    return (
      !q ||
      b.name?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    );
  });

  // When activeCategory === 'ALL', merge community posts and events chronologically
  const allFeedItems = [
    ...filteredPosts.map((p) => ({ ...p, feedItemType: 'POST' })),
    ...filteredEvents.map((e) => ({ ...e, feedItemType: 'EVENT', createdAt: e.createdAt || e.date }))
  ].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const getDisplayCount = () => {
    if (activeCategory === 'EVENT') return `${filteredEvents.length} Event${filteredEvents.length !== 1 ? 's' : ''}`;
    if (activeCategory === 'BUSINESS') return `${filteredBusinesses.length} Service${filteredBusinesses.length !== 1 ? 's' : ''}`;
    if (activeCategory === 'ALL') return `${allFeedItems.length} Update${allFeedItems.length !== 1 ? 's' : ''}`;
    return `${filteredPosts.length} Post${filteredPosts.length !== 1 ? 's' : ''}`;
  };

  const quickActions = [
    {
      title: 'Raise Complaint',
      subtitle: 'Report an issue →',
      icon: Wrench,
      gradient: 'from-[#542612]/10 via-[#F7F0DF]/10 to-transparent',
      borderColor: 'border-[#542612]/20',
      iconColor: 'text-[#542612] dark:text-[#F7F0DF]',
      action: () => setRaiseComplaintOpen(true),
    },
    {
      title: 'Create Post',
      subtitle: 'Share with society →',
      icon: PlusCircle,
      gradient: 'from-[#542612]/10 via-[#542612]/5 to-transparent',
      borderColor: 'border-[#542612]/20',
      iconColor: 'text-[#542612] dark:text-[#F7F0DF]',
      action: () => navigate('/create-post'),
    },
    {
      title: 'Find Services',
      subtitle: 'Discover businesses →',
      icon: Search,
      gradient: 'from-[#F7F0DF]/20 via-[#542612]/5 to-transparent',
      borderColor: 'border-[#F7F0DF]/30',
      iconColor: 'text-[#542612] dark:text-[#F7F0DF]',
      action: () => navigate('/explore'),
    },
    {
      title: 'View Events',
      subtitle: 'Upcoming celebrations →',
      icon: Calendar,
      gradient: 'from-[#542612]/10 via-[#542612]/5 to-transparent',
      borderColor: 'border-[#542612]/20',
      iconColor: 'text-[#542612] dark:text-[#F7F0DF]',
      action: () => navigate('/events'),
    },
  ];

  return (
    <PageContainer>
      <Header onSearch={handleSearch} />

      {/* QUICK ACTIONS CARDS SECTION */}
      <section className="mb-8 font-sans">
        <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#542612] dark:text-[#F7F0DF] mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {quickActions.map((qa, index) => {
            const Icon = qa.icon;
            return (
              <motion.div
                key={qa.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={qa.action}
                className={`group relative bg-[#F5EFE1] dark:bg-[#542612] p-4 sm:p-5 rounded border ${qa.borderColor} shadow-sm hover:shadow-xl hover:shadow-[#542612]/5 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${qa.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#542612] text-[#F7F0DF] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#542612] dark:text-white tracking-tight">
                      {qa.title}
                    </h4>
                    <span className="text-xs font-semibold text-[#542612]/70 dark:text-[#F7F0DF]/80 group-hover:text-[#542612] dark:group-hover:text-white transition-colors flex items-center gap-1 mt-1">
                      {qa.subtitle}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* MAIN COMMUNITY FEED SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        {/* Left Column: Category Pills & Feed Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#542612] dark:text-white tracking-tight">
                What's happening?
              </h2>
              <span className="text-xs font-bold text-[#542612]/70 dark:text-[#F7F0DF]/70">
                {getDisplayCount()}
              </span>
            </div>

            {/* Category Filter Pills */}
            <FeedFilters
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          {/* Feed List */}
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : activeCategory === 'EVENT' ? (
            filteredEvents.length === 0 ? (
              <EmptyState
                title="No community events scheduled"
                description="Upcoming festive celebrations, meetings, and sports matches will appear here."
                action={
                  <button
                    onClick={() => navigate('/events')}
                    className="px-5 py-2.5 rounded-full bg-[#542612] text-white font-bold text-xs"
                  >
                    Host Community Event
                  </button>
                }
              />
            ) : (
              <div className="space-y-5">
                {filteredEvents.map((ev) => (
                  <EventCard key={ev._id} event={ev} onRSVPToggle={fetchData} />
                ))}
              </div>
            )
          ) : activeCategory === 'BUSINESS' ? (
            filteredBusinesses.length === 0 ? (
              <EmptyState
                title="No resident services listed yet"
                description="Discover and support verified home businesses, tutors, and bakers in your society."
                action={
                  <button
                    onClick={() => setOpenBusinessOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#542612] text-white font-bold text-xs"
                  >
                    + Open Resident Business
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredBusinesses.map((b) => (
                  <BusinessCard
                    key={b._id}
                    business={b}
                    onClick={() => navigate('/businesses')}
                  />
                ))}
              </div>
            )
          ) : activeCategory === 'ALL' ? (
            allFeedItems.length === 0 ? (
              <EmptyState
                title="No society updates yet"
                description="Be the first resident to share an update, notice, or event with your neighbors!"
                action={
                  <button
                    onClick={() => navigate('/create-post')}
                    className="px-5 py-2.5 rounded-full bg-[#542612] text-white font-bold text-xs"
                  >
                    Create First Post
                  </button>
                }
              />
            ) : (
              <div className="space-y-5">
                {allFeedItems.map((item) =>
                  item.feedItemType === 'EVENT' ? (
                    <EventCard key={item._id} event={item} onRSVPToggle={fetchData} />
                  ) : (
                    <FeedCard
                      key={item._id}
                      post={item}
                      onCommentAdded={fetchData}
                      onPostDeleted={fetchData}
                      onPostPinned={fetchData}
                    />
                  )
                )}
              </div>
            )
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              title={
                activeCategory === 'NOTICE'
                  ? 'No official notices yet'
                  : activeCategory === 'GENERAL'
                  ? 'No community posts yet'
                  : 'No maintenance notices or complaints'
              }
              description={
                activeCategory === 'NOTICE'
                  ? 'Official notices and society circulars from your management will appear here.'
                  : activeCategory === 'GENERAL'
                  ? 'Share an update, recommendation, or start a discussion with your neighbors.'
                  : 'Have an issue or maintenance concern in your block?'
              }
              action={
                activeCategory === 'COMPLAINT' ? (
                  <button
                    onClick={() => setRaiseComplaintOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#542612] text-white font-bold text-xs"
                  >
                    Raise Complaint
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/create-post')}
                    className="px-5 py-2.5 rounded-full bg-[#542612] text-white font-bold text-xs"
                  >
                    {activeCategory === 'NOTICE' ? 'Publish Notice' : 'Create Community Post'}
                  </button>
                )
              }
            />
          ) : (
            <div className="space-y-5">
              {filteredPosts.map((post) => (
                <FeedCard
                  key={post._id}
                  post={post}
                  onCommentAdded={fetchData}
                  onPostDeleted={fetchData}
                  onPostPinned={fetchData}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Spotlight Widgets (Events & Businesses) */}
        <div className="space-y-6">
          {/* Upcoming Events Spotlight */}
          <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded p-5 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#542612] dark:text-[#F7F0DF]" />
                <h3 className="font-serif font-bold text-sm text-[#542612] dark:text-white uppercase tracking-wider">
                  Upcoming Events
                </h3>
              </div>
              <button
                onClick={() => navigate('/events')}
                className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] hover:underline"
              >
                View All
              </button>
            </div>

            {events.slice(0, 2).map((ev) => (
              <EventCard key={ev._id} event={ev} onRSVPToggle={fetchData} />
            ))}
          </div>

          {/* Resident Businesses Discovery Widget */}
          <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded p-5 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#542612] dark:text-[#F7F0DF]" />
                <h3 className="font-serif font-bold text-sm text-[#542612] dark:text-white uppercase tracking-wider">
                  Resident Businesses
                </h3>
              </div>
              <button
                onClick={() => setOpenBusinessOpen(true)}
                className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] hover:underline"
              >
                + Open Yours
              </button>
            </div>

            {businesses.slice(0, 2).map((b) => (
              <BusinessCard
                key={b._id}
                business={b}
                onClick={() => navigate('/businesses')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RaiseComplaintModal
        isOpen={raiseComplaintOpen}
        onClose={() => setRaiseComplaintOpen(false)}
        onCreated={fetchData}
      />
      <OpenBusinessModal
        isOpen={openBusinessOpen}
        onClose={() => setOpenBusinessOpen(false)}
        onCreated={fetchData}
      />
    </PageContainer>
  );
};

export default Home;
