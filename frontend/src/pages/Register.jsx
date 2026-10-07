import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { metaService } from '../api/services';
import Logo from '../components/common/Logo';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [community, setCommunity] = useState('Emerald Towers Enclave');
  const [password, setPassword] = useState('');
  const [residentType, setResidentType] = useState('OWNER');
  const [houseNumber, setHouseNumber] = useState('A-101');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [communitiesList, setCommunitiesList] = useState([
    'Emerald Towers Enclave',
    'Sapphire Heights Society',
    'Ruby Court Residency',
    'Diamond Crest Community',
    'Palm Groves Society',
    'Sunset Villa Enclave',
  ]);

  useEffect(() => {
    const fetchCommunities = async () => {
      const comms = await metaService.getCommunities();
      if (comms && comms.length > 0) {
        const names = comms.map((c) => c.name);
        setCommunitiesList(Array.from(new Set([...names, ...communitiesList])));
      }
    };
    fetchCommunities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register({
      name,
      email,
      phone,
      community,
      password,
      residentType,
      houseNumber,
      role: 'USER',
    });

    setLoading(false);
    if (res.success) {
      navigate('/home');
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#542612] text-[#FFFFFF] font-sans">
      <Link
        to="/"
        className="absolute top-6 left-6 sm:left-10 z-30 inline-flex items-center gap-2 text-sm font-bold text-[#FFFFFF] hover:text-[#F7F0DF] transition-colors"
      >
        <span aria-hidden="true">←</span>
        Back to landing
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 min-h-screen w-full grid grid-cols-1 md:grid-cols-[60%_40%] items-stretch"
      >
        {/* Brand introduction */}
        <div className="relative min-h-[38vh] md:min-h-screen flex flex-col justify-end p-8 sm:p-12 lg:p-16 overflow-hidden">
          <img
            src="hero_wood.jpg"
            alt="Dusk forest landscape"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#542612] via-[#542612]/55 to-[#542612]/25" />
          <div className="relative z-10 space-y-6 max-w-md">
            <Logo className="w-16 h-16 rounded-2xl" />
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#FFFFFF] font-serif">
              Join Our<br />Community,
            </h1>
            <p className="text-base text-[#F7F0DF] leading-relaxed max-w-sm">
              Select your society and connect with verified residents in your enclave.
            </p>
          </div>
          <div className="relative z-10 h-1 w-20 rounded-full bg-[#F7F0DF] mt-8" />
        </div>

        {/* Registration Form */}
        <div className="w-full flex items-center bg-[#542612] px-7 py-12 sm:px-12 lg:px-20">
          <div className="w-full max-w-xl">
          <div className="mb-10 space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FFFFFF] tracking-tight">
              Register
            </h2>
            <p className="text-sm text-[#F7F0DF]">
              Create your resident profile & link your community
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#542612]/70 border border-[#542612] text-[#F7F0DF] text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] placeholder-[#542612]/50 border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@website.com"
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] placeholder-[#542612]/50 border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
              />
            </div>

            {/* COMMUNITY SELECTION DROPDOWN */}
            <div>
              <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Select Community / Society</span>
                <Building2 className="w-3.5 h-3.5 text-[#F7F0DF]" />
              </label>
              <select
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
              >
                {communitiesList.map((comm) => (
                  <option key={comm} value={comm} className="bg-[#F5EFE1] text-[#542612]">
                    {comm}
                  </option>
                ))}
              </select>
            </div>

            {/* Flat Number & Resident Type Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                  Flat Number
                </label>
                <input
                  type="text"
                  required
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="e.g. A-101"
                  className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] placeholder-[#542612]/50 border border-[#542612]/20 focus:outline-none focus:border-[#542612] font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                  Resident Type
                </label>
                <select
                  value={residentType}
                  onChange={(e) => setResidentType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] border border-[#542612]/20 focus:outline-none focus:border-[#542612] font-sans"
                >
                  <option value="OWNER" className="bg-[#F5EFE1] text-[#542612]">Owner</option>
                  <option value="TENANT" className="bg-[#F5EFE1] text-[#542612]">Tenant</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 character"
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] placeholder-[#542612]/50 border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
              />
            </div>

            {/* Main Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F7F0DF] hover:bg-[#F5EFE1] text-[#542612] text-xs sm:text-sm font-bold transition-all shadow-md mt-2 active:scale-[0.99] cursor-pointer"
            >
              {loading ? 'Creating Profile...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center text-xs text-[#F7F0DF]">
            Already registered?{' '}
            <Link to="/login" className="text-[#FFFFFF] font-bold hover:underline">
              Sign In Here
            </Link>
          </div>
          </div>
        </div>
      </motion.div>
      </div>
  );
};

export default Register;
