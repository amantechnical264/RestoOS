import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // The Honeypot State
  // true = shows fake 404 page
  // false = shows the real admin login
  const [isHidden, setIsHidden] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  // Secret unlock mechanism: Triple-click the "404" text within a short timeframe
  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 3) {
      setIsHidden(false);
      setClickCount(0); // reset
    }
    
    // Reset clicks if they don't do it fast enough
    setTimeout(() => {
      setClickCount(0);
    }, 1500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Verify against the VITE_ADMIN_PIN env variable
    const adminPin = import.meta.env.VITE_ADMIN_PIN || '123456';
    
    setTimeout(() => {
      if (pin === adminPin) {
        // Industry Standard: Use sessionStorage for super-admin so it expires on tab close
        sessionStorage.setItem('3dish_sys_admin_token', 'secure_granted_session');
        navigate('/hq-portal/dashboard', { replace: true });
      } else {
        setError('Access Denied: Invalid Security Credential');
        setPin('');
      }
      setLoading(false);
    }, 800);
  };

  // -------------------------------------------------------------
  // FAKE 404 VIEW (HONEYPOT)
  // -------------------------------------------------------------
  if (isHidden) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#05020a] flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 text-neutral-300 dark:text-neutral-800">
          <AlertTriangle size={64} />
        </div>
        <h1 
          className="text-6xl font-black text-neutral-800 dark:text-neutral-700 mb-4 select-none cursor-default"
          onClick={handleSecretClick}
        >
          404
        </h1>
        <h2 className="text-xl font-bold text-neutral-600 dark:text-neutral-400 mb-2">Page Not Found</h2>
        <p className="text-neutral-500 max-w-sm mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button 
          onClick={() => navigate('/', { replace: true })}
          className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // REAL SECURE LOGIN VIEW
  // -------------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{ background: 'radial-gradient(ellipse at top, #110d1c 0%, #05020a 50%, #000000 100%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.15), transparent 70%)' }} />

      <button onClick={() => navigate('/', { replace: true })}
        className="absolute top-10 left-6 flex items-center gap-2 text-sm font-sans font-medium text-neutral-500 hover:text-purple-400 transition-colors">
        <ChevronLeft size={17} />
        Abort Access
      </button>

      <div className="w-full max-w-sm z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-purple-500/10 border border-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
              <Shield size={38} className="text-purple-500" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border border-purple-500/10 rounded-[2rem] border-dashed"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-purple-500/50" />
            <span className="text-[10px] font-sans font-semibold tracking-[0.35em] uppercase text-purple-400">
              Restricted Area
            </span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-purple-500/50" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-white mb-3">System Terminal</h1>
          <p className="text-neutral-500 text-sm font-sans">
            Enter secure credential sequence to establish connection.
          </p>
        </div>

        <form onSubmit={handleLogin}
          className="rounded-3xl p-7 shadow-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-xl">
          
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm font-sans font-medium p-4 rounded-xl mb-5 bg-red-500/10 border border-red-500/20 text-red-400">
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6">
            <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Access PIN</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-neutral-500" />
              </div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-neutral-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-xl tracking-widest text-center"
                required
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          <motion.button type="submit" disabled={loading || !pin}
            whileHover={{ scale: (loading || !pin) ? 1 : 1.02 }}
            whileTap={{ scale: (loading || !pin) ? 1 : 0.98 }}
            className="w-full py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all bg-purple-600 hover:bg-purple-500 text-white font-bold">
            {loading ? <Loader2 size={22} className="animate-spin" /> : 'Establish Connection'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
