import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, User } from 'lucide-react';
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

  const handleQuickDemo = async (demoEmail, demoPass = 'password123') => {
    setLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoading(false);
    if (res.success) {
      navigate('/home');
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

          {/* Google Sign In Option Button */}
          <button
            type="button"
            onClick={() => handleQuickDemo('rahul@wecommunicate.com')}
            className="w-full py-3 px-4 rounded-xl border border-[#542612]/20 hover:border-[#542612] bg-[#F5EFE1] hover:bg-[#F7F0DF]/20 text-sm font-semibold text-[#542612] transition-all flex items-center justify-center gap-3 group mb-8"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-[#F7F0DF]/20 w-full" />
            <span className="bg-[#F7F0DF] px-3 text-[11px] text-[#542612] font-medium whitespace-nowrap">
              Or Sign in with Email
            </span>
            <div className="border-t border-[#F7F0DF]/20 w-full" />
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#542612]/70 border border-[#542612] text-[#F7F0DF] text-xs text-center">
              {error}
            </div>
          )}

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

          {/* Quick Admin Test-Drive Shortcuts */}
          <div className="mt-6 pt-4 border-t border-[#F7F0DF]/20">
            <div className="text-[10px] font-bold text-[#F7F0DF] uppercase tracking-wider mb-2 text-center">
              ⚡ Demo Auto Logins (Including Admin)
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@gmail.com', '1234567890')}
                className="py-1.5 px-1 rounded-lg bg-[#542612] border border-[#F7F0DF]/40 text-[#FFFFFF] text-[10px] font-bold hover:bg-[#542612] transition-all flex flex-col items-center gap-0.5"
              >
                <ShieldCheck className="w-3 h-3 text-[#F7F0DF]" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('manager@wecommunicate.com')}
                className="py-1.5 px-1 rounded-lg bg-[#F5EFE1] border border-[#542612]/20 text-[#542612] text-[10px] font-bold hover:bg-[#F7F0DF]/20 transition-all flex flex-col items-center gap-0.5"
              >
                <UserCheck className="w-3 h-3 text-[#542612]" />
                Block Mgr
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('rahul@wecommunicate.com')}
                className="py-1.5 px-1 rounded-lg bg-[#F5EFE1] border border-[#542612]/20 text-[#542612] text-[10px] font-bold hover:bg-[#F7F0DF]/20 transition-all flex flex-col items-center gap-0.5"
              >
                <User className="w-3 h-3 text-[#F7F0DF]" />
                Resident
              </button>
            </div>
          </div>

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
