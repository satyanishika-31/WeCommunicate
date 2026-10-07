import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import EventCard from '../components/events/EventCard';
import { EventSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { eventService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const { user, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createEventOpen, setCreateEventOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-24');
  const [time, setTime] = useState('06:30 PM');
  const [venue, setVenue] = useState('Central Community Clubhouse');
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await eventService.getAll();
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    const res = await eventService.create(
      { title, description, date, time, venue },
      user
    );
    setCreating(false);
    if (res.success) {
      setCreateEventOpen(false);
      setTitle('');
      setDescription('');
      fetchEvents();
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <Header onSearch={(q) => setSearchQuery(q)} />

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#542612]/10 text-[#542612] dark:text-[#F7F0DF] flex items-center justify-center border border-[#542612]/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#542612] dark:text-white tracking-tight">
              Community Events & RSVP
            </h1>
            <p className="text-sm text-[#542612]/70 dark:text-[#542612]/60">
              Join festive celebrations, meetings, sports matches, and workshops
            </p>
          </div>
        </div>

        {(role === 'ADMIN' || role === 'BLOCK_MANAGER') && (
          <Button onClick={() => setCreateEventOpen(true)} icon={Plus}>
            Host New Event
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventSkeleton />
          <EventSkeleton />
          <EventSkeleton />
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No upcoming events"
          description="Check back later for upcoming community celebrations and meetings."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <EventCard key={ev._id} event={ev} onRSVPToggle={fetchEvents} />
          ))}
        </div>
      )}

      {/* Host Event Modal */}
      <Modal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        title="Host Community Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grand Diwali Celebration"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event highlights, food stalls, dress code..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="06:30 PM - 10:30 PM"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
              Venue Location
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Central Community Clubhouse Lawn"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCreateEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating} icon={Calendar}>
              Publish Event
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default Events;
