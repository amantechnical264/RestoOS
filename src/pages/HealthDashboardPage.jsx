import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Activity, Calendar, TrendingUp, Crown, Pencil, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const GOLD = '#D4AF37';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)' },
  { key: 'fat',      label: 'Fat',      unit: 'g',    color: GOLD,      bg: 'rgba(212,175,55,0.12)',  border: 'rgba(212,175,55,0.25)' },
];

function MacroBar({ label, unit, color, bg, border, value, goal }) {
  const pct = Math.min(100, goal > 0 ? Math.round((value / goal) * 100) : 0);
  const over = value > goal && goal > 0;
  return (
    <div className="rounded-2xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
        <span className="text-xs font-black text-white">
          {value}<span className="text-neutral-500 ml-0.5 font-normal">{unit}</span>
          <span className="text-neutral-500 font-normal"> / {goal}{unit}</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: over ? '#ef4444' : color, boxShadow: `0 0 8px ${color}55` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-bold" style={{ color: over ? '#ef4444' : color }}>
          {pct}% {over ? '⚠ Over goal' : 'of daily goal'}
        </span>
        <span className="text-[10px] text-neutral-600 font-medium">
          {Math.max(0, goal - value)}{unit} left
        </span>
      </div>
    </div>
  );
}

export default function HealthDashboardPage() {
  const navigate = useNavigate();
  const { user, orders, restaurants, userPreferences, updatePreferences } = useAppContext();

  const savedGoals = userPreferences?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  const [editingGoals, setEditingGoals] = useState(false);
  const [draftGoals, setDraftGoals] = useState({ ...savedGoals });

  const handleSaveGoals = () => {
    const parsed = {
      calories: parseInt(draftGoals.calories) || 2000,
      protein:  parseInt(draftGoals.protein)  || 150,
      carbs:    parseInt(draftGoals.carbs)    || 250,
      fat:      parseInt(draftGoals.fat)      || 65,
    };
    updatePreferences({ goals: parsed });
    setDraftGoals(parsed);
    setEditingGoals(false);
  };

  const handleCancelGoals = () => {
    setDraftGoals({ ...savedGoals });
    setEditingGoals(false);
  };

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
          <p className="text-neutral-500 text-xs">Resets daily at midnight · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-6 space-y-5">

        {/* ── TODAY'S INTAKE WITH PROGRESS BARS ── */}
        <div className="rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
          style={{ background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.2)' }}>

          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37] opacity-[0.03] blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-5 relative z-10">
            <h2 className="font-display font-black text-lg text-white flex items-center gap-2">
              <Crown size={16} style={{ color: GOLD }} /> Today's Intake
            </h2>
            <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-black"
              style={{ background: goldGradient }}>
              {todayOrders.length} meal{todayOrders.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3 relative z-10">
            {MACRO_CONFIG.map(m => (
              <MacroBar
                key={m.key}
                label={m.label}
                unit={m.unit}
                color={m.color}
                bg={m.bg}
                border={m.border}
                value={todayTotals[m.key]}
                goal={savedGoals[m.key]}
              />
            ))}
          </div>

          {todayOrders.length === 0 && (
            <p className="text-center text-xs text-neutral-600 mt-4">Place an order to start tracking today's nutrition.</p>
          )}
        </div>

        {/* ── DAILY GOALS (editable) ── */}
        <div className="rounded-[2rem] p-6 relative overflow-hidden"
          style={{ background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#D4AF37] opacity-[0.03] blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-5 relative z-10">
            <h2 className="font-display font-black text-lg text-white flex items-center gap-2">
              🎯 Daily Goals
            </h2>
            <AnimatePresence mode="wait">
              {!editingGoals ? (
                <motion.button key="edit" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setEditingGoals(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}>
                  <Pencil size={12} /> Edit
                </motion.button>
              ) : (
                <motion.div key="actions" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-2">
                  <button onClick={handleCancelGoals}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-400 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <X size={12} /> Cancel
                  </button>
                  <button onClick={handleSaveGoals}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-black transition-all"
                    style={{ background: goldGradient }}>
                    <Check size={12} /> Save
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3 relative z-10">
            {MACRO_CONFIG.map(m => (
              <div key={m.key} className="rounded-2xl p-4" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: m.color }}>{m.label}</p>
                {editingGoals ? (
                  <input
                    type="number"
                    value={draftGoals[m.key]}
                    onChange={e => setDraftGoals(prev => ({ ...prev, [m.key]: e.target.value }))}
                    className="w-full bg-black/40 rounded-lg px-2 py-1.5 text-white font-black text-lg focus:outline-none border"
                    style={{ borderColor: m.color + '55' }}
                  />
                ) : (
                  <p className="text-2xl font-black text-white">
                    {savedGoals[m.key]}
                    <span className="text-xs text-neutral-500 ml-1 font-normal">{m.unit}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {editingGoals && (
            <p className="text-center text-[10px] text-neutral-600 mt-4">Changes are saved locally on your device.</p>
          )}
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
                const isToday = new Date(order.timestamp || order.created_at).toDateString() === today;

                return (
                  <motion.div key={order.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-3xl p-5" style={{ background: '#0a0a0a', border: isToday ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm text-white">{restName}</p>
                          {isToday && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-black" style={{ background: goldGradient }}>TODAY</span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 font-medium mt-0.5">{orderDate}</p>
                      </div>
                      <span className="font-black text-xs px-2.5 py-1 rounded-lg text-black" style={{ background: goldGradient }}>
                        {m.calories} kcal
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">{itemsStr || 'No items detail'}</p>
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
