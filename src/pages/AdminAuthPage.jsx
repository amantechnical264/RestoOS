import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ChevronLeft, Loader2, AlertTriangle, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // The Honeypot State
  const [isHidden, setIsHidden] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  // If already logged in, they shouldn't need to do this unless their role is wrong.
  // Actually, we'll check role on the dashboard. But let's let them login first.

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 3) {
      setIsHidden(false);
      setClickCount(0); // reset
    }
    
    setTimeout(() => {
      setClickCount(0);
    }, 1500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send Magic Link
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin + '/hq-portal/dashboard',
        }
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send secure token.');
    } finally {
      setLoading(false);
    }
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
            Cryptographic Authentication Required.
          </p>
        </div>

        <div className="rounded-3xl p-7 shadow-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-xl">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm font-sans font-medium p-4 rounded-xl mb-5 bg-red-500/10 border border-red-500/20 text-red-400">
                ⚠ {error}
              </motion.div>
            )}

            {magicLinkSent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <p className="font-sans font-bold text-white mb-2">Transmission Sent</p>
                <p className="text-sm text-neutral-500 mb-5">
                  A secure access token has been dispatched to <span className="text-purple-400">{email}</span>.
                </p>
                <button
                  onClick={() => { setMagicLinkSent(false); setEmail(''); setError(''); }}
                  className="text-xs font-sans text-neutral-500 hover:text-neutral-300 transition-colors underline">
                  Initiate new request
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleLogin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6">
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Admin Identity (Email)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-neutral-500" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@system.local"
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-neutral-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm tracking-wider"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <motion.button type="submit" disabled={loading || !email}
                  whileHover={{ scale: (loading || !email) ? 1 : 1.02 }}
                  whileTap={{ scale: (loading || !email) ? 1 : 0.98 }}
                  className="w-full py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all bg-purple-600 hover:bg-purple-500 text-white font-bold">
                  {loading ? <Loader2 size={22} className="animate-spin" /> : 'Request Access Token'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
