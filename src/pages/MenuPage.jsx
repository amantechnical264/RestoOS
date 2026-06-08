import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Flame, Activity, QrCode, ShoppingCart, Star, ChevronDown, Maximize2, ChefHat, Leaf, Zap, BellRing, Droplets, Receipt, X, Users, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import BottomNav from '../components/BottomNav';
import AIWaiter from '../components/AIWaiter';

const CATEGORY_TABS = [
  { key: 'All',      emoji: '🍽',  label: 'All' },
  { key: 'Starters', emoji: '🥗',  label: 'Starters' },
  { key: 'Mains',    emoji: '🍖',  label: 'Mains' },
  { key: 'Desserts', emoji: '🍮',  label: 'Desserts' },
  { key: 'Drinks',   emoji: '🥂',  label: 'Drinks' },
  { key: 'Vegan',    emoji: '🌿',  label: 'Vegan' },
];

const SPICE_LEVELS = {
  'Mild': '🌶️',
  'Medium': '🌶️🌶️',
  'Hot': '🌶️🌶️🌶️',
  'Extra Hot': '🌶️🌶️🌶️🌶️'
};

const BADGE_STYLES = {
  'Chef\'s Pick': { bg: 'bg-amber-900/80',    text: 'text-amber-300',   border: 'border-amber-700/50' },
  'Signature':    { bg: 'bg-purple-900/80',   text: 'text-purple-300',  border: 'border-purple-700/50' },
  'Popular':      { bg: 'bg-rose-900/80',     text: 'text-rose-300',    border: 'border-rose-700/50' },
  'Bestseller':   { bg: 'bg-amber-900/80',    text: 'text-amber-300',   border: 'border-amber-700/50' },
  'Trending':     { bg: 'bg-orange-900/80',   text: 'text-orange-300',  border: 'border-orange-700/50' },
  'Vegan':        { bg: 'bg-emerald-900/80',  text: 'text-emerald-300', border: 'border-emerald-700/50' },
  'Seasonal':     { bg: 'bg-sky-900/80',      text: 'text-sky-300',     border: 'border-sky-700/50' },
  'New':          { bg: 'bg-blue-900/80',     text: 'text-amber-300',    border: 'border-blue-700/50' },
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
      className="relative flex flex-col rounded-[1.75rem] overflow-hidden bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/5 shadow-xl group cursor-pointer"
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
        {dish.tags?.includes('sold_out') && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="font-display font-black text-white text-sm tracking-wider">SOLD OUT</span>
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
            {primaryBadge === 'Trending' && <Flame size={9} className="text-orange-400" />}
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
            className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/40 border border-neutral-200 dark:border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <Maximize2 size={14} className="text-neutral-900 dark:text-white" />
          </button>
        )}

        {/* Favorite */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(dish.id); }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 border border-neutral-200 dark:border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-red-500/30 transition-all"
        >
          <Heart size={13} className={isFav ? 'text-red-400 fill-red-400' : 'text-neutral-900 dark:text-white'} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col gap-2">
        <div>
          <h3 className="font-display font-bold text-[15px] text-neutral-900 dark:text-white leading-snug line-clamp-2">{dish.name}</h3>
          <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{dish.chef || 'Chef of the House'}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1 mt-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
            {dish.spiceLevel && SPICE_LEVELS[dish.spiceLevel] && (
              <span title={dish.spiceLevel}>{SPICE_LEVELS[dish.spiceLevel]}</span>
            )}
            {dish.serves && (
              <span className="flex items-center gap-0.5"><Users size={11} className="text-blue-400"/> {dish.serves}</span>
            )}
            {dish.prepTime && (
              <span className="flex items-center gap-0.5">⏱ {dish.prepTime}m</span>
            )}
          </div>
          <span className="font-display font-black text-base text-[#D4AF37]">${Number(dish.price).toFixed(2)}</span>
        </div>

        {/* Add to cart quick button */}
        <motion.button
          disabled={dish.tags?.includes('sold_out')}
          whileTap={dish.tags?.includes('sold_out') ? undefined : { scale: 0.94 }}
          onClick={e => { e.stopPropagation(); onAddToCart(dish); }}
          className={`mt-1 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            dish.tags?.includes('sold_out')
              ? 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
              : 'bg-white/5 border border-neutral-200 dark:border-white/8 text-neutral-600 dark:text-neutral-300 hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] hover:border-[#D4AF37]/30'
          }`}
        >
          <ShoppingCart size={12} /> {dish.tags?.includes('sold_out') ? 'Sold Out' : 'Add to Order'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function MenuPage() {
  const navigate = useNavigate();
  const { activeRestId, tableNumber, dishes, setActiveDishId, restaurants, favorites, toggleFavorite, addToCart, cart, setUser, planFor } = useAppContext();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [serviceHubOpen, setServiceHubOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dinerName, setDinerName] = useState('');
  const [dinerPhone, setDinerPhone] = useState('');

  // ── Subscription plan gate for this restaurant ──
  const PLANS = ['Starter', 'Pro', 'Enterprise'];
  const restaurantPlan = planFor ? planFor(activeRestId) : 'Starter';
  const hasEnterprise = PLANS.indexOf(restaurantPlan) >= PLANS.indexOf('Enterprise');

  const heroRef = useRef(null);
  const { scrollY } = useScroll({ container: heroRef });
  const heroParallax = useTransform(scrollY, [0, 300], [0, 80]);
  const heroOpacity  = useTransform(scrollY, [0, 250], [1, 0.5]);

  useEffect(() => {
    const profile = localStorage.getItem('3dish_diner_profile');
    if (!profile) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (dinerName && dinerPhone) {
      const guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      const profile = { guestId, name: dinerName, phone: dinerPhone, firstVisit: new Date().toISOString() };
      localStorage.setItem('3dish_diner_profile', JSON.stringify(profile));
      setUser(prev => ({ ...prev, name: dinerName, phone: dinerPhone, role: 'diner', guestId }));
      setShowOnboarding(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const dishId = entry.target.dataset.dishId;
        }
      });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.dish-card-analytics').forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [activeCategory, search, dishes]);

  const requestService = async (type) => {
    setServiceHubOpen(false);
    if (!supabase) return;
    try {
      await supabase.channel('service-requests').send({
        type: 'broadcast',
        event: 'waiter_call',
        payload: { tableNumber: tableNumber || '12', type, time: new Date().toISOString() }
      });
    } catch (e) {
      console.error('Failed to request service:', e);
    }
  };

  useEffect(() => {
    if (!activeRestId) navigate('/scanner', { replace: true });
  }, [activeRestId, navigate]);

  const restaurant = restaurants.find(r => r.id === activeRestId);
  const allDishes = dishes.filter(d => (d.restId === activeRestId || d.rest_id === activeRestId) && !d.tags?.includes('hidden'));

  const filteredDishes = allDishes.filter(d => {
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

  const cartCount = cart.length;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white dark:bg-[#0d0d10] text-neutral-900 dark:text-white font-sans">

      {/* ── HERO ── */}
      <div className="relative h-[52vw] max-h-80 min-h-52 overflow-hidden flex-shrink-0">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant?.cover})`, y: heroParallax, opacity: heroOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-5 pt-12 z-10">
          <button onClick={() => navigate('/scanner?rescan=true')}
            className="p-2.5 rounded-full bg-black/30 border border-neutral-200 dark:border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
            <QrCode size={18} className="text-neutral-900 dark:text-white/80" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate('/health')}
              className="p-2.5 rounded-full bg-black/30 border border-neutral-200 dark:border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
              <Activity size={18} className="text-neutral-900 dark:text-white/80" />
            </button>
            <button onClick={() => navigate('/cart')}
              className="relative p-2.5 rounded-full bg-black/30 border border-neutral-200 dark:border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
              <ShoppingCart size={18} className="text-neutral-900 dark:text-white/80" />
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
            className="font-display font-black text-4xl text-neutral-900 dark:text-white leading-tight tracking-tight mb-3">
            {restaurant?.name || 'Restaurant'}
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-neutral-200 dark:border-white/15 text-xs font-bold text-neutral-900 dark:text-white backdrop-blur-md">
              TABLE {tableNumber || '12'}
            </span>
            <span className="text-xs text-neutral-900 dark:text-white/50">{allDishes.length} dishes available</span>
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
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/8 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D4AF37]/40 transition-all"
                />
                <button onClick={() => { setSearch(''); setSearchOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 dark:text-white text-xs px-2">✕</button>
              </div>
            </motion.div>
          ) : (
            <motion.button key="search-closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/5 text-neutral-500 text-sm mb-3 hover:border-neutral-200 dark:border-white/10 transition-all">
              <Search size={15} />
              <span>Search dishes, ingredients...</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

        <div className="flex gap-2 px-5 mt-6 mb-2 overflow-x-auto no-scrollbar snap-x pb-4">
          {CATEGORY_TABS.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-sm transition-all ${
                activeCategory === cat.key 
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg shadow-black/10 dark:shadow-white/10' 
                  : 'bg-white dark:bg-[#0a0a0a] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-[#222228]'
              }`}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Offer Banner */}
        {new Date().getHours() >= 16 && new Date().getHours() <= 19 && (
          <div className="mx-5 mb-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-lg flex items-center gap-2"><Flame size={18}/> Happy Hour!</h3>
              <p className="text-sm text-white/90">20% off all drinks and starters</p>
            </div>
            <div className="bg-white text-orange-500 font-black px-3 py-1.5 rounded-lg text-sm">-20%</div>
          </div>
        )}

        {/* ── DISH GRID ── */}
        <div className="px-5 pb-32">
        <AnimatePresence mode="popLayout">
          {filteredDishes.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-neutral-600">
              <ChefHat size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-display font-bold text-lg">No dishes found</p>
              <p className="text-sm mt-1">Try a different category or search</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {filteredDishes.map((dish, i) => (
                <div key={dish.id} data-dish-id={dish.id} className="dish-card-analytics">
                  <DishCard 
                    dish={dish} index={i}
                    isFav={favorites.includes(dish.id)}
                    onToggleFav={() => toggleFavorite(dish.id)}
                    onAddToCart={(e) => { e.stopPropagation(); addToCart(dish); }}
                    onDishClick={() => navigate(`/dish/${dish.id}`)}
                    onARClick={hasEnterprise && (dish.modelUrl || dish.model_url) ? (e) => { e.stopPropagation(); navigate(`/dish/${dish.id}`); } : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
        </div>

        {/* ── UPCOMING EVENTS ── */}
        <div className="px-5 pb-32">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-black text-xl flex items-center gap-2"><CalendarIcon size={20} className="text-indigo-500" /> Upcoming Events</h2>
            <button className="text-xs font-bold text-indigo-500">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-4">
            <div className="shrink-0 w-[280px] snap-start bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex flex-col items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                 <span className="text-[10px] font-black uppercase tracking-widest">Oct</span>
                 <span className="text-xl font-black">28</span>
              </div>
              <h3 className="font-display font-black text-lg mb-1">Live Jazz Night</h3>
              <p className="text-sm text-neutral-500 mb-4 line-clamp-2">Enjoy live music with our special 3-course dinner menu. Perfect for date night!</p>
              <button className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-black text-sm rounded-xl hover:opacity-90 transition-opacity">
                RSVP Now
              </button>
            </div>
          </div>
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
              <button onClick={() => requestService('Water Refill')} className="flex items-center gap-3 bg-neutral-50 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-neutral-200 dark:border-white/10 px-4 py-2.5 rounded-2xl text-neutral-900 dark:text-white shadow-xl hover:bg-white/10">
                <span className="text-sm font-bold">Water</span>
                <Droplets size={16} className="text-blue-400" />
              </button>
              <button onClick={() => requestService('Bill')} className="flex items-center gap-3 bg-neutral-50 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-neutral-200 dark:border-white/10 px-4 py-2.5 rounded-2xl text-neutral-900 dark:text-white shadow-xl hover:bg-white/10">
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
              ? 'bg-neutral-50 dark:bg-[#0a0a0a] border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white' 
              : 'bg-gradient-to-tr from-[#D4AF37] to-amber-300 border-amber-300/50 text-black'
          }`}
        >
          {serviceHubOpen ? <X size={24} /> : <BellRing size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {showOnboarding && (
          // ... Onboarding logic ...
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#12141D] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-neutral-200 dark:border-white/10 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/20 blur-3xl rounded-full pointer-events-none" />
              <div className="text-center mb-6 relative z-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4AF37] to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
                  <ChefHat size={32} className="text-black" />
                </div>
                <h2 className="font-display font-black text-2xl text-neutral-900 dark:text-white">Welcome!</h2>
                <p className="text-sm text-neutral-500 mt-1">Please enter your details to view the menu and place orders.</p>
              </div>
              <form onSubmit={handleOnboardingSubmit} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Your Name</label>
                  <input required type="text" value={dinerName} onChange={e => setDinerName(e.target.value)} placeholder="e.g. John Doe"
                    className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input required type="tel" value={dinerPhone} onChange={e => setDinerPhone(e.target.value)} placeholder="e.g. 9876543210"
                    className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white" />
                </div>
                <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-[#D4AF37] text-black font-black text-base hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                  View Menu
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Waiter Component — Enterprise Plan only */}
      {hasEnterprise && <AIWaiter />}

      <BottomNav />
    </div>
  );
}
