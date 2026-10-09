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
  const [community, setCommunity] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [residentType, setResidentType] = useState('OWNER');
  const [houseNumber, setHouseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [rawCommunities, setRawCommunities] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [availableFlats, setAvailableFlats] = useState([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const comms = await metaService.getCommunities();
        if (comms && comms.length > 0) {
          setRawCommunities(comms);
          setCommunity(comms[0].name);
          updateBlocksAndFlats(comms[0]);
        }
      } catch (err) {
        console.error('Failed to load communities:', err);
      }
    };
    fetchCommunities();
  }, []);

  const updateBlocksAndFlats = (commObj) => {
    if (!commObj) return;
    const blocks = commObj.blocksList && commObj.blocksList.length > 0
      ? commObj.blocksList
      : ['Block A', 'Block B', 'Block C'];
    setAvailableBlocks(blocks);
    setSelectedBlock(blocks[0] || '');

    const flats = commObj.flatsList && commObj.flatsList.length > 0
      ? commObj.flatsList
      : ['101', '102', '103', '201', '202', '203'];
    setAvailableFlats(flats);
    setHouseNumber(flats[0] ? `${blocks[0] ? blocks[0] + '-' : ''}${flats[0]}` : '101');
  };

  const handleCommunityChange = (selectedName) => {
    setCommunity(selectedName);
    const commObj = rawCommunities.find((c) => c.name === selectedName);
    if (commObj) {
      updateBlocksAndFlats(commObj);
    }
  };

  const handleBlockChange = (blockVal) => {
    setSelectedBlock(blockVal);
    // Suggest houseNumber with prefix
    const baseFlat = availableFlats[0] || '101';
    setHouseNumber(`${blockVal ? blockVal + '-' : ''}${baseFlat}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setLoading(true);

    const res = await register({
      name,
      email,
      phone: phone.trim(),
      community,
      password,
      residentType,
      houseNumber: houseNumber.trim(),
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

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
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
                onChange={(e) => handleCommunityChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
              >
                {rawCommunities.map((comm) => (
                  <option key={comm._id || comm.name} value={comm.name} className="bg-[#F5EFE1] text-[#542612]">
                    {comm.name} ({comm.totalBlocks || comm.blocksList?.length || 0} Blocks)
                  </option>
                ))}
              </select>
            </div>

            {/* Block & Flat Selection Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                  Block / Tower
                </label>
                {availableBlocks.length > 0 ? (
                  <select
                    value={selectedBlock}
                    onChange={(e) => handleBlockChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
                  >
                    {availableBlocks.map((blk) => (
                      <option key={blk} value={blk} className="bg-[#F5EFE1] text-[#542612]">
                        {blk}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedBlock}
                    onChange={(e) => handleBlockChange(e.target.value)}
                    placeholder="e.g. Block A"
                    className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] border border-[#542612]/20 focus:outline-none focus:border-[#542612] font-sans"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                  Flat Number
                </label>
                {availableFlats.length > 0 ? (
                  <select
                    value={houseNumber.replace(`${selectedBlock}-`, '')}
                    onChange={(e) => setHouseNumber(`${selectedBlock ? selectedBlock + '-' : ''}${e.target.value}`)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
                  >
                    {availableFlats.map((flt) => (
                      <option key={flt} value={flt} className="bg-[#F5EFE1] text-[#542612]">
                        {flt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. A-101"
                    className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] placeholder-[#542612]/50 border border-[#542612]/20 focus:outline-none focus:border-[#542612] font-sans"
                  />
                )}
              </div>
            </div>

            {/* Resident Type */}
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
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-xs sm:text-sm text-[#542612] placeholder-[#542612]/50 border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
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
