import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Heart, ShoppingCart, Flame, Clock, MapPin, AlertTriangle, Star, ChefHat, Leaf, Droplets, Box, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import ModelViewer from '../components/ModelViewer';
import ARCameraOverlay from '../components/ARCameraOverlay';
import DishRatingBadge from '../components/DishRatingBadge';

const ALLERGEN_ICONS = { Gluten: '🌾', Nuts: '🥜', Dairy: '🥛', Eggs: '🥚', Shellfish: '🦐', Soy: '🫘', Fish: '🐟' };

const resolveDishOrVariant = (dishIdOrStr, dishesList, keepBaseId = false) => {
  const [dishId, variantName] = (typeof dishIdOrStr === 'string' ? dishIdOrStr : '').split('::');
  const targetId = dishId || dishIdOrStr;
  const d = dishesList.find(x => x.id === targetId);
  if (!d) return null;
  
  if (d.variants && d.variants.length > 0) {
    const v = variantName 
      ? d.variants.find(varItem => varItem.name === variantName)
      : d.variants[0];
    const actualVariantName = variantName || v?.name || '';
    return {
      ...d,
      id: keepBaseId ? d.id : `${d.id}-${actualVariantName}`,
      originalId: d.id,
      name: `${d.name} (${actualVariantName})`,
      price: parseFloat(v?.price) || 0,
      isVariant: true,
      variantName: actualVariantName,
      selectedVariant: v
    };
  }
  
  return {
    ...d,
    originalId: d.id,
    price: parseFloat(d.price) || 0
  };
};

export default function Dish3DPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeRestId, dishes, addToCart, favorites, toggleFavorite, cart, removeOneFromCart } = useAppContext();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showARCamera, setShowARCamera] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantModalDish, setVariantModalDish] = useState(null);
  const arContainerRef = useRef(null);

  useEffect(() => {
    if (!activeRestId) navigate('/', { replace: true });
  }, [activeRestId, navigate]);

  // Eagerly load model-viewer script for the hidden AR activator
  useEffect(() => {
    if (!customElements.get('model-viewer')) {
      const existing = document.querySelector('script[src*="model-viewer"]');
      if (!existing) {
        const s = document.createElement('script');
        s.type = 'module';
        s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
        document.head.appendChild(s);
      }
    }
  }, []);

  const dish = dishes.find(d => d.id === id);
  const isFav = favorites.includes(id);

  if (!dish) return null;

  const rawModelUrl = dish.modelUrl || dish.model_url;
  const modelUrl = (typeof rawModelUrl === 'string' && rawModelUrl.trim() !== '' && rawModelUrl !== 'null' && rawModelUrl !== 'undefined') ? rawModelUrl : null;
  const primaryBadge = dish.tags?.find(t => ["Chef's Pick", 'Signature', 'Popular', 'Bestseller', 'Seasonal', 'Vegan'].includes(t));
  const macroPercent = (val, max) => Math.min(100, Math.round((parseInt(val) || 0) / max * 100));

  const activateAR = () => {
    // Open our custom full-screen AR camera overlay
    setShowARCamera(true);
  };

  const displayImages = dish.images?.length > 0 ? dish.images : (dish.cover ? [dish.cover] : []);
  const sameRestDishes = dishes.filter(d => d.id !== id && (d.restId === activeRestId || d.rest_id === activeRestId));
  const comboIds = dish.macros?.comboRecommendations || [];
  const recommendedDishes = comboIds.length > 0
    ? comboIds.map(cid => resolveDishOrVariant(cid, sameRestDishes, true)).filter(Boolean)
    : [];


  return (
    <>
    {/* ── AR Camera Overlay (full-screen, above everything) ── */}
    <AnimatePresence>
      {showARCamera && modelUrl && (
        <ARCameraOverlay
          modelUrl={modelUrl}
          dishName={dish.name}
          onClose={() => setShowARCamera(false)}
        />
      )}
    </AnimatePresence>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-[100dvh] relative overflow-hidden bg-white dark:bg-black transition-colors">

      {/* ══════════════════════════════════════════════════════ */}
      {/* HERO — Full-bleed food photo / 3D model               */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="relative flex-shrink-0 h-[42vh] overflow-hidden bg-neutral-100 dark:bg-[#111115]">
        {displayImages.length > 0 ? (
          <>
            <motion.img 
              key={currentImageIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={displayImages[currentImageIdx]} 
              alt={dish.name}
              className="w-full h-full object-cover" 
            />
            {displayImages.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                {displayImages.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentImageIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
                ))}
              </div>
            )}
          </>
        ) : modelUrl ? (
          <ModelViewer
            src={modelUrl}
            autoRotate
            cameraControls
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={64} className="text-neutral-300 dark:text-neutral-700" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white dark:to-black pointer-events-none transition-colors" />

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-5 pt-12 z-20">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all">
            <ChevronLeft size={22} className="text-white" />
          </motion.button>
        </div>

        {/* Badge */}
        {primaryBadge && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="absolute top-16 left-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-900/85 border border-amber-600/40 backdrop-blur-md z-10">
            <Star size={10} className="text-amber-300 fill-amber-300" />
            <span className="text-[11px] font-black text-amber-300 tracking-wide">{primaryBadge}</span>
          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* DETAILS SHEET                                          */}
      {/* ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="flex-1 overflow-y-auto no-scrollbar rounded-t-[2rem] bg-white dark:bg-black border-t border-neutral-200 dark:border-[#D4AF37]/15 z-30 transition-colors"
        style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.8)' }}
      >
        <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-white/15 mx-auto mt-3 mb-5" />

        <div className="px-5 pb-40">

          {/* ── Name + Price ── */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-4">
              <h1 className="font-display font-black text-[28px] text-neutral-900 dark:text-white leading-tight tracking-tight">{dish.name}</h1>
            </div>
            <div className="shrink-0 mt-1 flex flex-col gap-2 items-end">
              {dish.variants && dish.variants.length > 0 ? (
                dish.variants.map((v, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 font-display font-black text-lg text-[#D4AF37]">
                    <span className="text-xs font-sans font-bold opacity-80 mr-2 uppercase tracking-wider">{v.name}</span>
                    ₹{Number(v.price).toFixed(2)}
                  </span>
                ))
              ) : (
                <span className="inline-block px-4 py-2 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 font-display font-black text-xl text-[#D4AF37]">
                  ₹{Number(dish.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* ── Description ── */}
          <p className="text-sm text-neutral-500 dark:text-neutral-300 leading-relaxed mb-3">{dish.description || 'A carefully crafted dish made with the finest seasonal ingredients.'}</p>

          {/* ── Rating (only shown here on detail page, not on menu list) ── */}
          <DishRatingBadge dishId={dish.id} variant="full" className="mb-5" />

          {/* ── Stats Row: Calories + Prep Time ── */}
          <div className={`grid ${dish.macros?.calories ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-5`}>
            {dish.macros?.calories && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-100 dark:border-[#D4AF37]/10">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                  <Flame size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-display font-black text-2xl text-neutral-900 dark:text-white leading-none">{dish.macros.calories}</p>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Calories</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-100 dark:border-[#D4AF37]/15">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <Clock size={18} style={{ color: '#D4AF37' }} />
              </div>
              <div>
                <p className="font-display font-black text-2xl text-neutral-900 dark:text-white leading-none">{dish.prepTime || '18'} <span className="text-base font-semibold text-neutral-500">min</span></p>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Prep Time</p>
              </div>
            </div>
          </div>

          {/* ── Dietary & Spice Info ── */}
          {(dish.spiceLevel || dish.dietaryPreference) && (
            <div className="flex gap-2 mb-5">
              {dish.spiceLevel && (
                <div className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${dish.spiceLevel === 'Hot' || dish.spiceLevel === 'Extra Hot' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' : dish.spiceLevel === 'Medium' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'}`}>
                  <Flame size={12} /> {dish.spiceLevel}
                </div>
              )}
              {dish.dietaryPreference && (() => {
                let badgeClass = "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30";
                if (dish.dietaryPreference === 'Non-Vegetarian') {
                  badgeClass = "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30";
                } else if (dish.dietaryPreference === 'Eggitarian') {
                  badgeClass = "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30";
                }
                return (
                  <div className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${badgeClass}`}>
                    <Leaf size={12} /> {dish.dietaryPreference}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Provenance / Origin Story ── */}
          {(dish.origin || dish.provenance) && (
            <div className="mb-5 p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-100 dark:border-[#D4AF37]/10">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={13} className="text-[#D4AF37]" />
                <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">
                  {dish.origin || 'Sourced Fresh Daily'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{dish.provenance}</p>
            </div>
          )}

          {/* ── Macro Bars ── */}
          {(dish.macros?.protein || dish.macros?.carbs || dish.macros?.fat) && (
            <div className="mb-5 p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-100 dark:border-[#D4AF37]/10">
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
                    <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-white/5 overflow-hidden">
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
                    className="px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-[#1a1a1f] border border-neutral-200 dark:border-[#D4AF37]/10 text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Allergens ── */}
          {dish.allergens?.length > 0 && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-red-500 dark:text-red-400" />
                <span className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.15em]">Allergens</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map(a => (
                  <span key={a} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 text-[11px] font-semibold text-red-700 dark:text-red-300">
                    {ALLERGEN_ICONS[a] || ''} {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Tags ── */}
          {dish.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {dish.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-[#D4AF37]/10 text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* ── People Also Ordered ── */}
          {recommendedDishes.length > 0 && (
            <div className="mb-5">
              <h3 className="font-display font-black text-lg text-neutral-900 dark:text-white mb-4">People Also Ordered</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {recommendedDishes.map(rec => {
                  const recQty = (() => {
                    if (rec.isVariant && rec.selectedVariant) {
                      return cart.filter(c => c.id === rec.id && c.selectedVariant?.name === rec.selectedVariant.name).length;
                    }
                    return cart.filter(c => c.id === rec.id && !c.selectedVariant).length;
                  })();
                  const itemKey = rec.isVariant ? `${rec.id}-${rec.variantName}` : rec.id;
                  
                  return (
                    <div key={itemKey} onClick={() => navigate(`/dish/${rec.id}`)} className="shrink-0 w-36 cursor-pointer flex flex-col justify-between">
                      <div>
                        <div className="w-full h-36 rounded-2xl overflow-hidden mb-2 relative bg-neutral-100 dark:bg-[#1a1a1f]">
                          {(rec.images?.[0] || rec.cover) ? (
                            <img src={rec.images?.[0] || rec.cover} alt={rec.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ChefHat size={24} className="text-neutral-400" /></div>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">{rec.name}</h4>
                        <p className="text-accent-blue font-black text-sm">₹{Number(rec.price).toFixed(2)}</p>
                      </div>

                      {/* Add to Cart Stepper */}
                      <div className="mt-2" onClick={e => e.stopPropagation()}>
                        {recQty === 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (rec.variants && rec.variants.length > 1 && !rec.isVariant) {
                                setVariantModalDish(rec);
                              } else if (rec.variants && rec.variants.length === 1 && !rec.isVariant) {
                                addToCart({ ...rec, selectedVariant: rec.variants[0] });
                              } else if (rec.isVariant && rec.selectedVariant) {
                                addToCart({ ...rec, selectedVariant: rec.selectedVariant });
                              } else {
                                addToCart(rec);
                              }
                            }}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 uppercase tracking-wider shadow-sm"
                          >
                            Add +
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-between bg-emerald-600 rounded-xl overflow-hidden shadow-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeOneFromCart(rec.id, rec.variantName);
                              }}
                              className="flex-1 py-1.5 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="flex-1 text-center text-white font-extrabold text-xs select-none">
                              {recQty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (rec.isVariant && rec.selectedVariant) {
                                  addToCart({ ...rec, selectedVariant: rec.selectedVariant });
                                } else {
                                  addToCart(rec);
                                }
                              }}
                              className="flex-1 py-1.5 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* STICKY BOTTOM ACTIONS                                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 z-40 px-5 pb-8 pt-12 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-black dark:via-black/80 transition-colors">

        {/* AR Button — uses hidden ModelViewer activated imperatively */}
        {modelUrl && (
          <>
            {/* Hidden but properly sized AR model-viewer — must have real dimensions to initialise */}
            <div ref={arContainerRef} className="fixed -left-[9999px] -top-[9999px] w-[300px] h-[300px] pointer-events-none" aria-hidden="true">
              <ModelViewer src={modelUrl} ar />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={activateAR}
              className="mb-3 w-full py-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer border border-neutral-200 dark:border-[#D4AF37]/20 bg-white/80 dark:bg-white/5 backdrop-blur-md shadow-sm text-neutral-900 dark:text-white font-display font-black text-[15px] tracking-wide">
              <Box size={20} />
              VIEW IN AUGMENTED REALITY
            </motion.button>
          </>
        )}

        {/* Add to Order CTA */}
        <motion.button 
          disabled={dish.tags?.includes('sold_out')}
          whileHover={dish.tags?.includes('sold_out') ? undefined : { scale: 1.02 }} 
          whileTap={dish.tags?.includes('sold_out') ? undefined : { scale: 0.98 }}
          onClick={() => {
            if (dish.variants && dish.variants.length > 1) {
              setShowVariantModal(true);
            } else if (dish.variants && dish.variants.length === 1) {
              addToCart({ ...dish, selectedVariant: dish.variants[0] });
              navigate(-1);
            } else {
              addToCart(dish);
              navigate(-1);
            }
          }}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-display font-black text-base transition-all ${
            dish.tags?.includes('sold_out')
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
              : 'text-black'
          }`}
          style={dish.tags?.includes('sold_out') ? {} : { background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', boxShadow: '0 10px 40px rgba(212,175,55,0.35)' }}>
          <ShoppingCart size={19} />
          {dish.tags?.includes('sold_out') ? 'Sold Out' : (dish.variants && dish.variants.length > 1 ? 'Choose Variant' : `Order Now — ₹${Number(dish.variants?.length === 1 ? dish.variants[0].price : dish.price || 0).toFixed(2)}`)}
        </motion.button>
      </div>
    </motion.div>

    <AnimatePresence>
      {showVariantModal && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/60 backdrop-blur-sm" onClick={() => setShowVariantModal(false)}>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#12141D] w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-white/10"
          >
            <h3 className="font-display font-black text-xl mb-4 text-neutral-900 dark:text-white">Choose Variant</h3>
            <div className="space-y-3">
              {dish.variants.map((v, i) => (
                <button key={i} onClick={() => {
                  addToCart({ ...dish, selectedVariant: v });
                  setShowVariantModal(false);
                  navigate(-1);
                }} className="w-full flex justify-between items-center p-4 rounded-2xl bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all text-left">
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{v.name}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{Number(v.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowVariantModal(false)} className="w-full mt-4 py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {variantModalDish && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/60 backdrop-blur-sm" onClick={() => setVariantModalDish(null)}>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#12141D] w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-white/10"
          >
            <h3 className="font-display font-black text-xl mb-4 text-neutral-900 dark:text-white">Choose Variant</h3>
            <div className="space-y-3">
              {variantModalDish.variants.map((v, i) => (
                <button key={i} onClick={() => {
                  addToCart({ ...variantModalDish, selectedVariant: v });
                  setVariantModalDish(null);
                }} className="w-full flex justify-between items-center p-4 rounded-2xl bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all text-left">
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{v.name}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{Number(v.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setVariantModalDish(null)} className="w-full mt-4 py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
