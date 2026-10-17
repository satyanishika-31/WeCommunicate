import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Store,
  Users,
  Wrench,
} from 'lucide-react';
import Logo from '../components/common/Logo';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Community updates',
      description: 'Keep every resident informed with one clear community feed.',
      icon: MessageSquare,
    },
    {
      title: 'Simple maintenance',
      description: 'Raise, track, and resolve everyday society requests with ease.',
      icon: Wrench,
    },
    {
      title: 'Events together',
      description: 'Discover celebrations, meetings, and activities around you.',
      icon: Calendar,
    },
    {
      title: 'Resident businesses',
      description: 'Find trusted services and talents within your own community.',
      icon: Store,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F6EFDE] text-[#542612] selection:bg-[#542612] selection:text-white">
      <section className="relative min-h-[620px] overflow-hidden bg-[#F6EFDE] sm:min-h-[720px]">
        <img
          src="/p1.png"
          alt="A welcoming residential community"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#4B3322]/75 via-[#31566c]/20 to-transparent" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-white">
            <Logo className="h-8 w-8 rounded-lg" />
            <span>We Communicate</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[11px] font-semibold text-white/90 sm:flex">
            <a href="#about" className="transition-colors hover:text-white">About us</a>
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#gallery" className="transition-colors hover:text-white">Community</a>
          </nav>
          <button
            onClick={() => navigate('/login')}
            className="rounded-full bg-[#F7F0DF] px-4 py-2 text-[11px] font-bold text-[#542612] shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Sign in
          </button>
        </header>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 pb-36 pt-16 sm:px-10 sm:pt-20 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl text-white"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
              <Users className="h-3 w-3" />
              Built for better neighbourhoods
            </span>
            <h1 className="max-w-lg font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              A stronger community,
              <span className="block italic text-[#F7F0DF]">together.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              One warm, simple space for notices, neighbours, maintenance, events, and everything that makes your community feel like home.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#542612] px-5 py-3 text-xs font-bold text-white shadow-xl transition-transform hover:-translate-y-0.5"
            >
              Join your community
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <main className="relative z-20 mx-auto -mt-20 max-w-7xl px-4 pb-20 sm:px-8">
        <section
          id="about"
          className="grid overflow-hidden rounded-[2rem] border border-[#542612]/10 bg-[#FBF7F0] shadow-[0_25px_70px_-35px_rgba(84,38,18,0.45)] lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="p-7 sm:p-12 lg:p-16">
            <div className="mb-8 flex items-center gap-2 rounded-full border border-[#542612]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#542612]/70">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted resident platform
            </div>
            <h2 className="max-w-lg font-serif text-3xl leading-tight sm:text-5xl">
              Communication without the confusion.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#542612]/70">
              Replace scattered messages and missed updates with a shared digital home designed around the way communities actually live.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/login')}
                className="rounded-full bg-[#2C211E] px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-[#542612]"
              >
                Explore the portal
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-[#542612]/20 px-5 py-3 text-xs font-bold"
              >
                See what&apos;s inside
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden lg:min-h-full">
            <img
              src="/building_facade.png"
              alt="Community building surrounded by greenery"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C211E]/45 to-transparent" />
            <div className="absolute bottom-6 left-6 rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-md">
              Made for everyday community life
            </div>
          </div>
        </section>

        <section id="gallery" className="py-20">
          <div className="relative min-h-[650px] overflow-hidden bg-[#2F2520] px-5 py-8 sm:min-h-[720px] sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute bottom-9 left-[12%] right-[12%] top-9 bg-[#3D2B1F]" />

            <div className="relative z-10 mx-auto min-h-[570px] max-w-5xl">
              <div className="absolute left-[4%] top-12 grid w-[52%] grid-cols-2 gap-2 sm:top-16 sm:gap-3">
                {[
                  ['/bg_image.png', 'Communication in action'],
                  ['/card_festive_celebrations.jpg', 'Celebrate together'],
                  ['/card_green_spaces.jpg', 'Shared green spaces'],
                  ['/card_serene_atmosphere.jpg', 'A calmer everyday'],
                  ['/building_facade.png', 'Community homes'],
                  ['/hero_apartment_garden.jpg', 'A place to belong'],
                ].map(([src, title]) => (
                  <motion.div
                    key={src}
                    whileHover={{ scale: 1.025 }}
                    className="group relative h-32 overflow-hidden bg-[#17418E] sm:h-40"
                  >
                    <img
                      src={src}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>
                ))}
              </div>

              <div className="absolute right-[3%] top-16 w-[38%] text-white sm:top-24">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EAA627]">
                  Community photo gallery
                </p>
                <p className="mt-5 max-w-xs text-xs leading-relaxed text-white/85 sm:text-sm">
                  Discover the people, places, and everyday moments that make life in our community feel connected.
                </p>
                <p className="mt-4 text-[10px] text-white/60">
                  Images from the We Communicate community
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-5 border border-white/75 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-[#0D2F78]"
                >
                  Explore more
                </button>
              </div>

              <div className="absolute bottom-20 right-0 z-20 w-[58%] bg-[#F6EFDE] px-6 py-6 shadow-2xl sm:bottom-12 sm:px-10 sm:py-8">
                <p className="font-serif text-3xl leading-[0.95] text-[#2F2520] sm:text-5xl">
                Community
                <span className="block text-[#3D2B1F]">in colour</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="rounded-[2rem] bg-[#3D2B1F] p-7 text-[#F7F0DF] sm:p-12">
          <div className="mb-10 max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EAA627]">Everything in one place</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Designed to make resident life easier.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <Icon className="mb-7 h-5 w-5 text-[#EAA627]" />
                <h3 className="font-serif text-lg">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#F7F0DF]/70">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-7">
            <p className="text-sm text-[#F7F0DF]/75">Ready to make your community feel more connected?</p>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 rounded-full bg-[#F7F0DF] px-5 py-3 text-xs font-bold text-[#542612]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
