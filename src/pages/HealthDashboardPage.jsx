import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Droplets, Leaf, Activity, Calendar, TrendingUp, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const GOLD = '#D4AF37';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

function MacroRing({ value, max, color, label, unit }) {
  const pct  = Math.min(1, (value || 0) / max);
  const r    = 28;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <motion.circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - pct) }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color}66)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-white">{Math.round(pct * 100)}%</span>
        </div>
      </div>
      <span className="text-xs font-black mt-2 text-white">{value || 0}<span className="text-[10px] text-neutral-500 ml-0.5">{unit}</span></span>
      <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color }}>{label}</span>
    </div>
  );
}

export default function HealthDashboardPage() {
  const navigate = useNavigate();
  const { user, orders, restaurants, userPreferences } = useAppContext();
  const DAILY_GOALS = userPreferences?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  const myOrders = orders.filter(o => {
    const userId = o.user_id || o.userId;
    return userId === user?.uid || userId === user?.phone || userId === user?.email || userId === 'anonymous';
  });

  const validOrders = myOrders.filter(o => o.status !== 'Cancelled' && o.status !== 'Rejected');

  const today = new Date().toDateString();
  const todayOrders = validOrders.filter(o => new Date(o.timestamp || o.created_at).toDateString() === today);

  const calculateMacros = (items) => (items || []).reduce((acc, item) => {
    if (item.macros) {
      acc.calories += parseInt(item.macros.calories) || 0;
      acc.protein  += parseInt(item.macros.protein)  || 0;
      acc.carbs    += parseInt(item.macros.carbs)    || 0;
      acc.fat      += parseInt(item.macros.fat)      || 0;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const todayTotals = todayOrders.reduce((acc, order) => {
    const m = calculateMacros(order.items || []);
    acc.calories += m.calories;
    acc.protein  += m.protein;
    acc.carbs    += m.carbs;
    acc.fat      += m.fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const weeklyAvg = validOrders.length > 0
    ? Math.round(validOrders.reduce((s, r) => s + calculateMacros(r.items || []).calories, 0) / validOrders.length)
    : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-screen bg-black text-white overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-14 pb-5"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.15)', background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <ChevronLeft size={20} style={{ color: GOLD }} />
        </button>
        <div>
          <h1 className="text-xl font-display font-black text-white">Health Dashboard</h1>
          <p className="text-neutral-500 text-xs">Track your daily nutrition</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-6 space-y-6">

        {/* Today Goals */}
        <div className="rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
          style={{ background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.2)' }}>
          
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37] opacity-[0.03] blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Crown size={16} style={{ color: GOLD }} /> Today's Intake
            </h2>
            <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-black"
              style={{ background: goldGradient }}>
              {todayOrders.length} meal{todayOrders.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 relative z-10">
            <MacroRing value={todayTotals.calories} max={DAILY_GOALS.calories} color="#f97316" label="Cals"   unit="kcal" />
            <MacroRing value={todayTotals.protein}  max={DAILY_GOALS.protein}  color="#3b82f6" label="Prot"   unit="g" />
            <MacroRing value={todayTotals.carbs}    max={DAILY_GOALS.carbs}    color="#10b981" label="Carbs"  unit="g" />
            <MacroRing value={todayTotals.fat}      max={DAILY_GOALS.fat}      color={GOLD}    label="Fat"    unit="g" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Activity size={18} style={{ color: GOLD }} className="mb-2" />
            <p className="text-2xl font-black text-white">{weeklyAvg}</p>
            <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase tracking-widest">Avg Daily Cal</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Calendar size={18} style={{ color: GOLD }} className="mb-2" />
            <p className="text-2xl font-black text-white">{validOrders.length}</p>
            <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase tracking-widest">Meals Tracked</p>
          </div>
        </div>

        {/* Meal History */}
        <div>
          <h2 className="font-display font-black text-base mb-4 flex items-center gap-2">
            <TrendingUp size={16} style={{ color: GOLD }} /> Meal History
          </h2>
          {validOrders.length === 0 ? (
            <div className="text-center py-12 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Flame size={32} style={{ color: 'rgba(212,175,55,0.3)' }} className="mx-auto mb-3" />
              <p className="font-bold text-neutral-400">No meals tracked yet.</p>
              <p className="text-xs text-neutral-600 mt-1">Place an order to start tracking.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...validOrders].sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at)).map((order, i) => {
                const m = calculateMacros(order.items || []);
                const restName = restaurants.find(r => r.id === (order.rest_id || order.restId))?.name || 'Restaurant';
                const itemsStr = (order.items || []).map(item => item.name).join(' · ');
                const orderDate = new Date(order.timestamp || order.created_at).toLocaleString();

                return (
                  <motion.div key={order.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-3xl p-5" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-black text-sm text-white">{restName}</p>
                        <p className="text-[10px] text-neutral-500 font-medium mt-0.5">{orderDate}</p>
                      </div>
                      <span className="font-black text-xs px-2.5 py-1 rounded-lg text-black" style={{ background: goldGradient }}>
                        {m.calories} kcal
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">{itemsStr}</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl p-2" style={{ background: 'rgba(59,130,246,0.1)' }}>
                        <span className="text-blue-400 font-black text-sm block">{m.protein}g</span>
                        <span className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest">Protein</span>
                      </div>
                      <div className="rounded-xl p-2" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <span className="text-emerald-400 font-black text-sm block">{m.carbs}g</span>
                        <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Carbs</span>
                      </div>
                      <div className="rounded-xl p-2" style={{ background: 'rgba(212,175,55,0.1)' }}>
                        <span className="font-black text-sm block" style={{ color: GOLD }}>{m.fat}g</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.5)' }}>Fat</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
