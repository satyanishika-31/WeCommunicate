import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  Wrench,
  Calendar,
  Store,
  Users,
  Bell,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import Logo from '../components/common/Logo';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Community Social Feed',
      desc: 'Discover notices, news, pictures, and updates from neighbors in real time.',
      icon: MessageSquare,
      color: 'from-[#542612] to-[#542612]',
    },
    {
      title: 'Smart Complaints Timeline',
      desc: 'Log maintenance complaints with progressive status tracking from Pending to Resolved.',
      icon: Wrench,
      color: 'from-[#542612] to-[#F7F0DF]',
    },
    {
      title: 'Community Events & RSVP',
      desc: 'Stay informed about festivals, general body meetings, workshops, and RSVP in one click.',
      icon: Calendar,
      color: 'from-[#542612] to-[#542612]',
    },
    {
      title: 'Resident Businesses Spotlight',
      desc: 'Support local home bakers, tutors, tailors, and fitness trainers in your society.',
      icon: Store,
      color: 'from-[#542612] to-[#542612]',
    },
    {
      title: 'Easy Resident Directory',
      desc: 'Quickly find verified residents by block and house number with privacy controls.',
      icon: Users,
      color: 'from-[#542612] to-[#542612]',
    },
    {
      title: 'Instant Notifications',
      desc: 'Never miss urgent water outages, security alerts, or complaint updates.',
      icon: Bell,
      color: 'from-[#F7F0DF] to-[#542612]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F0DF] text-[#542612] font-sans selection:bg-[#542612] selection:text-white overflow-x-hidden">
      {/* Window Header Dots Bar */}
      

      {/* Main Top Header Bar */}
      <header className="bg-[#542612] text-[#FFFFFF] px-6 sm:px-12 py-5 flex items-center justify-between  relative z-30">
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white hover:text-[#F7F0DF] transition-colors cursor-pointer flex items-center gap-2"
        >
          <Logo className="w-8 h-8 rounded-xl" />
          <span>We Communicate</span>
        </Link>

        <nav className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-sans tracking-wider text-[#F7F0DF]">
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors cursor-pointer font-medium"
          >
            About Us
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors cursor-pointer font-medium"
          >
            Explore
          </a>
          <button
            onClick={() => navigate('/login')}
            className="hover:text-white transition-colors cursor-pointer font-semibold"
          >
            Contact
          </button>
        </nav>
      </header>

      {/* Hero Section with Forest Green & Cream Contrast */}
      <section className="relative bg-[#542612] overflow-hidden">
  {/* Background Image */}
  <img
    src="OIP.webp"
    alt="Community background"
    className="absolute inset-0 w-full h-full object-cover z-0"
  />

  {/* Background Overlay */}
  <div className="absolute inset-0 z-0">
    <div className="absolute inset-0 bg-gradient-to-b from-[#542612]/100 via-[#542612]/0 to-[#542612]/0"></div>
  </div>

  {/* Hero Title Content */}
  <div className="relative z-10 max-w-5xl mx-auto text-center px-6 pt-16 sm:pt-24 pb-32 sm:pb-48">
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#FFFFFF] font-normal leading-tight tracking-tight max-w-4xl mx-auto drop-shadow-lg"
    >
      Residential Community <br />
      <span className="italic font-serif font-light text-[#F7F0DF]">
        Living & Harmony
      </span>
    </motion.h1>
  </div>
</section>


      {/* Overlapping Central Card */}
      <section className="relative z-20 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto -mt-24 sm:-mt-36 md:-mt-44 w-52 sm:w-68 md:w-80 bg-[#F5EFE1] p-2.5 rounded-2xl shadow-[0_25px_60px_-15px_rgba(27,67,45,0.3)] transition-transform duration-500 hover:scale-[1.02] border border-[#F7F0DF]/40"
        >
          <img
            src="https://www.bing.com/th/id/OIP.XavGX0F9ghDY4B3mJcKnwgHaJ4?w=193&h=257&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=ImgAns&rm=2"
            alt="Modern Residential Enclave"
            className="w-full h-64 sm:h-80 md:h-[400px] object-cover rounded-xl"
          />
        </motion.div>
      </section>

      {/* Light Cream Subtitle & Action Button Section */}
      <section className="bg-[#F7F0DF] text-center pt-10 sm:pt-14 pb-20 sm:pb-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-xl mx-auto space-y-8"
        >
          <p className="text-xs sm:text-sm md:text-base text-[#542612]/90 font-sans leading-relaxed tracking-wide font-normal max-w-md mx-auto">
            Discover We Communicate, where community notices, maintenance workflows, and neighborly living thrive together.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-3 pl-6 pr-1.5 py-1.5 bg-[#542612] hover:bg-[#542612] text-white font-sans text-xs sm:text-sm font-medium rounded-full shadow-md hover:shadow-xl transition-all duration-200 group cursor-pointer"
            >
              <span>Explore Portal</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-[#F7F0DF] text-[#542612] flex items-center justify-center rounded-full group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Residential Society Platform Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-[#542612]/15">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>We Communicate Society Platform</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#542612]">
            Everything your residential community needs.
          </h2>
          <p className="text-[#542612]/80 text-xs sm:text-sm leading-relaxed">
            Unifying digital notices, maintenance timeline tracking, festive event RSVP, and local resident businesses.
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-[#F5EFE1] p-6 rounded-2xl border border-[#542612]/15 hover:border-[#542612] transition-all duration-300 group hover:-translate-y-1 shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[#542612] flex items-center justify-center text-[#F7F0DF] mb-5 shadow-sm group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#542612] mb-2">{feat.title}</h3>
                <p className="text-xs text-[#542612]/80 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Portal Action Bar */}
        <div className="mt-16 bg-[#542612] text-stone-100 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl border border-[#F7F0DF]/20">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
              Ready to experience your residential community platform?
            </h3>
            <p className="text-xs sm:text-sm text-[#F7F0DF]/90 leading-relaxed">
              Sign in with resident credentials, block manager profile, or administrator panel.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-xl bg-[#F7F0DF] text-[#542612] hover:bg-[#F5EFE1] text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Platform
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 rounded-xl bg-[#542612] hover:bg-[#542612] text-[#FFFFFF] text-xs sm:text-sm font-bold transition-all border border-[#F7F0DF]/30"
              >
                Register Flat
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
