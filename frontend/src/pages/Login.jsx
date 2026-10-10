import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/home');
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#F7F0DF] text-[#FFFFFF] font-sans">
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
              Welcome<br />Back,
            </h1>
            <p className="text-base text-[#F7F0DF] leading-relaxed max-w-sm">
              Enter your personal details and start your journey with us.
            </p>
          </div>
          <div className="relative z-10 h-1 w-20 rounded-full bg-[#F7F0DF] mt-8" />
        </div>

        {/* Login Form */}
        <div className="w-full flex items-center bg-[#542612] px-30 py-12 sm:px-12 lg:px-20">
          <div className="w-full max-w-xl">
          <div className="mb-10 space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FFFFFF] tracking-tight">
              Login
            </h2>
            <p className="text-sm text-[#F7F0DF]">
              Measure the performance of your society, stay connected!
            </p>
          </div>



          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#542612]/70 border border-[#542612] text-[#F7F0DF] text-xs text-center">
              {error}
            </div>
          )}

          {/* Quick Admin Auto-fill */}
          <div className="mb-6 flex items-center justify-between p-3 rounded-xl bg-[#F5EFE1]/10 border border-[#F5EFE1]/20 text-xs">
            <div>
              <span className="font-bold text-[#F7F0DF] block">System Admin Credentials</span>
              <span className="text-[11px] text-[#F7F0DF]/70">admin@gmail.com • 1234567890</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@gmail.com');
                setPassword('1234567890');
              }}
              className="px-3 py-1 rounded-lg bg-[#F7F0DF] text-[#542612] text-xs font-bold hover:bg-white transition-colors cursor-pointer"
            >
              Fill Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-semibold text-[#F7F0DF] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@website.com"
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-sm text-[#542612] placeholder-[#542612]/50 border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
              />
            </div>

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
                className="w-full px-4 py-3 rounded-xl bg-[#F5EFE1] text-sm text-[#542612] placeholder-[#542612]/50 border border-[#542612]/20 focus:outline-none focus:border-[#542612] transition-all font-sans"
              />
            </div>

            {/* Checkbox and Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#F7F0DF] hover:text-[#FFFFFF]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#F5EFE1] border-[#542612]/30 text-[#542612] focus:ring-0"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions sent to email!');
                }}
                className="text-[#F7F0DF] hover:text-[#FFFFFF] transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Main Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#F7F0DF] hover:bg-[#F5EFE1] text-[#542612] text-sm font-bold transition-all shadow-md mt-2 active:scale-[0.99] cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>



          {/* Registration Link */}
          <div className="mt-8 text-center text-xs text-[#F7F0DF]">
            Not registered yet?{' '}
            <Link to="/register" className="text-[#FFFFFF] font-bold hover:underline">
              Create an Account
            </Link>
          </div>
          </div>
        </div>
      </motion.div>
      </div>
  );
};

export default Login;
