import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const GOLD = '#D4AF37';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
];

export default function VendorOnboardingPage() {
  const navigate = useNavigate();
  const { restaurants, addRestaurant, setActiveRestId, supabaseUser, isInitializing, isDataLoaded } = useAppContext();
  
  const [name, setName] = useState('');
  const [selectedCover, setSelectedCover] = useState(DEFAULT_COVERS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Redirect logic: wait for BOTH auth AND data to be fully loaded ──
  useEffect(() => {
    if (isInitializing) return; // Still loading auth

    // If auth callback params in URL — wait for Supabase to process them
    const hasAuthParams = window.location.hash.includes('access_token') ||
      window.location.search.includes('code=');
    if (hasAuthParams && !supabaseUser) return;

    // Not logged in → send to auth
    if (!supabaseUser) {
      navigate('/vendor-auth', { replace: true });
      return;
    }

    // Wait for restaurant data to load before checking if we should skip onboarding
    // This prevents a false "no restaurant" check on first load
    if (!isDataLoaded) return;

    // User already has a restaurant → go straight to dashboard
    // Pick the one with the most dishes (oldest as tiebreaker) so we land on the right one
    const myRests = restaurants.filter(r =>
      r.vendor_id === supabaseUser.id || r.vendorId === supabaseUser.id
    );
    if (myRests.length > 0) {
      const best = [...myRests].sort((a, b) => {
        if (b.created_at < a.created_at) return -1; // older first as tiebreaker
        return 1;
      })[0];
      setActiveRestId(best.id);
      navigate('/vendor', { replace: true });
    }
  }, [restaurants, navigate, setActiveRestId, isInitializing, supabaseUser, isDataLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setErrorMsg('');

    // Always use a URL (never base64) — Postgres text columns can't efficiently store images
    const result = await addRestaurant({ name: name.trim(), cover: selectedCover });

    if (result && result.id) {
      setActiveRestId(result.id);
      navigate('/vendor', { replace: true });
    } else {
      setLoading(false);
      setErrorMsg(result?.error || 'Could not create restaurant. Please try again.');
    }
  };

  // Show a loading screen while auth/data is being resolved
  if (isInitializing || (supabaseUser && !isDataLoaded)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin" style={{ color: GOLD }} />
          <p className="text-neutral-400 text-sm">Setting up your account…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.2), transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10 p-8 rounded-[2.5rem] shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #111 0%, #050505 100%)',
          border: '1px solid rgba(212,175,55,0.15)',
        }}>

        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
          <Store size={32} style={{ color: GOLD }} />
        </div>

        <h1 className="text-3xl font-display font-black mb-2 text-white">Create Restaurant</h1>
        <p className="text-neutral-400 text-sm mb-8">Set up your digital presence to generate menus and QR codes instantly.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant name */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Restaurant Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Quantum Cafe"
              className="w-full bg-black border rounded-xl px-4 py-4 focus:outline-none transition-colors text-white"
              style={{ borderColor: 'rgba(212,175,55,0.2)' }}
              required
            />
          </div>

          {/* Cover image — pick from presets (no file upload to avoid base64 in DB) */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Cover Style</label>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_COVERS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedCover(url)}
                  className="relative rounded-xl overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: selectedCover === url ? GOLD : 'rgba(255,255,255,0.1)',
                    boxShadow: selectedCover === url ? `0 0 10px rgba(212,175,55,0.5)` : 'none',
                    aspectRatio: '1',
                  }}
                >
                  <img src={url} alt={`Cover ${i + 1}`} className="w-full h-full object-cover" />
                  {selectedCover === url && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(212,175,55,0.3)' }}>
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="w-full h-32 rounded-xl bg-cover bg-center border"
            style={{ backgroundImage: `url(${selectedCover})`, borderColor: 'rgba(212,175,55,0.2)' }} />

          {/* Error */}
          {errorMsg && (
            <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/30 rounded-xl px-4 py-3">{errorMsg}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 mt-4 text-black text-base"
            style={{ background: goldGradient, boxShadow: '0 4px 20px rgba(212,175,55,0.25)' }}
          >
            {loading
              ? <Loader2 className="animate-spin text-black" size={20} />
              : <><span>Launch Digital Portal</span><ArrowRight size={18} /></>
            }
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
