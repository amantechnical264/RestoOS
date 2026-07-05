import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Camera, ArrowRight, Loader2, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const GOLD = '#D4AF37';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

export default function VendorOnboardingPage() {
  const navigate = useNavigate();
  const { user, restaurants, addRestaurant, setActiveRestId, supabaseUser, isInitializing } = useAppContext();
  
  const [name, setName] = useState('');
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isInitializing) return;

    // If there's an OAuth code/token in the URL, Supabase is still exchanging it —
    // don't redirect yet, wait for onAuthStateChange to fire with the session
    const hasAuthParams = window.location.hash.includes('access_token') ||
      window.location.hash.includes('error') ||
      window.location.search.includes('code=') ||
      window.location.search.includes('error=');
    
    if (hasAuthParams && !supabaseUser) {
      // Still processing the auth callback — don't redirect yet
      return;
    }
    
    if (!supabaseUser) {
      navigate('/vendor-auth', { replace: true });
      return;
    }

    // Check if user already has a restaurant — use supabaseUser.id as the authoritative ID
    if (supabaseUser && restaurants && restaurants.length > 0) {
      const existing = restaurants.find(r => 
        r.vendor_id === supabaseUser.id || r.vendorId === supabaseUser.id
      );
      if (existing) {
        setActiveRestId(existing.id);
        navigate('/vendor', { replace: true });
      }
    }
  }, [user, restaurants, navigate, setActiveRestId, isInitializing, supabaseUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCover(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    // Use a default cover if they didn't upload one
    const finalCover = cover || 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80';
    
    const newId = await addRestaurant({ name, cover: finalCover });
    
    if (newId) {
      setActiveRestId(newId);
      navigate('/vendor');
    } else {
      setLoading(false);
      alert("Failed to create restaurant. Please check your Supabase connection.");
    }
  };

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
          
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Cover Image (Optional)</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full bg-black border rounded-xl px-4 py-3 focus:outline-none transition-colors text-sm text-neutral-300
                  file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold 
                  file:text-black hover:file:opacity-90"
                style={{ 
                  borderColor: 'rgba(212,175,55,0.2)',
                }}
              />
              <style>{`
                input[type=file]::file-selector-button {
                  background: ${goldGradient};
                }
              `}</style>
            </div>
          </div>
          
          {preview && (
            <div className="w-full h-32 rounded-xl bg-cover bg-center border mt-2 opacity-90 shadow-inner" 
              style={{ backgroundImage: `url(${preview})`, borderColor: 'rgba(212,175,55,0.2)' }}></div>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 mt-4 text-black text-base shadow-gold"
            style={{ background: goldGradient, boxShadow: '0 4px 20px rgba(212,175,55,0.25)' }}
          >
            {loading ? <Loader2 className="animate-spin text-black" size={20} /> : (
              <>Launch Digital Portal <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
