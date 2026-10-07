import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import { eventService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const EventCard = ({ event, onRSVPToggle }) => {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState(event.attendees || []);
  const [loading, setLoading] = useState(false);

  const isAttending = user ? attendees.includes(user._id) : false;

  const handleRSVP = async () => {
    if (!user) return;
    setLoading(true);
    await eventService.toggleRSVP(event._id, user._id);
    setAttendees((prev) =>
      isAttending ? prev.filter((id) => id !== user._id) : [...prev, user._id]
    );
    setLoading(false);
    if (onRSVPToggle) onRSVPToggle(event._id, !isAttending);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl overflow-hidden border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm hover:shadow-xl hover:shadow-[#542612]/10 flex flex-col justify-between group font-sans"
    >
      <div>
        {/* Event Poster Header */}
        <div className="relative h-48 sm:h-52 overflow-hidden bg-[#F7F0DF] dark:bg-[#542612]">
          <img
            src={event.poster || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#542612]/90 via-[#542612]/20 to-transparent" />

          {/* Date Badge overlay */}
          <div className="absolute top-4 left-4 bg-[#F5EFE1]/95 dark:bg-[#542612]/95 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-lg flex items-center gap-1.5 text-xs font-bold text-[#542612] dark:text-[#F7F0DF]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <span className="text-xs font-semibold flex items-center gap-1 bg-[#542612]/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[#F7F0DF]">
              <Users className="w-3.5 h-3.5 text-[#F7F0DF]" />
              {attendees.length} Resident{attendees.length !== 1 ? 's' : ''} Attending
            </span>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-5 space-y-3">
          <h3 className="font-serif font-extrabold text-lg text-[#542612] dark:text-white tracking-tight line-clamp-1">
            🎉 {event.title}
          </h3>

          <p className="text-xs text-[#542612]/80 dark:text-[#F7F0DF]/80 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-1.5 pt-2 text-xs font-medium text-[#542612] dark:text-[#FFFFFF]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#542612] dark:text-[#F7F0DF] flex-shrink-0" />
              <span>{event.time || '06:30 PM Onwards'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#542612] dark:text-[#F7F0DF] flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Action */}
      <div className="p-5 pt-0">
        <Button
          onClick={handleRSVP}
          loading={loading}
          variant={isAttending ? 'secondary' : 'primary'}
          className="w-full"
        >
          {isAttending ? (
            <span className="flex items-center gap-1.5 text-[#542612] dark:text-[#542612] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              RSVP'd (Attending)
            </span>
          ) : (
            'RSVP Now'
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default EventCard;
