import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  PlusCircle,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  Store,
  Megaphone,
  Heart,
  MessageSquare,
  Send,
  Bell,
  Users,
  Info,
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
    const [pList, eList, bList] = await Promise.all([
      postService.getAll(),
      eventService.getAll(),
      businessService.getAll(),
    ]);
    setPosts(pList || []);
    setEvents(eList || []);
    setBusinesses(bList || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === 'ALL' ||
      post.type === activeCategory ||
      (activeCategory === 'COMPLAINT' && post.type === 'NOTICE');

    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

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

      {/* HERO BANNER SECTION (MATCHING DESIGN 2) */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 mb-8"
      >
        {/* Main Hero Card */}
        <div className="relative overflow-hidden rounded bg-[#F4EFE6] dark:bg-[#3D1E10] border border-[#542612]/15 dark:border-[#542612]/30 shadow-sm min-h-[300px] lg:min-h-[360px] flex items-center justify-between">
          {/* Building image positioned at right corner with multi-directional seamless blend */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden">
            <img
              src="/hero_apartment_garden.jpg"
              alt="Community Living Architecture"
              className="w-full h-full object-cover object-center"
            />
            {/* Seamless Left Fade into Warm Background */}
            <div className="absolute inset-y-0 left-0 w-36 sm:w-56 bg-gradient-to-r from-[#F4EFE6] via-[#F4EFE6]/80 to-transparent dark:from-[#3D1E10] dark:via-[#3D1E10]/80 dark:to-transparent" />
            {/* Seamless Top & Bottom soft blends */}
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#F4EFE6]/60 to-transparent dark:from-[#3D1E10]/60 dark:to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F4EFE6]/80 to-transparent dark:from-[#3D1E10]/80 dark:to-transparent" />
          </div>

          {/* Left Text Content & Action Buttons */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFEAD9]/90 dark:bg-[#542612]/80 border border-[#542612]/20 text-[#542612] dark:text-[#F7F0DF] text-[11px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-sm">
              <MessageSquare className="w-3.5 h-3.5 text-[#542612] dark:text-[#EAA627]" />
              <span>Communications & Community</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#542612] dark:text-white tracking-tight leading-[1.15]">
              A Stronger Community, <br />
              <span className="italic font-serif text-[#542612] dark:text-[#F7F0DF]">
                Together
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#542612]/85 dark:text-[#F7F0DF]/90 font-sans leading-relaxed max-w-md">
              Stay informed, get things done, and be part of a more connected and active community.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/notices')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#542612] text-white font-bold text-xs sm:text-sm hover:bg-[#3d1b0c] transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>View Announcements</span>
                <span className="text-xs">→</span>
              </button>

              <button
                onClick={() => navigate('/create-post')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F4EFE6]/90 dark:bg-[#542612] border border-[#542612]/30 text-[#542612] dark:text-white font-bold text-xs sm:text-sm hover:bg-white transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer backdrop-blur-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Notification</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 Bottom Nav / Feature Cards (Matching Image 2 exactly) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {[
            {
              title: 'Communication & Announcements',
              path: '/notices',
              icon: Megaphone,
              bgImage: 'https://www.shutterstock.com/image-photo/couple-using-smartphone-window-display-600nw-1895729401.jpg',
            },
            {
              title: 'Complaints & Maintenance',
              path: '/complaints',
              icon: Wrench,
              bgImage: 'bg_image.png',
            },
            {
              title: 'Events & Community Activities',
              path: '/events',
              icon: Calendar,
              bgImage: 'bg_img2.jpg',
            },
            {
              title: 'Resident Directory & Services',
              path: '/businesses',
              icon: Users,
              bgImage: 'bg_img3.jpg',
            },
            {
              title: 'Community Information',
              path: '/records',
              icon: Info,
              bgImage: 'bg_img5.png',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.02 }}
                onClick={() => navigate(item.path)}
                className="relative h-32 sm:h-36 rounded overflow-hidden bg-[#542612] shadow-sm border border-[#542612]/100 cursor-pointer group flex flex-col justify-end p-3.5 transition-all"
              >
                <img
                  src={item.bgImage}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-70 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D1E10] via-[#3D1E10]/50 to-transparent" />

                <div className="relative z-10 flex items-center justify-between gap-2 text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-2">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs shrink-0">
                    →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

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
                {filteredPosts.length} Post{filteredPosts.length !== 1 ? 's' : ''}
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
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              title="No posts in this category yet"
              description="Be the first resident to share an update, notice, or event with your society!"
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
              {filteredPosts.map((post) => (
                <FeedCard
                  key={post._id}
                  post={post}
                  onLikeToggle={fetchData}
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
