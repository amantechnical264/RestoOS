import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ListOrdered, TrendingUp, Utensils, QrCode as QrIcon,
  Box, Edit2, Plus, X, Upload, AlertTriangle, LogOut, Store, Settings,
  Users, Save, Trash2, RefreshCw, Printer, ChefHat, Sparkles, Crown,
  Zap, Bell, Tag, Star, Eye, EyeOff, BarChart2, Activity, Megaphone,
  Clock, DollarSign, ShoppingBag, Repeat, ArrowUpRight, BrainCircuit,
  ArrowDownRight, Package, MessageSquare, Percent, Gift, Target, ToggleLeft, ToggleRight,
  TrendingDown, Calendar, Filter, CheckCircle, XCircle, Flame, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import ModelViewer from '../components/ModelViewer';

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
const MiniBarChart = ({ data, color = '#D4AF37', height = 80 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = 100 / (data.length * 2 - 1);
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const bh = (d.value / max) * (height - 20);
        const x = i * (barW * 2);
        return (
          <g key={i}>
            <rect x={x} y={height - 20 - bh} width={barW} height={bh}
              rx="2" fill={color} opacity="0.85" />
            <text x={x + barW / 2} y={height - 4} textAnchor="middle"
              fontSize="6" fill="#6B7280">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div
    className="rounded-3xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform cursor-default bg-white dark:bg-transparent"
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
);

// ─── Dish Popularity Row ───────────────────────────────────────────────
const PopularityRow = ({ rank, name, count, revenue, total, badge }) => {
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
        <p className="text-[10px] font-semibold text-emerald-500">${revenue.toFixed(0)}</p>
      </div>
    </div>
  );
};

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

// ══════════════════════════════════════════════════════════════════════
export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const {
    orders, activeRestId, vendorTab, setVendorTab, updateOrderStatus,
    dishes, restaurants, addDish, updateDish, user, setUser,
    updateRestaurant, supabaseUser, setActiveRestId, isInitializing,
    theme, toggleTheme, showNotification, serviceAlerts, setServiceAlerts,
    planFor, upgradePlan,
  } = useAppContext();

  // ── Subscription helpers ────────────────────────────────────────
  const PLANS = ['Starter', 'Pro', 'Enterprise'];
  const currentPlan = planFor(activeRestId);
  const hasPro        = PLANS.indexOf(currentPlan) >= PLANS.indexOf('Pro');
  const hasEnterprise = PLANS.indexOf(currentPlan) >= PLANS.indexOf('Enterprise');

  // Lock screen component for gated tabs
  const UpgradeLock = ({ requiredPlan, feature }) => (
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
    await supabase.auth.signOut(); setUser(null); navigate('/');
  };

  const currentRestaurant = restaurants.find(r => r.id === activeRestId);
  const [editingDish, setEditingDish] = React.useState(null);
  const [scanState, setScanState]     = React.useState('idle');
  const [scanStageLabel, setScanStageLabel] = React.useState('');
  const [progress, setProgress]       = React.useState(0);
  const glbInputRef = React.useRef(null);
  const [tableCount, setTableCount]   = React.useState(5);
  const [activePromo, setActivePromo] = React.useState(null);
  const [notifText, setNotifText]     = React.useState('');
  const [promoForm, setPromoForm]     = React.useState({ label: '', discount: 15, type: 'percent', expires: '' });
  const [dishVisibility, setDishVisibility] = React.useState({});
  const [soldOutDishes, setSoldOutDishes]   = React.useState({});
  const [analyticsRange, setAnalyticsRange] = React.useState('7d');
  const [isGenerating3D, setIsGenerating3D] = React.useState(false);
  const [enteredCodes, setEnteredCodes] = React.useState({});

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

  const ALLERGEN_OPTIONS = ['Gluten', 'Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Soy', 'Fish'];

  const finalizeGlbResult = React.useCallback((url) => {
    setScanState('complete'); setProgress(100); setScanStageLabel('3D AR Model Ready!');
    setEditingDish(prev => prev ? { ...prev, modelUrl: url } : prev);
  }, []);

  const uploadGlbFile = async (file) => {
    setScanState('uploading'); setScanStageLabel('Uploading .glb model...'); setProgress(30);
    try {
      const filePath = `${activeRestId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('models').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('models').getPublicUrl(filePath);
      finalizeGlbResult(pub.publicUrl);
      return pub.publicUrl;
    } catch (err) {
      console.error(err); setScanState('error'); setScanStageLabel('Upload failed. Check your Supabase storage bucket.');
      return null;
    }
  };

  const handleAIGenerate3D = async () => {
    if (!editingDish.cover && !editingDish.images?.length) {
      showNotification('Please upload at least one dish image first.');
      return;
    }
    setIsGenerating3D(true);
    showNotification('Sending to Meshy.ai...');
    setTimeout(() => {
      // Mock generation completion
      setEditingDish(prev => ({
        ...prev, 
        modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' // placeholder
      }));
      setIsGenerating3D(false);
      showNotification('3D Model generated successfully!');
    }, 3000);
  };

  // ── Order helpers ─────────────────────────────────────────────────
  const restOrders = orders.filter(o => o.restId === activeRestId || o.rest_id === activeRestId);
  const pendingVerification = restOrders.filter(o => o.status === 'Pending Verification');
  const pending   = restOrders.filter(o => o.status === 'Pending' || o.status === 'Scheduled');
  const prep      = restOrders.filter(o => o.status === 'Preparing');
  const ready     = restOrders.filter(o => o.status === 'Ready');
  const completed = restOrders.filter(o => o.status === 'Completed');
  const cancelled = restOrders.filter(o => o.status === 'Cancelled');

  const getOrderNumber = (order) => {
    const idx = restOrders.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)).findIndex(o => o.id === order.id);
    return `#${String(idx + 1).padStart(3, '0')}`;
  };

  // ── Analytics computations ────────────────────────────────────────
  const todayRevenue = completed.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = completed.length > 0 ? todayRevenue / completed.length : 0;
  const cancelRate = restOrders.length > 0 ? Math.round((cancelled.length / restOrders.length) * 100) : 0;

  // Dish order counts
  const dishCounts = {};
  const dishRevenue = {};
  completed.forEach(order => {
    (order.items || []).forEach(item => {
      dishCounts[item.name] = (dishCounts[item.name] || 0) + 1;
      dishRevenue[item.name] = (dishRevenue[item.name] || 0) + Number(item.price || 0);
    });
  });
  const dishRanking = Object.entries(dishCounts)
    .map(([name, count]) => ({ name, count, revenue: dishRevenue[name] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const totalOrderedItems = dishRanking.reduce((s, d) => s + d.count, 0);

  // 7-day revenue (real data)
  const weekData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const dayRev = completed.filter(o => o.timestamp?.startsWith(dayStr)).reduce((s, o) => s + (o.total || 0), 0);
    return { label: d.toLocaleDateString('en-US', { weekday: 'short' })[0], value: dayRev };
  });

  // Peak hours (real heatmap data)
  const HOURS = ['10','11','12','13','14','15','16','17','18','19','20','21'];
  const peakData = HOURS.map(h => ({
    hour: h,
    value: restOrders.filter(o => o.timestamp && new Date(o.timestamp).getHours() === parseInt(h)).length
  }));
  const peakMax = Math.max(...peakData.map(d => d.value), 1);

  // Aggregate and calculate dynamic customer list from real-time orders
  const customerList = React.useMemo(() => {
    const map = {};
    restOrders.forEach(o => {
      // Create a unique key for grouping. Prefer phone or user_id, fallback to name or generic ID.
      const key = o.contactPhone || (o.user_id && o.user_id !== 'anonymous' ? o.user_id : null) || o.contactName || 'anonymous_' + o.id;
      if (!map[key]) {
        let displayName = 'Guest Diner';
        if (o.contactName) {
          displayName = o.contactName;
        } else if (o.contactPhone) {
          displayName = `Guest (${o.contactPhone})`;
        } else if (o.user_id && o.user_id !== 'anonymous') {
          displayName = `Member (${o.user_id.substring(0, 6)})`;
        }

        map[key] = {
          id: key,
          name: displayName,
          phone: o.contactPhone || 'Dine-In Guest',
          userId: o.user_id || 'anonymous',
          totalSpend: 0,
          orderCount: 0,
          lastOrder: o.timestamp,
          orderType: o.orderType || 'dine_in'
        };
      }
      map[key].totalSpend += Number(o.total || 0);
      map[key].orderCount += 1;
      if (new Date(o.timestamp) > new Date(map[key].lastOrder)) {
        map[key].lastOrder = o.timestamp;
      }
    });

    return Object.values(map).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [restOrders]);

  const uniqueCustomers = customerList.length;
  const repeatCustomers = customerList.filter(c => c.orderCount > 1).length;
  const avgLifetimeValue = uniqueCustomers > 0 ? (completed.reduce((s, o) => s + (o.total || 0), 0) / uniqueCustomers) : 0;

  const satisfactionScore = React.useMemo(() => {
    if (restOrders.length === 0) return '5.0';
    const completedCount = completed.length;
    const cancelledCount = cancelled.length;
    const totalProcessed = completedCount + cancelledCount;
    if (totalProcessed === 0) return '4.9';
    const ratio = completedCount / totalProcessed;
    const score = 3.5 + (ratio * 1.5);
    return score.toFixed(1);
  }, [completed.length, cancelled.length, restOrders.length]);

  const vendDishes = dishes.filter(d => d.restId === activeRestId || d.rest_id === activeRestId);

  const TAB_CONFIG = [
    { key: 'orders',    icon: ListOrdered,  label: 'Kitchen',  badge: pendingVerification.length + pending.length + prep.length },
    { key: 'floor',     icon: Bell,         label: 'Floor',    badge: serviceAlerts.length },
    { key: 'analytics', icon: BarChart2,    label: 'Analytics' },
    { key: 'menu',      icon: Utensils,     label: 'Menu' },
    { key: 'growth',    icon: Zap,          label: 'Growth' },
    { key: 'customers', icon: Users,        label: 'Customers' },
    { key: 'events',    icon: Calendar,     label: 'Events' },
    { key: 'qr',        icon: QrIcon,       label: 'Tables' },
    { key: 'settings',  icon: Settings,     label: 'Settings' },
  ];

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
        <AnimatePresence mode="wait">

          {/* ════════════════════ KITCHEN DISPLAY ════════════════════ */}
          {vendorTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-x-auto p-5 flex gap-4 items-start">

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
                        <div className="flex justify-between mb-3">
                          <span className="font-mono font-black text-sm">{getOrderNumber(o)}</span>
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
                          <div className="flex justify-between mb-2">
                            <span className="font-mono font-black text-sm">{getOrderNumber(o)}</span>
                            {o.orderType === 'prepaid' && <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">DUE {o.scheduledTime}</span>}
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
                            <span className="text-xs font-black text-emerald-600">${(o.total || 0).toFixed(2)}</span>
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
                <p className="text-xs font-bold text-emerald-700/60 dark:text-emerald-500">Revenue: <span className="text-emerald-600 dark:text-emerald-400">${todayRevenue.toFixed(2)}</span></p>
                <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/40 space-y-1.5 max-h-48 overflow-y-auto">
                  {completed.slice(-5).reverse().map(o => (
                    <div key={o.id} className="flex justify-between text-xs text-emerald-700/70 dark:text-emerald-500">
                      <span>{getOrderNumber(o)}</span>
                      <span className="font-bold">${(o.total||0).toFixed(2)}</span>
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
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="font-display font-black text-2xl">Floor & Service Hub</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Manage customer requests and active tables</p>
                </div>
                
                <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm min-h-[50vh]">
                  {serviceAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-neutral-400 opacity-60">
                      <CheckCircle size={48} className="mb-4 text-emerald-500" />
                      <p className="font-display font-black text-lg text-neutral-900 dark:text-white">All Clear on the Floor</p>
                      <p className="text-sm">No active service requests right now.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {serviceAlerts.map((alert, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 p-5 rounded-2xl flex flex-col justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                <Bell size={24} className="text-amber-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Table {alert.tableNumber}</p>
                                <p className="font-display font-black text-lg text-neutral-900 dark:text-white">{alert.type}</p>
                              </div>
                            </div>
                            <button onClick={() => setServiceAlerts(prev => prev.filter((_, i) => i !== idx))}
                              className="w-full py-3 rounded-xl bg-amber-500 text-white font-black text-sm hover:bg-amber-600 transition-colors shadow-sm">
                              Mark as Resolved
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ ANALYTICS HUB ════════════════════ */}
          {vendorTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6">
              {!hasPro ? <UpgradeLock requiredPlan="Pro" feature="Analytics Hub" /> : (
              <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-display font-black text-2xl">Analytics Hub</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Deep insights into your restaurant's performance</p>
                  </div>
                  <div className="flex gap-2">
                    {['Today','7d','30d'].map(r => (
                      <button key={r} onClick={() => setAnalyticsRange(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${analyticsRange === r ? 'bg-neutral-900 dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-500'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard icon={DollarSign}   label="Today's Revenue"  value={`$${todayRevenue.toFixed(0)}`}     color="bg-emerald-500" trend={12} />
                  <KpiCard icon={ShoppingBag}  label="Orders Completed" value={completed.length}                  color="bg-blue-500"    trend={5} />
                  <KpiCard icon={TrendingUp}   label="Avg Order Value"  value={`$${avgOrderValue.toFixed(0)}`}   color="bg-purple-500"  trend={-3} />
                  <KpiCard icon={XCircle}      label="Cancellation Rate" value={`${cancelRate}%`}                 color="bg-red-500"     trend={cancelRate > 10 ? 8 : -2} />
                </div>

                {/* Revenue Chart + Order Split */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display font-black text-base">Revenue — 7 Days</h3>
                      <span className="text-xs font-semibold text-neutral-400">vs prev. week <span className="text-emerald-500">↑ 12%</span></span>
                    </div>
                    <MiniBarChart data={weekData} color="#3B82F6" height={100} />
                    <div className="mt-2 text-center text-[10px] text-neutral-400 font-medium">Today: ${todayRevenue.toFixed(2)}</div>
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
              </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════ MENU MANAGER ════════════════════ */}
          {vendorTab === 'menu' && !editingDish && (
            <motion.div key="menu" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="font-display font-black text-2xl">Menu Manager</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">{vendDishes.length} dishes · {vendDishes.filter(d => !dishVisibility[d.id]).length} visible</p>
                  </div>
                  <div className="flex gap-2">
                    <input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleCsvUpload} />
                    <label htmlFor="csv-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-sm font-bold hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors">
                      <Upload size={16} /> Import CSV
                    </label>
                    <button onClick={() => setEditingDish({ name: '', price: '', description: '', modelUrl: '', chef: '', prepTime: '', origin: '', serves: '', images: [], tags: [], macros: { calories: '', protein: '', carbs: '', fat: '' }, allergens: [], ingredients: [] })}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity">
                      <Plus size={16} /> Add Dish
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendDishes.map(dish => (
                    <div key={dish.id} className={`bg-white dark:bg-[#12141D] border rounded-3xl overflow-hidden shadow-sm transition-opacity ${dishVisibility[dish.id] ? 'opacity-50' : ''} border-neutral-100 dark:border-white/6`}>
                      <div className="relative h-36 bg-neutral-100 dark:bg-[#1a1a1f] overflow-hidden">
                        {dish.cover
                          ? <img src={dish.cover} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><ChefHat size={32} className="text-neutral-300" /></div>
                        }
                        {soldOutDishes[dish.id] && (
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
                          <span className="font-display font-black text-base text-[#D4AF37]">${Number(dish.price).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {dish.tags?.slice(0,3).map(t => (
                            <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500">{t}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button onClick={() => setEditingDish(dish)}
                            className="py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity flex items-center justify-center gap-1">
                            <Edit2 size={11} /> Edit
                          </button>
                          <button onClick={() => setSoldOutDishes(p => ({ ...p, [dish.id]: !p[dish.id] }))}
                            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${soldOutDishes[dish.id] ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500'}`}>
                            <Package size={11} /> {soldOutDishes[dish.id] ? 'Restore' : 'Sold Out'}
                          </button>
                          <button onClick={() => setDishVisibility(p => ({ ...p, [dish.id]: !p[dish.id] }))}
                            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${dishVisibility[dish.id] ? 'bg-neutral-200 dark:bg-white/10 text-neutral-700' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500'}`}>
                            {dishVisibility[dish.id] ? <EyeOff size={11} /> : <Eye size={11} />}
                            {dishVisibility[dish.id] ? 'Hidden' : 'Visible'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
          )}

          {/* ── EVENTS TAB ── */}
          {vendorTab === 'events' && (
            <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 overflow-y-auto p-6">
              {!hasPro ? <UpgradeLock requiredPlan="Pro" feature="Events & Promos" /> : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-black">Events & Promos</h2>
                    <p className="text-neutral-500">Manage your upcoming restaurant events.</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2">
                    <Plus size={16} /> Create Event
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex flex-col items-center justify-center border border-orange-200 dark:border-orange-800/50">
                       <span className="text-xs font-bold text-orange-600 dark:text-orange-400">OCT</span>
                       <span className="text-xl font-black text-orange-700 dark:text-orange-300">28</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Live Jazz Night</h3>
                      <p className="text-sm text-neutral-500">Enjoy live music with our special dinner menu.</p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-white/5 rounded-md text-xs font-bold">18 RSVPs</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-xs font-bold">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    <X size={18} />
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
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Dish Name *</label>
                        <input required type="text" value={editingDish.name} onChange={e => setEditingDish({...editingDish, name: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Price ($) *</label>
                        <input required type="number" step="0.01" value={editingDish.price} onChange={e => setEditingDish({...editingDish, price: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Chef Name</label>
                        <input type="text" value={editingDish.chef || ''} onChange={e => setEditingDish({...editingDish, chef: e.target.value})}
                          placeholder="Chef of the House"
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
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="relative flex items-center">
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
                      </div>
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
                    {!editingDish.modelUrl ? (
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
                          <button type="button" onClick={() => window.open(editingDish.modelUrl, '_blank')}
                            className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors font-bold text-xs flex items-center gap-2">
                            <Eye size={15} /> Preview
                          </button>
                          <button type="button" onClick={() => setEditingDish({...editingDish, modelUrl: ''})}
                            className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-100 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        
                        {/* Live Model Preview */}
                        <div className="w-full h-64 bg-neutral-100 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden relative">
                          <ModelViewer 
                            src={editingDish.modelUrl}
                            autoRotate
                            cameraControls
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
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider">Tags & Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Chef's Pick", 'Bestseller', 'Signature', 'Popular', 'Seasonal', 'Vegan', 'High Protein', 'Low Calorie', 'Spicy', 'New'].map(tag => {
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
              {!hasPro ? <UpgradeLock requiredPlan="Pro" feature="Growth Tools" /> : (
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <h2 className="font-display font-black text-2xl">Growth Tools</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Boost revenue with smart promotions and marketing</p>
                </div>

                {/* Tool Cards */}
                <div className="space-y-3">
                  <PromoCard icon={Percent} title="Flash Discount" badge="Popular" badgeColor="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    desc="Set a time-limited % discount on selected dishes or the entire menu to drive impulse purchases."
                    onClick={() => setActivePromo(activePromo === 'discount' ? null : 'discount')} />
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
                              <input type="number" value={promoForm.discount} min="1" max="70"
                                onChange={e => setPromoForm(p => ({...p, discount: e.target.value}))}
                                className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-neutral-500 block mb-1.5">Expires</label>
                              <input type="date" value={promoForm.expires}
                                onChange={e => setPromoForm(p => ({...p, expires: e.target.value}))}
                                className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            <div className="flex items-end">
                              <button onClick={() => { showNotification(`Promo "${promoForm.label}" activated — ${promoForm.discount}% off!`); setActivePromo(null); }}
                                className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity">
                                Activate Promo
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <PromoCard icon={Clock} title="Happy Hour" badge="High Impact" badgeColor="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    desc="Configure time windows where selected categories (drinks, starters) get automatic discounts."
                    onClick={() => setActivePromo(activePromo === 'happy' ? null : 'happy')} />
                  <AnimatePresence>
                    {activePromo === 'happy' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5">
                          <div className="grid grid-cols-3 gap-4">
                            <div><label className="text-xs font-bold text-neutral-500 block mb-1.5">From</label><input type="time" defaultValue="17:00" className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" /></div>
                            <div><label className="text-xs font-bold text-neutral-500 block mb-1.5">To</label><input type="time" defaultValue="19:00" className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" /></div>
                            <div><label className="text-xs font-bold text-neutral-500 block mb-1.5">Discount %</label><input type="number" defaultValue="20" className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" /></div>
                          </div>
                          <button onClick={() => { showNotification('Happy Hour configured: 5–7 PM at 20% off!'); setActivePromo(null); }}
                            className="mt-4 w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-black hover:bg-amber-600 transition-colors">
                            Enable Happy Hour
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <PromoCard icon={Bell} title="Push Notification" desc="Send a custom message to all recent customers — announce a new dish, daily special, or invite them back."
                    onClick={() => setActivePromo(activePromo === 'notif' ? null : 'notif')} />
                  <AnimatePresence>
                    {activePromo === 'notif' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-3">
                          <textarea value={notifText} onChange={e => setNotifText(e.target.value)} rows={3}
                            placeholder="🍽 Tonight's special: Truffle Risotto — only 8 seats left!"
                            className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white resize-none" />
                          <div className="flex gap-3">
                            <div className="flex-1 py-3 px-4 bg-neutral-50 dark:bg-[#0d0d10] rounded-xl text-xs text-neutral-500 border border-neutral-100 dark:border-white/8">
                              📣 Will reach ~{uniqueCustomers} recent customers
                            </div>
                            <button onClick={() => { showNotification(`Notification sent to ${uniqueCustomers} customers!`); setNotifText(''); setActivePromo(null); }}
                              className="px-5 py-3 rounded-xl bg-blue-500 text-white text-sm font-black hover:bg-blue-600 transition-colors">
                              Send Now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <PromoCard icon={Gift} title="Loyalty Rewards" badge="Coming Soon" badgeColor="bg-neutral-100 dark:bg-white/8 text-neutral-500"
                    desc="Set up a stamp-card system where customers earn points and redeem rewards automatically."
                    onClick={() => showNotification('Loyalty rewards launching soon!')} />

                  <PromoCard icon={Target} title="Smart Upsell Rules" badge="AI" badgeColor="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    desc="Automatically suggest high-margin add-ons when customers add specific dishes to their cart."
                    onClick={() => showNotification('AI upsell rules coming soon!')} />
                </div>

                {/* Revenue Forecast */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp size={20} />
                    <h3 className="font-display font-black text-lg">Revenue Forecast</h3>
                  </div>
                  <p className="text-sm text-blue-100 mb-4">Based on your current daily average, projected monthly revenue:</p>
                  <p className="font-display font-black text-5xl mb-2">${(todayRevenue * 26).toFixed(0)}</p>
                  <p className="text-xs text-blue-200">Activate promos to increase this by 15-40%</p>
                </div>
              </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════ CUSTOMER INSIGHTS ════════════════════ */}
          {vendorTab === 'customers' && (
            <motion.div key="customers" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6">
              {!hasPro ? <UpgradeLock requiredPlan="Pro" feature="Customer Insights" /> : (
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="font-display font-black text-2xl">Customer Insights</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Understand your audience to serve them better</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard icon={Users}      label="Total Customers"     value={uniqueCustomers}              color="bg-blue-500" />
                  <KpiCard icon={Repeat}     label="Repeat Guests"       value={repeatCustomers}              color="bg-purple-500" />
                  <KpiCard icon={DollarSign} label="Avg Lifetime Value"  value={`$${avgLifetimeValue.toFixed(0)}`} color="bg-emerald-500" />
                  <KpiCard icon={Star}       label="Satisfaction Score"  value={`${satisfactionScore} ★`}    color="bg-amber-500" />
                </div>

                {/* Customer list from orders */}
                <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-neutral-50 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-display font-black text-base">Top Customers (by Spend)</h3>
                    <span className="text-xs text-neutral-400 font-bold">{customerList.length} total profiles</span>
                  </div>
                  <div className="divide-y divide-neutral-50 dark:divide-white/4">
                    {customerList.slice(0, 15).map(c => (
                      <div key={c.id} className="px-5 py-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-white/3 transition-colors">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-[#AA8C2C] flex items-center justify-center text-white font-black text-sm shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{c.name}</p>
                          <p className="text-xs text-neutral-400">
                            {c.phone} · {c.orderCount} order{c.orderCount > 1 ? 's' : ''} · Last: {new Date(c.lastOrder).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-sm text-emerald-600">${Number(c.totalSpend).toFixed(2)}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{c.orderType === 'dine_in' ? 'Dine-In' : 'Pre-Order'}</p>
                        </div>
                      </div>
                    ))}
                    {customerList.length === 0 && (
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
                        value={`${window.location.origin}/scanner?restId=${activeRestId}&table=${i + 1}`}
                        size={130} level="H" includeMargin={false} fgColor="#111111"
                        className="dark:hidden"
                      />
                      <QRCodeSVG
                        value={`${window.location.origin}/scanner?restId=${activeRestId}&table=${i + 1}`}
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
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Cover Image URL</label>
                      <input type="url" value={settingsForm.cover} onChange={e => setSettingsForm({...settingsForm, cover: e.target.value})}
                        className="w-full rounded-xl p-3 text-sm" placeholder="https://..." />
                      {settingsForm.cover && <div className="mt-2 h-28 rounded-xl bg-cover bg-center border" style={{ backgroundImage: `url(${settingsForm.cover})`, borderColor: 'rgba(212,175,55,0.2)' }} />}
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

                  {/* ── OCR Menu Import ── */}
                  <div className="rounded-2xl p-5 space-y-3 mt-4 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[rgba(212,175,55,0.15)]">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
                      <Upload size={13}/> AI Menu Import (OCR)
                    </h3>
                    <p className="text-sm text-neutral-500">Upload any existing paper/PDF menu — our AI will scan and create all dishes automatically.</p>
                    <button type="button" onClick={() => showNotification("Analyzing PDF menu... This may take a moment.")}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                      style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}>
                      <Upload size={15}/> Upload PDF / Image Menu
                    </button>
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

        </AnimatePresence>
      </div>
    </div>
  );
}
