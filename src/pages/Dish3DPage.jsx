import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Heart, ShoppingCart, Flame, Clock, MapPin, AlertTriangle, Star, ChefHat, Leaf, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const ALLERGEN_ICONS = { Gluten: '🌾', Nuts: '🥜', Dairy: '🥛', Eggs: '🥚', Shellfish: '🦐', Soy: '🫘', Fish: '🐟' };

export default function Dish3DPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeRestId, dishes, addToCart, favorites, toggleFavorite } = useAppContext();
  const [arTip, setArTip] = useState(true);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  useEffect(() => {
    if (!activeRestId) navigate('/scanner', { replace: true });
  }, [activeRestId, navigate]);

  useEffect(() => {
    if (!customElements.get('model-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
      document.head.appendChild(s);
    }
  }, []);

  const dish = dishes.find(d => d.id === id);
  const isFav = favorites.includes(id);

  if (!dish) return null;

  const modelUrl = dish.modelUrl || dish.model_url;
  const primaryBadge = dish.tags?.find(t => ['Chef\'s Pick', 'Signature', 'Popular', 'Bestseller', 'Seasonal', 'Vegan'].includes(t));
  const macroPercent = (val, max) => Math.min(100, Math.round((parseInt(val) || 0) / max * 100));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-[100dvh] relative overflow-hidden bg-[#0d0d10]">

      {/* ══════════════════════════════════════════════════════ */}
      {/* HERO — Full-bleed food photo                          */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="relative flex-shrink-0 h-[42vh] overflow-hidden bg-[#111115]">
        {dish.cover ? (
          <img src={dish.cover} alt={dish.name}
            className="w-full h-full object-cover" />
        ) : modelUrl ? (
          <div className="w-full h-full" dangerouslySetInnerHTML={{__html: `
            <model-viewer
              src="${modelUrl}"
              auto-rotate auto-rotate-delay="0" rotation-per-second="12deg"
              camera-controls camera-orbit="0deg 75deg 110%"
              shadow-intensity="1.5" environment-image="neutral" exposure="1.2"
              interaction-prompt="none"
              style="width:100%;height:100%;--poster-color:transparent;"
            ></model-viewer>
          `}} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={64} className="text-neutral-700" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0d0d10]" />

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-5 pt-12 z-20">
          {/* Back */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all">
            <ChevronLeft size={22} className="text-white" />
          </motion.button>

          {/* Favorite */}
          <motion.button whileTap={{ scale: 1.2 }} onClick={() => toggleFavorite(id)}
            className={`w-11 h-11 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all ${
              isFav ? 'bg-red-500/20 border-red-500/30' : 'bg-black/40 border-white/10'
            }`}>
            <Heart size={20} className={isFav ? 'text-red-400 fill-red-400' : 'text-white'} />
          </motion.button>
        </div>

        {/* Chef's Pick badge — top left of photo */}
        {primaryBadge && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="absolute top-16 left-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-900/85 border border-amber-600/40 backdrop-blur-md z-10">
            <Star size={10} className="text-amber-300 fill-amber-300" />
            <span className="text-[11px] font-black text-amber-300 tracking-wide">{primaryBadge}</span>
          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* DETAILS SHEET — slides up from bottom                 */}
      {/* ══════════════════════════════════════════════════════ */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 60 }}
        dragElastic={0.15}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="flex-1 overflow-y-auto no-scrollbar rounded-t-[2rem] bg-[#0d0d10] border-t border-white/8 z-30"
        style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mt-3 mb-5 cursor-grab active:cursor-grabbing" />

        <div className="px-5 pb-40">

          {/* ── Name + Price ── */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-4">
              <h1 className="font-display font-black text-[28px] text-white leading-tight tracking-tight">{dish.name}</h1>
            </div>
            <div className="shrink-0 mt-1">
              <span className="inline-block px-4 py-2 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 font-display font-black text-xl text-[#D4AF37]">
                ${Number(dish.price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Chef ── */}
          <div className="flex items-center gap-2 mb-4">
            <ChefHat size={14} className="text-[#D4AF37]" />
            <span className="text-sm font-semibold text-[#D4AF37]">{dish.chef || 'Chef of the House'}</span>
          </div>

          {/* ── Description ── */}
          <p className="text-sm text-neutral-300 leading-relaxed mb-5">{dish.description || 'A carefully crafted dish made with the finest seasonal ingredients.'}</p>

          {/* ── Stats Row: Calories + Prep Time ── */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1a1a1f] border border-white/6">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <Flame size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="font-display font-black text-2xl text-white leading-none">{dish.macros?.calories || '—'}</p>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Calories</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1a1a1f] border border-white/6">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Clock size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="font-display font-black text-2xl text-white leading-none">{dish.prepTime || '18'} <span className="text-base font-semibold text-neutral-400">min</span></p>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Prep Time</p>
              </div>
            </div>
          </div>

          {/* ── Provenance / Origin Story ── */}
          {(dish.origin || dish.provenance) && (
            <div className="mb-5 p-4 rounded-2xl bg-[#1a1a1f] border border-white/6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={13} className="text-[#D4AF37]" />
                <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">
                  {dish.origin || 'Sourced Fresh Daily'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{dish.provenance}</p>
            </div>
          )}

          {/* ── Macro Bars ── */}
          {(dish.macros?.protein || dish.macros?.carbs || dish.macros?.fat) && (
            <div className="mb-5 p-4 rounded-2xl bg-[#1a1a1f] border border-white/6">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-4">Nutrition</p>
              <div className="space-y-3.5">
                {[
                  { label: 'Protein',  value: parseInt(dish.macros?.protein), unit: 'g', max: 60,  color: '#3B82F6', icon: <Droplets size={13} className="text-blue-400" /> },
                  { label: 'Carbs',    value: parseInt(dish.macros?.carbs),   unit: 'g', max: 100, color: '#10B981', icon: <Leaf size={13} className="text-emerald-400" /> },
                  { label: 'Fat',      value: parseInt(dish.macros?.fat),     unit: 'g', max: 50,  color: '#D4AF37', icon: <span className="text-[11px] font-black text-[#D4AF37]">F</span> },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-3">
                    <div className="w-5 flex justify-center shrink-0">{m.icon}</div>
                    <span className="text-[11px] font-bold text-neutral-500 w-12 shrink-0">{m.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${macroPercent(m.value, m.max)}%` }}
                        transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: m.color }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-400 w-10 text-right shrink-0">{m.value || 0}{m.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Ingredients ── */}
          {dish.ingredients?.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-3">Ingredients</p>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map(ing => (
                  <span key={ing}
                    className="px-3 py-1.5 rounded-full bg-[#1a1a1f] border border-white/8 text-[12px] font-medium text-neutral-300">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Allergens ── */}
          {dish.allergens?.length > 0 && (
            <div className="mb-5 p-4 rounded-2xl bg-red-950/40 border border-red-900/40">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-red-400" />
                <span className="text-[11px] font-black text-red-400 uppercase tracking-[0.15em]">Allergens</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map(a => (
                  <span key={a} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-900/30 border border-red-800/40 text-[11px] font-semibold text-red-300">
                    {ALLERGEN_ICONS[a] || ''} {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Tags ── */}
          {dish.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {dish.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/8 text-[11px] font-bold text-neutral-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* STICKY BOTTOM ACTIONS                                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 z-40 px-5 pb-8 pt-12"
        style={{ background: 'linear-gradient(to top, #0d0d10 50%, transparent)' }}>

        {/* AR Button */}
        {modelUrl && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="mb-3 w-full py-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer border border-white/10 bg-white/5 backdrop-blur-md"
            dangerouslySetInnerHTML={{__html: `
              <model-viewer src="${modelUrl}" ar ar-modes="webxr scene-viewer quick-look" style="display:none;"></model-viewer>
              <button onclick="document.querySelectorAll('model-viewer').forEach(mv=>mv.activateAR())"
                style="width:100%;display:flex;align-items:center;justify-content:center;gap:12px;
                       background:transparent;border:none;color:white;font-family:Outfit,sans-serif;
                       font-size:15px;font-weight:900;letter-spacing:0.05em;cursor:pointer;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                VIEW IN AUGMENTED REALITY
              </button>
            `}}
          />
        )}

        {/* Add to Order CTA */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { addToCart(dish); navigate(-1); }}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-display font-black text-base text-black transition-all"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', boxShadow: '0 10px 40px rgba(212,175,55,0.35)' }}>
          <ShoppingCart size={19} />
          Add to Order — ${Number(dish.price).toFixed(2)}
        </motion.button>
      </div>
    </motion.div>
  );
}
