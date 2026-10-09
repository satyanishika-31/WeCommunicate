import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Settings,
  Camera,
  Building,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FeedCard from '../components/feed/FeedCard';
import ComplaintCard from '../components/complaints/ComplaintCard';
import BusinessCard from '../components/businesses/BusinessCard';
import EventCard from '../components/events/EventCard';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { postService, complaintService, businessService, eventService, metaService } from '../api/services';

const Profile = () => {
  const { user, role, residentType, updateProfile } = useAuth();
  const profileImageInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('POSTS'); // POSTS | COMPLAINTS | BUSINESS | EVENTS

  const [userPosts, setUserPosts] = useState([]);
  const [userComplaints, setUserComplaints] = useState([]);
  const [userBusinesses, setUserBusinesses] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [communitiesList, setCommunitiesList] = useState([]);

  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    houseNumber: '',
    community: '',
    residentType: 'OWNER',
  });

  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        phone: user.phone || '',
        houseNumber: user.houseNumber || user.house?.houseNumber || '',
        community: user.community || '',
        residentType: user.residentType || 'OWNER',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchComms = async () => {
      try {
        const comms = await metaService.getCommunities();
        if (comms && comms.length > 0) {
          setCommunitiesList(comms.map((c) => c.name));
        }
      } catch (err) {
        console.error('Failed to load communities for edit profile modal:', err);
      }
    };
    fetchComms();
  }, []);

  const handleOpenEditModal = () => {
    setEditError('');
    setEditFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      houseNumber: user?.houseNumber || user?.house?.houseNumber || '',
      community: user?.community || (communitiesList[0] || ''),
      residentType: user?.residentType || 'OWNER',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      setEditError('Name is required.');
      return;
    }
    setEditSaving(true);
    setEditError('');
    try {
      await updateProfile(editFormData);
      setIsEditModalOpen(false);
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setEditSaving(false);
    }
  };

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
        {/* Profile Header Card */}
        <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl overflow-hidden border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-xl">
          {/* Cover Banner */}
          <div className="h-40 sm:h-48 bg-gradient-to-r from-[#2c1308] via-[#542612] to-[#3a180a] relative p-6 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F7F0DF_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#F7F0DF] text-xs font-bold border border-white/20">
                <Building className="w-3.5 h-3.5" />
                {user?.community || 'Residential Society'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAA627] hover:bg-[#d4941f] text-[#33160a] text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all border border-white/25 shadow-sm"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>

            <div className="relative z-10 text-right text-[11px] font-semibold text-white/70">
              Verified Resident Profile
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="px-6 sm:px-8 pb-8 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-14 sm:-mt-16 mb-5">
              {/* Avatar + Change Photo Button */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ring-4 ring-[#F5EFE1] dark:ring-[#542612] shadow-2xl overflow-hidden bg-[#542612] flex items-center justify-center">
                  {user?.profileImage && user.profileImage.trim() ? (
                    <img
                      src={user.profileImage}
                      alt={user?.name || 'Resident'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#542612] to-[#301407] flex items-center justify-center text-white font-serif font-black text-2xl sm:text-3xl">
                      {user?.name
                        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'NI'}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => profileImageInputRef.current?.click()}
                  className="absolute -right-2 -bottom-2 w-9 h-9 rounded-2xl bg-[#542612] text-white flex items-center justify-center border-2 border-white shadow-lg hover:bg-[#3e1b0c] transition-all cursor-pointer hover:scale-105"
                  title="Upload / Change Profile Picture"
                  aria-label="Upload / Change Profile Picture"
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

              {/* Badges on right side */}
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <Badge type={role} size="md" />
                <Badge type={residentType} size="md" />
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified
                </span>
              </div>
            </div>

            {/* Name & Contact Details */}
            <div className="space-y-3 text-center sm:text-left">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#542612] dark:text-white tracking-tight">
                  {user?.name || 'Resident Member'}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-[#542612]/75 dark:text-[#F7F0DF]/80 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#542612] dark:text-[#F7F0DF]" />
                  <span>
                    Flat {user?.houseNumber || user?.house?.houseNumber || 'A-101'}
                    {user?.block?.name ? ` • ${user.block.name}` : ''}
                    {user?.community ? ` • ${user.community}` : ''}
                  </span>
                </p>
              </div>

              {/* Contact Information Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                {user?.email && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-[#542612]/40 border border-[#542612]/15 text-xs text-[#542612] dark:text-[#F7F0DF] font-medium shadow-2xs">
                    <Mail className="w-3.5 h-3.5 text-[#542612]/70 dark:text-[#F7F0DF]/70" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-[#542612]/40 border border-[#542612]/15 text-xs text-[#542612] dark:text-[#F7F0DF] font-medium shadow-2xs">
                    <Phone className="w-3.5 h-3.5 text-[#542612]/70 dark:text-[#F7F0DF]/70" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Key Metrics / Activity Counters Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#542612]/15 dark:border-[#F7F0DF]/15 text-center">
              <div className="bg-white/50 dark:bg-black/20 p-3.5 rounded-2xl border border-[#542612]/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#542612]/60 dark:text-[#F7F0DF]/60 block mb-1">
                  Community Posts
                </span>
                <span className="text-xl font-extrabold text-[#542612] dark:text-white font-serif">
                  {userPosts.length}
                </span>
              </div>

              <div className="bg-white/50 dark:bg-black/20 p-3.5 rounded-2xl border border-[#542612]/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#542612]/60 dark:text-[#F7F0DF]/60 block mb-1">
                  Complaints Raised
                </span>
                <span className="text-xl font-extrabold text-[#542612] dark:text-white font-serif">
                  {userComplaints.length}
                </span>
              </div>

              <div className="bg-white/50 dark:bg-black/20 p-3.5 rounded-2xl border border-[#542612]/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#542612]/60 dark:text-[#F7F0DF]/60 block mb-1">
                  Resolved Issues
                </span>
                <span className="text-xl font-extrabold text-[#542612] dark:text-white font-serif">
                  {userComplaints.filter((c) => c.status === 'RESOLVED').length}
                </span>
              </div>

              <div className="bg-white/50 dark:bg-black/20 p-3.5 rounded-2xl border border-[#542612]/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#542612]/60 dark:text-[#F7F0DF]/60 block mb-1">
                  Events Joined
                </span>
                <span className="text-xl font-extrabold text-[#542612] dark:text-white font-serif">
                  {userEvents.length}
                </span>
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
              userPosts.map((post) => (
                <FeedCard
                  key={post._id}
                  post={post}
                  onLikeToggle={fetchData}
                  onPostDeleted={fetchData}
                  onPostPinned={fetchData}
                />
              ))
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

        {/* EDIT PROFILE MODAL */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Resident Profile"
          maxWidth="max-w-md"
        >
          {editError && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center font-medium">
              {editError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider text-[10px] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/30 border border-[#542612]/20 dark:border-white/20 text-[#542612] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider text-[10px] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/30 border border-[#542612]/20 dark:border-white/20 text-[#542612] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
              />
            </div>

            {/* Flat Number & Resident Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider text-[10px] mb-1.5">
                  Flat / House #
                </label>
                <input
                  type="text"
                  value={editFormData.houseNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, houseNumber: e.target.value })}
                  placeholder="e.g. A-101"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/30 border border-[#542612]/20 dark:border-white/20 text-[#542612] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider text-[10px] mb-1.5">
                  Resident Type
                </label>
                <select
                  value={editFormData.residentType}
                  onChange={(e) => setEditFormData({ ...editFormData, residentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/30 border border-[#542612]/20 dark:border-white/20 text-[#542612] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                >
                  <option value="OWNER" className="bg-white dark:bg-zinc-900 text-[#542612] dark:text-white">Owner</option>
                  <option value="TENANT" className="bg-white dark:bg-zinc-900 text-[#542612] dark:text-white">Tenant</option>
                </select>
              </div>
            </div>

            {/* Community Selection */}
            <div>
              <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider text-[10px] mb-1.5">
                Community / Society
              </label>
              {communitiesList.length > 0 ? (
                <select
                  value={editFormData.community}
                  onChange={(e) => setEditFormData({ ...editFormData, community: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/30 border border-[#542612]/20 dark:border-white/20 text-[#542612] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                >
                  {communitiesList.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-zinc-900 text-[#542612] dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={editFormData.community}
                  onChange={(e) => setEditFormData({ ...editFormData, community: e.target.value })}
                  placeholder="Society name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/30 border border-[#542612]/20 dark:border-white/20 text-[#542612] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#542612]/10 dark:border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={editSaving}
                className="bg-[#542612] text-white hover:bg-[#3d1b0c]"
              >
                {editSaving ? 'Saving Changes...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default Profile;
