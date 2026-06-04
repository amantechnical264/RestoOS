import React from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Star, Trophy, History, ChevronLeft, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const ACHIEVEMENTS = [
  { id: 1, name: 'First Timer', icon: '🌟', desc: 'Placed your first order', unlocked: true, xp: 50 },
  { id: 2, name: 'Spice Seeker', icon: '🌶️', desc: 'Ordered 3 spicy dishes', unlocked: true, xp: 100 },
  { id: 3, name: 'Night Owl', icon: '🦉', desc: 'Ordered after 10 PM', unlocked: false, xp: 75 },
  { id: 4, name: 'Loyal Regular', icon: '👑', desc: 'Visited 10 times', unlocked: false, xp: 200 },
];

const LEADERBOARD = [
  { rank: 1, name: 'FoodNinja', xp: 2400, avatar: 'F' },
  { rank: 2, name: 'GourmetKing', xp: 2100, avatar: 'G' },
  { rank: 3, name: 'SpiceHunter', xp: 1800, avatar: 'S' },
];

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { user, orders } = useAppContext();

  const dinerProfile = JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}');
  const dinerName = user?.name || dinerProfile.name || 'Foodie';
  const initial = dinerName.charAt(0).toUpperCase();

  const points = 1450;
  const rank = 4;
  const totalOrders = orders.length || 3;

  const cardStyleClass = "bg-white dark:bg-gradient-to-br dark:from-[#111111] dark:to-[#080808] border border-neutral-200 dark:border-[rgba(212,175,55,0.18)] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.8)]";

  const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

  return (
    <div className="flex flex-col min-h-[100dvh] bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white font-sans pb-20">

      {/* ── Header ── */}
      <div
        className="relative p-5 pb-8 text-neutral-900 dark:text-white overflow-hidden shrink-0 bg-white dark:bg-black border-b border-neutral-200 dark:border-transparent"
      >
        {/* Gold glow orb */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }} />

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-neutral-100 dark:bg-[rgba(212,175,55,0.1)] border border-neutral-200 dark:border-[rgba(212,175,55,0.3)]"
          >
            <ChevronLeft size={20} className="text-[#D4AF37]" />
          </button>

          <div className="flex-1">
            <h1 className="font-display font-black text-2xl text-neutral-900 dark:text-white">{dinerName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Crown size={12} style={{ color: '#D4AF37' }} />
              <p className="text-xs font-bold" style={{ color: '#D4AF37' }}>Gold Member</p>
            </div>
          </div>

          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-gold"
            style={{ background: goldGradient, boxShadow: '0 4px 20px rgba(212,175,55,0.4)' }}
          >
            <span className="font-display font-black text-2xl text-black">{initial}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 space-y-5 no-scrollbar">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Trophy, label: 'XP Points', value: points.toLocaleString(), color: '#D4AF37' },
            { icon: Crown,  label: 'City Rank',  value: `#${rank}`,             color: '#D4AF37' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl p-5 flex flex-col items-center text-center ${cardStyleClass}`}
            >
              <Icon size={26} style={{ color, marginBottom: 8 }} />
              <p className="font-display font-black text-2xl text-neutral-900 dark:text-white">{value}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1 text-neutral-500">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* XP Progress Bar */}
        <div className={`rounded-2xl p-5 ${cardStyleClass}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-neutral-900 dark:text-white">Level 4 — Gold Connoisseur</span>
            <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>{points}/2000 XP</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(points / 2000) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: goldGradient }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2">550 XP to Level 5 — Platinum Elite</p>
        </div>

        {/* Leaderboard */}
        <div>
          <div
            className={`rounded-2xl p-5 bg-white dark:bg-gradient-to-br dark:from-[#111] dark:to-[#0a0a00] border border-neutral-200 dark:border-[rgba(212,175,55,0.25)]`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-black text-lg flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>🏆</span> City Leaderboard
              </h3>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                Top 5%
              </span>
            </div>

            <div className="space-y-3">
              {LEADERBOARD.map(p => (
                <div key={p.rank} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-black text-neutral-500">#{p.rank}</span>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-black"
                    style={{ background: goldGradient }}
                  >
                    {p.avatar}
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white flex-1">{p.name}</span>
                  <span className="text-xs font-black" style={{ color: '#D4AF37' }}>{p.xp.toLocaleString()} XP</span>
                </div>
              ))}

              {/* You */}
              <div
                className="flex items-center gap-3 rounded-xl p-2 -mx-1 bg-neutral-100 dark:bg-[rgba(212,175,55,0.08)] border border-neutral-200 dark:border-[rgba(212,175,55,0.2)]"
              >
                <span className="w-6 text-xs font-black" style={{ color: '#D4AF37' }}>#{rank}</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-black"
                  style={{ background: goldGradient }}
                >
                  {initial}
                </div>
                <span className="font-bold text-sm text-neutral-900 dark:text-white flex-1">You</span>
                <span className="text-xs font-black" style={{ color: '#D4AF37' }}>{points.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="font-display font-black text-lg mb-3 flex items-center gap-2">
            <Zap size={18} style={{ color: '#D4AF37' }} /> Your Badges
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map(a => (
              <motion.div
                key={a.id}
                whileHover={a.unlocked ? { scale: 1.03 } : {}}
                className={`rounded-2xl p-4 ${!a.unlocked ? 'opacity-40 grayscale' : ''} ${
                  a.unlocked ? cardStyleClass : 'bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/5'
                }`}
              >
                <span className="text-3xl block mb-2">{a.icon}</span>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{a.name}</h4>
                <p className="text-xs text-neutral-500 mt-0.5 mb-2">{a.desc}</p>
                {a.unlocked && (
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
                  >
                    +{a.xp} XP
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Visit History */}
        <div>
          <h3 className="font-display font-black text-lg mb-3 flex items-center gap-2">
            <History size={18} style={{ color: '#D4AF37' }} /> Recent Visits
          </h3>
          <div className="space-y-3">
            {totalOrders > 0
              ? Array(Math.min(3, totalOrders)).fill(0).map((_, i) => (
                <div key={i} className={`rounded-2xl p-4 flex justify-between items-center ${cardStyleClass}`}>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">Local Bistro</h4>
                    <p className="text-xs text-neutral-500">{i + 1} day{i !== 0 ? 's' : ''} ago</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black" style={{ color: '#D4AF37' }}>+150 XP</span>
                    <p className="text-[10px] text-neutral-600 mt-0.5">Earned</p>
                  </div>
                </div>
              ))
              : (
                <div className={`rounded-2xl p-6 text-center ${cardStyleClass}`}>
                  <p className="text-sm text-neutral-500">No visits yet. Time to explore the menu!</p>
                </div>
              )
            }
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
