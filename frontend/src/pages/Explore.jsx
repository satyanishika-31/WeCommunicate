import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Store, Calendar, MapPin, Phone, Mail, Filter } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import BusinessCard from '../components/businesses/BusinessCard';
import EventCard from '../components/events/EventCard';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import OpenBusinessModal from '../components/businesses/OpenBusinessModal';
import { metaService, businessService, eventService } from '../api/services';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('BUSINESSES'); // BUSINESSES | RESIDENTS | EVENTS
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBusinessOpen, setOpenBusinessOpen] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Services' },
    { id: 'BAKING', label: 'Baking' },
    { id: 'TUITION', label: 'Tuition' },
    { id: 'TAILORING', label: 'Tailoring' },
    { id: 'BEAUTY', label: 'Beauty' },
    { id: 'FITNESS', label: 'Fitness' },
    { id: 'ART', label: 'Art' },
    { id: 'FOOD', label: 'Food' },
  ];

  const fetchData = async () => {
    setLoading(true);
    const [uList, bList, eList] = await Promise.all([
      metaService.getUsers(),
      businessService.getAll(),
      eventService.getAll(),
    ]);
    setUsers(uList || []);
    setBusinesses(bList || []);
    setEvents(eList || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.owner?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredResidents = users.filter((u) => {
    return (
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.block?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.house?.houseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <PageContainer>
      <Header onSearch={(q) => setSearchQuery(q)} />

      {/* Hero Header */}
      <div className="mb-8 space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-extrabold text-[#542612] dark:text-white tracking-tight">
              Explore Community Directory
            </h1>
            <p className="text-sm text-[#542612]/70 dark:text-[#F7F0DF]/80 mt-1">
              Find verified residents, home-run services, and upcoming events in your society
            </p>
          </div>

          <button
            onClick={() => setOpenBusinessOpen(true)}
            className="px-5 py-2.5 rounded bg-[#542612] hover:bg-[#542612] text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
          >
            + Open Your Business
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#542612]/15 dark:border-[#F7F0DF]/20 pb-1">
          {[
            { id: 'BUSINESSES', label: 'Resident Businesses', icon: Store, count: businesses.length },
            { id: 'RESIDENTS', label: 'Residents Directory', icon: Users, count: users.length },
            { id: 'EVENTS', label: 'Events & Workshops', icon: Calendar, count: events.length },
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
                    : 'text-[#542612]/70 dark:text-[#F7F0DF]/70 hover:text-[#542612] dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 rounded bg-[#F7F0DF] dark:bg-[#542612] text-[10px] text-[#542612] dark:text-[#F7F0DF]">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BUSINESSES TAB */}
      {activeTab === 'BUSINESSES' && (
        <div className="space-y-6">
          {/* Service Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? 'bg-[#542612] text-white shadow-sm'
                    : 'bg-[#F5EFE1] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/15 dark:border-[#F7F0DF]/20 hover:bg-[#F7F0DF]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {filteredBusinesses.length === 0 ? (
            <EmptyState
              title="No businesses found"
              description="No resident businesses match your search or filter."
              action={
                <button
                  onClick={() => setOpenBusinessOpen(true)}
                  className="px-4 py-2 rounded bg-[#542612] text-white text-xs font-bold"
                >
                  Register Your Business
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((b) => (
                <BusinessCard key={b._id} business={b} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* RESIDENTS TAB */}
      {activeTab === 'RESIDENTS' && (
        <div>
          {filteredResidents.length === 0 ? (
            <EmptyState
              title="No residents found"
              description="Try searching by flat number or different name."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResidents.map((res) => (
                <motion.div
                  key={res._id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#F5EFE1] dark:bg-[#542612] rounded p-5 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm hover:shadow-lg transition-all flex items-center gap-4"
                >
                  <Avatar src={res.profileImage} name={res.name} size="lg" showStatus />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#542612] dark:text-white truncate">
                        {res.name}
                      </h4>
                      <Badge type={res.role} size="sm" className="text-[9px] py-0 px-1" />
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[#542612] dark:text-[#F7F0DF] font-semibold mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{res.house?.houseNumber || 'A-101'} • {res.block?.name || 'Block A'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#542612]/70 dark:text-[#F7F0DF]/70 mt-2">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#542612]/60 dark:text-[#F7F0DF]/60" />
                        {res.phone || '+91 98765 xxxxx'}
                      </span>
                      <Badge type={res.residentType || 'OWNER'} size="sm" className="text-[9px] py-0 px-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVENTS TAB */}
      {activeTab === 'EVENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} onRSVPToggle={fetchData} />
          ))}
        </div>
      )}

      {/* Open Business Modal */}
      <OpenBusinessModal
        isOpen={openBusinessOpen}
        onClose={() => setOpenBusinessOpen(false)}
        onCreated={fetchData}
      />
    </PageContainer>
  );
};

export default Explore;
