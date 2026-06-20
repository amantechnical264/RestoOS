import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ListOrdered, TrendingUp, Utensils, QrCode as QrIcon,
  Box, Edit2, Plus, X as CloseIcon, Upload, AlertTriangle, LogOut, Store, Settings,
  Users, Save, Trash2, RefreshCw, Printer, ChefHat, Sparkles, Crown,
  Zap, Bell, Tag, Star, Eye, EyeOff, BarChart2, Activity, Megaphone,
  Clock, DollarSign, ShoppingBag, Repeat, ArrowUpRight, BrainCircuit,
  ArrowDownRight, Package, MessageSquare, Percent, Gift, Target, ToggleLeft, ToggleRight,
  TrendingDown, Calendar, Filter, CheckCircle, XCircle, Flame, SlidersHorizontal, BookOpen, ChevronUp, ChevronDown, GripVertical, ArrowDown, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { reviewService } from '../services/ReviewService';
import ModelViewer from '../components/ModelViewer';
import AIImageGenerator from '../components/AIImageGenerator';
import StaffDashboard from '../components/StaffDashboard';
import { KpiCardSkeleton, OrderLaneSkeleton, CustomerRowSkeleton } from '../components/Skeleton';
import { extractMenuFromImage } from '../services/geminiService';
import { generateMeshyModel } from '../services/meshyService';

// ── Design Tokens ─────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_DIM = '#AA8C2C';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';
const cardStyle = {
  background: 'linear-gradient(145deg, #111111 0%, #080808 100%)',
  border: '1px solid rgba(212,175,55,0.18)',
  boxShadow: '0 4px 30px rgba(0,0,0,0.8)',
};
const cardStyleLight = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
};

// ─── Mini Bar Chart (pure SVG, no library) ────────────────────────────
const MiniBarChart = React.memo(({ data, color = '#D4AF37', height = 80 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const [hovered, setHovered] = React.useState(null);
  return (
    <div className="relative" style={{ height: height + 30 }}>
      {/* Tooltip */}
      {hovered !== null && data[hovered] && (
        <div className="absolute z-20 px-3 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-[11px] font-bold shadow-xl pointer-events-none whitespace-nowrap"
          style={{
            left: `${((hovered + 0.5) / data.length) * 100}%`,
            top: 0,
            transform: 'translateX(-50%)'
          }}>
          <div>₹{Number(data[hovered].value).toFixed(2)}</div>
          <div className="text-[10px] font-medium opacity-70">{data[hovered].orders || 0} orders</div>
          {data[hovered].fullDate && <div className="text-[9px] opacity-50">{data[hovered].fullDate}</div>}
        </div>
      )}
      {/* Bars */}
      <div className="flex items-end justify-between gap-[2px] h-full pt-8 pb-5">
        {data.map((d, i) => {
          const bh = Math.max((d.value / max) * (height - 20), 2);
          return (
            <div key={i} className="flex flex-col items-center flex-1 cursor-pointer group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>
              <div
                className="w-full rounded-t-sm transition-all duration-150"
                style={{
                  height: bh,
                  backgroundColor: color,
                  opacity: hovered === null ? 0.85 : hovered === i ? 1 : 0.4,
                  transform: hovered === i ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom'
                }}
              />
              <span className="text-[9px] text-neutral-500 mt-1 select-none">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── KPI Card ─────────────────────────────────────────────────────────
const KpiCard = React.memo(({ icon: Icon, label, value, sub, color, trend, onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-3xl p-5 flex flex-col gap-3 transition-transform bg-white dark:bg-transparent ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : 'hover:scale-[1.02] cursor-default'}`}
    style={{ ...( document.documentElement.classList.contains('dark') ? cardStyle : cardStyleLight ) }}
  >
    <div className="flex justify-between items-start">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}44` }}
      >
        <Icon size={18} style={{ color: GOLD }} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
          trend >= 0
            ? 'text-emerald-400'
            : 'text-red-400'
        }`} style={{ background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl font-display font-black text-neutral-900 dark:text-white">{value}</p>
      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-neutral-400 mt-1">{sub}</p>}
    </div>
  </div>
));

// ─── Dish Popularity Row ───────────────────────────────────────────────
const PopularityRow = React.memo(({ rank, name, count, revenue, total, badge }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-neutral-100 dark:border-white/5 last:border-0">
      <span className="font-display font-black text-lg w-5 text-center">
        {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : <span className="text-neutral-500 text-sm">{rank}</span>}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{name}</p>
          {badge && <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>{badge}</span>}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,175,55,0.08)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ delay: 0.3 + rank * 0.08, duration: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: goldGradient }} />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-neutral-900 dark:text-white">{count}x</p>
        <p className="text-[10px] font-semibold text-emerald-500">₹{revenue.toFixed(0)}</p>
      </div>
    </div>
  );
});

// ─── Promotion / Feature Card ──────────────────────────────────────────
const PromoCard = ({ title, desc, icon: Icon, badge, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full text-left p-4 rounded-2xl group transition-all"
    style={{
      background: 'linear-gradient(145deg, #111 0%, #0a0a0a 100%)',
      border: '1px solid rgba(212,175,55,0.2)',
    }}
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
        <Icon size={18} style={{ color: GOLD }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-sm text-white">{title}</p>
          {badge && <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>{badge}</span>}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
      </div>
      <ArrowUpRight size={15} className="shrink-0 mt-0.5 transition-colors" style={{ color: GOLD }} />
    </div>
  </motion.button>
);

// ─── Category Reorder List Helper ──────────────────────────────────────
const CategoryReorderList = ({ cat, initialDishes, metadataRecord, updateDish }) => {
  const [items, setItems] = React.useState(initialDishes);

  React.useEffect(() => {
    const initialIds = initialDishes.map(d => d.id).join(',');
    const currentIds = items.map(d => d.id).join(',');

    const metaChanged = initialDishes.some(d => {
      const match = items.find(item => item.id === d.id);
      return !match || match.name !== d.name || match.price !== d.price;
    });

    const initialIdSet = new Set(initialDishes.map(d => d.id));
    const currentIdSet = new Set(items.map(d => d.id));
    const hasDifferentItems = initialDishes.length !== items.length || 
      [...initialIdSet].some(id => !currentIdSet.has(id));

    if (hasDifferentItems || metaChanged) {
      setItems(initialDishes);
    }
  }, [initialDishes]);

  const saveOrder = async (newOrder) => {
    if (!metadataRecord) return;
    const ids = newOrder.map(d => d.id);
    await updateDish(metadataRecord.id, { 
      macros: { ...metadataRecord.macros, categoryOrders: { ...(metadataRecord.macros?.categoryOrders || {}), [cat]: ids } }
    });
  };

  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-2 mt-2">
      {items.map((dish) => (
        <Reorder.Item 
          key={dish.id} 
          value={dish}
          onDragEnd={() => saveOrder(items)}
          className="flex justify-between items-center p-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 text-xs group cursor-grab active:cursor-grabbing relative select-none touch-none"
        >
          <span className="font-semibold truncate pr-2 flex-1">{dish.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-neutral-500 font-sans mr-2">₹{Number(dish.price).toFixed(2)}</span>
            <div className="p-1 text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 transition-colors">
               <GripVertical size={16} />
            </div>
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

// ─── Subscription Gating Lock Component ──────────────────────────────
const UpgradeLock = ({ requiredPlan, feature, activeRestId, upgradePlan, showNotification }) => {
  const PLANS = ['Starter', 'Pro', 'Enterprise'];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-black"
    >
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.35)' }}>
          <Crown size={36} style={{ color: GOLD }} />
        </div>
        <h2 className="font-display font-black text-2xl text-neutral-900 dark:text-white mb-2">{feature} is a {requiredPlan} Feature</h2>
        <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
          Upgrade your plan to unlock {feature}, deeper analytics, customer CRM, AI concierge, and more premium capabilities.
        </p>
        <div className="grid grid-cols-1 gap-3">
          {PLANS.filter(p => PLANS.indexOf(p) >= PLANS.indexOf(requiredPlan)).map(p => (
            <button key={p} type="button"
              onClick={() => { if (activeRestId) { upgradePlan(activeRestId, p); showNotification(`🌟 Upgraded to ${p}!`); } }}
              className="w-full py-3.5 rounded-2xl font-black text-sm transition-all"
              style={p === requiredPlan
                ? { background: goldGradient, color: '#000', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }
                : { background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD }
              }
            >
              {p === 'Pro' ? 'Upgrade to Pro — $49/mo' : 'Upgrade to Enterprise — $99/mo'}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-500">Cancel anytime. Instant access upon upgrade.</p>
      </div>
    </motion.div>
  );
};

// ─── Google Play-Style Reviews Analytics ──────────────────────────────
const STAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']; // 1→5 star colors

const ReviewsAnalytics = ({ reviews }) => {
  const [loading, setLoading] = React.useState(false);

  // loading state isn't strictly necessary since it receives data synchronously,
  // but kept for compatibility with the rest of the component's UI states if needed.
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews)
    : 0;
  const displayAvg = averageRating.toFixed(1);

  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    return { star, count, pct: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
  });

  // Sentiment label
  const sentiment = averageRating >= 4.5 ? 'Excellent' : averageRating >= 4 ? 'Very Good' : averageRating >= 3 ? 'Good' : averageRating >= 2 ? 'Fair' : 'Poor';
  const sentimentColor = averageRating >= 4.5 ? 'text-emerald-500' : averageRating >= 4 ? 'text-green-500' : averageRating >= 3 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-black text-lg">Customer Reviews</h3>
          {totalReviews > 0 && (
            <p className="text-xs text-neutral-500 mt-0.5">Based on {totalReviews} verified {totalReviews === 1 ? 'order' : 'orders'}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <RefreshCw size={18} className="text-neutral-400 animate-spin" />
          <span className="text-sm text-neutral-500">Loading reviews…</span>
        </div>
      ) : totalReviews === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Star size={28} className="opacity-30" />
          </div>
          <p className="font-bold text-neutral-600 dark:text-neutral-400 mb-1">No reviews yet</p>
          <p className="text-sm text-neutral-400">Reviews submitted by customers after completing orders will appear here.</p>
        </div>
      ) : (
        <>
          {/* Score + Distribution */}
          <div className="flex flex-col sm:flex-row gap-8 mb-8 p-5 bg-neutral-50 dark:bg-white/[0.03] rounded-2xl border border-neutral-100 dark:border-white/5">
            {/* Big Score */}
            <div className="flex flex-col items-center justify-center shrink-0 min-w-[110px]">
              <span className="font-display font-black text-7xl leading-none text-neutral-900 dark:text-white">{displayAvg}</span>
              <div className="flex gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14}
                    className={s <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200 dark:fill-white/10 dark:text-white/10'}
                  />
                ))}
              </div>
              <span className={`text-xs font-black uppercase tracking-wide ${sentimentColor}`}>{sentiment}</span>
            </div>

            {/* Bar Distribution */}
            <div className="flex-1 w-full space-y-2.5">
              {distribution.map(d => (
                <div key={d.star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 shrink-0 w-8 justify-end">
                    <span className="text-xs font-bold text-neutral-500">{d.star}</span>
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-neutral-200 dark:bg-white/8 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.pct}%` }}
                      transition={{ duration: 0.6, delay: (5 - d.star) * 0.05, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: STAR_COLORS[d.star - 1] }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400 shrink-0 w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Review Cards */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {reviews.map((review, idx) => {
              const initial = (review.diner_name || 'A').charAt(0).toUpperCase();
              const avatarColors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500'];
              const avatarColor = avatarColors[initial.charCodeAt(0) % avatarColors.length];
              const date = review.created_at
                ? new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : '';

              return (
                <motion.div
                  key={review.id || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/5"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center shrink-0 text-white font-black text-sm`}>
                      {initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                          {review.diner_name || 'Anonymous Diner'}
                        </span>
                        {date && (
                          <span className="text-[11px] text-neutral-400 shrink-0 ml-2">{date}</span>
                        )}
                      </div>

                      {/* Stars row */}
                      <div className="flex items-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={12}
                            style={s <= review.rating ? { fill: STAR_COLORS[review.rating - 1], color: STAR_COLORS[review.rating - 1] } : {}}
                            className={s <= review.rating ? '' : 'fill-neutral-200 text-neutral-200 dark:fill-white/10 dark:text-white/10'}
                          />
                        ))}
                        <span className="ml-1.5 text-[11px] font-bold" style={{ color: STAR_COLORS[review.rating - 1] }}>
                          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][review.rating]}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};


// ══════════════════════════════════════════════════════════════════════
export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const [vendorTab, setVendorTab] = React.useState('orders');
  const {
    orders, activeRestId, updateOrderStatus,
    dishes, setDishes, restaurants, addDish, updateDish, user, setUser,
    updateRestaurant, supabaseUser, setActiveRestId, isInitializing,
    theme, toggleTheme, showNotification, serviceAlerts, setServiceAlerts,
    planFor, upgradePlan, isDataLoaded,
    promos, updateMarketingCampaign,
  } = useAppContext();

  // ── Subscription helpers ────────────────────────────────────────
  const PLANS = ['Starter', 'Pro', 'Enterprise'];
  const currentPlan = planFor(activeRestId);
  const hasPro        = PLANS.indexOf(currentPlan) >= PLANS.indexOf('Pro');
  const hasEnterprise = PLANS.indexOf(currentPlan) >= PLANS.indexOf('Enterprise');



  // ── Guards ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (isInitializing) return;
    if (!supabaseUser) { navigate('/vendor-auth', { replace: true }); return; }
    const myRest = restaurants.find(r => r.vendor_id === supabaseUser.id || r.vendorId === supabaseUser.id);
    if (!myRest && restaurants.length === 0) return;
    if (!myRest) { navigate('/vendor-onboard', { replace: true }); }
    else if (!activeRestId) { setActiveRestId(myRest.id); }
  }, [supabaseUser, restaurants, activeRestId, navigate, setActiveRestId, isInitializing]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('3dish_user');
    sessionStorage.removeItem('3dish_active_rest');
    window.location.href = '/vendor-auth';
  };

  const updateOrder = async (orderId, updates) => {
    if (updates.status && updateOrderStatus) {
      await updateOrderStatus(orderId, updates.status);
    }
  };

  const currentRestaurant = restaurants.find(r => r.id === activeRestId);
  const [editingDish, setEditingDish] = React.useState(null);
  const [editingEvent, setEditingEvent] = React.useState(null);
  const [viewingRsvpsEvent, setviewingRsvpsEvent] = React.useState(null);
  const [managingCategories, setManagingCategories] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [selectedEditCategory, setSelectedEditCategory] = React.useState('All');
  const [scanState, setScanState]     = React.useState('idle');
  const [scanStageLabel, setScanStageLabel] = React.useState('');
  const [progress, setProgress]       = React.useState(0);
  const glbInputRef = React.useRef(null);
  const [isStaffMode, setIsStaffMode] = React.useState(false);
  const [aiImportState, setAiImportState] = React.useState('idle');
  const [extractedDishes, setExtractedDishes] = React.useState([]);
  const [importProgress, setImportProgress] = React.useState(0);
  const fileInputRef = React.useRef(null);
  const [tableCount, setTableCount]   = React.useState(5);
  const [activePromo, setActivePromo] = React.useState(null);
  const [notifText, setNotifText]     = React.useState('');
  const [promoForm, setPromoForm]     = React.useState({ label: '', discount: 15, type: 'percent', applicableDishes: [] });
  const [happyHourForm, setHappyHourForm] = React.useState({ startTime: '17:00', endTime: '19:00', discount: 20 });

  const handleActivatePromo = () => {
    const disc = Number(promoForm.discount);
    if (!promoForm.label.trim()) {
      showNotification('Please enter a promo label');
      return;
    }
    if (isNaN(disc) || disc <= 0 || disc > 100) {
      showNotification('Discount must be between 1% and 100%');
      return;
    }
    if (promoForm.applicableDishes.length === 0) {
      showNotification('Please select at least one dish for the promo');
      return;
    }

    updateMarketingCampaign(activeRestId, 'flash', {
      label: promoForm.label,
      discount: disc,
      applicableDishes: promoForm.applicableDishes
    });
    
    const existingFlash = promos[activeRestId]?.flash;
    showNotification(`Promo "${promoForm.label}" ${existingFlash ? 'updated' : 'activated'} for ${promoForm.applicableDishes.length} dishes!`);
    setActivePromo(null);
  };

  const handleActivateHappyHour = () => {
    const disc = Number(happyHourForm.discount);
    if (!happyHourForm.startTime || !happyHourForm.endTime) {
      showNotification('Please enter both start and end times');
      return;
    }
    if (isNaN(disc) || disc <= 0 || disc > 100) {
      showNotification('Discount must be between 1% and 100%');
      return;
    }

    updateMarketingCampaign(activeRestId, 'happyHour', {
      startTime: happyHourForm.startTime,
      endTime: happyHourForm.endTime,
      discount: disc
    });
    
    const existingHappy = promos[activeRestId]?.happyHour;
    showNotification(`Happy Hour ${existingHappy ? 'updated' : 'activated'}: ${happyHourForm.startTime} - ${happyHourForm.endTime} at ${disc}% off!`);
    setActivePromo(null);
  };
  const [dishVisibility, setDishVisibility] = React.useState({});
  const [soldOutDishes, setSoldOutDishes]   = React.useState({});
  const [analyticsRange, setAnalyticsRange] = React.useState('Week');
  const [isGenerating3D, setIsGenerating3D] = React.useState(false);
  const [showAIImageGen, setShowAIImageGen] = React.useState(false);
  const [enteredCodes, setEnteredCodes] = React.useState({});

  // ── Combo Builder State ────────────────────────────────────────
  const [showComboDialog, setShowComboDialog] = React.useState(false);
  const [comboParent, setComboParent] = React.useState(null);
  const [comboRecs, setComboRecs] = React.useState([]);
  const [categoryToDelete, setCategoryToDelete] = React.useState(null);
  const [customerFilter, setCustomerFilter] = React.useState('top'); // 'top', 'all', 'repeat'

  // Custom Customer Modal State
  const [showAllCustomersModal, setShowAllCustomersModal] = React.useState(false);
  const [customerModalSort, setCustomerModalSort] = React.useState('most-came'); // 'most-came', 'most-spend'
  const [selectedCustomerIds, setSelectedCustomerIds] = React.useState([]);



  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target.result;
        const rows = text.split('\n').map(row => row.split(','));
        let count = 0;
        for (let i = 1; i < rows.length; i++) {
           const r = rows[i];
           if (r.length >= 3 && r[0].trim()) {
             await addDish({ name: r[0], price: parseFloat(r[1]), description: r[2], restId: activeRestId });
             count++;
           }
        }
        showNotification(`Imported ${count} dishes successfully!`);
      };
      reader.readAsText(file);
    }
  };

  const [settingsForm, setSettingsForm] = React.useState({
    name: '', cover: '', taxRate: 8, acceptCash: true, phone: '', hours: '10:00 - 22:00'
  });


  React.useEffect(() => {
    if (currentRestaurant) {
      setSettingsForm({
        name: currentRestaurant.name || '',
        cover: currentRestaurant.cover || '',
        taxRate: currentRestaurant.taxRate !== undefined ? currentRestaurant.taxRate : 8,
        acceptCash: currentRestaurant.acceptCash !== undefined ? currentRestaurant.acceptCash : true,
        phone: currentRestaurant.phone || '',
        hours: currentRestaurant.hours || '10:00 - 22:00',
      });
    }
  }, [currentRestaurant]);

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    await updateRestaurant(activeRestId, settingsForm);
    showNotification('Settings saved successfully!');
  };

  const handleOCRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-uploaded
    e.target.value = '';

    setAiImportState('analyzing');
    setImportProgress(0);

    try {
      // Animate progress bar while waiting for API
      let fakeP = 0;
      const progressInterval = setInterval(() => {
        fakeP = Math.min(fakeP + 8, 85); // goes up to 85%, then jump to 100 on success
        setImportProgress(fakeP);
      }, 500);

      const dishes = await extractMenuFromImage(file);
      clearInterval(progressInterval);
      setImportProgress(100);
      setExtractedDishes(dishes);
      setAiImportState('reviewing');
      showNotification(`✨ Extracted ${dishes.length} dishes from your menu!`);
    } catch (err) {
      console.error('OCR error:', err);
      setAiImportState('idle');
      if (err.message === 'GEMINI_API_KEY_MISSING') {
        showNotification('⚠️ Add VITE_GEMINI_API_KEY to your .env file to enable AI menu import.');
      } else {
        showNotification(`Import failed: ${err.message}`);
      }
    }
  };

  const ALLERGEN_OPTIONS = ['Gluten', 'Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Soy', 'Fish'];

  const finalizeGlbResult = React.useCallback((url) => {
    setScanState('complete'); setProgress(100); setScanStageLabel('3D AR Model Ready!');
    setEditingDish(prev => prev ? { ...prev, modelUrl: url } : prev);
  }, []);

  const [glbUpload, setGlbUpload] = React.useState({ uploading: false, progress: 0, error: null });

  const uploadGlbFile = async (file) => {
    // 5MB limit to protect Supabase egress quota
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showNotification('⚠️ File too large. Please compress your GLB to under 5MB (e.g. using gltf.report).', 'error');
      setGlbUpload({ uploading: false, progress: 0, error: 'File exceeds 5MB limit.' });
      return null;
    }

    setGlbUpload({ uploading: true, progress: 0, error: null });

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += (90 - currentProgress) * 0.12;
      setGlbUpload(prev => ({ ...prev, progress: Math.min(Math.round(currentProgress), 89) }));
    }, 250);

    try {
      const filePath = `${activeRestId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('models').upload(filePath, file, { cacheControl: '3600', upsert: false });
      clearInterval(progressInterval);
      if (error) throw error;
      const { data: pub } = supabase.storage.from('models').getPublicUrl(filePath);
      setGlbUpload({ uploading: false, progress: 100, error: null });
      // Set the model URL — preview renders immediately
      setEditingDish(prev => prev ? { ...prev, modelUrl: pub.publicUrl } : prev);
      return pub.publicUrl;
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      setGlbUpload({ uploading: false, progress: 0, error: 'Upload failed. Check your Supabase storage bucket.' });
      return null;
    }
  };

  const handleAIGenerate3D = async () => {
    const imageUrl = editingDish.cover || editingDish.images?.[0];
    if (!imageUrl) {
      showNotification('Please upload at least one dish image first.');
      return;
    }
    setIsGenerating3D(true);
    setScanStageLabel('Sending to Meshy.ai...');
    showNotification('🤖 Starting 3D generation — this takes 1-3 minutes...');

    try {
      const glbUrl = await generateMeshyModel(imageUrl, (progress) => {
        setProgress(progress);
        setScanStageLabel(`Generating 3D model... ${Math.round(progress)}%`);
      });
      setEditingDish(prev => ({ ...prev, modelUrl: glbUrl }));
      setIsGenerating3D(false);
      setScanStageLabel('3D AR Model Ready!');
      setProgress(100);
      showNotification('✅ 3D Model generated successfully! Preview it below.');
    } catch (err) {
      console.error('Meshy 3D error:', err);
      setIsGenerating3D(false);
      setScanStageLabel('');
      if (err.message === 'MESHY_API_KEY_MISSING') {
        showNotification('⚠️ Add VITE_MESHY_API_KEY to your .env file to enable 3D generation.');
      } else {
        showNotification(`3D generation failed: ${err.message}`);
      }
    }
  };

  // ── Order helpers ─────────────────────────────────────────────────
  const restOrders = React.useMemo(() => orders.filter(o => o.restId === activeRestId || o.rest_id === activeRestId), [orders, activeRestId]);
  const pendingVerification = React.useMemo(() => restOrders.filter(o => o.status === 'Pending Verification'), [restOrders]);
  const pending   = React.useMemo(() => restOrders.filter(o => o.status === 'Pending' || o.status === 'Scheduled'), [restOrders]);
  const prep      = React.useMemo(() => restOrders.filter(o => o.status === 'Preparing'), [restOrders]);
  const ready     = React.useMemo(() => restOrders.filter(o => o.status === 'Ready'), [restOrders]);
  const completed = React.useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" in local time
    return restOrders.filter(o => {
      if (o.status !== 'Completed') return false;
      if (!o.timestamp) return false;
      const orderDate = new Date(o.timestamp).toLocaleDateString('en-CA');
      return orderDate === todayStr;
    });
  }, [restOrders]);
  const cancelled = React.useMemo(() => restOrders.filter(o => o.status === 'Cancelled'), [restOrders]);

  const getOrderNumber = React.useCallback((order) => {
    const sorted = [...restOrders].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
    const idx = sorted.findIndex(o => o.id === order.id);
    return `#${String(idx + 1).padStart(3, '0')}`;
  }, [restOrders]);

  // ── Analytics computations ────────────────────────────────────────
  // Filter completed/all orders by the selected analytics range
  const rangedCompleted = React.useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    return restOrders.filter(o => {
      if (o.status !== 'Completed' || !o.timestamp) return false;
      const orderDate = new Date(o.timestamp).toLocaleDateString('en-CA');
      if (analyticsRange === 'Today') return orderDate === todayStr;
      if (analyticsRange === 'Week') {
        const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7);
        return new Date(o.timestamp) >= cutoff;
      }
      if (analyticsRange === 'Month') {
        const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
        return new Date(o.timestamp) >= cutoff;
      }
      return true;
    });
  }, [restOrders, analyticsRange]);

  const rangedAllOrders = React.useMemo(() => {
    const now = new Date();
    return restOrders.filter(o => {
      if (!o.timestamp) return false;
      if (analyticsRange === 'Today') {
        const todayStr = now.toLocaleDateString('en-CA');
        return new Date(o.timestamp).toLocaleDateString('en-CA') === todayStr;
      }
      if (analyticsRange === 'Week') {
        const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7);
        return new Date(o.timestamp) >= cutoff;
      }
      if (analyticsRange === 'Month') {
        const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
        return new Date(o.timestamp) >= cutoff;
      }
      return true;
    });
  }, [restOrders, analyticsRange]);

  const todayRevenue = React.useMemo(() => rangedCompleted.reduce((s, o) => s + (o.total || 0), 0), [rangedCompleted]);
  const avgOrderValue = React.useMemo(() => rangedCompleted.length > 0 ? todayRevenue / rangedCompleted.length : 0, [rangedCompleted, todayRevenue]);
  const cancelRate = React.useMemo(() => rangedAllOrders.length > 0 ? Math.round((rangedAllOrders.filter(o => o.status === 'Cancelled').length / rangedAllOrders.length) * 100) : 0, [rangedAllOrders]);

  // Previous period's metrics for comparison (adapts to selected range)
  const prevPeriodMetrics = React.useMemo(() => {
    const now = new Date();
    
    if (analyticsRange === 'Today') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');
  
      const prevCompleted = restOrders.filter(o => {
        if (o.status !== 'Completed' || !o.timestamp) return false;
        return new Date(o.timestamp).toLocaleDateString('en-CA') === yesterdayStr;
      });
  
      const prevAll = restOrders.filter(o => {
        if (!o.timestamp) return false;
        return new Date(o.timestamp).toLocaleDateString('en-CA') === yesterdayStr;
      });
  
      const prevRevenue = prevCompleted.reduce((s, o) => s + (o.total || 0), 0);
      const prevAvg = prevCompleted.length > 0 ? prevRevenue / prevCompleted.length : 0;
      const prevCancelRate = prevAll.length > 0 ? Math.round((prevAll.filter(o => o.status === 'Cancelled').length / prevAll.length) * 100) : 0;
  
      return { revenue: prevRevenue, orders: prevCompleted.length, avgOrder: prevAvg, cancelRate: prevCancelRate };
    }
    
    // For Week and Month
    const prevStart = new Date(now);
    const prevEnd = new Date(now);
    
    if (analyticsRange === 'Week') {
      prevStart.setDate(now.getDate() - 14);
      prevEnd.setDate(now.getDate() - 7);
    } else { // Month
      prevStart.setDate(now.getDate() - 60);
      prevEnd.setDate(now.getDate() - 30);
    }
    
    const prevCompleted = restOrders.filter(o => {
      if (o.status !== 'Completed' || !o.timestamp) return false;
      const t = new Date(o.timestamp);
      return t >= prevStart && t < prevEnd;
    });
    
    const prevAll = restOrders.filter(o => {
      if (!o.timestamp) return false;
      const t = new Date(o.timestamp);
      return t >= prevStart && t < prevEnd;
    });
    
    const prevRevenue = prevCompleted.reduce((s, o) => s + (o.total || 0), 0);
    const prevAvg = prevCompleted.length > 0 ? prevRevenue / prevCompleted.length : 0;
    const prevCancelRate = prevAll.length > 0 ? Math.round((prevAll.filter(o => o.status === 'Cancelled').length / prevAll.length) * 100) : 0;
    
    return { revenue: prevRevenue, orders: prevCompleted.length, avgOrder: prevAvg, cancelRate: prevCancelRate };
  }, [restOrders, analyticsRange]);

  // Helper: compute % change (capped at ±999 to avoid Infinity)
  const pctChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const trendRevenue = pctChange(todayRevenue, prevPeriodMetrics.revenue);
  const trendOrders = pctChange(rangedCompleted.length, prevPeriodMetrics.orders);
  const trendAvg = pctChange(avgOrderValue, prevPeriodMetrics.avgOrder);
  const trendCancel = pctChange(cancelRate, prevPeriodMetrics.cancelRate);

  // Dish order counts
  const dishRanking = React.useMemo(() => {
    const dishCounts = {};
    const dishRevenue = {};
    rangedCompleted.forEach(order => {
      (order.items || []).forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + 1;
        dishRevenue[item.name] = (dishRevenue[item.name] || 0) + Number(item.price || 0);
      });
    });
    return Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count, revenue: dishRevenue[name] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rangedCompleted]);

  const totalOrderedItems = React.useMemo(() => dishRanking.reduce((s, d) => s + d.count, 0), [dishRanking]);

  // Revenue chart — adapts to selected range
  const weekData = React.useMemo(() => {
    const days = analyticsRange === 'Month' ? 30 : analyticsRange === 'Week' ? 7 : 1;
    return [...Array(days)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dayStr = d.toLocaleDateString('en-CA');
      const dayOrders = restOrders
        .filter(o => o.status === 'Completed' && o.timestamp && new Date(o.timestamp).toLocaleDateString('en-CA') === dayStr);
      const dayRev = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
      return {
        label: days === 1 ? `${d.getHours()}h` : d.toLocaleDateString('en-US', { weekday: 'short' })[0],
        value: dayRev,
        orders: dayOrders.length,
        fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  }, [restOrders, analyticsRange]);

  // Peak hours (real heatmap data)
  const peakData = React.useMemo(() => {
    const HOURS = ['10','11','12','13','14','15','16','17','18','19','20','21'];
    return HOURS.map(h => ({
      hour: h,
      value: restOrders.filter(o => o.timestamp && new Date(o.timestamp).getHours() === parseInt(h)).length
    }));
  }, [restOrders]);

  const peakMax = React.useMemo(() => Math.max(...peakData.map(d => d.value), 1), [peakData]);

  // Aggregate and calculate dynamic customer list from real-time orders
  const customerList = React.useMemo(() => {
    const map = {};
    restOrders.forEach(o => {
      const cName = o.contactName || o.contact_name;
      const cPhone = o.contactPhone || o.contact_phone;
      const oType = o.orderType || o.order_type;

      // Group by user_id first to merge anonymous past orders with newer named orders from the same guest
      const key = (o.user_id && o.user_id !== 'anonymous' ? o.user_id : null) || cPhone || cName || 'anonymous_' + o.id;
      const orderDate = new Date(o.timestamp);

      if (!map[key]) {
        let displayName = 'Guest Diner';
        if (cName) {
          displayName = cName;
        } else if (cPhone) {
          displayName = `Guest (${cPhone})`;
        } else if (o.user_id && o.user_id !== 'anonymous') {
          if (o.user_id.startsWith('guest_')) {
             displayName = 'Guest Diner';
          } else {
             displayName = `Member (${o.user_id.substring(0, 8)})`;
          }
        }

        map[key] = {
          id: key,
          name: displayName,
          phone: cPhone || 'Dine-In Guest',
          userId: o.user_id || 'anonymous',
          totalSpend: 0,
          orderCount: 0,
          lastOrder: o.timestamp,
          latestBill: Number(o.total || 0),
          latestDishes: (o.items || []).map(i => i.name).join(', '),
          orderType: oType || 'dine_in'
        };
      } else {
        // If we found a real name/phone in this order, upgrade the anonymous profile
        if (cName && (map[key].name === 'Guest Diner' || map[key].name.startsWith('Member (') || map[key].name.startsWith('Guest ('))) {
          map[key].name = cName;
        }
        if (cPhone && map[key].phone === 'Dine-In Guest') {
          map[key].phone = cPhone;
        }
      }
      
      map[key].totalSpend += Number(o.total || 0);
      map[key].orderCount += 1;
      
      // Update latest order details if this order is newer than the stored one
      if (orderDate > new Date(map[key].lastOrder)) {
        map[key].lastOrder = o.timestamp;
        map[key].latestBill = Number(o.total || 0);
        map[key].latestDishes = (o.items || []).map(i => i.name).join(', ');
        map[key].orderType = oType || 'dine_in';
      }
    });

    return Object.values(map).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [restOrders]);

  const handleExportVCF = React.useCallback(() => {
    // If none selected, export all
    const targets = selectedCustomerIds.length > 0 
      ? customerList.filter(c => selectedCustomerIds.includes(c.id))
      : customerList;
      
    let vcfContent = '';
    targets.forEach(c => {
      vcfContent += 'BEGIN:VCARD\n';
      vcfContent += 'VERSION:3.0\n';
      vcfContent += `FN:${c.name}\n`;
      if (c.phone && c.phone !== 'Dine-In Guest' && c.phone !== '') {
        vcfContent += `TEL;TYPE=CELL:${c.phone}\n`;
      }
      vcfContent += 'END:VCARD\n';
    });

    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [customerList, selectedCustomerIds]);

  const uniqueCustomers = customerList.length;
  const repeatCustomers = customerList.filter(c => c.orderCount > 1).length;
  const avgLifetimeValue = uniqueCustomers > 0 ? (completed.reduce((s, o) => s + (o.total || 0), 0) / uniqueCustomers) : 0;

  const reviewOrders = React.useMemo(() => {
    return restOrders
      .filter(o => o.review_rating)
      .map(o => ({
        id: o.id,
        rating: o.review_rating,
        diner_name: o.review_name || o.contactName || o.contact_name || 'Anonymous Diner',
        created_at: o.reviewed_at || o.timestamp
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [restOrders]);

  const satisfactionScore = React.useMemo(() => {
    if (reviewOrders.length === 0) return '0.0';
    const totalRating = reviewOrders.reduce((sum, r) => sum + r.rating, 0);
    return (totalRating / reviewOrders.length).toFixed(1);
  }, [reviewOrders]);

  const vendDishes = dishes.filter(d => (d.restId === activeRestId || d.rest_id === activeRestId) && !d.tags?.includes('event') && !d.tags?.includes('_categories_metadata'));
  const vendEvents = dishes.filter(d => (d.restId === activeRestId || d.rest_id === activeRestId) && d.tags?.includes('event'));

  const metadataRecord = dishes.find(d => d.tags?.includes('_categories_metadata') && (d.restId === activeRestId || d.rest_id === activeRestId));
  const customCategories = metadataRecord?.macros?.categories || ['Starters', 'Mains', 'Desserts', 'Drinks', 'Vegan'];

  const [localDisplayDishes, setLocalDisplayDishes] = React.useState([]);

  React.useEffect(() => {
    let display = [...vendDishes].sort((a, b) => (a.macros?.sort_order || 0) - (b.macros?.sort_order || 0));
    if (selectedEditCategory === '__uncategorised__') {
      display = display.filter(d => !customCategories.some(cat => d.tags?.includes(cat)));
    } else if (selectedEditCategory !== 'All') {
      display = display.filter(d => d.tags?.includes(selectedEditCategory));
    }
    setLocalDisplayDishes(display);
  }, [vendDishes, selectedEditCategory, customCategories]);

  const handleReorderDishes = (newOrder) => {
    setLocalDisplayDishes(newOrder);
    newOrder.forEach((dish, index) => {
      if ((dish.macros?.sort_order || 0) !== index) {
        updateDish(dish.id, {
          ...dish,
          macros: { ...(dish.macros || {}), sort_order: index }
        });
      }
    });
  };

  const FULL_TAB_CONFIG = [
    { key: 'orders',    icon: ListOrdered,  label: 'Kitchen',  badge: pendingVerification.length + pending.length + prep.length },
    { key: 'floor',     icon: Bell,         label: 'Floor',    badge: serviceAlerts.length },
    { key: 'analytics', icon: BarChart2,    label: 'Analytics' },
    { key: 'menu',      icon: Utensils,     label: 'Menu' },
    { key: 'growth',    icon: Zap,          label: 'Growth' },
    { key: 'customers', icon: Users,        label: 'Customers' },
    { key: 'events',    icon: Calendar,     label: 'Events' },
    { key: 'editmenu',  icon: BookOpen,     label: 'Edit Menu' },
    { key: 'qr',        icon: QrIcon,       label: 'Tables' },
    { key: 'settings',  icon: Settings,     label: 'Settings' },
  ];

  const TAB_CONFIG = isStaffMode 
    ? FULL_TAB_CONFIG.filter(t => ['orders', 'floor', 'menu'].includes(t.key)) 
    : FULL_TAB_CONFIG;
    
  React.useEffect(() => {
    if (isStaffMode && !['orders', 'floor', 'menu'].includes(vendorTab)) {
      setVendorTab('orders');
    }
  }, [isStaffMode, vendorTab]);

  const handlePrintBill = React.useCallback((order) => {
    // If contactName is empty, fallback to contact_name, user_id, or Guest
    const customerName = order.contactName || order.contact_name || order.user_id || 'Guest';
    const printDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const printTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const restName = currentRestaurant?.name || 'Restaurant';

    const itemsHtml = (order.items || []).map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
        <span style="flex: 1;">${item.quantity || 1} x ${item.name}</span>
        <span>${(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
      </div>
    `).join('');

    const subtotal = (order.items || []).reduce((acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)), 0);
    const taxRate = currentRestaurant?.taxRate !== undefined ? currentRestaurant.taxRate / 100 : 0.08;
    const taxAmount = subtotal * taxRate;
    const totalAmount = (order.total || (subtotal + taxAmount)).toFixed(2);

    const orderNumber = getOrderNumber(order);
    const serverName = user?.email?.split('@')[0] || 'Staff';
    const orderTypeStr = order.orderType === 'dine_in' ? '*Dine In*' : '*Carry Out*';

    const htmlContent = `
      <html>
        <head>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 0; padding: 10px; }
            }
            body {
              font-family: monospace;
              width: 300px;
              color: #000;
              background: #fff;
              padding: 10px;
              margin: 0;
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              color: #1a60b9;
            }
            .sub-header {
              text-align: center;
              font-size: 12px;
              margin-bottom: 10px;
            }
            .info {
              font-size: 12px;
              margin-bottom: 10px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .items {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
              margin-bottom: 10px;
            }
            .totals {
              font-size: 14px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .due {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
            }
            .tax-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${restName.toUpperCase()}
          </div>
          <div class="sub-header">
            Order Slip<br/>
            ${orderNumber}<br/>
            Order: ${order.id.slice(-4)}
          </div>
          <div class="info">
            <div>${printDate} &nbsp; ${printTime}</div>
            <div>Server: ${serverName.toUpperCase()}</div>
            <div style="font-weight:bold; font-size:14px; margin-top:5px;">${orderTypeStr}</div>
            <div style="margin-top:5px; border-bottom: 1px dashed #000; width: 100%; text-align:center; padding-bottom:5px;">
              ${customerName}
            </div>
          </div>
          <div class="items">
            ${itemsHtml}
          </div>
          <div class="tax-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div class="tax-row">
            <span>Tax (${Math.round(taxRate * 100)}%)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div class="totals">
            <span>Total</span>
            <span>${totalAmount}</span>
          </div>
          <div class="due">
            <span>Cash</span>
            <span>${totalAmount}</span>
          </div>
          <div class="due">
            <span>Due</span>
            <span>0.00</span>
          </div>
          <div style="text-align: center; margin-top: 15px; font-weight: bold; color: #1a60b9;">
            ${restName.toUpperCase()}
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(htmlContent);
    iframe.contentWindow.document.close();
    
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  }, [currentRestaurant, getOrderNumber, user]);

  if (isStaffMode) {
    return (
      <StaffDashboard
        isStaffMode={isStaffMode}
        setIsStaffMode={setIsStaffMode}
        serviceAlerts={serviceAlerts}
        setServiceAlerts={setServiceAlerts}
        restOrders={restOrders}
        updateOrder={updateOrder}
        tableCount={tableCount}
        GOLD={GOLD}
        goldGradient={goldGradient}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white relative">
      
      {/* ── SERVICE ALERTS ── */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {serviceAlerts.slice(0, 5).map((alert, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[280px]"
              style={{ background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 10px 40px rgba(0,0,0,0.9)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <Bell size={20} style={{ color: GOLD }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: GOLD }}>Table {alert.tableNumber}</p>
                <p className="text-sm font-black text-white">{alert.type}</p>
              </div>
              <button onClick={() => setServiceAlerts(prev => prev.filter((_, i) => i !== idx))} className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <CheckCircle size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── HEADER ── */}
      <div
        className="px-5 py-3 flex justify-between items-center z-10 shrink-0 backdrop-blur-xl bg-white dark:bg-black/95 border-b border-neutral-200 dark:border-[rgba(212,175,55,0.2)] shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: goldGradient, boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}
          >
            <Store size={18} className="text-black" />
          </div>
          <div>
            <h1 className="font-display font-black text-base leading-tight text-neutral-900 dark:text-white">{currentRestaurant?.name || 'Dashboard'}</h1>
            <p className="text-[11px] flex items-center gap-1.5 text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />
              {user?.email || 'Synced to Cloud'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsStaffMode(!isStaffMode)}
            className="flex items-center gap-1.5 text-[10px] font-black px-3 py-2 rounded-xl transition-all uppercase tracking-widest"
            style={isStaffMode ? { background: '#D4AF37', color: '#000' } : { background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}
          >
            {isStaffMode ? 'Exit Staff Mode' : 'Staff Mode'}
          </button>
          <button onClick={toggleTheme}
            className="p-2 rounded-xl transition-colors"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div
        className="flex shrink-0 overflow-x-auto no-scrollbar bg-neutral-100 dark:bg-black border-b border-neutral-200 dark:border-[rgba(212,175,55,0.15)]"
      >
        {TAB_CONFIG.map(tab => (
          <button key={tab.key} onClick={() => setVendorTab(tab.key)}
            className={`relative px-4 py-3.5 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${vendorTab !== tab.key ? 'text-neutral-500 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white' : ''}`}
            style={{
              borderBottom: vendorTab === tab.key ? `2px solid ${GOLD}` : '2px solid transparent',
              color: vendorTab === tab.key ? GOLD : 'inherit',
              background: vendorTab === tab.key ? 'rgba(212,175,55,0.06)' : 'transparent',
            }}
          >
            <tab.icon size={14} /> {tab.label}
            {tab.badge > 0 && (
              <span className="absolute top-2 right-1 w-4 h-4 rounded-full text-black text-[8px] font-black flex items-center justify-center"
                style={{ background: goldGradient }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-hidden relative bg-neutral-50 dark:bg-black">
        <AnimatePresence>

          {/* ════════════════════ KITCHEN DISPLAY ════════════════════ */}
          {vendorTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-x-auto p-5 flex gap-4 items-start">

              {/* Skeleton lanes — shown until orders data is ready */}
              {!isDataLoaded && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-72 shrink-0 rounded-2xl border border-neutral-200 dark:border-white/6 overflow-hidden">
                      <div className="sk h-12 rounded-none" />
                      <div className="p-3 space-y-3">
                        {Array.from({ length: 2 }).map((__, j) => <OrderLaneSkeleton key={j} />)}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Pending Verification */}
              <div className="w-72 shrink-0 bg-white dark:bg-[#12141D] rounded-2xl border border-amber-200 dark:border-amber-900/40 flex flex-col max-h-full overflow-hidden shadow-sm">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 flex justify-between items-center">
                  <span className="font-display font-black text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2"><Clock size={14} /> Verify Table</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">{pendingVerification.length}</span>
                </div>
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  <AnimatePresence>
                    {pendingVerification.map(o => (
                      <motion.div layout key={o.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-[#1a1a1f] border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-sm">{getOrderNumber(o)}</span>
                            {(o.table_number || o.tableNumber) && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
                                T{o.table_number || o.tableNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                            {o.orderType === 'dine_in' ? 'DINE-IN' : 'PRE-ORDER'}
                          </span>
                        </div>
                        <ul className="text-xs font-semibold space-y-1 mb-3 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-[#0d0d10]/60 p-2 rounded-lg border border-neutral-100 dark:border-white/5">
                          {o.items?.map((item, i) => <li key={i}>· {item.name}</li>)}
                        </ul>
                        
                        <div className="mb-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-xl p-3">
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2">
                            {o.verificationCode ? "Enter Customer Code" : "Verification Status"}
                          </p>
                          {o.verificationCode ? (
                            <div className="space-y-2">
                              <input 
                                type="text"
                                maxLength={4}
                                placeholder="Enter 4-digit code"
                                value={enteredCodes[o.id] || ''}
                                onChange={(e) => setEnteredCodes({ ...enteredCodes, [o.id]: e.target.value })}
                                className="w-full text-center bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-lg py-2 font-mono font-bold text-lg tracking-[0.25em] focus:outline-none focus:border-[#D4AF37] text-neutral-900 dark:text-white"
                              />
                              <p className="text-[10px] text-center font-semibold text-neutral-400">
                                { (enteredCodes[o.id] || '').length === 4 ? (
                                    (enteredCodes[o.id] === o.verificationCode) ? (
                                      <span className="text-emerald-500">✓ Code matches</span>
                                    ) : (
                                      <span className="text-red-500">✕ Code mismatch</span>
                                    )
                                  ) : "Code required to approve"
                                }
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-amber-500">
                              ⚠️ No code generated. Tap Approve to bypass verification.
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button 
                            disabled={o.verificationCode ? enteredCodes[o.id] !== o.verificationCode : false}
                            onClick={() => updateOrderStatus(o.id, 'Pending')} 
                            className="flex-1 py-2.5 rounded-lg text-xs font-black bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:hover:bg-emerald-500"
                          >
                            ✓ Approve
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(o.id, 'Cancelled')} 
                            className="flex-1 py-2.5 rounded-lg text-xs font-black bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {pendingVerification.length === 0 && <p className="text-center py-4 text-xs text-neutral-400">All clear!</p>}
                  </AnimatePresence>
                </div>
              </div>

              {/* Standard lanes */}
              {[
                { title: 'New Orders',  data: pending,   accent: 'blue',   action: 'Preparing', actionLabel: '🔥 Start Cooking' },
                { title: 'Preparing',   data: prep,      accent: 'orange',  action: 'Ready',     actionLabel: '✓ Mark Ready' },
                { title: 'Ready',       data: ready,     accent: 'emerald', action: 'Completed', actionLabel: '🏁 Complete' },
              ].map(lane => (
                <div key={lane.title} className={`w-72 shrink-0 bg-white dark:bg-[#12141D] rounded-2xl border dark:border-white/6 border-neutral-200 flex flex-col max-h-full overflow-hidden shadow-sm`}>
                  <div className={`p-4 border-b border-neutral-100 dark:border-white/6 flex justify-between items-center`}>
                    <span className="font-display font-black text-sm">{lane.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-neutral-100 dark:bg-white/8 text-neutral-600 dark:text-neutral-400">{lane.data.length}</span>
                  </div>
                  <div className="p-3 space-y-3 overflow-y-auto flex-1">
                    <AnimatePresence>
                      {lane.data.map(o => (
                        <motion.div layout key={o.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white dark:bg-[#1a1a1f] border border-neutral-100 dark:border-white/5 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-sm">{getOrderNumber(o)}</span>
                              {(o.table_number || o.tableNumber) && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
                                  T{o.table_number || o.tableNumber}
                                </span>
                              )}
                            </div>
                            {o.orderType === 'prepaid' && <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">DUE {o.scheduledTime}</span>}
                            {o.orderType === 'dine_in' && <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">DINE-IN</span>}
                          </div>
                          <ul className="text-xs font-semibold space-y-1 mb-3 text-neutral-600 dark:text-neutral-400">
                            {o.items?.map((item, i) => <li key={i}>· {item.name}</li>)}
                          </ul>
                          {o.metadata?.specialInstructions && (
                            <div className="mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-0.5 flex items-center gap-1"><AlertTriangle size={10}/> Special Instructions</p>
                              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">{o.metadata.specialInstructions}</p>
                            </div>
                          )}
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black text-emerald-600">₹{(o.total || 0).toFixed(2)}</span>
                            {o.paymentStatus === 'Unpaid' && <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">COLLECT CASH</span>}
                          </div>
                          <button onClick={() => updateOrderStatus(o.id, lane.action)}
                            className="w-full py-2.5 rounded-xl text-xs font-black bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
                            {lane.actionLabel}
                          </button>
                        </motion.div>
                      ))}
                      {lane.data.length === 0 && <p className="text-center py-4 text-xs text-neutral-400">No orders here</p>}
                    </AnimatePresence>
                  </div>
                </div>
              ))}

              {/* Completed summary */}
              <div className="w-56 shrink-0 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-4 flex flex-col gap-3">
                <p className="font-display font-black text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2"><CheckCircle size={14} /> Completed Today</p>
                <p className="font-display font-black text-4xl text-emerald-600 dark:text-emerald-400">{completed.length}</p>
                <p className="text-xs font-bold text-emerald-700/60 dark:text-emerald-500">Revenue: <span className="text-emerald-600 dark:text-emerald-400">₹{todayRevenue.toFixed(2)}</span></p>
                <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/40 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {completed.slice(-10).reverse().map(o => (
                    <div key={o.id} className="flex flex-col gap-1 text-xs text-emerald-700/70 dark:text-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/20 p-2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{getOrderNumber(o)}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">₹{(o.total||0).toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => handlePrintBill(o)}
                        className="flex items-center justify-center gap-1 w-full py-1.5 mt-1 bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 rounded text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-800 transition-colors"
                      >
                        <Printer size={12} /> Print Bill
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ FLOOR & SERVICE HUB ════════════════════ */}
          {vendorTab === 'floor' && (
            <motion.div key="floor" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="font-display font-black text-2xl">Live Floor Plan</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">Real-time table status and service requests</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-500">Total Tables:</span>
                    <input type="number" value={tableCount} onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-center" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: tableCount }).map((_, i) => {
                    const tNum = String(i + 1);
                    const tableAlerts = serviceAlerts.filter(a => String(a.tableNumber) === tNum);
                    const activeTableOrders = restOrders.filter(o => String(o.tableNumber) === tNum && (o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready'));
                    
                    let status = 'available'; // available, occupied, service
                    if (tableAlerts.length > 0) status = 'service';
                    else if (activeTableOrders.length > 0) status = 'occupied';
                    
                    const statusConfig = {
                      available: { bg: 'bg-neutral-50 dark:bg-white/[0.02]', border: 'border-neutral-200 dark:border-white/5', text: 'text-neutral-500', icon: null },
                      occupied: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-500', icon: <Utensils size={14}/> },
                      service: { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-300 dark:border-amber-500/30', text: 'text-amber-500', icon: <Bell size={14} className="animate-pulse" /> }
                    };
                    const sc = statusConfig[status];
                    
                    return (
                      <motion.div key={i} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                        className={`relative p-5 rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all ${sc.bg} ${sc.border}`}>
                        
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-black text-xl border-4 ${status === 'available' ? 'border-neutral-200 dark:border-white/10 text-neutral-400' : status === 'occupied' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' : 'border-amber-500/30 text-amber-500 bg-amber-500/10'}`}>
                          {tNum}
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${sc.text}`}>
                            {status === 'service' ? 'Needs Service' : status}
                          </span>
                          {activeTableOrders.length > 0 && (
                            <span className="text-xs font-bold text-neutral-400 mt-0.5">{activeTableOrders.length} Order(s)</span>
                          )}
                        </div>
                        
                        {tableAlerts.length > 0 && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                            <Bell size={12} />
                          </div>
                        )}
                        
                        {status === 'service' && (
                          <button onClick={() => setServiceAlerts(prev => prev.filter(a => String(a.tableNumber) !== tNum))}
                            className="mt-2 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase rounded-xl transition-colors">
                            Resolve All
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {serviceAlerts.length > 0 && (
                  <div className="mt-8 bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-display font-black text-lg mb-4">Active Service Requests Log</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <AnimatePresence>
                        {serviceAlerts.map((alert, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                <Bell size={18} className="text-amber-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Table {alert.tableNumber}</p>
                                <p className="font-bold text-sm text-neutral-900 dark:text-white">{alert.type}</p>
                              </div>
                            </div>
                            <button onClick={() => setServiceAlerts(prev => prev.filter((_, i) => i !== idx))}
                              className="w-full py-2.5 rounded-xl bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-white font-black text-xs hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors">
                              Mark as Resolved
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════════════ ANALYTICS HUB ════════════════════ */}
          {vendorTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6">
              {!hasPro ? <UpgradeLock requiredPlan="Pro" feature="Analytics Hub" activeRestId={activeRestId} upgradePlan={upgradePlan} showNotification={showNotification} /> : (
              <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-display font-black text-2xl">Analytics Hub</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Deep insights into your restaurant's performance</p>
                  </div>
                  <div className="flex gap-2">
                    {['Today','Week','Month'].map(r => (
                      <button key={r} onClick={() => setAnalyticsRange(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${analyticsRange === r ? 'bg-neutral-900 dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-500'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KPI Grid — skeleton while data loads */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {!isDataLoaded ? (
                    Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
                  ) : (
                    <>
                      <KpiCard icon={DollarSign}   label={`${analyticsRange === 'Today' ? "Today's" : analyticsRange === 'Week' ? "This Week's" : "This Month's"} Revenue`}  value={`₹${todayRevenue.toFixed(0)}`}     color="bg-emerald-500" trend={trendRevenue} />
                      <KpiCard icon={ShoppingBag}  label="Orders Completed" value={rangedCompleted.length}                  color="bg-blue-500"    trend={trendOrders} />
                      <KpiCard icon={TrendingUp}   label="Avg Order Value"  value={`₹${avgOrderValue.toFixed(0)}`}   color="bg-purple-500"  trend={trendAvg} />
                      <KpiCard icon={XCircle}      label="Cancellation Rate" value={`${cancelRate}%`}                 color="bg-red-500"     trend={trendCancel} />
                    </>
                  )}
                </div>

                {/* Revenue Chart + Order Split */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display font-black text-base">Revenue — {analyticsRange === 'Today' ? 'Today' : analyticsRange === 'Week' ? '7 Days' : '30 Days'}</h3>
                      <span className="text-xs font-semibold text-neutral-400">
                        vs prev. {analyticsRange === 'Today' ? 'day' : analyticsRange === 'Week' ? 'week' : 'month'} <span className={`${trendRevenue >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{trendRevenue >= 0 ? '↑' : '↓'} {Math.abs(trendRevenue)}%</span>
                      </span>
                    </div>
                    <MiniBarChart data={weekData} color="#3B82F6" height={100} />
                    <div className="mt-2 text-center text-[10px] text-neutral-400 font-medium">Total: ₹{todayRevenue.toFixed(2)}</div>
                  </div>
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-display font-black text-base mb-6">Order Types</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Dine-In',  count: restOrders.filter(o => o.orderType === 'dine_in').length, color: 'bg-blue-500' },
                        { label: 'Pre-Order', count: restOrders.filter(o => o.orderType === 'prepaid').length, color: 'bg-purple-500' },
                      ].map(type => {
                        const pct = restOrders.length > 0 ? Math.round((type.count / restOrders.length) * 100) : 0;
                        return (
                          <div key={type.label}>
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                              <span className="text-neutral-600 dark:text-neutral-400">{type.label}</span>
                              <span className="text-neutral-900 dark:text-white">{pct}% ({type.count})</span>
                            </div>
                            <div className="h-2 rounded-full bg-neutral-100 dark:bg-white/5 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                                className={`h-full rounded-full ${type.color}`} />
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-4 border-t border-neutral-50 dark:border-white/5">
                        <p className="text-xs text-neutral-500">Total orders: <span className="font-black text-neutral-900 dark:text-white">{restOrders.length}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dish Popularity Ranking */}
                <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-display font-black text-base">Dish Popularity Ranking</h3>
                    <span className="text-xs text-neutral-400">by order count</span>
                  </div>
                  {dishRanking.length > 0 ? (
                    <div>
                      {dishRanking.map((d, i) => (
                        <PopularityRow key={d.name} rank={i + 1} name={d.name} count={d.count}
                          revenue={d.revenue} total={totalOrderedItems}
                          badge={i === 0 ? 'Top Seller' : undefined} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-neutral-400">
                      <BarChart2 size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Complete some orders to see dish analytics</p>
                    </div>
                  )}
                </div>

                {/* Peak Hours Heatmap */}
                <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-base mb-5">Peak Hours Heatmap</h3>
                  <div className="flex gap-2 items-end">
                    {peakData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${(d.value / peakMax) * 80 + 8}px` }}
                          transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
                          className="w-full rounded-t-lg"
                          style={{ background: d.value / peakMax > 0.7 ? '#EF4444' : d.value / peakMax > 0.4 ? '#F97316' : '#3B82F6', opacity: 0.6 + (d.value / peakMax) * 0.4 }}
                        />
                        <span className="text-[9px] font-bold text-neutral-400">{d.hour}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-4 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500 opacity-70" />Low</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-500 opacity-80" />Medium</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" />Peak</span>
                  </div>
                </div>

                {/* Quick metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 text-center shadow-sm">
                    <p className="font-display font-black text-3xl text-blue-500">{uniqueCustomers}</p>
                    <p className="text-xs font-bold text-neutral-500 mt-1">Unique Customers</p>
                  </div>
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 text-center shadow-sm">
                    <p className="font-display font-black text-3xl text-purple-500">{repeatCustomers}</p>
                    <p className="text-xs font-bold text-neutral-500 mt-1">Repeat Guests</p>
                  </div>
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 text-center shadow-sm">
                    <p className="font-display font-black text-3xl text-emerald-500">{vendDishes.length}</p>
                    <p className="text-xs font-bold text-neutral-500 mt-1">Active Dishes</p>
                  </div>
                </div>
                
                {/* Reviews Analytics */}
                <ReviewsAnalytics reviews={reviewOrders} />

              </div>
              )}
            </motion.div>
          )}

          {/* ── ════════════════════ MENU MANAGER ════════════════════ ── */}
          {vendorTab === 'menu' && !editingDish && (
            managingCategories ? (
              <motion.div key="categories-manager" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="font-display font-black text-2xl">Manage Categories & Filters</h2>
                      <p className="text-sm text-neutral-500 mt-0.5">Define custom menu tabs and see dishes assigned to them.</p>
                    </div>
                    <button onClick={() => setManagingCategories(false)}
                      className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors">
                      <CloseIcon size={18} />
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 mb-6">
                    <h3 className="text-sm font-bold mb-3">Add New Category Filter</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newCategoryName.trim()) return;
                      const trimmed = newCategoryName.trim();
                      if (customCategories.includes(trimmed)) {
                        showNotification("Category already exists!");
                        return;
                      }
                      const updated = [...customCategories, trimmed];
                      
                      const payload = {
                        name: "_categories_metadata",
                        price: 0,
                        description: "Metadata for custom categories",
                        tags: ["_categories_metadata"],
                        macros: { categories: updated }
                      };

                      let success = false;
                      if (metadataRecord?.id) {
                        const res = await updateDish(metadataRecord.id, payload);
                        success = res !== null;
                      } else {
                        const res = await addDish({
                          ...payload,
                          restId: activeRestId
                        });
                        success = res !== null;
                      }

                      if (success) {
                        setNewCategoryName('');
                        showNotification(`Category "${trimmed}" added!`);
                      }
                    }} className="flex gap-2">
                      <input
                        required
                        type="text"
                        placeholder="e.g. Seafood, Soups, Chef's Specials..."
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="flex-1 bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white"
                      />
                      <button type="submit" className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center gap-1.5">
                        <Plus size={16} /> Add
                      </button>
                    </form>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider">Active Categories</h3>
                    {customCategories.length === 0 ? (
                      <p className="text-neutral-500 text-sm">No custom categories defined.</p>
                    ) : (
                      customCategories.map((cat) => {
                        let catDishes = vendDishes.filter(d => d.tags?.includes(cat));
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

                        return (
                          <div key={cat} className="bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-2xl p-5">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h4 className="font-bold text-lg text-neutral-900 dark:text-white">{cat}</h4>
                                <p className="text-xs text-neutral-500">{catDishes.length} dishes in this category</p>
                              </div>
                              <button
                                onClick={() => {
                                  if (catDishes.length > 0) {
                                    setCategoryToDelete({ name: cat, dishesCount: catDishes.length, error: true });
                                  } else {
                                    setCategoryToDelete({ name: cat, dishesCount: 0, error: false });
                                  }
                                }}
                                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 transition-colors"
                              >
                                <Trash2 size={13} /> Delete Filter
                              </button>
                            </div>

                            {catDishes.length === 0 ? (
                              <p className="text-xs text-neutral-400 italic">No dishes assigned to this category. Edit a dish and select this tag to assign it.</p>
                            ) : (
                              <CategoryReorderList 
                                cat={cat} 
                                initialDishes={catDishes} 
                                metadataRecord={metadataRecord} 
                                updateDish={updateDish} 
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute inset-0 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="font-display font-black text-2xl">Menu Manager</h2>
                      <p className="text-sm text-neutral-500 mt-0.5">{vendDishes.length} dishes · {vendDishes.filter(d => !d.tags?.includes('hidden')).length} visible</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setManagingCategories(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-sm font-bold hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors">
                        <Filter size={16} /> Manage Categories
                      </button>
                      <input type="file" accept="image/*,.pdf" capture="environment" className="hidden" id="ai-menu-upload" onChange={handleOCRUpload} />
                      <label htmlFor="ai-menu-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-black hover:bg-[#D4AF37]/20 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                        <Sparkles size={16} /> Import Menu (AI)
                      </label>
                      <button onClick={() => setEditingDish({ name: '', price: '', description: '', modelUrl: '', chef: '', prepTime: '', origin: '', serves: '', images: [], tags: [], macros: { calories: '', protein: '', carbs: '', fat: '' }, allergens: [], ingredients: [] })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity">
                        <Plus size={16} /> Add Dish
                      </button>
                    </div>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendDishes.map(dish => {
                    const isSoldOut = dish.tags?.includes('sold_out');
                    const isHidden = dish.tags?.includes('hidden');
                    return (
                      <div key={dish.id} className={`bg-white dark:bg-[#12141D] border rounded-3xl overflow-hidden shadow-sm transition-opacity ${isHidden ? 'opacity-50' : ''} border-neutral-100 dark:border-white/6`}>
                        <div className="relative h-36 bg-neutral-100 dark:bg-[#1a1a1f] overflow-hidden">
                          {(dish.cover || dish.images?.[0])
                            ? <img src={dish.cover || dish.images[0]} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><ChefHat size={32} className="text-neutral-300" /></div>
                          }
                          {isSoldOut && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="font-display font-black text-white text-lg tracking-wider">SOLD OUT</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            {(dish.modelUrl || dish.model_url) && (
                              <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-black flex items-center gap-1 backdrop-blur-sm">
                                <Box size={9} /> 3D
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 pr-2">
                              <h3 className="font-bold text-sm leading-tight">{dish.name}</h3>
                              <p className="text-xs text-neutral-500 mt-0.5">{dish.chef || 'Chef of House'}</p>
                            </div>
                            <span className="font-display font-black text-base text-[#D4AF37]">₹{Number(dish.price).toFixed(2)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {dish.tags?.filter(t => t !== 'sold_out' && t !== 'hidden').slice(0,3).map(t => (
                              <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500">{t}</span>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button onClick={() => setEditingDish(dish)}
                              className="py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity flex items-center justify-center gap-1">
                              <Edit2 size={11} /> Edit
                            </button>
                            <button onClick={async () => {
                              const newTags = isSoldOut
                                ? (dish.tags || []).filter(t => t !== 'sold_out')
                                : [...(dish.tags || []), 'sold_out'];
                              await updateDish(dish.id, { tags: newTags });
                            }}
                              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${isSoldOut ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500'}`}>
                              <Package size={11} /> {isSoldOut ? 'Restore' : 'Sold Out'}
                            </button>
                            <button onClick={async () => {
                              const newTags = isHidden
                                ? (dish.tags || []).filter(t => t !== 'hidden')
                                : [...(dish.tags || []), 'hidden'];
                              await updateDish(dish.id, { tags: newTags });
                            }}
                              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${isHidden ? 'bg-neutral-200 dark:bg-white/10 text-neutral-700' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500'}`}>
                              {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                              {isHidden ? 'Hidden' : 'Visible'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {vendDishes.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-neutral-400">
                      <ChefHat size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-display font-bold text-lg">No dishes yet</p>
                      <p className="text-sm mt-1">Add your first dish to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* ── EDIT MENU TAB ── */}
          {vendorTab === 'editmenu' && (
            <motion.div key="editmenu" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex overflow-hidden">

              {/* ── LEFT: Category Sidebar ── */}
              <div className="w-52 shrink-0 border-r border-neutral-200 dark:border-white/8 bg-white dark:bg-[#0d0d10] overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-neutral-100 dark:border-white/5">
                  <h2 className="font-display font-black text-base">Edit Menu</h2>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{vendDishes.length} dishes</p>
                </div>

                {/* Add Dish shortcut */}
                <button
                  onClick={() => { setEditingDish({ name: '', price: '', description: '', modelUrl: '', chef: '', prepTime: '', origin: '', serves: '', images: [], tags: [], macros: { calories: '', protein: '', carbs: '', fat: '' }, allergens: [], ingredients: [] }); setVendorTab('menu'); }}
                  className="mx-3 mt-3 mb-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} /> Add Dish
                </button>

                <nav className="flex flex-col gap-0.5 p-2 flex-1">
                  {/* All category */}
                  {[{ key: 'All', label: 'All', count: vendDishes.length }, ...customCategories.map(cat => ({ key: cat, label: cat, count: vendDishes.filter(d => d.tags?.includes(cat)).length }))].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedEditCategory(cat.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                        selectedEditCategory === cat.key
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                        selectedEditCategory === cat.key
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                          : 'bg-neutral-100 dark:bg-white/8 text-neutral-400'
                      }`}>{cat.count}</span>
                    </button>
                  ))}

                  {/* Uncategorised bucket */}
                  {(() => {
                    const uncatCount = vendDishes.filter(d => !customCategories.some(cat => d.tags?.includes(cat))).length;
                    return uncatCount > 0 ? (
                      <button
                        onClick={() => setSelectedEditCategory('__uncategorised__')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                          selectedEditCategory === '__uncategorised__'
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate italic">Uncategorised</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                          selectedEditCategory === '__uncategorised__'
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                            : 'bg-neutral-100 dark:bg-white/8 text-neutral-400'
                        }`}>{uncatCount}</span>
                      </button>
                    ) : null;
                  })()}
                </nav>
              </div>

              {/* ── RIGHT: Dish List ── */}
              <div className="flex-1 overflow-y-auto">
                {/* Section header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-[#0d0d10] border-b border-neutral-100 dark:border-white/5 px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-black text-base">
                      {selectedEditCategory === 'All' ? 'All Dishes'
                        : selectedEditCategory === '__uncategorised__' ? 'Uncategorised'
                        : selectedEditCategory}
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      {(() => {
                        if (selectedEditCategory === 'All') return vendDishes.length;
                        if (selectedEditCategory === '__uncategorised__') return vendDishes.filter(d => !customCategories.some(cat => d.tags?.includes(cat))).length;
                        return vendDishes.filter(d => d.tags?.includes(selectedEditCategory)).length;
                      })()} items
                    </p>
                  </div>
                </div>

                {/* Dish rows */}
                <div className="divide-y divide-neutral-100 dark:divide-white/5">
                  {localDisplayDishes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                      <ChefHat size={40} className="mb-3 opacity-20" />
                      <p className="font-bold">No dishes here</p>
                      <p className="text-xs mt-1">Add a dish or assign one to this category</p>
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={localDisplayDishes} onReorder={handleReorderDishes}>
                      {localDisplayDishes.map(dish => {
                        const isSoldOut = dish.tags?.includes('sold_out');
                        const isHidden  = dish.tags?.includes('hidden');
                        return (
                          <Reorder.Item
                            key={dish.id}
                            value={dish}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors group cursor-grab active:cursor-grabbing ${
                              isHidden ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white shrink-0">
                              <GripVertical size={18} />
                            </div>

                            {/* Thumbnail */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 shrink-0 border border-neutral-200 dark:border-white/5 pointer-events-none">
                              {(dish.cover || dish.images?.[0])
                                ? <img src={dish.cover || dish.images[0]} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><ChefHat size={20} className="text-neutral-300" /></div>
                              }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 pointer-events-none">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">{dish.name}</span>
                                {isSoldOut && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600">SOLD OUT</span>}
                                {isHidden  && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-neutral-200 dark:bg-white/10 text-neutral-500">HIDDEN</span>}
                                {(dish.modelUrl || dish.model_url) && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-500">3D</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="font-display font-black text-sm text-[#D4AF37]">₹{Number(dish.price).toFixed(2)}</span>
                                <span className="text-[11px] text-neutral-400">{dish.chef || 'Chef of House'}</span>
                              </div>
                              {/* Category tags on this dish */}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {dish.tags?.filter(t => !['sold_out','hidden','event','_categories_metadata'].includes(t)).slice(0, 4).map(t => (
                                  <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/6 text-neutral-500">{t}</span>
                                ))}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingDish(dish); setVendorTab('menu'); }}
                                className="p-2 rounded-lg bg-neutral-100 dark:bg-white/8 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={async () => {
                                  const newTags = isSoldOut
                                    ? (dish.tags || []).filter(t => t !== 'sold_out')
                                    : [...(dish.tags || []), 'sold_out'];
                                  await updateDish(dish.id, { tags: newTags });
                                }}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                  isSoldOut
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                                    : 'bg-neutral-100 dark:bg-white/8 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-500'
                                }`}
                                title={isSoldOut ? 'Mark Available' : 'Mark Sold Out'}
                              >
                                <Package size={13} />
                              </button>
                              <button
                                onClick={async () => {
                                  const newTags = isHidden
                                    ? (dish.tags || []).filter(t => t !== 'hidden')
                                    : [...(dish.tags || []), 'hidden'];
                                  await updateDish(dish.id, { tags: newTags });
                                }}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                  isHidden
                                    ? 'bg-neutral-200 dark:bg-white/15 text-neutral-700 dark:text-neutral-200'
                                    : 'bg-neutral-100 dark:bg-white/8 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-500'
                                }`}
                                title={isHidden ? 'Make Visible' : 'Hide Dish'}
                              >
                                {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete "${dish.name}"? This cannot be undone.`)) {
                                    const { error } = await supabase.from('dishes').delete().eq('id', dish.id);
                                    if (!error) { setDishes(prev => prev.filter(d => d.id !== dish.id)); showNotification('Dish deleted.'); }
                                    else showNotification('Failed to delete dish.');
                                  }
                                }}
                                className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Combo Panel ── */}
              <div className="w-56 shrink-0 border-l border-neutral-200 dark:border-white/8 bg-white dark:bg-[#0d0d10] overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-neutral-100 dark:border-white/5">
                  <h2 className="font-display font-black text-sm">Combos</h2>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Dish pairing recommendations</p>
                </div>
                <button
                  onClick={() => { setComboParent(null); setComboRecs([]); setShowComboDialog(true); }}
                  className="mx-3 mt-3 mb-2 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', color: '#000' }}
                >
                  <Gift size={13} /> Make Combos
                </button>
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {vendDishes.filter(d => d.macros?.comboRecommendations?.length > 0).length === 0 && (
                    <div className="text-center py-8 text-neutral-400">
                      <Gift size={28} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[11px] font-semibold">No combos yet</p>
                      <p className="text-[10px] mt-0.5">Click "Make Combos" to pair dishes</p>
                    </div>
                  )}
                  {vendDishes.filter(d => d.macros?.comboRecommendations?.length > 0).map(parentDish => {
                    const recIds = parentDish.macros.comboRecommendations;
                    const recDishes = recIds.map(rid => vendDishes.find(d => d.id === rid)).filter(Boolean);
                    return (
                      <div key={parentDish.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black text-neutral-900 dark:text-white truncate flex-1 mr-2">{parentDish.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setComboParent(parentDish);
                                setComboRecs(recDishes);
                                setShowComboDialog(true);
                              }}
                              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                              title="Edit combo"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={async () => {
                                await updateDish(parentDish.id, { macros: { ...(parentDish.macros || {}), comboRecommendations: undefined } });
                                showNotification('Combo deleted.');
                              }}
                              className="p-1 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Delete combo"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {recDishes.map(r => (
                            <span key={r.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">{r.name}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── COMBO BUILDER DIALOG ── */}
          <AnimatePresence>
            {showComboDialog && (
              <motion.div
                key="combo-dialog-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowComboDialog(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
                >
                  {/* Dialog Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-white/5">
                    <div>
                      <h2 className="font-display font-black text-xl">Combo Builder</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">Click a dish to assign it as parent or recommendation</p>
                    </div>
                    <button onClick={() => setShowComboDialog(false)} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors">
                      <CloseIcon size={16} />
                    </button>
                  </div>

                  {/* Dialog Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                      {/* Left: Drop Zones */}
                      <div className="space-y-4">
                        {/* Parent Dish Zone */}
                        <div>
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2">Parent Dish (1)</p>
                          <div className={`min-h-[70px] rounded-2xl border-2 border-dashed p-3 transition-colors ${comboParent ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'border-neutral-300 dark:border-white/15 bg-neutral-50 dark:bg-white/[0.02]'}`}>
                            {comboParent ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-200 dark:bg-white/10 shrink-0">
                                    {(comboParent.cover || comboParent.images?.[0]) ? <img src={comboParent.cover || comboParent.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ChefHat size={16} className="text-neutral-400" /></div>}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm">{comboParent.name}</p>
                                    <p className="text-xs text-neutral-500">₹{Number(comboParent.price).toFixed(2)}</p>
                                  </div>
                                </div>
                                <button onClick={() => setComboParent(null)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"><CloseIcon size={14} /></button>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-400 text-center py-3">Click a dish below to set as parent</p>
                            )}
                          </div>
                        </div>

                        {/* Recommendations Zone */}
                        <div>
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2">Recommendations ({comboRecs.length})</p>
                          <div className={`min-h-[100px] rounded-2xl border-2 border-dashed p-3 space-y-2 transition-colors ${comboRecs.length > 0 ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-neutral-300 dark:border-white/15 bg-neutral-50 dark:bg-white/[0.02]'}`}>
                            {comboRecs.length === 0 ? (
                              <p className="text-xs text-neutral-400 text-center py-5">Click dishes below to add recommendations</p>
                            ) : (
                              comboRecs.map(rec => (
                                <div key={rec.id} className="flex items-center justify-between bg-white dark:bg-white/5 rounded-xl px-3 py-2 border border-neutral-100 dark:border-white/5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-200 dark:bg-white/10 shrink-0">
                                      {(rec.cover || rec.images?.[0]) ? <img src={rec.cover || rec.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ChefHat size={12} className="text-neutral-400" /></div>}
                                    </div>
                                    <span className="font-bold text-xs truncate">{rec.name}</span>
                                  </div>
                                  <button onClick={() => setComboRecs(prev => prev.filter(r => r.id !== rec.id))} className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"><CloseIcon size={12} /></button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Save Combo Button */}
                        <button
                          disabled={!comboParent || comboRecs.length === 0}
                          onClick={async () => {
                            if (!comboParent || comboRecs.length === 0) return;
                            await updateDish(comboParent.id, {
                              macros: { ...(comboParent.macros || {}), comboRecommendations: comboRecs.map(r => r.id) }
                            });
                            showNotification(`Combo saved for "${comboParent.name}" with ${comboRecs.length} recommendations!`);
                            setShowComboDialog(false);
                            setComboParent(null);
                            setComboRecs([]);
                          }}
                          className="w-full py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          style={comboParent && comboRecs.length > 0 ? { background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', color: '#000', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' } : { background: 'rgba(212,175,55,0.1)', color: '#AA8C2C' }}
                        >
                          <span className="flex items-center justify-center gap-2"><Save size={15} /> Save Combo</span>
                        </button>
                      </div>

                      {/* Right: Available Dishes Grid */}
                      <div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2">Available Dishes — Click to assign</p>
                        <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                          {vendDishes.map(d => {
                            const isParent = comboParent?.id === d.id;
                            const isRec = comboRecs.some(r => r.id === d.id);
                            const isAlreadyParentElsewhere = d.macros?.comboRecommendations?.length > 0 && comboParent?.id !== d.id;
                            const isUsed = isParent || isRec;
                            return (
                              <button
                                key={d.id}
                                disabled={isAlreadyParentElsewhere && !comboParent}
                                onClick={() => {
                                  if (isParent) { setComboParent(null); return; }
                                  if (isRec) { setComboRecs(prev => prev.filter(r => r.id !== d.id)); return; }
                                  if (!comboParent) {
                                    if (d.macros?.comboRecommendations?.length > 0) {
                                      showNotification(`${d.name} is already a parent of another combo.`);
                                      return;
                                    }
                                    setComboParent(d);
                                  } else {
                                    setComboRecs(prev => [...prev, d]);
                                  }
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                  isParent
                                    ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-300 dark:border-emerald-700'
                                    : isRec
                                      ? 'bg-blue-50 dark:bg-blue-900/15 border-blue-300 dark:border-blue-700'
                                      : isAlreadyParentElsewhere && !comboParent
                                        ? 'opacity-40 cursor-not-allowed bg-neutral-100 dark:bg-white/[0.01] border-neutral-200 dark:border-white/5'
                                        : 'bg-neutral-50 dark:bg-white/[0.02] border-neutral-100 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/5'
                                } border`}
                              >
                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-200 dark:bg-white/10 shrink-0">
                                  {(d.cover || d.images?.[0]) ? <img src={d.cover || d.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ChefHat size={14} className="text-neutral-400" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-xs truncate">{d.name}</p>
                                  <p className="text-[10px] text-neutral-500">₹{Number(d.price).toFixed(2)}</p>
                                </div>
                                {isParent && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">PARENT</span>}
                                {isRec && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">REC</span>}
                                {!isUsed && (
                                  <span className="text-[10px] text-neutral-400">
                                    {isAlreadyParentElsewhere && !comboParent
                                      ? 'Already Parent'
                                      : !comboParent
                                        ? 'Set as parent'
                                        : '+ Add rec'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── EVENTS TAB ── */}
          {vendorTab === 'events' && (
            <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 overflow-y-auto p-6">
              {!hasPro ? <UpgradeLock requiredPlan="Pro" feature="Events & Promos" activeRestId={activeRestId} upgradePlan={upgradePlan} showNotification={showNotification} /> : (
                editingEvent ? (
                  <div className="max-w-2xl mx-auto bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-3xl p-6 relative">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display font-black text-xl">{editingEvent.id ? 'Edit Event' : 'Create New Event'}</h3>
                      <button onClick={() => setEditingEvent(null)} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                        <CloseIcon size={16} />
                      </button>
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      let success = false;
                      const payload = {
                        name: editingEvent.name,
                        price: parseFloat(editingEvent.price) || 0,
                        description: editingEvent.description,
                        cover: editingEvent.cover || '',
                        macros: {
                          ...(editingEvent.macros || {}),
                          isEvent: true,
                          date: editingEvent.macros?.date || new Date().toISOString().split('T')[0],
                          time: editingEvent.macros?.time || '19:00',
                          rsvps: editingEvent.macros?.rsvps || []
                        }
                      };

                      if (editingEvent.id) {
                        const res = await updateDish(editingEvent.id, payload);
                        success = res !== null;
                      } else {
                        const res = await addDish({
                          ...payload,
                          tags: ['event'],
                          restId: activeRestId
                        });
                        success = res !== null;
                      }

                      if (success) {
                        setEditingEvent(null);
                        showNotification(editingEvent.id ? 'Event updated!' : 'Event created!');
                      }
                    }} className="space-y-4 font-sans">
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Event Name *</label>
                        <input required type="text" value={editingEvent.name || ''} onChange={e => setEditingEvent({...editingEvent, name: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 dark:text-white" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 font-sans">
                        <div>
                          <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Date *</label>
                          <input required type="date" value={editingEvent.macros?.date || ''} onChange={e => setEditingEvent({
                            ...editingEvent,
                            macros: { ...(editingEvent.macros || {}), date: e.target.value }
                          })}
                            className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Time *</label>
                          <input required type="time" value={editingEvent.macros?.time || ''} onChange={e => setEditingEvent({
                            ...editingEvent,
                            macros: { ...(editingEvent.macros || {}), time: e.target.value }
                          })}
                            className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 dark:text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 font-sans">
                        <div>
                          <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Entry Price (₹) (0 if free)</label>
                          <input type="number" step="0.01" value={editingEvent.price || 0} onChange={e => setEditingEvent({...editingEvent, price: e.target.value})}
                            className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Event Banner Image</label>
                          <div className="relative">
                            <input type="file" accept="image/*" className="hidden" id="event-cover-upload" onChange={async e => {
                              const file = e.target.files[0];
                              if (file) {
                                showNotification('Uploading event banner...');
                                const filePath = `events/${activeRestId}/${Date.now()}_${file.name}`;
                                const { error } = await supabase.storage.from('models').upload(filePath, file, { cacheControl: '3600', upsert: false });
                                if (!error) {
                                  const { data: pub } = supabase.storage.from('models').getPublicUrl(filePath);
                                  setEditingEvent(prev => ({ ...prev, cover: pub.publicUrl }));
                                  showNotification('Banner uploaded successfully!');
                                } else {
                                  showNotification('Upload failed.');
                                }
                              }
                            }} />
                            <label htmlFor="event-cover-upload" className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 text-xs font-bold hover:bg-neutral-100 transition-colors text-indigo-500 justify-center">
                              <Upload size={14} /> {editingEvent.cover ? 'Change Banner' : 'Upload Banner'}
                            </label>
                          </div>
                        </div>
                      </div>

                      {editingEvent.cover && (
                        <div className="w-full h-32 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 relative">
                          <img src={editingEvent.cover} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 font-sans">Description *</label>
                        <textarea required value={editingEvent.description || ''} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 h-24 resize-none dark:text-white" />
                      </div>

                      <button type="submit"
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition-all shadow-md">
                        Save Event
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-display font-black">Events & Promos</h2>
                        <p className="text-neutral-500 font-sans">Manage your upcoming restaurant events.</p>
                      </div>
                      <button 
                        onClick={() => setEditingEvent({ name: '', price: 0, description: '', cover: '', macros: { isEvent: true, date: '', time: '19:00', rsvps: [] } })}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
                        <Plus size={16} /> Create Event
                      </button>
                    </div>

                    {vendEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#12141D] border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl">
                        <Calendar size={48} className="text-neutral-400 mb-3" />
                        <h3 className="font-bold text-lg">No events created yet</h3>
                        <p className="text-neutral-500 text-sm mb-6 font-sans">Promote special dining nights, live music, or holiday menus.</p>
                        <button 
                          onClick={() => setEditingEvent({ name: '', price: 0, description: '', cover: '', macros: { isEvent: true, date: '', time: '19:00', rsvps: [] } })}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
                          Get Started
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendEvents.map((event) => {
                          const dateStr = event.macros?.date || '';
                          let month = 'OCT';
                          let day = '28';
                          if (dateStr) {
                            try {
                              const d = new Date(dateStr + 'T12:00:00');
                              month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                              day = d.getDate().toString();
                            } catch {}
                          }
                          const rsvpsCount = event.macros?.rsvps?.length || 0;

                          return (
                            <div key={event.id} className="bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex flex-col items-center justify-center border border-orange-200 dark:border-orange-800/50 shrink-0 font-sans">
                                   <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{month}</span>
                                   <span className="text-xl font-black text-orange-700 dark:text-orange-300">{day}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg truncate pr-2">{event.name}</h3>
                                    {event.price > 0 ? (
                                      <span className="text-emerald-500 font-black text-sm font-sans">₹{Number(event.price).toFixed(2)}</span>
                                    ) : (
                                      <span className="text-indigo-500 font-bold text-xs font-sans">Free</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{event.description}</p>
                                  <div className="mt-3 flex gap-2">
                                    <button onClick={() => setviewingRsvpsEvent(event)} className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 transition-colors rounded-md text-xs font-bold font-sans text-indigo-700 dark:text-indigo-300">{rsvpsCount} Joined</button>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-xs font-bold font-sans">Active</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 border-t border-neutral-100 dark:border-white/5 pt-3">
                                <button 
                                  onClick={() => setEditingEvent(event)}
                                  className="p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 rounded-lg transition-colors flex items-center justify-center">
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (confirm("Are you sure you want to delete this event?")) {
                                      const { error } = await supabase.from('dishes').delete().eq('id', event.id);
                                      if (error) {
                                        showNotification("Failed to delete event.");
                                      } else {
                                        showNotification("Event deleted successfully.");
                                        setDishes(prev => prev.filter(d => d.id !== event.id));
                                      }
                                    }
                                  }}
                                  className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors flex items-center justify-center font-sans">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              )}
            </motion.div>
          )}

          {/* ── SETTINGS TAB ── */}
          {/* ── Dish Edit Form ── */}
          {vendorTab === 'menu' && editingDish && (
            <motion.div key="menu-edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display font-black text-xl">{editingDish.id ? 'Edit Dish' : 'Create New Dish'}</h2>
                  <button onClick={() => { setEditingDish(null); setScanState('idle'); setProgress(0); }}
                    className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors">
                    <CloseIcon size={18} />
                  </button>
                </div>

                {scanState !== 'idle' && (
                  <div className={`rounded-2xl p-6 mb-6 relative overflow-hidden ${scanState === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30' : 'bg-neutral-100 dark:bg-[#1a1a1f] border border-neutral-200 dark:border-white/10'}`}>
                    {scanState !== 'complete' && scanState !== 'error' && <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />}
                    <div className="relative text-center">
                      <p className={`font-display font-black text-lg ${scanState === 'complete' ? 'text-emerald-600' : scanState === 'error' ? 'text-red-600' : 'text-neutral-900 dark:text-white'}`}>{scanStageLabel}</p>
                      {scanState !== 'complete' && scanState !== 'error' && (
                        <div className="mt-4 h-2 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                        </div>
                      )}
                      {scanState === 'error' && (
                        <button onClick={() => { setScanState('idle'); setProgress(0); }}
                          className="mt-4 flex items-center gap-2 mx-auto text-sm font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-xl">
                          <RefreshCw size={14} /> Try Again
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  let success;
                  if (editingDish.id) success = await updateDish(editingDish.id, editingDish) !== null;
                  else success = await addDish({ ...editingDish, restId: activeRestId }) !== null;
                  if (success) { setEditingDish(null); setScanState('idle'); setProgress(0); showNotification(editingDish.id ? 'Dish updated!' : 'Dish published!'); }
                }} className="space-y-5">

                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider">Basic Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Dish Name *</label>
                        <input required type="text" value={editingDish.name} onChange={e => setEditingDish({...editingDish, name: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Price (₹) *</label>
                        <input required type="number" step="0.01" value={editingDish.price} onChange={e => setEditingDish({...editingDish, price: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Prep Time (min)</label>
                        <input type="number" value={editingDish.prepTime || ''} onChange={e => setEditingDish({...editingDish, prepTime: e.target.value})}
                          placeholder="18"
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Description *</label>
                      <textarea required value={editingDish.description || ''} onChange={e => setEditingDish({...editingDish, description: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-20 resize-none dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Origin / Provenance</label>
                        <input type="text" value={editingDish.origin || ''} onChange={e => setEditingDish({...editingDish, origin: e.target.value})}
                          placeholder="e.g. Adriatic Sea, Croatia"
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Serves (People)</label>
                        <input type="number" value={editingDish.serves || ''} onChange={e => setEditingDish({...editingDish, serves: e.target.value})}
                          placeholder="2"
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>
                    </div>

                    {/* ── Category Dropdown ── */}
                    {customCategories.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                          Category <span className="text-neutral-400 font-normal">(shows on menu filter tabs)</span>
                        </label>
                        <select
                          value={editingDish.tags?.find(t => customCategories.includes(t)) || ''}
                          onChange={e => {
                            const selected = e.target.value;
                            // Remove any existing category tags, then add the new one
                            const stripped = (editingDish.tags || []).filter(t => !customCategories.includes(t));
                            setEditingDish({
                              ...editingDish,
                              tags: selected ? [...stripped, selected] : stripped
                            });
                          }}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white transition-all cursor-pointer"
                        >
                          <option value="">— No category —</option>
                          {customCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Dish Images (Multiple)</label>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {(editingDish.images || [editingDish.cover]).filter(Boolean).map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-white/10">
                            <img src={img} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => {
                              const newImgs = (editingDish.images || [editingDish.cover]).filter((_, idx) => idx !== i);
                              setEditingDish({ ...editingDish, images: newImgs, cover: newImgs[0] || '' });
                            }} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white">
                              <CloseIcon size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="relative flex items-center gap-2">
                        <input type="file" accept="image/*" className="hidden" id="cover-upload" multiple onChange={async e => {
                          const files = Array.from(e.target.files);
                          if(files.length > 0) {
                            showNotification('Uploading images...');
                            const newUrls = [];
                            for (const file of files) {
                              const filePath = `${activeRestId}/${Date.now()}_${file.name}`;
                              const { error } = await supabase.storage.from('models').upload(filePath, file, { cacheControl: '3600', upsert: false });
                              if (!error) {
                                const { data: pub } = supabase.storage.from('models').getPublicUrl(filePath);
                                newUrls.push(pub.publicUrl);
                              }
                            }
                            const updatedImgs = [...(editingDish.images || (editingDish.cover ? [editingDish.cover] : [])), ...newUrls];
                            setEditingDish(prev => ({...prev, images: updatedImgs, cover: updatedImgs[0] || prev.cover}));
                            showNotification('Images uploaded!');
                          }
                        }} />
                        <label htmlFor="cover-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a1f] border border-neutral-200 dark:border-white/10 text-xs font-bold hover:bg-neutral-50 transition-colors text-blue-500">
                          <Upload size={14} /> Upload Images
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAIImageGen(prev => !prev)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: showAIImageGen
                              ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))'
                              : 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.08))',
                            border: '1px solid rgba(168,85,247,0.3)',
                            color: '#a855f7',
                          }}
                        >
                          <Sparkles size={14} />
                          {showAIImageGen ? 'Close AI' : 'Create with AI'}
                        </button>
                      </div>

                      {/* AI Image Generator Panel */}
                      <AnimatePresence>
                        {showAIImageGen && (
                          <AIImageGenerator
                            dishName={editingDish.name}
                            dishDescription={editingDish.description}
                            dishOrigin={editingDish.origin}
                            dishCategory={editingDish.tags?.find(t => !['Chef\'s Pick', 'Bestseller', 'Signature', 'Popular', 'Seasonal', 'Vegan', 'High Protein', 'Low Calorie', 'Spicy', 'New', 'sold_out'].includes(t))}
                            dietaryPref={editingDish.dietaryPreference}
                            activeRestId={activeRestId}
                            onImageConfirmed={(url) => {
                              const updatedImgs = [...(editingDish.images || (editingDish.cover ? [editingDish.cover] : [])), url];
                              setEditingDish(prev => ({...prev, images: updatedImgs, cover: updatedImgs[0] || prev.cover}));
                              showNotification('AI image added to dish! ✨');
                            }}
                            onClose={() => setShowAIImageGen(false)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Spice Level</label>
                        <select value={editingDish.spiceLevel || ''} onChange={e => setEditingDish({...editingDish, spiceLevel: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 dark:text-white transition-all cursor-pointer">
                          <option value="">None</option>
                          <option value="Mild">Mild</option>
                          <option value="Medium">Medium</option>
                          <option value="Hot">Hot</option>
                          <option value="Extra Hot">Extra Hot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Dietary Preference</label>
                        <select value={editingDish.dietaryPreference || ''} onChange={e => setEditingDish({...editingDish, dietaryPreference: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 dark:text-white transition-all cursor-pointer">
                          <option value="">None</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Vegan">Vegan</option>
                          <option value="Gluten-Free">Gluten-Free</option>
                          <option value="Halal">Halal</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3D Model */}
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider flex items-center gap-2"><Box size={14} /> 3D AR Model (.GLB)</h3>
                      <button type="button" onClick={handleAIGenerate3D} disabled={isGenerating3D}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5">
                        {isGenerating3D ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={12} />}
                        {isGenerating3D ? 'Generating...' : 'AI Generate'}
                      </button>
                    </div>
                    <input type="file" accept=".glb,.gltf" className="hidden" ref={glbInputRef} onChange={e => { if (e.target.files[0]) uploadGlbFile(e.target.files[0]); }} />
                    
                    {/* Uploading state — inline progress bar */}
                    {glbUpload.uploading ? (
                      <div className="rounded-2xl p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Uploading 3D model...</span>
                          <span className="ml-auto text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">{glbUpload.progress}%</span>
                        </div>
                        <div className="h-2.5 bg-blue-200 dark:bg-blue-900/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${glbUpload.progress}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                          />
                        </div>
                        <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-2">Please wait, large files may take a moment...</p>
                      </div>
                    ) : glbUpload.error ? (
                      <div className="rounded-2xl p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
                        <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">{glbUpload.error}</p>
                        <button type="button" onClick={() => { setGlbUpload({ uploading: false, progress: 0, error: null }); glbInputRef.current?.click(); }}
                          className="text-xs font-bold px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 flex items-center gap-1.5">
                          <RefreshCw size={12} /> Try Again
                        </button>
                      </div>
                    ) : !(editingDish.modelUrl || editingDish.model_url) ? (
                      <div onClick={() => glbInputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) uploadGlbFile(f); }}
                        className="border-2 border-dashed border-blue-200 dark:border-blue-900/40 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                        <Upload size={28} className="mx-auto text-blue-400 mb-3" />
                        <p className="font-bold text-sm text-neutral-700 dark:text-neutral-300">Drag & drop or click to upload .GLB</p>
                        <p className="text-xs text-neutral-400 mt-1">Enables AR view for customers</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <div className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">3D Model Attached</span>
                          </div>
                          <button type="button" onClick={() => window.open((editingDish.modelUrl || editingDish.model_url), '_blank')}
                            className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors font-bold text-xs flex items-center gap-2">
                            <Eye size={15} /> Preview
                          </button>
                          <button type="button" onClick={() => { setEditingDish({...editingDish, modelUrl: '', model_url: ''}); setGlbUpload({ uploading: false, progress: 0, error: null }); }}
                            className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-100 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        
                        {/* Live Model Preview — shows immediately after upload */}
                        <div className="w-full h-64 bg-neutral-100 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden relative">
                          <ModelViewer 
                            src={editingDish.modelUrl || editingDish.model_url}
                            autoRotate
                            cameraControls
                            className="w-full h-full"
                          />
                          <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-md text-[9px] font-black text-neutral-900 dark:text-white tracking-widest uppercase border border-neutral-200 dark:border-white/10">
                            Live Preview
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nutrition */}
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider">Nutrition</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['calories', 'protein', 'carbs', 'fat'].map(macro => (
                        <div key={macro}>
                          <label className="block text-[10px] font-bold text-neutral-500 mb-1 capitalize">{macro} {macro === 'calories' ? '(kcal)' : '(g)'}</label>
                          <input type="number" value={parseInt(editingDish.macros?.[macro] || 0)}
                            onChange={e => setEditingDish({...editingDish, macros: {...editingDish.macros, [macro]: macro === 'calories' ? e.target.value : e.target.value + 'g'}})}
                            className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider">Category Filters & Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...customCategories, "Chef's Pick", 'Bestseller', 'Signature', 'Popular', 'Seasonal', 'Vegan', 'High Protein', 'Low Calorie', 'Spicy', 'New'].map(tag => {
                        const active = editingDish.tags?.includes(tag);
                        return (
                          <button key={tag} type="button"
                            onClick={() => setEditingDish(p => ({ ...p, tags: active ? p.tags.filter(t => t !== tag) : [...(p.tags || []), tag] }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800/50' : 'bg-neutral-50 dark:bg-white/5 text-neutral-500 border-neutral-200 dark:border-white/10'}`}>
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Allergens */}
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={13} className="text-red-500" /> Allergens</h3>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGEN_OPTIONS.map(a => {
                        const active = editingDish.allergens?.includes(a);
                        return (
                          <button key={a} type="button"
                            onClick={() => setEditingDish(p => ({ ...p, allergens: active ? (p.allergens||[]).filter(x => x !== a) : [...(p.allergens||[]), a] }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800/50' : 'bg-neutral-50 dark:bg-white/5 text-neutral-500 border-neutral-200 dark:border-white/10'}`}>
                            {a}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full py-4 rounded-2xl font-display font-black text-base bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-lg">
                    {editingDish.id ? 'Save Changes' : 'Publish Dish'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ GROWTH TOOLS ════════════════════ */}
          {vendorTab === 'growth' && (
            <motion.div key="growth" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6">
              {!hasPro ? <UpgradeLock requiredPlan="Pro" feature="Growth Tools" activeRestId={activeRestId} upgradePlan={upgradePlan} showNotification={showNotification} /> : (
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <h2 className="font-display font-black text-2xl">Growth Tools</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Boost revenue with smart promotions and marketing</p>
                </div>

                {/* Tool Cards */}
                <div className="space-y-3">
                  <PromoCard icon={Percent} title="Flash Discount" badge="Popular" badgeColor="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    desc="Set a time-limited % discount on selected dishes or the entire menu to drive impulse purchases."
                    onClick={() => {
                      if (activePromo === 'discount') {
                        setActivePromo(null);
                      } else {
                        const existing = promos[activeRestId]?.flash;
                        if (existing) {
                          setPromoForm({
                            label: existing.label || '',
                            discount: existing.discount || 15,
                            type: 'percent',
                            applicableDishes: existing.applicableDishes || []
                          });
                        } else {
                          setPromoForm({ label: '', discount: 15, type: 'percent', applicableDishes: [] });
                        }
                        setActivePromo('discount');
                      }
                    }} />
                  <AnimatePresence>
                    {activePromo === 'discount' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-neutral-500 block mb-1.5">Promo Label</label>
                              <input type="text" placeholder="e.g. Happy Monday!" value={promoForm.label}
                                onChange={e => setPromoForm(p => ({...p, label: e.target.value}))}
                                className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-neutral-500 block mb-1.5">Discount %</label>
                              <input type="number" value={promoForm.discount} min="1" max="100"
                                onChange={e => setPromoForm(p => ({...p, discount: e.target.value}))}
                                className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            
                            <div className="col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-neutral-500 block">Applicable Dishes</label>
                                <button 
                                  onClick={() => {
                                    const vendorDishes = dishes.filter(d => d.restId === activeRestId);
                                    if (promoForm.applicableDishes.length === vendorDishes.length) {
                                      setPromoForm(p => ({...p, applicableDishes: []}));
                                    } else {
                                      setPromoForm(p => ({...p, applicableDishes: vendorDishes.map(d => d.id)}));
                                    }
                                  }}
                                  className="text-[10px] font-bold text-[#D4AF37] hover:underline"
                                >
                                  {promoForm.applicableDishes.length === dishes.filter(d => d.restId === activeRestId).length ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>
                              <div className="bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                                {dishes.filter(d => d.restId === activeRestId).map(dish => (
                                  <label key={dish.id} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={promoForm.applicableDishes.includes(dish.id)}
                                      onChange={(e) => {
                                        setPromoForm(p => {
                                          const checked = e.target.checked;
                                          const newDishes = checked 
                                            ? [...p.applicableDishes, dish.id]
                                            : p.applicableDishes.filter(id => id !== dish.id);
                                          return { ...p, applicableDishes: newDishes };
                                        });
                                      }}
                                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm dark:text-neutral-200">{dish.name}</span>
                                    <span className="text-xs text-neutral-500 ml-auto">₹{dish.originalPrice || dish.price}</span>
                                  </label>
                                ))}
                                {dishes.filter(d => d.restId === activeRestId).length === 0 && (
                                  <div className="text-xs text-neutral-500 text-center py-2">No dishes available. Add dishes first.</div>
                                )}
                              </div>
                            </div>

                            <div className="col-span-2 mt-2">
                              {promos[activeRestId]?.flash ? (
                                <div className="flex gap-2">
                                  <button onClick={handleActivatePromo}
                                    className="flex-1 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity">
                                    Save Edits
                                  </button>
                                  <button onClick={() => { updateMarketingCampaign(activeRestId, 'flash', null); setActivePromo(null); showNotification('Promo stopped'); }}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors">
                                    Stop Promo
                                  </button>
                                </div>
                              ) : (
                                <button onClick={handleActivatePromo}
                                  className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity">
                                  Activate Promo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <PromoCard icon={Clock} title="Happy Hour" badge="High Impact" badgeColor="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    desc="Configure time windows where the entire menu gets an automatic discount everyday."
                    onClick={() => {
                      if (activePromo === 'happy') {
                        setActivePromo(null);
                      } else {
                        const existing = promos[activeRestId]?.happyHour;
                        if (existing) {
                          setHappyHourForm({
                            startTime: existing.startTime || '17:00',
                            endTime: existing.endTime || '19:00',
                            discount: existing.discount || 20
                          });
                        } else {
                          setHappyHourForm({ startTime: '17:00', endTime: '19:00', discount: 20 });
                        }
                        setActivePromo('happy');
                      }
                    }} />
                  <AnimatePresence>
                    {activePromo === 'happy' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs font-bold text-neutral-500 block mb-1.5">From</label>
                              <input type="time" value={happyHourForm.startTime} onChange={e => setHappyHourForm(h => ({...h, startTime: e.target.value}))} className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-neutral-500 block mb-1.5">To</label>
                              <input type="time" value={happyHourForm.endTime} onChange={e => setHappyHourForm(h => ({...h, endTime: e.target.value}))} className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-neutral-500 block mb-1.5">Discount %</label>
                              <input type="number" min="1" max="100" value={happyHourForm.discount} onChange={e => setHappyHourForm(h => ({...h, discount: e.target.value}))} className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                          </div>
                          <div className="mt-4">
                            {promos[activeRestId]?.happyHour ? (
                              <div className="flex gap-2">
                                <button onClick={handleActivateHappyHour}
                                  className="flex-1 py-3 rounded-xl bg-amber-500 text-white text-sm font-black hover:bg-amber-600 transition-colors">
                                  Save Edits
                                </button>
                                <button onClick={() => { updateMarketingCampaign(activeRestId, 'happyHour', null); setActivePromo(null); showNotification('Happy Hour stopped'); }}
                                  className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors">
                                  Stop Promo
                                </button>
                              </div>
                            ) : (
                              <button onClick={handleActivateHappyHour}
                                className="w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-black hover:bg-amber-600 transition-colors">
                                Enable Happy Hour
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>


                </div>


              </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════ CUSTOMER INSIGHTS ════════════════════ */}
          {vendorTab === 'customers' && (
            <motion.div key="customers" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6">
              {!hasPro ? <UpgradeLock requiredPlan="Pro" feature="Customer Insights" activeRestId={activeRestId} upgradePlan={upgradePlan} showNotification={showNotification} /> : (
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="font-display font-black text-2xl">Customer Insights</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Understand your audience to serve them better</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {!isDataLoaded ? (
                    Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
                  ) : (
                    <>
                      <KpiCard icon={Users}      label="Total Customers"     value={uniqueCustomers}              color="bg-blue-500" onClick={() => setCustomerFilter(f => f === 'all' ? 'top' : 'all')} />
                      <KpiCard icon={Repeat}     label="Repeat Guests"       value={repeatCustomers}              color="bg-purple-500" onClick={() => setCustomerFilter(f => f === 'repeat' ? 'top' : 'repeat')} />
                      <KpiCard icon={DollarSign} label="Avg Lifetime Value"  value={`₹${avgLifetimeValue.toFixed(0)}`} color="bg-emerald-500" />
                      <KpiCard icon={Star}       label="Satisfaction Score"  value={`${satisfactionScore} ★`}    sub={`${reviewOrders.length} reviews`} color="bg-amber-500" />
                    </>
                  )}
                </div>

                {/* Customer list from orders */}
                <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-neutral-50 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-display font-black text-base">{customerFilter === 'repeat' ? 'Repeat Customers' : customerFilter === 'all' ? 'All Customers' : 'Top Customers (by Spend)'}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400 font-bold hidden sm:inline">
                        {customerFilter === 'repeat' ? repeatCustomers : customerFilter === 'all' ? uniqueCustomers : Math.min(15, uniqueCustomers)} shown
                      </span>
                      <button onClick={() => setShowAllCustomersModal(true)} className="px-3 py-1.5 text-xs font-bold bg-[#D4AF37] text-black rounded-lg hover:bg-amber-400 transition-colors shadow-sm">
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-neutral-50 dark:divide-white/4">
                    {/* Skeleton rows while loading */}
                    {!isDataLoaded && (
                      Array.from({ length: 5 }).map((_, i) => <CustomerRowSkeleton key={i} />)
                    )}
                    {isDataLoaded && (customerFilter === 'repeat' ? customerList.filter(c => c.orderCount > 1) : customerFilter === 'all' ? customerList : customerList.slice(0, 15)).map(c => (
                      <div key={c.id} className="px-5 py-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-white/3 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{c.name}</p>
                          <p className="text-xs text-neutral-400">
                            {c.phone} · {c.orderCount} order{c.orderCount > 1 ? 's' : ''} · Last: {new Date(c.lastOrder).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-sm text-emerald-600">₹{Number(c.totalSpend).toFixed(2)}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{c.orderType === 'dine_in' ? 'Dine-In' : 'Pre-Order'}</p>
                        </div>
                      </div>
                    ))}
                    {isDataLoaded && customerList.length === 0 && (
                      <div className="text-center py-12 text-neutral-400">
                        <Users size={36} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Customer data appears after orders are placed</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Segment insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-display font-black text-sm mb-4">Top Dishes by Segment</h3>
                    {dishRanking.slice(0, 3).map((d, i) => (
                      <div key={d.name} className="flex items-center gap-3 mb-3 last:mb-0">
                        <span className="font-display font-black text-xl w-6 text-center">{['🥇','🥈','🥉'][i]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{d.name}</p>
                          <p className="text-xs text-neutral-400">{d.count} orders</p>
                        </div>
                        <span className="text-xs font-black text-emerald-600">${d.revenue.toFixed(0)}</span>
                      </div>
                    ))}
                    {dishRanking.length === 0 && <p className="text-xs text-neutral-400 text-center py-4">No completed orders yet</p>}
                  </div>
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-display font-black text-sm mb-4">Retention Overview</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-neutral-500">New Customers</span><span>{Math.max(uniqueCustomers - repeatCustomers, 0)}</span></div>
                        <div className="h-2 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${uniqueCustomers > 0 ? ((uniqueCustomers - repeatCustomers) / uniqueCustomers) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-neutral-500">Returning Guests</span><span>{repeatCustomers}</span></div>
                        <div className="h-2 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-5">Returning guest rate: <span className="font-black text-purple-500">{uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0}%</span></p>
                  </div>
                </div>
              </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════ TABLES & QR ════════════════════ */}
          {vendorTab === 'qr' && (
            <motion.div key="qr" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="font-display font-black text-2xl">Tables & QR Codes</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Generate unique QR codes for each table</p>
                </div>

                <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 flex items-center justify-between mb-6 shadow-sm">
                  <div>
                    <p className="font-display font-black">Number of Tables</p>
                    <p className="text-xs text-neutral-500 mt-0.5">One unique QR code per table</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setTableCount(n => Math.max(1, n - 1))}
                      className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-white/10 font-black flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors">−</button>
                    <span className="font-display font-black text-2xl w-8 text-center">{tableCount}</span>
                    <button onClick={() => setTableCount(n => Math.min(50, n + 1))}
                      className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-white/10 font-black flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors">+</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Array.from({ length: tableCount }, (_, i) => (
                    <div key={i} className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 flex flex-col items-center shadow-sm">
                      <p className="font-black text-xs text-neutral-400 mb-4 uppercase tracking-widest">Table {i + 1}</p>
                      <QRCodeSVG
                        value={`${window.location.origin}/menu?restId=${activeRestId}&table=${i + 1}`}
                        size={130} level="H" includeMargin={false} fgColor="#111111"
                        className="dark:hidden"
                      />
                      <QRCodeSVG
                        value={`${window.location.origin}/menu?restId=${activeRestId}&table=${i + 1}`}
                        size={130} level="H" includeMargin={false} fgColor="#FFFFFF"
                        bgColor="#12141D"
                        className="hidden dark:block"
                      />
                      <p className="text-[10px] text-neutral-400 mt-3 text-center">{currentRestaurant?.name} · T{i+1}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => window.print()}
                  className="w-full py-4 rounded-2xl font-display font-black flex items-center justify-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-lg">
                  <Printer size={18} /> Print All {tableCount} QR Codes
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ SETTINGS ════════════════════ */}
          {vendorTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6 bg-neutral-50 dark:bg-[#050505]"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-black text-neutral-900 dark:text-white">Restaurant Settings</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Configure your restaurant, AI, and marketing settings</p>
                </div>

                <form onSubmit={handleSettingsSave} className="space-y-4">
                  <div className="rounded-2xl p-5 space-y-4 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[rgba(212,175,55,0.15)]">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
                      <Store size={13}/> Restaurant Profile
                    </h3>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Restaurant Name *</label>
                      <input required type="text" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})}
                        className="w-full rounded-xl p-3 text-sm" placeholder="My Restaurant" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Cover Image</label>
                      {settingsForm.cover ? (
                        <div className="relative group h-32 rounded-xl overflow-hidden border bg-neutral-100 dark:bg-[#1A1A1A]" style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
                          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${settingsForm.cover})` }} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                              <Upload size={16} /> Edit Image
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => setSettingsForm({...settingsForm, cover: evt.target.result});
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer h-32 border-2 border-dashed border-neutral-300 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:border-neutral-400 transition-colors">
                          <Upload size={24} className="mb-2 opacity-50" />
                          <span className="text-sm font-bold">Upload Cover Image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => setSettingsForm({...settingsForm, cover: evt.target.result});
                                  reader.readAsDataURL(file);
                                }
                              }} />
                        </label>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Phone Number</label>
                      <input type="tel" value={settingsForm.phone} onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567" className="w-full rounded-xl p-3 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Operating Hours</label>
                      <input type="text" value={settingsForm.hours} onChange={e => setSettingsForm({...settingsForm, hours: e.target.value})}
                        placeholder="10:00 - 22:00" className="w-full rounded-xl p-3 text-sm" />
                    </div>
                  </div>

                  {/* Billing & Payments */}
                  <div className="rounded-2xl p-5 space-y-4 mt-4 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[rgba(212,175,55,0.15)]">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
                      <DollarSign size={13}/> Billing & Payments
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Tax Rate (%)</label>
                        <input type="number" step="0.1" value={settingsForm.taxRate} onChange={e => setSettingsForm({...settingsForm, taxRate: parseFloat(e.target.value)})}
                          className="w-full rounded-xl p-3 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Accept Cash</label>
                        <select value={String(settingsForm.acceptCash)} onChange={e => setSettingsForm({...settingsForm, acceptCash: e.target.value === 'true'})}
                          className="w-full rounded-xl p-3 text-sm">
                          <option value="true">✓ Yes — Cash Accepted</option>
                          <option value="false">✗ No — Digital Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── AI Waiter Settings ── */}
                  <div className="rounded-2xl p-5 space-y-4 mt-4 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[rgba(212,175,55,0.15)]">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
                      <BrainCircuit size={13}/> AI Waiter Settings
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">Enable AI Concierge</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Show floating AI Waiter to customers</p>
                      </div>
                      <button type="button" className="w-12 h-6 rounded-full transition-all relative"
                        style={{ background: goldGradient, boxShadow: '0 2px 8px rgba(212,175,55,0.3)' }}>
                        <span className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">AI Personality / Instructions</label>
                      <textarea rows={3} placeholder="e.g. You are a formal luxury dining concierge. Always recommend the chef's special first..."
                        className="w-full rounded-xl p-3 text-sm resize-none" />
                    </div>
                  </div>

                  {/* ── Happy Hour / Offers Management ── */}
                  <div className="rounded-2xl p-5 space-y-4 mt-4 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[rgba(212,175,55,0.15)]">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
                      <Flame size={13}/> Dynamic Offers (Happy Hour)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Start Time</label>
                        <input type="time" defaultValue="16:00" className="w-full rounded-xl p-3 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">End Time</label>
                        <input type="time" defaultValue="19:00" className="w-full rounded-xl p-3 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Offer Message</label>
                      <input type="text" defaultValue="20% off all drinks and starters" className="w-full rounded-xl p-3 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Discount %</label>
                      <input type="number" defaultValue={20} min={0} max={100} className="w-full rounded-xl p-3 text-sm" />
                    </div>
                  </div>

                  {/* ── Subscription Plans ── */}
                  <div className="rounded-2xl p-5 space-y-4 mt-4 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[rgba(212,175,55,0.15)]">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
                      <Crown size={13}/> Subscription Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { plan: 'Starter',    desc: 'Basic QR Menu & Orders',      price: 'Free' },
                        { plan: 'Pro',         desc: 'AR + Analytics + CRM',         price: '$49/mo' },
                        { plan: 'Enterprise',  desc: 'AI Waiter + 3D + White Label', price: '$99/mo' },
                      ].map(({ plan, desc, price }) => {
                        const isActive = currentPlan === plan;
                        return (
                        <div key={plan}
                          className={`rounded-xl p-4 relative ${
                            isActive
                              ? ''
                              : 'bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-white/10'
                          }`}
                          style={isActive ? {
                            background: 'linear-gradient(145deg, #1a1500, #0a0a00)',
                            border: `1px solid ${GOLD}`,
                            boxShadow: `0 0 20px rgba(212,175,55,0.2)`,
                          } : {}}
                        >
                          {isActive && <span className="absolute -top-2 right-3 text-[10px] font-black px-2 py-0.5 rounded-full text-black" style={{ background: goldGradient }}>ACTIVE</span>}
                          <h4 className="font-black text-base text-neutral-900 dark:text-white mb-0.5">{plan}</h4>
                          <p className="text-xs text-neutral-500 mb-2">{desc}</p>
                          <p className={`font-black text-sm mb-3 ${isActive ? '' : 'text-neutral-400 dark:text-white/50'}`} style={{ color: isActive ? GOLD : undefined }}>{price}</p>
                          <button type="button"
                            onClick={() => { if (!isActive && activeRestId) { upgradePlan(activeRestId, plan); showNotification(`🌟 Switched to ${plan} plan!`); }}}
                            className="w-full py-2 rounded-lg text-xs font-bold transition-all"
                            style={isActive
                              ? { background: goldGradient, color: '#000' }
                              : { background: 'rgba(212,175,55,0.08)', color: GOLD, border: `1px solid rgba(212,175,55,0.3)` }
                            }>
                            {isActive ? 'Current Plan ✓' : `Upgrade to ${plan} →`}
                          </button>
                        </div>
                        );
                      })}
                    </div>
                  </div>



                  <button type="submit"
                    className="w-full py-4 mt-6 rounded-2xl font-display font-black flex items-center justify-center gap-2 text-black text-base shadow-gold"
                    style={{ background: goldGradient, boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}>
                    <Save size={18}/> Save All Settings
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── CUSTOM DELETE CATEGORY CONFIRM DIALOG ── */}
          {categoryToDelete && (
            <motion.div
              key="delete-category-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setCategoryToDelete(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden text-neutral-900 dark:text-white"
              >
                {/* Visual Accent */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full pointer-events-none ${
                  categoryToDelete.error ? 'bg-red-500/10' : 'bg-amber-500/10'
                }`} />

                {categoryToDelete.error ? (
                  /* ERROR STATE: Dishes fall in this category */
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                      <AlertTriangle size={32} />
                    </div>
                    <h3 className="font-display font-black text-xl text-neutral-900 dark:text-white mb-2">Shift Dishes First</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                      The category <strong className="text-neutral-900 dark:text-white">"{categoryToDelete.name}"</strong> cannot be deleted because it has <strong className="text-red-500 font-extrabold">{categoryToDelete.dishesCount}</strong> assigned dish(es).
                      <br /><br />
                      Please edit those dishes and shift them to another category first.
                    </p>
                    <button
                      onClick={() => setCategoryToDelete(null)}
                      className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-black text-sm rounded-xl transition-all shadow-md"
                    >
                      Got It
                    </button>
                  </div>
                ) : (
                  /* CONFIRM STATE: Safe to delete category */
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950/30 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                      <Trash2 size={32} />
                    </div>
                    <h3 className="font-display font-black text-xl text-neutral-900 dark:text-white mb-2">Delete Category</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                      Are you sure you want to delete the category <strong className="text-neutral-900 dark:text-white">"{categoryToDelete.name}"</strong>?
                      <br /><br />
                      This category will be permanently removed from your dashboard and the diner menu.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setCategoryToDelete(null)}
                        className="py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 font-bold text-sm rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          const cat = categoryToDelete.name;
                          const updated = customCategories.filter(c => c !== cat);
                          const newCategoryOrders = { ...(metadataRecord?.macros?.categoryOrders || {}) };
                          delete newCategoryOrders[cat];

                          const payload = {
                            name: "_categories_metadata",
                            price: 0,
                            description: "Metadata for custom categories",
                            tags: ["_categories_metadata"],
                            macros: { categories: updated, categoryOrders: newCategoryOrders }
                          };

                          let success = false;
                          if (metadataRecord?.id) {
                            const res = await updateDish(metadataRecord.id, payload);
                            success = res !== null;
                          } else {
                            const res = await addDish({
                              ...payload,
                              restId: activeRestId
                            });
                            success = res !== null;
                          }

                          if (success) {
                            showNotification(`Category "${cat}" deleted.`);
                            setCategoryToDelete(null);
                          }
                        }}
                        className="py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-red-600/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {viewingRsvpsEvent && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setviewingRsvpsEvent(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[80vh] text-neutral-900 dark:text-white"
              >
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <h2 className="font-display font-black text-xl">Guest List</h2>
                      <p className="text-xs text-neutral-500 font-sans">{viewingRsvpsEvent.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setviewingRsvpsEvent(null)} className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                    <CloseIcon size={16} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3">
                  {!viewingRsvpsEvent.macros?.rsvps || viewingRsvpsEvent.macros.rsvps.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-neutral-500 text-sm">No one has joined yet.</p>
                    </div>
                  ) : (
                    viewingRsvpsEvent.macros.rsvps.map((rsvp, idx) => {
                      const isObj = typeof rsvp === 'object';
                      const name = isObj ? (rsvp.name || 'Anonymous Guest') : 'Anonymous Guest';
                      const phone = isObj ? (rsvp.phone || 'No phone provided') : 'No phone provided';
                      const timestamp = isObj && rsvp.timestamp ? new Date(rsvp.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Unknown date';
                      
                      return (
                        <div key={idx} className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/5">
                          <p className="text-sm font-bold">{name}</p>
                          <div className="flex justify-between text-xs text-neutral-500">
                            <span>{phone}</span>
                            <span>{timestamp}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── AI MENU IMPORT MODAL ── */}
        <AnimatePresence>
          {aiImportState !== 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-white dark:bg-[#12141D] rounded-3xl border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                
                <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center bg-neutral-50 dark:bg-[#1a1a1f]">
                  <h2 className="font-display font-black text-xl flex items-center gap-2 text-[#D4AF37]">
                    <Sparkles size={20} /> AI Menu Import
                  </h2>
                  <button onClick={() => setAiImportState('idle')} className="text-neutral-400 hover:text-red-500 transition-colors">
                    <CloseIcon size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  {aiImportState === 'analyzing' && (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-[#D4AF37]/20 rounded-full"></div>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-t-[#D4AF37] rounded-full"></motion.div>
                        <BrainCircuit size={40} className="absolute inset-0 m-auto text-[#D4AF37] animate-pulse" />
                      </div>
                      <h3 className="font-black text-lg mb-2">Analyzing Image/PDF...</h3>
                      <p className="text-neutral-500 text-sm text-center mb-6 max-w-[250px]">Our AI is magically extracting dishes, prices, and descriptions.</p>
                      <div className="w-full h-2 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${importProgress}%` }} className="h-full bg-[#D4AF37] rounded-full" />
                      </div>
                    </div>
                  )}

                  {aiImportState === 'reviewing' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-4">
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1.5"><CheckCircle size={16}/> Extraction Complete</p>
                        <span className="text-xs font-black uppercase tracking-widest text-neutral-500">{extractedDishes.length} Items Found</span>
                      </div>
                      
                      <div className="space-y-3">
                        {extractedDishes.map((dish, i) => (
                          <div key={dish.id} className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-white/10 rounded-2xl p-4">
                            <input value={dish.name} onChange={e => {
                              const newD = [...extractedDishes]; newD[i].name = e.target.value; setExtractedDishes(newD);
                            }} className="w-full bg-transparent text-lg font-black text-neutral-900 dark:text-white border-none focus:ring-0 p-0 mb-2 placeholder:text-neutral-500" placeholder="Dish Name" />
                            
                            <div className="flex gap-3 mb-3">
                              <div className="relative w-1/3">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">₹</span>
                                <input value={dish.price} onChange={e => {
                                  const newD = [...extractedDishes]; newD[i].price = e.target.value; setExtractedDishes(newD);
                                }} className="w-full bg-white dark:bg-[#1a1a1f] pl-7 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 text-sm font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-[#D4AF37]/50 transition-colors" placeholder="0.00" />
                              </div>
                              <input value={dish.category} onChange={e => {
                                const newD = [...extractedDishes]; newD[i].category = e.target.value; setExtractedDishes(newD);
                              }} className="w-2/3 bg-white dark:bg-[#1a1a1f] px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 text-sm font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-[#D4AF37]/50 transition-colors" placeholder="Category" />
                            </div>
                            
                            <textarea value={dish.description} onChange={e => {
                              const newD = [...extractedDishes]; newD[i].description = e.target.value; setExtractedDishes(newD);
                            }} className="w-full bg-white dark:bg-[#1a1a1f] px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-400 resize-none h-16 focus:outline-none focus:border-[#D4AF37]/50 transition-colors" placeholder="Description..." />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {aiImportState === 'reviewing' && (
                  <div className="p-5 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1a1a1f] shrink-0">
                    <button onClick={async () => {
                      for (const d of extractedDishes) {
                        await addDish({ name: d.name, price: Number(d.price), category: d.category, description: d.description, restId: activeRestId });
                      }
                      setAiImportState('idle');
                      showNotification(`Successfully imported ${extractedDishes.length} dishes!`);
                    }} className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_4px_20px_rgba(212,175,55,0.3)] text-black" style={{ background: goldGradient }}>
                      <CheckCircle size={20}/> Save All Items to Menu
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Customers Modal */}
        <AnimatePresence>
          {showAllCustomersModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-[#12141D] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-neutral-200 dark:border-white/10 relative">
                <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center bg-neutral-50 dark:bg-black shrink-0 relative z-10">
                  <div>
                    <h2 className="font-display font-black text-xl text-neutral-900 dark:text-white">Customer Database</h2>
                    <p className="text-xs text-neutral-500 mt-1">{customerList.length} total customers</p>
                  </div>
                  <button onClick={() => setShowAllCustomersModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200/50 dark:bg-white/10 text-neutral-600 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors">
                    <CloseIcon size={18} />
                  </button>
                </div>
                
                <div className="p-4 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#12141D] shrink-0 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex gap-2 bg-neutral-100 dark:bg-black p-1 rounded-xl">
                    <button onClick={() => setCustomerModalSort('most-came')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${customerModalSort === 'most-came' ? 'bg-white dark:bg-[#1a1a1f] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>Most Came</button>
                    <button onClick={() => setCustomerModalSort('most-spend')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${customerModalSort === 'most-spend' ? 'bg-white dark:bg-[#1a1a1f] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>Most Spend</button>
                  </div>
                  
                  <button onClick={handleExportVCF} className="px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.2)]">
                    <ArrowDown size={14} /> Export Contact{selectedCustomerIds.length > 0 ? `s (${selectedCustomerIds.length})` : 's (All)'}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-1">
                    {[...customerList].sort((a, b) => customerModalSort === 'most-came' ? b.orderCount - a.orderCount : b.totalSpend - a.totalSpend).map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer" onClick={() => setSelectedCustomerIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${selectedCustomerIds.includes(c.id) ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-neutral-300 dark:border-neutral-600'}`}>
                          {selectedCustomerIds.includes(c.id) && <CheckCircle size={14} className="text-black" />}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-white/10 flex items-center justify-center shrink-0">
                          <UserCircle size={18} className="text-neutral-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">{c.name}</p>
                          <p className="text-xs text-neutral-500 font-mono truncate">{c.phone}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-[#D4AF37] text-sm">₹{c.totalSpend.toFixed(2)}</p>
                          <p className="text-[10px] text-neutral-500 font-bold">{c.orderCount} visits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

