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

  // Editable image link placeholders inspired by Image 2 design gallery layout
  const heroGalleryImages = [
    {
      title: 'Community Moments',
      url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Green Spaces & Gardens',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Serene Atmosphere',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Festive Celebrations',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
    },
  ];

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

      {/* COMPACT COMMUNITY HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-6 lg:p-10 bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/20 shadow-sm mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/30 text-[#542612] dark:text-[#F7F0DF] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>We Communicate Community</span>
            </div>

            {/* Serif Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#542612] dark:text-white tracking-tight leading-none">
              Your Path To <br />
              <span className="italic font-serif text-[#542612] dark:text-[#F7F0DF]">
                Community & Living
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#542612]/80 dark:text-[#F7F0DF]/80 font-sans leading-relaxed max-w-lg">
              Connecting residents, empowering local home businesses, and maintaining peace of mind across every block.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-3 rounded-full bg-[#542612] text-white font-bold text-sm hover:bg-[#542612] transition-all shadow-md hover:scale-105 active:scale-95"
            >
              Explore Community
            </button>
            <button
              onClick={() => navigate('/create-post')}
              className="px-6 py-3 rounded-full border border-[#542612] dark:border-white text-[#542612] dark:text-white font-bold text-sm hover:bg-[#F7F0DF]/20 transition-all hover:scale-105 active:scale-95"
            >
              + Share Post
            </button>
          </div>
        </div>

        {/* IMAGE GALLERY GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {heroGalleryImages.map((img, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-[#F5EFE1] dark:bg-[#542612] shadow-sm border border-[#542612]/15 group cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#542612]/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-serif font-bold">
                {img.title}
              </div>
            </motion.div>
          ))}
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
                className={`group relative bg-[#F5EFE1] dark:bg-[#542612] p-4 sm:p-5 rounded-2xl border ${qa.borderColor} shadow-sm hover:shadow-xl hover:shadow-[#542612]/5 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between`}
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
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Spotlight Widgets (Events & Businesses) */}
        <div className="space-y-6">
          {/* Upcoming Events Spotlight */}
          <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-5 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-4">
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
          <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-5 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-4">
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
