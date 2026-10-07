import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Heart, ShieldCheck, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 bg-[#542612] text-[#FFFFFF] rounded-t-3xl pt-12 pb-8 px-6 lg:px-12 border-t border-[#F7F0DF]/20 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Brand & About */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#542612] to-[#542612] border border-[#F7F0DF]/30 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#F7F0DF]" />
            </div>
            <span className="font-serif text-2xl font-bold text-white tracking-tight group-hover:text-[#F7F0DF] transition-colors">
              WE COMMUNICATE
            </span>
          </Link>

          <p className="text-xs text-[#F7F0DF]/90 leading-relaxed font-sans">
            Connecting communities, empowering residents. A unified residential society platform for notices, maintenance complaints, festive events, and resident-run businesses.
          </p>

          <div className="text-xs text-[#F7F0DF]/80 space-y-1 pt-1 font-sans">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#F7F0DF]" />
              <span>Emerald Towers Enclave, Block A-D</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#F7F0DF]" />
              <span>support@wecommunicate.app</span>
            </div>
          </div>
        </div>

        {/* Services & Modules */}
        <div>
          <h4 className="font-serif font-bold text-base text-[#F7F0DF] mb-4 uppercase tracking-wider text-[11px]">
            Community Services
          </h4>
          <ul className="space-y-2.5 text-xs text-[#F7F0DF]/80 font-sans">
            <li>
              <Link to="/notices" className="hover:text-[#F7F0DF] transition-colors flex items-center gap-1">
                Official Notices & Water Updates <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
            <li>
              <Link to="/complaints" className="hover:text-[#F7F0DF] transition-colors flex items-center gap-1">
                Maintenance Complaint Timeline <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-[#F7F0DF] transition-colors flex items-center gap-1">
                Festive Events & AGM RSVP <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
            <li>
              <Link to="/businesses" className="hover:text-[#F7F0DF] transition-colors flex items-center gap-1">
                Resident Home Businesses & Tutors <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
            <li>
              <Link to="/explore" className="hover:text-[#F7F0DF] transition-colors flex items-center gap-1">
                Resident Directory Search <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
          </ul>
        </div>

        {/* About & Society Guidelines */}
        <div>
          <h4 className="font-serif font-bold text-base text-[#F7F0DF] mb-4 uppercase tracking-wider text-[11px]">
            About & Management
          </h4>
          <ul className="space-y-2.5 text-xs text-[#F7F0DF]/80 font-sans">
            <li>
              <Link to="/profile" className="hover:text-[#F7F0DF] transition-colors">
                Resident Profile & Flat Details
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-[#F7F0DF] transition-colors">
                Theme & Notification Settings
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-[#F7F0DF] transition-colors">
                Admin Governance & Verification
              </Link>
            </li>
            <li>
              <Link to="/manager" className="hover:text-[#F7F0DF] transition-colors">
                Block Manager Desk
              </Link>
            </li>
            <li>
              <span className="text-[#F7F0DF]/60">Society Bylaws & Safety Standards</span>
            </li>
          </ul>
        </div>

        {/* Quick Contact & Action */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-base text-[#F7F0DF] mb-4 uppercase tracking-wider text-[11px]">
            Need Assistance?
          </h4>
          <p className="text-xs text-[#F7F0DF]/80 leading-relaxed font-sans">
            Have a question or need emergency maintenance help? Contact your Block Manager or raise a ticket directly.
          </p>

          <Link
            to="/complaints"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-[#F7F0DF] text-[#542612] font-bold text-xs hover:bg-[#F5EFE1] transition-colors shadow-sm"
          >
            Raise Maintenance Ticket →
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-6 border-t border-[#542612] text-center sm:flex sm:items-center sm:justify-between text-[11px] text-[#F7F0DF]/60 font-sans">
        <p>© 2026 We Communicate Society Platform. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 flex items-center justify-center gap-1">
          Designed with <Heart className="w-3 h-3 text-[#F7F0DF] fill-[#F7F0DF]" /> for modern residential living.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
