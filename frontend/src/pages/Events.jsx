import React, { useCallback, useState, useEffect } from 'react';
import { Calendar, Plus, Upload, X, Image as ImageIcon } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import EventCard from '../components/events/EventCard';
import { EventSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { eventService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import useEventPolling from '../hooks/useEventPolling';

const Events = () => {
  const { user, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createEventOpen, setCreateEventOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('06:30 PM');
  const [venue, setVenue] = useState('Central Community Clubhouse');
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await eventService.getAll();
    setEvents(data || []);
    setLoading(false);
  };

  const handleEventsUpdated = useCallback((data) => {
    setEvents(data || []);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);
  useEventPolling(handleEventsUpdated);

  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview]);

  const handlePosterChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WEBP).');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    if (posterPreview) URL.revokeObjectURL(posterPreview);
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const removePoster = () => {
    if (posterPreview) URL.revokeObjectURL(posterPreview);
    setPosterFile(null);
    setPosterPreview('');
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setCreateError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('date', date);
    formData.append('time', time.trim());
    formData.append('venue', venue.trim());
    if (user?.block?._id || user?.block) {
      formData.append('block', user?.block?._id || user?.block);
    }
    if (posterFile) {
      formData.append('poster', posterFile);
    }

    try {
      const res = await eventService.create(formData);
      if (res.success) {
        setCreateEventOpen(false);
        setTitle('');
        setDescription('');
        removePoster();
        fetchEvents();
      } else {
        setCreateError(res.message || 'Unable to publish event.');
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Unable to publish event.');
    } finally {
      setCreating(false);
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
              Community Events
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

          {/* Event Poster / Banner Image */}
          <div>
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
              Event Banner / Poster Image (Optional)
            </label>

            {posterPreview ? (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#542612]/30 shadow-md group">
                <img
                  src={posterPreview}
                  alt="Event poster preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePoster}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform hover:scale-110"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-[#542612]/30 hover:border-[#542612] bg-[#F7F0DF]/60 hover:bg-[#F7F0DF] dark:bg-[#542612]/30 cursor-pointer transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#542612]/10 text-[#542612] dark:text-[#F7F0DF] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-[#542612] dark:text-white block">
                    Click to upload event poster
                  </span>
                  <span className="text-[11px] text-[#542612]/60 dark:text-[#F7F0DF]/60">
                    PNG, JPG, or WEBP (Max 5MB)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePosterChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {createError && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50">
              {createError}
            </p>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateEventOpen(false);
                removePoster();
              }}
            >
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
