import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Flame, Activity, QrCode, ShoppingCart, Star, ChevronDown, Maximize2, ChefHat, Leaf, Zap, BellRing, Droplets, Receipt, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import BottomNav from '../components/BottomNav';

const CATEGORY_TABS = [
  { key: 'All',      emoji: '🍽',  label: 'All' },
  { key: 'Starters', emoji: '🥗',  label: 'Starters' },
  { key: 'Mains',    emoji: '🍖',  label: 'Mains' },
  { key: 'Desserts', emoji: '🍮',  label: 'Desserts' },
  { key: 'Drinks',   emoji: '🥂',  label: 'Drinks' },
  { key: 'Vegan',    emoji: '🌿',  label: 'Vegan' },
];

const BADGE_STYLES = {
  'Chef\'s Pick': { bg: 'bg-amber-900/80',    text: 'text-amber-300',   border: 'border-amber-700/50' },
  'Signature':    { bg: 'bg-purple-900/80',   text: 'text-purple-300',  border: 'border-purple-700/50' },
  'Popular':      { bg: 'bg-rose-900/80',     text: 'text-rose-300',    border: 'border-rose-700/50' },
  'Bestseller':   { bg: 'bg-amber-900/80',    text: 'text-amber-300',   border: 'border-amber-700/50' },
  'Vegan':        { bg: 'bg-emerald-900/80',  text: 'text-emerald-300', border: 'border-emerald-700/50' },
  'Seasonal':     { bg: 'bg-sky-900/80',      text: 'text-sky-300',     border: 'border-sky-700/50' },
  'New':          { bg: 'bg-blue-900/80',     text: 'text-blue-300',    border: 'border-blue-700/50' },
};

const DishCard = ({ dish, index, onDishClick, onAddToCart, isFav, onToggleFav, onARClick }) => {
  const primaryBadge = dish.tags?.find(t => BADGE_STYLES[t]);
  const badgeStyle = primaryBadge ? BADGE_STYLES[primaryBadge] : null;
  const hasModel = !!(dish.modelUrl || dish.model_url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative flex flex-col rounded-[1.75rem] overflow-hidden bg-[#1a1a1f] border border-white/5 shadow-xl group cursor-pointer"
      onClick={() => onDishClick(dish.id)}
    >
      {/* Food Photo */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#111115]">
        {dish.cover ? (
          <img
            src={dish.cover}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-700">
            <ChefHat size={40} />
          </div>
        )}
        {/* Dark gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent" />

        {/* Badge — top left */}
        {badgeStyle && (
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md text-[10px] font-bold tracking-wider ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {primaryBadge === 'Vegan' && <Leaf size={9} />}
            {primaryBadge === 'Popular' && <Star size={9} className="fill-current" />}
            {primaryBadge === 'Seasonal' && <Zap size={9} />}
            {primaryBadge}
          </div>
        )}

        {/* Secondary badge row (Vegan if not primary) */}
        {primaryBadge !== 'Vegan' && dish.tags?.includes('Vegan') && (
          <div className="absolute top-3 left-3 mt-7 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-700/50 text-[9px] font-bold text-emerald-300 backdrop-blur-md">
            <Leaf size={8} /> VEG
          </div>
        )}

        {/* AR expand icon — top right */}
        {hasModel && (
          <button
            onClick={e => { e.stopPropagation(); onARClick(dish.id); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <Maximize2 size={14} className="text-white" />
          </button>
        )}

        {/* Favorite */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(dish.id); }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-red-500/30 transition-all"
        >
          <Heart size={13} className={isFav ? 'text-red-400 fill-red-400' : 'text-white'} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col gap-2">
        <div>
          <h3 className="font-display font-bold text-[15px] text-white leading-snug line-clamp-2">{dish.name}</h3>
          <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{dish.chef || 'Chef of the House'}</p>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <Flame size={11} className="text-orange-500" />
            <span>{dish.macros?.calories || '—'} cal</span>
          </div>
          <span className="font-display font-black text-base text-[#D4AF37]">${Number(dish.price).toFixed(2)}</span>
        </div>

        {/* Add to cart quick button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={e => { e.stopPropagation(); onAddToCart(dish); }}
          className="mt-1 w-full py-2 rounded-xl bg-white/5 border border-white/8 text-xs font-bold text-neutral-300 hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={12} /> Add to Order
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function MenuPage() {
  const navigate = useNavigate();
  const { activeRestId, dishes, setActiveDishId, restaurants, favorites, toggleFavorite, addToCart, cart } = useAppContext();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [serviceHubOpen, setServiceHubOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll({ container: heroRef });
  const heroParallax = useTransform(scrollY, [0, 300], [0, 80]);
  const heroOpacity  = useTransform(scrollY, [0, 250], [1, 0.5]);

  const requestService = async (type) => {
    setServiceHubOpen(false);
    if (!supabase) return;
    try {
      await supabase.channel('service-requests').send({
        type: 'broadcast',
        event: 'waiter_call',
        payload: { tableNumber: restaurant?.tableNumber || '12', type, time: new Date().toISOString() }
      });
      // Also show a local success notification (assuming showNotification is in context)
      // We will assume showNotification is available or we can just let it silently succeed since the vendor gets it.
    } catch (e) {
      console.error('Failed to request service:', e);
    }
  };

  useEffect(() => {
    if (!activeRestId) navigate('/scanner', { replace: true });
  }, [activeRestId, navigate]);

  const restaurant = restaurants.find(r => r.id === activeRestId);
  const allDishes = dishes.filter(d => d.restId === activeRestId || d.rest_id === activeRestId);

  const filtered = allDishes.filter(d => {
    const matchSearch = !search
      || d.name.toLowerCase().includes(search.toLowerCase())
      || d.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All'
      ? true
      : activeCategory === 'Vegan'
        ? d.tags?.includes('Vegan')
        : d.category === activeCategory || d.tags?.includes(activeCategory);
    return matchSearch && matchCat;
  });

  const handleDishClick = (id) => { setActiveDishId(id); navigate(`/dish/${id}`); };
  const handleARClick   = (id) => { setActiveDishId(id); navigate(`/dish/${id}`); };

  const cartCount = cart.length;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0d0d10] text-white font-sans">

      {/* ── HERO ── */}
      <div className="relative h-[52vw] max-h-80 min-h-52 overflow-hidden flex-shrink-0">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant?.cover})`, y: heroParallax, opacity: heroOpacity }}
        />
        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-5 pt-12 z-10">
          <button onClick={() => navigate('/scanner?rescan=true')}
            className="p-2.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
            <QrCode size={18} className="text-white/80" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate('/health')}
              className="p-2.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
              <Activity size={18} className="text-white/80" />
            </button>
            <button onClick={() => navigate('/cart')}
              className="relative p-2.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
              <ShoppingCart size={18} className="text-white/80" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-black text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="absolute bottom-5 left-5 right-5 z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-2">
            <Star size={10} className="text-[#D4AF37] fill-[#D4AF37]" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
              {restaurant?.cuisine || 'Signature Menu'} · {restaurant?.city || 'Est. 2024'}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="font-display font-black text-4xl text-white leading-tight tracking-tight mb-3">
            {restaurant?.name || 'Restaurant'}
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white backdrop-blur-md">
              TABLE {restaurant?.tableNumber || '12'}
            </span>
            <span className="text-xs text-white/50">{allDishes.length} dishes available</span>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AR Active
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── SEARCH (collapsible) ── */}
      <div className="px-4 mt-4 flex-shrink-0">
        <AnimatePresence>
          {searchOpen ? (
            <motion.div key="search-open" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  autoFocus
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search dishes, ingredients..."
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-[#1a1a1f] border border-white/8 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D4AF37]/40 transition-all"
                />
                <button onClick={() => { setSearch(''); setSearchOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs px-2">✕</button>
              </div>
            </motion.div>
          ) : (
            <motion.button key="search-closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1a1f] border border-white/5 text-neutral-500 text-sm mb-3 hover:border-white/10 transition-all">
              <Search size={15} />
              <span>Search dishes, ingredients...</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-1 flex-shrink-0">
        {CATEGORY_TABS.map(tab => (
          <motion.button key={tab.key} onClick={() => setActiveCategory(tab.key)}
            whileTap={{ scale: 0.93 }}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${
              activeCategory === tab.key
                ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]'
                : 'bg-white/4 border-white/6 text-neutral-400 hover:border-white/10 hover:text-white'
            }`}>
            <span className="text-base leading-none">{tab.emoji}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* ── DISH GRID ── */}
      <div className="flex-1 px-4 mt-5 pb-28">
        {/* Section header */}
        {activeCategory !== 'All' && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-white">{activeCategory}</h2>
            <span className="text-xs text-neutral-500">{filtered.length} items</span>
          </div>
        )}

        {/* Featured single (first bestseller) */}
        {activeCategory === 'All' && (() => {
          const featured = allDishes.find(d => d.tags?.includes('Bestseller') || d.tags?.includes("Chef's Pick"));
          if (!featured) return null;
          return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="relative rounded-[2rem] overflow-hidden mb-5 cursor-pointer group"
              onClick={() => handleDishClick(featured.id)}>
              {/* Full-width hero card */}
              <div className="relative h-56 overflow-hidden bg-[#111115]">
                {featured.cover && <img src={featured.cover} alt={featured.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-900/80 border border-amber-700/50 backdrop-blur-md">
                  <Star size={10} className="text-amber-300 fill-amber-300" />
                  <span className="text-[11px] font-black text-amber-300 tracking-wide">Chef's Pick</span>
                </div>
                <button onClick={e => { e.stopPropagation(); handleARClick(featured.id); }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all">
                  <Maximize2 size={15} className="text-white" />
                </button>
              </div>
              <div className="p-4 bg-[#1a1a1f] border border-white/5 border-t-0 rounded-b-[2rem]">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-display font-black text-xl text-white">{featured.name}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{featured.chef || 'Chef of the House'}</p>
                  </div>
                  <span className="font-display font-black text-xl text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xl border border-[#D4AF37]/20">
                    ${Number(featured.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2 mt-2">{featured.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Flame size={11} className="text-orange-500" />{featured.macros?.calories || '—'} cal</span>
                    {featured.prepTime && <span>⏱ {featured.prepTime} min</span>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); addToCart(featured); }}
                    className="px-4 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-black hover:bg-amber-400 transition-all">
                    + Add
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* 2-column grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-neutral-600">
              <ChefHat size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-display font-bold text-lg">No dishes found</p>
              <p className="text-sm mt-1">Try a different category or search</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered
                .filter(d => activeCategory !== 'All' || !(d.tags?.includes('Bestseller') || d.tags?.includes("Chef's Pick") || d.id === allDishes.find(x => x.tags?.includes('Bestseller') || x.tags?.includes("Chef's Pick"))?.id))
                .map((dish, index) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    index={index}
                    onDishClick={handleDishClick}
                    onAddToCart={addToCart}
                    isFav={favorites.includes(dish.id)}
                    onToggleFav={toggleFavorite}
                    onARClick={handleARClick}
                  />
                ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SERVICE HUB FAB ── */}
      <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end">
        <AnimatePresence>
          {serviceHubOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="flex flex-col gap-3 mb-4 items-end"
            >
              <button onClick={() => requestService('Water Refill')} className="flex items-center gap-3 bg-[#1a1a1f]/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl text-white shadow-xl hover:bg-white/10">
                <span className="text-sm font-bold">Water</span>
                <Droplets size={16} className="text-blue-400" />
              </button>
              <button onClick={() => requestService('Bill')} className="flex items-center gap-3 bg-[#1a1a1f]/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl text-white shadow-xl hover:bg-white/10">
                <span className="text-sm font-bold">Bill</span>
                <Receipt size={16} className="text-emerald-400" />
              </button>
              <button onClick={() => requestService('Waiter')} className="flex items-center gap-3 bg-[#D4AF37]/90 backdrop-blur-xl border border-[#D4AF37]/50 px-4 py-2.5 rounded-2xl text-black shadow-xl hover:bg-[#D4AF37]">
                <span className="text-sm font-bold">Call Waiter</span>
                <BellRing size={16} className="text-black" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setServiceHubOpen(!serviceHubOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border ${
            serviceHubOpen 
              ? 'bg-[#1a1a1f] border-white/10 text-white' 
              : 'bg-gradient-to-tr from-[#D4AF37] to-amber-300 border-amber-300/50 text-black'
          }`}
        >
          {serviceHubOpen ? <X size={24} /> : <BellRing size={24} />}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
