import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Crown, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

export default function VendorAuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authMode, setAuthMode] = useState('google'); // 'google' | 'email'

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/vendor-onboard' }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Failed to connect to Google.');
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // After clicking the email link, land on vendor onboarding
          emailRedirectTo: window.location.origin + '/vendor-onboard',
          shouldCreateUser: true,
        }
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send magic link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{ background: 'radial-gradient(ellipse at top, #12100a 0%, #0B0C10 50%, #050508 100%)' }}
    >
      {/* Ambient gold orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none opacity-8"
        style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.12), transparent 70%)' }} />

      {/* Back button */}
      <button onClick={() => navigate('/')}
        className="absolute top-10 left-6 flex items-center gap-2 text-sm font-sans font-medium transition-colors"
        style={{ color: '#6B7280' }}
        onMouseEnter={e => e.target.style.color = '#D4AF37'}
        onMouseLeave={e => e.target.style.color = '#6B7280'}>
        <ChevronLeft size={17} />
        Back
      </button>

      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-10 text-center">
          {/* Gold crest icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
                border: '1px solid rgba(212,175,55,0.3)',
                boxShadow: '0 0 50px rgba(212,175,55,0.15)'
              }}>
              <Crown size={38} style={{ color: '#D4AF37' }} />
            </div>
            {/* Subtle ring pulse */}
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 rounded-3xl"
              style={{ border: '1px solid rgba(212,175,55,0.2)' }} />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5))' }} />
            <span className="text-[10px] font-sans font-semibold tracking-[0.35em] uppercase" style={{ color: '#D4AF37' }}>
              Exclusive Access
            </span>
            <div className="w-8 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.5))' }} />
          </div>

          <h1 className="text-3xl font-serif font-bold text-pearl mb-3">Partner Portal</h1>
          <p className="text-neutral-600 text-sm font-sans leading-relaxed px-2 max-w-xs">
            Manage your digital 3D menu, monitor live orders, and grow your elite dining experience.
          </p>
        </div>

        {/* Auth card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-3xl p-7 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm font-sans font-medium p-4 rounded-xl mb-5"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
                ⚠ {error}
              </motion.div>
            )}

            {magicLinkSent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <CheckCircle2 size={32} style={{ color: '#D4AF37' }} />
                </div>
                <p className="font-sans font-bold text-white mb-2">Check your inbox!</p>
                <p className="text-sm text-neutral-500 mb-5">
                  We sent a magic link to <span style={{ color: '#D4AF37' }}>{email}</span>. Click it to access your dashboard.
                </p>
                <button
                  onClick={() => { setMagicLinkSent(false); setEmail(''); setError(''); }}
                  className="text-xs font-sans text-neutral-500 hover:text-neutral-300 transition-colors underline">
                  Use a different email
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-sans text-neutral-600 mb-5 text-center">Sign in to continue to your dashboard</p>

                {/* Google OAuth */}
                <motion.button type="button" onClick={handleGoogleLogin} disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full font-sans font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-60 transition-all mb-4"
                  style={{ background: '#FFFFFF', color: '#111' }}>
                  {loading && authMode === 'google' ? (
                    <Loader2 size={22} className="animate-spin text-neutral-600" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-[10px] font-sans text-neutral-600 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Email Magic Link */}
                <form onSubmit={handleMagicLink} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@restaurant.com"
                    required
                    className="w-full font-sans text-sm py-3.5 px-4 rounded-2xl outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                    }}
                    onFocus={e => e.target.style.border = '1px solid rgba(212,175,55,0.4)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                  <motion.button type="submit" disabled={loading || !email.trim()}
                    whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-sans font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)', color: '#000' }}>
                    {loading && authMode === 'email' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <><Mail size={16} /> Send Magic Link</>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs font-sans mt-7" style={{ color: '#374151' }}>
          🔒 Secured by Supabase · Restaurant partners only
        </p>
      </div>
    </motion.div>
  );
}

