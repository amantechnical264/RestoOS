import React from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Star, Trophy, History, ChevronLeft, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

// Helper to format "time ago" relative dates
function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { user, orders, restaurants } = useAppContext();

  // Get active diner identifier (registered user or persistent local storage guest UUID)
  const dinerProfile = JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}');
  const userId = user?.uid || user?.phone || dinerProfile.guestId || 'anonymous';
  const dinerName = user?.name || dinerProfile.name || 'Diner Guest';
  const initial = dinerName.charAt(0).toUpperCase();

  // Filter orders placed by this customer (by matching user_id)
  const myOrders = React.useMemo(() => {
    return orders.filter(o => o.user_id === userId || o.contactPhone === user?.phone);
  }, [orders, userId, user]);

  const orderCount = myOrders.length;

  // ─── Dynamic Badges / Achievements Logic ─────────────────────────────
  const hasSpicy = React.useMemo(() => {
    return myOrders.some(o => 
      o.items?.some(item => 
        item.spiceLevel === 'Hot' || 
        item.spiceLevel === 'Extra Hot' || 
        item.tags?.includes('Spicy')
      )
    );
  }, [myOrders]);

  const hasLateNight = React.useMemo(() => {
    return myOrders.some(o => {
      const hour = new Date(o.timestamp).getHours();
      return hour >= 22 || hour <= 4;
    });
  }, [myOrders]);

  const achievements = React.useMemo(() => {
    const list = [
      { id: 1, name: 'First Timer', icon: '🌟', desc: 'Placed your first order', unlocked: orderCount >= 1, xp: 50 },
      { id: 2, name: 'Spice Seeker', icon: '🌶️', desc: 'Ordered a spicy dish', unlocked: hasSpicy, xp: 100 },
      { id: 3, name: 'Night Owl', icon: '🦉', desc: 'Ordered after 10 PM', unlocked: hasLateNight, xp: 75 },
      { id: 4, name: 'Loyal Regular', icon: '👑', desc: 'Placed 5 or more orders', unlocked: orderCount >= 5, xp: 200 },
    ];
    return list;
  }, [orderCount, hasSpicy, hasLateNight]);

  // ─── XP & Level Calculation ───────────────────────────────────────
  // Every successful order grants 150 XP, plus XP from unlocked badges
  const badgeXp = achievements.reduce((sum, a) => sum + (a.unlocked ? a.xp : 0), 0);
  const totalXp = (orderCount * 150) + badgeXp;

  // Level milestones mapping
  const levelInfo = React.useMemo(() => {
    if (totalXp < 500) {
      return { level: 1, name: 'Bronze Diner', nextName: 'Silver Foodie', min: 0, max: 500 };
    } else if (totalXp < 1000) {
      return { level: 2, name: 'Silver Foodie', nextName: 'Gold Connoisseur', min: 500, max: 1000 };
    } else if (totalXp < 1800) {
      return { level: 3, name: 'Gold Connoisseur', nextName: 'Platinum Elite', min: 1000, max: 1800 };
    } else if (totalXp < 3000) {
      return { level: 4, name: 'Platinum Elite', nextName: 'Diamond Master', min: 1800, max: 3000 };
    } else {
      return { level: 5, name: 'Diamond Master', nextName: 'Legendary Foodie', min: 3000, max: 6000 };
    }
  }, [totalXp]);

  const levelProgressPct = Math.min(100, ((totalXp - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100);
  const xpNeeded = levelInfo.max - totalXp;

  // City Rank approximation based on XP tiers
  const cityRank = React.useMemo(() => {
    if (totalXp > 2500) return 1;
    if (totalXp > 2000) return 2;
    if (totalXp > 1500) return 3;
    if (totalXp > 1000) return 4;
    if (totalXp > 500) return 8;
    return 12;
  }, [totalXp]);

  // Static mock leaderboard entries above the current user
  const leaderboard = React.useMemo(() => {
    const defaultLeaders = [
      { rank: 1, name: 'FoodNinja', xp: 2800, avatar: 'F' },
      { rank: 2, name: 'GourmetKing', xp: 2200, avatar: 'G' },
      { rank: 3, name: 'SpiceHunter', xp: 1600, avatar: 'S' },
    ];
    // Filter out mock leaders that have less XP than the user to preserve rank order
    return defaultLeaders.filter(l => l.xp > totalXp);
  }, [totalXp]);

  const cardStyleClass = "bg-white dark:bg-gradient-to-br dark:from-[#111111] dark:to-[#080808] border border-neutral-200 dark:border-[rgba(212,175,55,0.18)] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.8)]";
  const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

  return (
    <div className="flex flex-col min-h-[100dvh] bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white font-sans pb-20">

      {/* ── Header ── */}
      <div className="relative p-5 pb-8 text-neutral-900 dark:text-white overflow-hidden shrink-0 bg-white dark:bg-black border-b border-neutral-200 dark:border-transparent">
        {/* Gold glow orb */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }} />

        <div className="flex items-center gap-4 relative z-10">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-neutral-100 dark:bg-[rgba(212,175,55,0.1)] border border-neutral-200 dark:border-[rgba(212,175,55,0.3)]">
            <ChevronLeft size={20} className="text-[#D4AF37]" />
          </button>

          <div className="flex-1">
            <h1 className="font-display font-black text-2xl text-neutral-900 dark:text-white">{dinerName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Crown size={12} style={{ color: '#D4AF37' }} />
              <p className="text-xs font-bold" style={{ color: '#D4AF37' }}>{levelInfo.name}</p>
            </div>
          </div>

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-gold"
            style={{ background: goldGradient, boxShadow: '0 4px 20px rgba(212,175,55,0.4)' }}>
            <span className="font-display font-black text-2xl text-black">{initial}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 space-y-5 no-scrollbar">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.02 }} className={`rounded-2xl p-5 flex flex-col items-center text-center ${cardStyleClass}`}>
            <Trophy size={26} style={{ color: '#D4AF37', marginBottom: 8 }} />
            <p className="font-display font-black text-2xl text-neutral-900 dark:text-white">{totalXp.toLocaleString()}</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1 text-neutral-500">XP Points</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className={`rounded-2xl p-5 flex flex-col items-center text-center ${cardStyleClass}`}>
            <Crown size={26} style={{ color: '#D4AF37', marginBottom: 8 }} />
            <p className="font-display font-black text-2xl text-neutral-900 dark:text-white">#{cityRank}</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1 text-neutral-500">City Rank</p>
          </motion.div>
        </div>

        {/* Level Progress Bar */}
        <div className={`rounded-2xl p-5 ${cardStyleClass}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-neutral-900 dark:text-white">Level {levelInfo.level} — {levelInfo.name}</span>
            <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>{totalXp}/{levelInfo.max} XP</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-200 dark:bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgressPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: goldGradient }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {xpNeeded > 0 ? `${xpNeeded} XP to Level ${levelInfo.level + 1} — ${levelInfo.nextName}` : 'Max level achieved!'}
          </p>
        </div>

        {/* Leaderboard */}
        <div>
          <div className={`rounded-2xl p-5 bg-white dark:bg-gradient-to-br dark:from-[#111] dark:to-[#0a0a00] border border-neutral-200 dark:border-[rgba(212,175,55,0.25)]`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-black text-lg flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>🏆</span> City Leaderboard
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                Top 5%
              </span>
            </div>

            <div className="space-y-3">
              {leaderboard.map((p, idx) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-black text-neutral-500">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-black"
                    style={{ background: goldGradient }}>
                    {p.avatar}
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white flex-1">{p.name}</span>
                  <span className="text-xs font-black" style={{ color: '#D4AF37' }}>{p.xp.toLocaleString()} XP</span>
                </div>
              ))}

              {/* Dynamic Diner Rank row */}
              <div className="flex items-center gap-3 rounded-xl p-2 -mx-1 bg-neutral-100 dark:bg-[rgba(212,175,55,0.08)] border border-neutral-200 dark:border-[rgba(212,175,55,0.2)]">
                <span className="w-6 text-xs font-black" style={{ color: '#D4AF37' }}>#{cityRank}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-black"
                  style={{ background: goldGradient }}>
                  {initial}
                </div>
                <span className="font-bold text-sm text-neutral-900 dark:text-white flex-1">You</span>
                <span className="text-xs font-black" style={{ color: '#D4AF37' }}>{totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements / Badges Grid */}
        <div>
          <h3 className="font-display font-black text-lg mb-3 flex items-center gap-2">
            <Zap size={18} style={{ color: '#D4AF37' }} /> Your Badges
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map(a => (
              <motion.div
                key={a.id}
                whileHover={a.unlocked ? { scale: 1.03 } : {}}
                className={`rounded-2xl p-4 transition-all duration-300 ${!a.unlocked ? 'opacity-30 grayscale' : ''} ${
                  a.unlocked ? cardStyleClass : 'bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/5'
                }`}
              >
                <span className="text-3xl block mb-2">{a.icon}</span>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{a.name}</h4>
                <p className="text-xs text-neutral-500 mt-0.5 mb-2">{a.desc}</p>
                {a.unlocked ? (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                    +{a.xp} XP
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-neutral-400">Locked</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dynamic Visit History */}
        <div>
          <h3 className="font-display font-black text-lg mb-3 flex items-center gap-2">
            <History size={18} style={{ color: '#D4AF37' }} /> Recent Visits
          </h3>
          <div className="space-y-3">
            {myOrders.length > 0 ? (
              myOrders.slice(0, 5).map((o) => {
                const restName = restaurants.find(r => r.id === o.restId || r.id === o.rest_id)?.name || 'Local Restaurant';
                return (
                  <div key={o.id} className={`rounded-2xl p-4 flex justify-between items-center ${cardStyleClass}`}>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">{restName}</h4>
                      <p className="text-xs text-neutral-500">{timeAgo(o.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black" style={{ color: '#D4AF37' }}>+150 XP</span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Earned</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`rounded-2xl p-6 text-center ${cardStyleClass}`}>
                <p className="text-sm text-neutral-500">No visits yet. Scan a table QR code or order to earn XP!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
