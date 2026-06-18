import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Flame, Activity, QrCode, ShoppingCart, Star, ChevronDown, Maximize2, ChefHat, Leaf, Zap, BellRing, Droplets, Receipt, X, Users, Calendar as CalendarIcon, BookOpen, Minus, Plus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import BottomNav from '../components/BottomNav';
import AIWaiter from '../components/AIWaiter';
import { MenuPageSkeleton } from '../components/Skeleton';

// ─── Optimized Image with shimmer → fade-in ──────────────────────────────────
const OptimizedImage = ({ src, alt, className = '', eager = false, sizes }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  // Check if image is already cached (complete before onload fires)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center text-neutral-400 dark:text-neutral-600 ${className}`}>
        <ChefHat size={32} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shimmer skeleton — visible until image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-shimmer">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent shimmer-wave" />
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        fetchpriority={eager ? 'high' : 'auto'}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className.includes('group-hover') ? 'group-hover:scale-105 transition-transform duration-700' : ''}`}
      />
    </div>
  );
};

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

// ─── Blinkit-Style Add / Stepper Button ──────────────────────────────────────
const BlinkitAddButton = ({ qty, onAdd, onRemove, isSoldOut, variant = 'overlay' }) => {
  if (isSoldOut) {
    return (
      <div className={`${
        variant === 'overlay'
          ? 'w-24 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-xl text-xs font-bold text-center uppercase tracking-wider cursor-not-allowed'
          : 'w-full py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 rounded-xl text-xs font-bold text-center uppercase cursor-not-allowed'
      }`}>
        Sold Out
      </div>
    );
  }

  if (qty === 0) {
    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onAdd}
        className={`${
          variant === 'overlay'
            ? 'w-24 py-2 bg-white dark:bg-[#12141D] text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-xl shadow-lg border border-neutral-200 dark:border-white/10 hover:border-emerald-500/30 transition-all uppercase tracking-wider flex items-center justify-center gap-1'
            : 'w-full py-2 bg-white/5 border border-neutral-200 dark:border-white/8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider'
        }`}
      >
        <span>Add</span>
        <span className="text-sm font-light">+</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`${
        variant === 'overlay'
          ? 'w-24 flex items-center justify-between bg-emerald-600 rounded-xl shadow-lg overflow-hidden'
          : 'w-full flex items-center justify-between bg-emerald-600 rounded-xl overflow-hidden'
      }`}
    >
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onRemove}
        className="flex-1 py-2 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors active:bg-emerald-800"
      >
        <Minus size={14} strokeWidth={3} />
      </motion.button>
      <motion.span
        key={qty}
        initial={{ scale: 1.3, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex-1 text-center text-white font-extrabold text-sm tabular-nums select-none"
      >
        {qty}
      </motion.span>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onAdd}
        className="flex-1 py-2 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors active:bg-emerald-800"
      >
        <Plus size={14} strokeWidth={3} />
      </motion.button>
    </motion.div>
  );
};

const DishCard = React.memo(({ dish, index, onDishClick, onAddToCart, isFav, onToggleFav, onARClick, qty, onAdd, onRemove }) => {
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
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-[#111115]">
        <OptimizedImage
          src={dish.cover || dish.images?.[0]}
          alt={dish.name}
          eager={index < 4}
          className="w-full h-full group-hover:scale-105"
        />
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
          <span className="font-display font-black text-base text-[#D4AF37]">₹{Number(dish.price).toFixed(2)}</span>
        </div>

        {/* Blinkit-style Add / Stepper button */}
        <div className="mt-1" onClick={e => e.stopPropagation()}>
          <BlinkitAddButton
            qty={qty}
            onAdd={onAdd}
            onRemove={onRemove}
            isSoldOut={dish.tags?.includes('sold_out')}
            variant="inline"
          />
        </div>
      </div>
    </motion.div>
  );
});

const ZomatoDishRow = React.memo(({ dish, isFav, onToggleFav, onAddToCart, onDishClick, onARClick, qty, onAdd, onRemove }) => {
  const hasModel = !!(dish.modelUrl || dish.model_url);
  const primaryBadge = dish.tags?.find(t => BADGE_STYLES[t]);
  const badgeStyle = primaryBadge ? BADGE_STYLES[primaryBadge] : null;

  const isVeg = dish.dietaryPreference === 'Vegetarian' 
    || dish.dietaryPreference === 'Vegan' 
    || dish.tags?.includes('Vegetarian') 
    || dish.tags?.includes('Vegan') 
    || dish.tags?.includes('vegan')
    || dish.tags?.includes('vegetarian');

  return (
    <div className="flex justify-between items-start gap-4 cursor-pointer group" onClick={onDishClick}>
      {/* Left Details Panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-left">
        {/* Veg / Non-veg Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
          {badgeStyle && (
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              {primaryBadge}
            </span>
          )}
        </div>

        {/* Dish Name */}
        <h3 className="font-display font-bold text-base text-neutral-900 dark:text-white leading-snug group-hover:text-[#D4AF37] transition-colors">
          {dish.name}
        </h3>

        {/* Price */}
        <div className="font-display font-black text-base text-[#D4AF37] mt-0.5">
          ₹{Number(dish.price).toFixed(2)}
        </div>

        {/* Chef / Prep Details */}
        <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-sans">
          {dish.prepTime && <span>⏱ {dish.prepTime}m</span>}
          {dish.serves && <span className="flex items-center gap-0.5"><Users size={11}/> {dish.serves}</span>}
        </div>

        {/* Description */}
        {dish.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed line-clamp-2">
            {dish.description}
          </p>
        )}

        {/* Action icons (Bookmark/AR) */}
        <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={onToggleFav}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              isFav 
                ? 'bg-red-500/10 border-red-500/25 text-red-500' 
                : 'bg-white dark:bg-[#0d0d10] border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'
            }`}
          >
            <Heart size={12} className={isFav ? 'fill-current' : ''} />
            <span>{isFav ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
          
          {hasModel && (
            <button
              onClick={onARClick}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white dark:bg-[#0d0d10] border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 text-[11px] font-bold transition-all"
            >
              <Maximize2 size={12} className="text-indigo-400" />
              <span>View in AR</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Image / Add Button Panel */}
      <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#111115] border border-neutral-200 dark:border-white/10 shadow-sm">
          <OptimizedImage
            src={dish.cover || dish.images?.[0]}
            alt={dish.name}
            eager={true}
            className="w-full h-full"
          />
          
          {dish.tags?.includes('sold_out') && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl z-10">
              <span className="font-display font-black text-white text-[10px] tracking-wider uppercase">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Blinkit-style Add / Stepper Button Overlay */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 w-24">
          <BlinkitAddButton
            qty={qty}
            onAdd={onAdd}
            onRemove={onRemove}
            isSoldOut={dish.tags?.includes('sold_out')}
            variant="overlay"
          />
        </div>
      </div>
    </div>
  );
});

export default function MenuPage() {
  const navigate = useNavigate();
  const { activeRestId, tableNumber, dishes, setActiveDishId, restaurants, favorites, toggleFavorite, addToCart, removeOneFromCart, cart, setUser, planFor, updateDish, showNotification, isDataLoaded } = useAppContext();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [serviceHubOpen, setServiceHubOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dinerName, setDinerName] = useState('');
  const [dinerPhone, setDinerPhone] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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
      // Normalize service type to avoid any ambiguity
      let resolvedType = type;
      if (type === 'Waiter') resolvedType = 'Call Waiter';
      if (type === 'Bill') resolvedType = 'Request Bill';
      
      await supabase.channel('service-requests').send({
        type: 'broadcast',
        event: 'waiter_call',
        payload: { tableNumber: tableNumber || '12', type: resolvedType, time: new Date().toISOString() }
      });
    } catch (e) {
      console.error('Failed to request service:', e);
    }
  };

  useEffect(() => {
    if (!activeRestId) navigate('/scanner', { replace: true });
  }, [activeRestId, navigate]);

  const restaurant = restaurants.find(r => r.id === activeRestId);
  const allDishes = dishes.filter(d => (d.restId === activeRestId || d.rest_id === activeRestId) && !d.tags?.includes('hidden') && !d.tags?.includes('event') && !d.tags?.includes('_categories_metadata'));
  const events = dishes.filter(d => (d.restId === activeRestId || d.rest_id === activeRestId) && !d.tags?.includes('hidden') && d.tags?.includes('event'));

  const metadataRecord = dishes.find(d => d.tags?.includes('_categories_metadata') && (d.restId === activeRestId || d.rest_id === activeRestId));
  const customCategories = metadataRecord?.macros?.categories || ['Starters', 'Mains', 'Desserts', 'Drinks', 'Vegan'];

  const EMOJI_MAP = {
    'All': '🍽',
    'Starters': '🥗',
    'Mains': '🍖',
    'Desserts': '🍮',
    'Drinks': '🥂',
    'Vegan': '🌿',
    'Vegetarian': '🥗',
    'Salads': '🥗',
    'Beverages': '🍹',
    'Appetizers': '🍟'
  };

  const dynamicCategoryTabs = [
    { key: 'All', emoji: '🍽', label: 'All' },
    ...customCategories.map(cat => ({
      key: cat,
      emoji: EMOJI_MAP[cat] || '🍽',
      label: cat
    }))
  ];

  const categoriesToRender = activeCategory === 'All'
    ? customCategories
    : customCategories.filter(cat => cat === activeCategory);

  // Memoized: only recomputes when filters/data actually change (not on unrelated re-renders)
  const categoriesWithDishes = useMemo(() => {
    const result = categoriesToRender.map(cat => {
      const catDishes = allDishes.filter(d => {
        const matchSearch = !search
          || d.name.toLowerCase().includes(search.toLowerCase())
          || d.description?.toLowerCase().includes(search.toLowerCase());
        
        const matchCat = cat === 'Vegan'
          ? d.tags?.includes('Vegan') || d.dietaryPreference === 'Vegan'
          : d.category === cat || d.tags?.includes(cat);
          
        const isVeg = d.dietaryPreference === 'Vegetarian' 
          || d.dietaryPreference === 'Vegan' 
          || d.tags?.includes('Vegetarian') 
          || d.tags?.includes('Vegan') 
          || d.tags?.includes('vegan')
          || d.tags?.includes('vegetarian');
          
        const matchVeg = vegOnly ? isVeg : true;
        return matchSearch && matchCat && matchVeg;
      });

      const orderArray = metadataRecord?.macros?.categoryOrders?.[cat] || [];
      if (orderArray.length > 0) {
        catDishes.sort((a, b) => {
          const idxA = orderArray.indexOf(a.id);
          const idxB = orderArray.indexOf(b.id);
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      }

      return {
        category: cat,
        dishes: catDishes
      };
    }).filter(c => c.dishes.length > 0);

    // Add uncategorized if activeCategory is 'All'
    if (activeCategory === 'All') {
      const uncategorizedDishes = allDishes.filter(d => {
        const hasCategory = customCategories.some(cat => d.category === cat || d.tags?.includes(cat));
        if (hasCategory) return false;
        
        const matchSearch = !search
          || d.name.toLowerCase().includes(search.toLowerCase())
          || d.description?.toLowerCase().includes(search.toLowerCase());
        
        const isVeg = d.dietaryPreference === 'Vegetarian' 
          || d.dietaryPreference === 'Vegan' 
          || d.tags?.includes('Vegetarian') 
          || d.tags?.includes('Vegan') 
          || d.tags?.includes('vegan')
          || d.tags?.includes('vegetarian');
          
        const matchVeg = vegOnly ? isVeg : true;
        return matchSearch && matchVeg;
      });

      if (uncategorizedDishes.length > 0) {
        result.push({
          category: 'Others',
          dishes: uncategorizedDishes
        });
      }
    }
    return result;
  }, [allDishes, activeCategory, search, vegOnly, customCategories, categoriesToRender, metadataRecord]);

  const totalItemsCount = categoriesWithDishes.reduce((acc, catGroup) => acc + catGroup.dishes.length, 0);
  const cartCount = cart.length;

  if (!isDataLoaded) return <MenuPageSkeleton />;

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
          {dynamicCategoryTabs.map((cat) => (
            <button key={cat.key} onClick={() => {
              setActiveCategory(cat.key);
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
              className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-sm transition-all ${
                activeCategory === cat.key 
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg shadow-black/10 dark:shadow-white/10' 
                  : 'bg-white dark:bg-[#0a0a0a] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-[#222228]'
              }`}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center px-5 mt-2 mb-4 flex-shrink-0">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {totalItemsCount} items showing
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 ${
              vegOnly
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                : 'bg-white dark:bg-[#0a0a0a] text-neutral-500 border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10'
            }`}
          >
            <Leaf size={12} className={vegOnly ? 'fill-emerald-500 text-emerald-500' : ''} />
            <span>Veg Only</span>
            <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-300 shrink-0 flex items-center ${vegOnly ? 'bg-emerald-500 justify-end' : 'bg-neutral-300 dark:bg-white/10 justify-start'}`}>
              <motion.div layout className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
          </button>
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

        {/* ── ZOMATO-STYLE GROUPED DISH LIST ── */}
        <div className="pb-32">
          {categoriesWithDishes.length === 0 ? (
            <div className="text-center py-20 text-neutral-600 px-5">
              <ChefHat size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-display font-bold text-lg">No dishes found</p>
              <p className="text-sm mt-1">Try a different category or search</p>
            </div>
          ) : (
            categoriesWithDishes.map((catGroup) => (
              <div 
                key={catGroup.category} 
                id={`category-${catGroup.category.replace(/\s+/g, '-').toLowerCase()}`}
                className="mb-8 scroll-mt-24"
              >
                {/* Sticky Header */}
                <div className="sticky top-0 bg-white/95 dark:bg-[#0d0d10]/95 backdrop-blur-md py-4 px-5 z-20 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center">
                  <h2 className="font-display font-black text-lg text-neutral-900 dark:text-white tracking-tight">
                    {catGroup.category}
                  </h2>
                  <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-white/5 px-2.5 py-1 rounded-full font-sans">
                    {catGroup.dishes.length} items
                  </span>
                </div>

                {/* Vertical Dishes List */}
                <div className="divide-y divide-neutral-100 dark:divide-white/5 px-5">
                  {catGroup.dishes.map((dish, i) => {
                    const dishQty = cart.filter(c => c.id === dish.id).length;
                    return (
                      <div key={dish.id} data-dish-id={dish.id} className="dish-card-analytics py-5 first:pt-4 last:pb-4">
                        <ZomatoDishRow 
                          dish={dish} 
                          isFav={favorites.includes(dish.id)}
                          onToggleFav={() => toggleFavorite(dish.id)}
                          onAddToCart={() => addToCart(dish)}
                          onDishClick={() => navigate(`/dish/${dish.id}`)}
                          onARClick={hasEnterprise && (dish.modelUrl || dish.model_url) ? () => navigate(`/dish/${dish.id}`) : undefined}
                          qty={dishQty}
                          onAdd={(e) => { if (e) e.stopPropagation(); addToCart(dish); }}
                          onRemove={(e) => { if (e) e.stopPropagation(); removeOneFromCart(dish.id); }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── UPCOMING EVENTS ── */}
        <div className="px-5 pb-32">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-black text-xl flex items-center gap-2"><CalendarIcon size={20} className="text-indigo-500" /> Upcoming Events</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-4">
            {events.map((event) => {
              const profile = JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}');
              const guestId = profile.guestId || 'anonymous';
              const rsvpsList = event.macros?.rsvps || [];
              const isRsvpd = rsvpsList.includes(guestId);
              
              // Extract date parts
              const dateStr = event.macros?.date || '';
              let month = 'OCT';
              let day = '28';
              if (dateStr) {
                try {
                  const d = new Date(dateStr + 'T12:00:00');
                  month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                  day = d.getDate().toString();
                } catch (err) {
                  console.error(err);
                }
              }

              return (
                <div key={event.id} className="shrink-0 w-[280px] snap-start bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                  {/* Event Cover Image if exists */}
                  {event.cover && (
                    <div className="w-full h-24 rounded-2xl overflow-hidden mb-4 relative">
                      <img src={event.cover} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex flex-col items-center justify-center border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                       <span className="text-[10px] font-black uppercase tracking-widest">{month}</span>
                       <span className="text-xl font-black">{day}</span>
                    </div>
                    {event.price > 0 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800/30">
                        ₹{Number(event.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-lg mb-1 truncate">{event.name}</h3>
                  <p className="text-xs text-neutral-500 mb-4 line-clamp-2 h-8">{event.description || 'Join us for a wonderful time!'}</p>
                  
                  <button 
                    onClick={async () => {
                      if (guestId === 'anonymous') {
                        showNotification('Please fill in your name and phone first to RSVP!');
                        setShowOnboarding(true);
                        return;
                      }
                      
                      const hasRsvpd = rsvpsList.includes(guestId);
                      const newRsvps = hasRsvpd
                        ? rsvpsList.filter(id => id !== guestId)
                        : [...rsvpsList, guestId];
                        
                      const updatedMacros = {
                        ...(event.macros || {}),
                        isEvent: true,
                        rsvps: newRsvps,
                        date: dateStr
                      };
                      
                      await updateDish(event.id, { macros: updatedMacros });
                      showNotification(hasRsvpd ? 'RSVP Cancelled' : 'Successfully RSVP\'d!');
                    }}
                    className={`w-full py-3 font-black text-sm rounded-xl transition-all shadow-sm ${
                      isRsvpd
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isRsvpd ? '✓ RSVP\'d' : 'RSVP Now'}
                  </button>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 text-center font-bold">
                    {rsvpsList.length} guest(s) attending
                  </p>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                <CalendarIcon size={32} className="text-neutral-400 mb-3" />
                <h3 className="font-display font-black text-base mb-1">No Upcoming Events</h3>
                <p className="text-xs text-neutral-500 max-w-[200px]">Check back later for exciting dining events and promotions!</p>
              </div>
            )}
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
              <button id="service-btn-water" onClick={() => requestService('Water Refill')} className="flex items-center gap-3 bg-neutral-50 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-neutral-200 dark:border-white/10 px-4 py-2.5 rounded-2xl text-neutral-900 dark:text-white shadow-xl hover:bg-white/10">
                <span className="text-sm font-bold">Water</span>
                <Droplets size={16} className="text-blue-400" />
              </button>
              <button id="service-btn-bill" onClick={() => requestService('Bill')} className="flex items-center gap-3 bg-neutral-50 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-neutral-200 dark:border-white/10 px-4 py-2.5 rounded-2xl text-neutral-900 dark:text-white shadow-xl hover:bg-white/10">
                <span className="text-sm font-bold">Bill</span>
                <Receipt size={16} className="text-emerald-400" />
              </button>
              <button id="service-btn-waiter" onClick={() => requestService('Waiter')} className="flex items-center gap-3 bg-[#D4AF37]/90 backdrop-blur-xl border border-[#D4AF37]/50 px-4 py-2.5 rounded-2xl text-black shadow-xl hover:bg-[#D4AF37]">
                <span className="text-sm font-bold">Call Waiter</span>
                <BellRing size={16} className="text-black" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          id="service-fab"
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

      {/* ── FLOATING ZOMATO MENU BUTTON ── */}
      {categoriesWithDishes.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xl font-bold text-sm tracking-wide transition-all border border-white/10 dark:border-black/5"
          >
            <BookOpen size={16} />
            <span>Menu</span>
          </motion.button>
        </div>
      )}

      {/* ── MENU POPUP OVERLAY ── */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#12141D] w-full max-w-[280px] rounded-[2rem] p-6 shadow-2xl border border-neutral-200 dark:border-white/10 relative overflow-hidden flex flex-col max-h-[60vh] mb-4"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />
              
              {/* Categories list */}
              <div className="overflow-y-auto pr-1 flex-1 py-2 space-y-4">
                {categoriesWithDishes.map((catGroup) => {
                  const isActive = activeCategory === catGroup.category;
                  return (
                    <button
                      key={catGroup.category}
                      onClick={() => {
                        setActiveCategory(catGroup.category);
                        setMenuOpen(false);
                        // Scroll to the category header
                        setTimeout(() => {
                          const el = document.getElementById(`category-${catGroup.category.replace(/\s+/g, '-').toLowerCase()}`);
                          if (el) {
                            const yOffset = -90;
                            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className="w-full flex justify-between items-center text-left py-1"
                    >
                      <span className={`text-base font-bold transition-colors ${
                        isActive ? 'text-green-600 dark:text-green-400 font-extrabold' : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {catGroup.category}
                      </span>
                      <span className={`text-sm font-semibold transition-colors ${
                        isActive ? 'text-green-600 dark:text-green-400 font-extrabold' : 'text-neutral-400 dark:text-neutral-500'
                      }`}>
                        {catGroup.dishes.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Standalone Close Button at Bottom */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black font-extrabold text-sm shadow-xl border border-white/10 dark:border-black/5"
            >
              <X size={16} />
              <span>Close</span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* ── BLINKIT-STYLE FLOATING CART BAR ── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/cart')}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 border border-emerald-500/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={16} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold opacity-90">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                  <p className="text-[10px] opacity-70 -mt-0.5">added to cart</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tabular-nums">
                  ₹{cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0).toFixed(2)}
                </span>
                <ChevronRight size={18} strokeWidth={2.5} />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
