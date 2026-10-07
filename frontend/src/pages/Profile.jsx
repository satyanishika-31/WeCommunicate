import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  MessageSquare,
  Wrench,
  Store,
  Calendar,
  Settings as SettingsIcon,
  Camera,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import FeedCard from '../components/feed/FeedCard';
import ComplaintCard from '../components/complaints/ComplaintCard';
import BusinessCard from '../components/businesses/BusinessCard';
import EventCard from '../components/events/EventCard';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { postService, complaintService, businessService, eventService } from '../api/services';

const Profile = () => {
  const { user, role, residentType, updateProfile } = useAuth();
  const profileImageInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('POSTS'); // POSTS | COMPLAINTS | BUSINESS | EVENTS

  const [userPosts, setUserPosts] = useState([]);
  const [userComplaints, setUserComplaints] = useState([]);
  const [userBusinesses, setUserBusinesses] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProfile({ profileImage: reader.result });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const fetchData = async () => {
    setLoading(true);
    const [pList, cList, bList, eList] = await Promise.all([
      postService.getAll(),
      complaintService.getAll(),
      businessService.getAll(),
      eventService.getAll(),
    ]);

    setUserPosts((pList || []).filter((p) => p.author?._id === user?._id));
    setUserComplaints((cList || []).filter((c) => c.raisedBy?._id === user?._id));
    setUserBusinesses((bList || []).filter((b) => b.owner?._id === user?._id));
    setUserEvents((eList || []).filter((e) => e.attendees?.includes(user?._id)));

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <PageContainer>
      <Header />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Banner */}
        <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl overflow-hidden border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm">
          {/* Cover Gradient */}
          <div className="h-36 bg-gradient-to-r from-[#542612] via-[#542612] to-[#542612] relative" />

          {/* User Info Container */}
          <div className="px-6 pb-6 relative -top-12 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                <Avatar
                  src={user?.profileImage}
                  name={user?.name || 'Rahul Sharma'}
                  size="xl"
                  className="ring-4 ring-white dark:ring-[#542612] shadow-xl"
                />
                <button
                  type="button"
                  onClick={() => profileImageInputRef.current?.click()}
                  className="absolute -right-2 -bottom-2 w-9 h-9 rounded-full bg-[#542612] text-[#FFFFFF] flex items-center justify-center border-4 border-white shadow-md hover:bg-[#542612] transition-colors"
                  title="Change profile picture"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-[#542612] dark:text-white tracking-tight">
                    {user?.name || 'Rahul Sharma'}
                  </h1>
                  <Badge type={role} />
                  <Badge type={residentType} />
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[#542612] dark:text-[#F7F0DF]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    Flat {user?.house?.houseNumber || 'A-101'} • {user?.block?.name || 'Block A'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#542612]/70 dark:text-[#542612]/60 pt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#542612]/60" />
                    {user?.phone || '+91 98765 43210'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#542612]/60" />
                    {user?.email || 'rahul@wecommunicate.com'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-2 border-b border-[#542612]/20 dark:border-[#F7F0DF]/20 pb-1">
          {[
            { id: 'POSTS', label: 'My Posts', icon: MessageSquare, count: userPosts.length },
            { id: 'COMPLAINTS', label: 'My Complaints', icon: Wrench, count: userComplaints.length },
            { id: 'BUSINESS', label: 'My Business', icon: Store, count: userBusinesses.length },
            { id: 'EVENTS', label: 'Events Joined', icon: Calendar, count: userEvents.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'text-[#542612] dark:text-[#F7F0DF] border-b-2 border-[#542612] dark:border-[#F7F0DF]'
                    : 'text-[#542612]/70 dark:text-[#542612]/60 hover:text-[#542612] dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#F7F0DF] dark:bg-[#542612] text-[10px] text-[#542612] dark:text-[#F7F0DF]">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'POSTS' && (
          <div className="space-y-4">
            {userPosts.length === 0 ? (
              <EmptyState title="No posts created yet" description="Share updates with your neighbors on the home feed!" />
            ) : (
              userPosts.map((post) => <FeedCard key={post._id} post={post} onLikeToggle={fetchData} />)
            )}
          </div>
        )}

        {activeTab === 'COMPLAINTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userComplaints.length === 0 ? (
              <div className="col-span-full">
                <EmptyState title="No complaints raised" description="You have not submitted any maintenance requests." />
              </div>
            ) : (
              userComplaints.map((comp) => <ComplaintCard key={comp._id} complaint={comp} />)
            )}
          </div>
        )}

        {activeTab === 'BUSINESS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userBusinesses.length === 0 ? (
              <div className="col-span-full">
                <EmptyState title="No business registered" description="You haven't listed a home business or tuition service yet." />
              </div>
            ) : (
              userBusinesses.map((b) => <BusinessCard key={b._id} business={b} />)
            )}
          </div>
        )}

        {activeTab === 'EVENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userEvents.length === 0 ? (
              <div className="col-span-full">
                <EmptyState title="No events joined" description="Browse upcoming events and click RSVP to attend!" />
              </div>
            ) : (
              userEvents.map((ev) => <EventCard key={ev._id} event={ev} onRSVPToggle={fetchData} />)
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Profile;
