import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ListOrdered, TrendingUp, Utensils, QrCode as QrIcon,
  Box, Edit2, Plus, X as CloseIcon, Upload, AlertTriangle, LogOut, Store, Settings,
  Users, Save, Trash2, RefreshCw, Printer, ChefHat, Sparkles, Crown,
  Zap, Bell, Tag, Star, Eye, EyeOff, BarChart2, Activity, Megaphone,
  Clock, DollarSign, ShoppingBag, Repeat, ArrowUpRight, BrainCircuit,
  ArrowDownRight, Package, MessageSquare, Percent, Gift, Target, ToggleLeft, ToggleRight,
  TrendingDown, Calendar, Filter, CheckCircle, XCircle, Flame, SlidersHorizontal, BookOpen, ChevronUp, ChevronDown, GripVertical, ArrowDown, UserCircle, Search, MapPin, Phone, Sliders, ChevronRight, Minus as MinusIcon
} from 'lucide-react';
import { Share2, Globe, Layers, PlusCircle, Trash } from 'lucide-react';

// Custom Social Media SVG Icons
const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const YoutubeIcon = ({ size = 20, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const RedditIcon = ({ size = 20, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M17 11.5a1.5 1.5 0 0 1-2.5 1.1 4.9 4.9 0 0 0-5 0A1.5 1.5 0 1 1 7 11.5a1.47 1.47 0 0 1 .3-1 4.75 4.75 0 0 1 8.4 0 1.47 1.47 0 0 1 .3 1z"></path>
    <circle cx="10" cy="11.5" r=".5" fill="currentColor"></circle>
    <circle cx="14" cy="11.5" r=".5" fill="currentColor"></circle>
    <path d="M9.5 15.5c.7.7 2.2.9 2.5.9.3 0 1.8-.2 2.5-.9"></path>
    <path d="M12 7.5v-3.8l2.5.5"></path>
    <circle cx="14.5" cy="4.2" r=".7"></circle>
  </svg>
);

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { auth } from '../services/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { reviewService } from '../services/ReviewService';
import ModelViewer from '../components/ModelViewer';
import AIImageGenerator from '../components/AIImageGenerator';
import StaffDashboard from '../components/StaffDashboard';
import { KpiCardSkeleton, OrderLaneSkeleton, CustomerRowSkeleton } from '../components/Skeleton';
import { extractMenuFromImage, enrichDishWithAI, generateAIDescription } from '../services/geminiService';
import { generateMeshyModel } from '../services/meshyService';

const getOrderNote = (o) => {
  if (!o) return null;
  const rawNote = o.metadata?.specialInstructions || 
                  o.metadata?.special_instructions || 
                  o.specialInstructions || 
                  o.special_instructions || 
                  o.note || 
                  o.notes || 
                  o.items?.find(item => item.id === '__special_instructions')?.instructions || 
                  o.items?.find(item => item.id === '__special_instructions')?.specialInstructions;
  if (!rawNote) return null;
  const noteStr = String(rawNote).trim();
  if (noteStr.startsWith('GPS:')) return null;
  if (noteStr.includes(' | GPS:')) {
    return noteStr.split(' | GPS:')[0];
  }
  return noteStr;
};
// Helper for Dietary Icons
const DietIcon = ({ type }) => {
  if (!type || type === 'None') return null;
  const t = type.toLowerCase();
  
  let bColor = '';
  let bgColor = '';
  
  if (t === 'vegetarian') {
    bColor = 'border-green-700';
    bgColor = 'bg-green-700';
  } else if (t === 'non-vegetarian') {
    bColor = 'border-red-700';
    bgColor = 'bg-red-700';
  } else if (t === 'eggitarian') {
    bColor = 'border-[#E5A900]';
    bgColor = 'bg-[#E5A900]';
  } else {
    return null;
  }

  return (
    <span 
      className={`inline-flex items-center justify-center w-[14px] h-[14px] border-[1.5px] ${bColor} bg-white rounded-[2px] mr-1.5 align-middle shrink-0`} 
      title={type}
    >
      <span className={`w-[6px] h-[6px] rounded-full ${bgColor}`}></span>
    </span>
  );
};

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

// ─── Yearly Contribution Grid Chart ────────────────────────────────────
const YearlyContributionGrid = React.memo(({ orders = [], onDayClick }) => {
  const [selectedYear, setSelectedYear] = React.useState(() => new Date().getFullYear());
  const [hoveredDay, setHoveredDay] = React.useState(null);

  // Get available years from order dates (minimum: 2024)
  const availableYears = React.useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    orders.forEach(o => {
      if (o.timestamp) {
        const y = new Date(o.timestamp).getFullYear();
        if (y >= 2024) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  // Filter orders for the selected year and group by YYYY-MM-DD
  const yearData = React.useMemo(() => {
    const map = {};
    let totalOrders = 0;
    
    // Filter completed/delivered orders
    const yearOrders = orders.filter(o => {
      if (!o.timestamp) return false;
      const orderDate = new Date(o.timestamp);
      const isYear = orderDate.getFullYear() === selectedYear;
      const isCompleted = o.status === 'Completed' || o.status === 'Delivered';
      return isYear && isCompleted;
    });

    totalOrders = yearOrders.length;
    let totalRevenue = 0;

    yearOrders.forEach(o => {
      const d = new Date(o.timestamp);
      // Format as YYYY-MM-DD in local time
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;

      if (!map[dateKey]) {
        map[dateKey] = {
          count: 0,
          revenue: 0,
          orders: []
        };
      }
      map[dateKey].count += 1;
      map[dateKey].revenue += Number(o.total || 0);
      map[dateKey].orders.push(o);
      totalRevenue += Number(o.total || 0);
    });

    const activeDays = new Set(Object.keys(map));
    
    // Calculate max streak
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;
    const sortedActiveDays = Array.from(activeDays).sort();

    for (let i = 0; i < sortedActiveDays.length; i++) {
      const curr = new Date(sortedActiveDays[i]);
      if (prevDate === null) {
        currentStreak = 1;
      } else {
        const diffTime = Math.abs(curr - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      prevDate = curr;
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    return {
      map,
      totalOrders,
      totalRevenue,
      activeDaysCount: activeDays.size,
      maxStreak
    };
  }, [orders, selectedYear]);

  // Months name array
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Helper to determine color level
  const getColorLevelClass = (count) => {
    if (!count || count === 0) return 'bg-neutral-100 dark:bg-neutral-800 hover:ring-1 hover:ring-neutral-400';
    if (count <= 2) return 'bg-emerald-100 dark:bg-emerald-950/80 hover:ring-1 hover:ring-emerald-400';
    if (count <= 5) return 'bg-emerald-300 dark:bg-emerald-800/80 hover:ring-1 hover:ring-emerald-300';
    if (count <= 9) return 'bg-emerald-500 dark:bg-emerald-600/80 hover:ring-1 hover:ring-emerald-200';
    return 'bg-emerald-600 dark:bg-emerald-400 hover:ring-1 hover:ring-emerald-100';
  };

  return (
    <div className="w-full space-y-4 relative contribution-grid-container">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-100 dark:border-white/5 pb-3">
        <div className="space-y-0.5">
          <div className="text-lg font-display font-black text-neutral-900 dark:text-[#D4AF37]">
            {yearData.totalOrders} orders placed in the restaurant in {selectedYear}
          </div>
          <div className="flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Total active days: <strong className="text-neutral-900 dark:text-white">{yearData.activeDaysCount}</strong></span>
            <span>Max streak: <strong className="text-neutral-900 dark:text-white">{yearData.maxStreak} days</strong></span>
          </div>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="bg-neutral-50 dark:bg-[#1e1e24] border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
        >
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Grid Container */}
      <div className="relative overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-4 min-w-[760px] justify-between">
          {months.map((monthName, monthIndex) => {
            // Calculate calendar details for this month
            const startDayOfWeek = new Date(selectedYear, monthIndex, 1).getDay(); // 0 = Sun, 6 = Sat
            const totalDays = new Date(selectedYear, monthIndex + 1, 0).getDate();
            const numCols = Math.ceil((startDayOfWeek + totalDays) / 7);

            return (
              <div key={monthName} className="flex flex-col items-center flex-1">
                {/* Month grid */}
                <div className="grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
                  {[...Array(numCols)].map((_, colIndex) => {
                    return [...Array(7)].map((_, rowIndex) => {
                      const dayNum = (colIndex * 7) + rowIndex - startDayOfWeek + 1;
                      const isValidDay = dayNum >= 1 && dayNum <= totalDays;

                      if (!isValidDay) {
                        return <div key={`${colIndex}-${rowIndex}`} className="w-[10px] h-[10px] bg-transparent" />;
                      }

                      // Date formatting for key
                      const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const dayStats = yearData.map[dateKey] || { count: 0, revenue: 0, orders: [] };

                      return (
                        <div
                          key={dateKey}
                          onClick={() => {
                            if (dayStats.count > 0 && onDayClick) {
                              onDayClick({
                                fullDate: new Date(selectedYear, monthIndex, dayNum).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                allDayOrders: dayStats.orders
                              });
                            }
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay({
                              dateStr: new Date(selectedYear, monthIndex, dayNum).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                              count: dayStats.count,
                              revenue: dayStats.revenue,
                              left: rect.left + window.scrollX + (rect.width / 2),
                              top: rect.top + window.scrollY - 65
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-[10px] h-[10px] rounded-[2px] transition-all cursor-pointer ${getColorLevelClass(dayStats.count)}`}
                        />
                      );
                    });
                  })}
                </div>
                {/* Month Label */}
                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-2">
                  {monthName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Revenue and Details Row */}
      <div className="mt-4 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-neutral-100 dark:border-white/5">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
          Total Revenue in {selectedYear}: <strong className="text-neutral-905 dark:text-[#D4AF37] text-sm ml-1 font-bold">₹{yearData.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-neutral-100 dark:bg-neutral-800" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-100 dark:bg-emerald-950/80" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-300 dark:bg-emerald-800/80" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-50 dark:bg-emerald-600/80" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      {/* Dynamic Tooltip via React Portal */}
      {hoveredDay && createPortal(
        <div
          className="absolute z-[9999] px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl pointer-events-none whitespace-nowrap"
          style={{
            left: `${hoveredDay.left}px`,
            top: `${hoveredDay.top}px`,
            transform: 'translateX(-50%)',
            backgroundColor: '#0a0a0a',
            borderColor: '#262626',
            position: 'absolute'
          }}
        >
          <div className="flex items-center gap-2 mb-1 pb-1 border-b" style={{ borderColor: '#262626' }}>
            <span className="text-[12px] font-bold" style={{ color: '#ffffff' }}>
              {hoveredDay.count} {hoveredDay.count === 1 ? 'order' : 'orders'}
            </span>
            {hoveredDay.count > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border" style={{ color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', borderColor: 'rgba(52, 211, 153, 0.2)' }}>
                ₹{hoveredDay.revenue.toFixed(0)}
              </span>
            )}
          </div>
          <div className="text-[9px] font-semibold" style={{ color: '#a3a3a3' }}>{hoveredDay.dateStr}</div>
        </div>,
        document.body
      )}
    </div>
  );
});

// ─── Mini Bar Chart (pure SVG, no library) ────────────────────────────
const MiniBarChart = React.memo(({ data, color = '#D4AF37', height = 80, onBarClick }) => {
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
          <div className="flex items-center gap-1.5 mb-1.5 border-b border-white/10 pb-1.5">
            <span className="text-[14px]">₹{Number(data[hovered].value).toFixed(0)}</span>
            <span className="text-[9px] font-medium opacity-70 bg-white/10 px-1.5 py-0.5 rounded-md">{data[hovered].orders || 0} orders</span>
          </div>
          {data[hovered].dineInValue > 0 && (
            <div className="flex justify-between items-center gap-4 text-[10px] font-medium opacity-90 mb-0.5">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Dine-In:</span>
              <span>₹{Number(data[hovered].dineInValue).toFixed(0)}</span>
            </div>
          )}
          {data[hovered].deliveryValue > 0 && (
            <div className="flex justify-between items-center gap-4 text-[10px] font-medium opacity-90 mb-0.5">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Delivery:</span>
              <span>₹{Number(data[hovered].deliveryValue).toFixed(0)}</span>
            </div>
          )}
          {data[hovered].fullDate && <div className="text-[9px] opacity-50 mt-1.5 pt-1.5 border-t border-white/5">{data[hovered].fullDate}</div>}
        </div>
      )}
      {/* Bars */}
      <div className="flex items-end justify-between gap-[2px] h-full pt-8 pb-5">
        {data.map((d, i) => {
          const bh = Math.max((d.value / max) * (height - 20), 2);
          return (
            <div key={i} className="flex flex-col items-center flex-1 cursor-pointer group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onBarClick && onBarClick(d)}>
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

// ─── Combo Card Item ───────────────────────────────────────────────────
const ComboCardItem = React.memo(({ combo, comboChildren, originalTotal, updateDish, deleteDish, setComboDraft, setShowComboCreator }) => {
  const [imgIdx, setImgIdx] = React.useState(0);
  
  const allImages = React.useMemo(() => {
    const imgs = [];
    if (combo.cover) imgs.push(combo.cover);
    comboChildren.forEach(child => {
      if (child.cover) imgs.push(child.cover);
      else if (child.images?.[0]) imgs.push(child.images[0]);
    });
    return imgs.length > 0 ? imgs : null;
  }, [combo, comboChildren]);
  const imagesKey = allImages ? allImages.join(',') : '';

  React.useEffect(() => {
    if (!allImages || allImages.length <= 1) return;
    const interval = setInterval(() => {
      setImgIdx(prev => (prev + 1) % allImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [imagesKey, allImages.length]);

  const isSoldOut = combo.tags?.includes('sold_out');
  const isHidden = combo.tags?.includes('hidden');

  return (
    <div className={`bg-white dark:bg-[#111115] rounded-3xl border overflow-hidden flex flex-col transition-opacity ${isHidden ? 'opacity-50' : ''} border-neutral-200 dark:border-white/10`}>
      <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-black/50 overflow-hidden">
        {allImages ? (
          <AnimatePresence mode="popLayout">
            <motion.img
              key={imgIdx}
              src={allImages[imgIdx]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              alt={combo.name}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <Gift size={32} className="opacity-20" />
          </div>
        )}
        
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="font-display font-black text-white text-lg tracking-wider">SOLD OUT</span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          {allImages && allImages.length > 1 && (
            <div className="bg-black/50 backdrop-blur-md rounded-full px-2 py-1 flex gap-1 items-center">
              {allImages.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-black text-lg mb-1 line-clamp-1">{combo.name}</h3>
        <p className="text-xs text-neutral-500 line-clamp-2 mb-4">{combo.description}</p>
        
        <div className="flex -space-x-2 mb-4">
          {comboChildren.slice(0, 4).map((child, idx) => (
            <div key={idx} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#111115] bg-neutral-100 dark:bg-black overflow-hidden flex shrink-0" title={child.name}>
              {child.cover || child.images?.[0] ? (
                <img src={child.cover || child.images[0]} alt={child.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px]">🍽</div>
              )}
            </div>
          ))}
          {comboChildren.length > 4 && (
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#111115] bg-neutral-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold z-10">
              +{comboChildren.length - 4}
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-white/5 flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Combo Price</p>
              <div className="flex items-end gap-2">
                <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 leading-none">₹{Number(combo.price).toFixed(0)}</span>
                {originalTotal > Number(combo.price) && (
                  <span className="text-xs font-bold text-neutral-400 line-through mb-0.5">₹{originalTotal.toFixed(0)}</span>
                )}
              </div>
            </div>
            {originalTotal > Number(combo.price) && (
              <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-1 rounded-lg">
                <span className="text-[10px] font-black uppercase tracking-wider">Save ₹{(originalTotal - Number(combo.price)).toFixed(0)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button onClick={() => {
                setComboDraft({
                  id: combo.id,
                  name: combo.name,
                  description: combo.description || '',
                  price: combo.price,
                  dishes: combo.macros?.comboDishes || []
                });
                setShowComboCreator(true);
              }}
              className="py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity flex items-center justify-center gap-1">
              <Edit2 size={11} /> Edit
            </button>
            <button onClick={async () => {
                const newTags = isSoldOut
                  ? (combo.tags || []).filter(t => t !== 'sold_out')
                  : [...(combo.tags || []), 'sold_out'];
                await updateDish(combo.id, { tags: newTags });
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${isSoldOut ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500'}`}>
              <Package size={11} /> {isSoldOut ? 'Restore' : 'Sold Out'}
            </button>
            <button onClick={async () => {
                const newTags = isHidden
                  ? (combo.tags || []).filter(t => t !== 'hidden')
                  : [...(combo.tags || []), 'hidden'];
                await updateDish(combo.id, { tags: newTags });
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${isHidden ? 'bg-neutral-200 dark:bg-white/10 text-neutral-700' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500'}`}>
              {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
              {isHidden ? 'Hidden' : 'Visible'}
            </button>
            <button onClick={async () => {
                if(window.confirm(`Are you sure you want to delete combo "${combo.name}"?`)) {
                  await deleteDish(combo.id);
                }
              }}
              className="py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 hover:opacity-80">
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
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
            <span className="text-neutral-500 font-sans mr-2">₹{Number(dish.price).toFixed(0)}</span>
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
              {p === 'Pro' ? 'Upgrade to Pro — ₹49/mo' : 'Upgrade to Enterprise — ₹99/mo'}
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
                      <div className="flex items-center gap-0.5 mb-2">
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
                      
                      {/* Review Text */}
                      {review.text && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 italic mt-1 leading-relaxed border-l-2 pl-2 border-neutral-200 dark:border-white/10">
                          "{review.text}"
                        </p>
                      )}
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


const getSuggestionParents = (dishesList) => {
  const parents = [];
  dishesList.forEach(d => {
    // Check root dish
    if (d.macros?.comboRecommendations?.length > 0) {
      parents.push({
        ...d,
        originalId: d.id,
        isVariant: false,
        displayName: d.name,
        recommendations: d.macros.comboRecommendations
      });
    }
    // Check variants
    if (d.macros?.variants && d.macros.variants.length > 0) {
      d.macros.variants.forEach(v => {
        if (v.comboRecommendations?.length > 0) {
          parents.push({
            ...d,
            id: `${d.id}-${v.name}`,
            originalId: d.id,
            isVariant: true,
            variantName: v.name,
            displayName: `${d.name} (${v.name})`,
            price: parseFloat(v.price) || 0,
            recommendations: v.comboRecommendations
          });
        }
      });
    }
  });
  return parents;
};


const expandDishesWithVariants = (dishesList) => {
  const result = [];
  dishesList.forEach(dish => {
    if (dish.variants && dish.variants.length > 0) {
      dish.variants.forEach(v => {
        result.push({
          ...dish,
          id: `${dish.id}-${v.name}`, // Unique ID for React keys / Framer Motion
          originalId: dish.id,        // To know which actual dish it refers to
          name: `${dish.name} (${v.name})`,
          price: parseFloat(v.price) || 0,
          isVariant: true,
          variantName: v.name
        });
      });
    } else {
      result.push({
        ...dish,
        originalId: dish.id,
        price: parseFloat(dish.price) || 0
      });
    }
  });
  return result;
};


// ══════════════════════════════════════════════════════════════════════
// CUSTOMIZATIONS PANEL COMPONENT
// ══════════════════════════════════════════════════════════════════════



function CustomizationItemRow({ item, onUpdate, onDelete }) {
  return (
    <div className="flex items-center gap-2 group">
      <input
        type="text"
        value={item.name}
        onChange={e => onUpdate({ ...item, name: e.target.value })}
        placeholder="Option name (e.g. Extra Cheese)"
        className="flex-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white transition-colors"
      />
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 shrink-0">
        <span className="text-neutral-500 dark:text-neutral-400 text-sm font-bold">₹</span>
        <input
          type="number"
          value={item.price}
          onChange={e => onUpdate({ ...item, price: e.target.value })}
          placeholder="0"
          className="w-16 bg-transparent text-sm focus:outline-none dark:text-white"
          min="0"
        />
      </div>
      <select
        value={item.type || 'veg'}
        onChange={e => onUpdate({ ...item, type: e.target.value })}
        className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-2 py-2 text-xs focus:outline-none dark:text-white shrink-0"
      >
        <option value="veg">🟢 Veg</option>
        <option value="non-veg">🔴 Non-Veg</option>
      </select>
      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
      >
        <MinusIcon size={14} />
      </button>
    </div>
  );
}

function CustomizationGroupCard({ group, dishes, categories, onUpdate, onDelete, onDuplicate }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [targetType, setTargetType] = React.useState(group.targetType || 'categories');

  const addItem = () => {
    onUpdate({ ...group, items: [...(group.items || []), { id: Date.now().toString(), name: '', price: 0, type: 'veg' }] });
  };

  const updateItem = (idx, updated) => {
    const newItems = [...group.items];
    newItems[idx] = updated;
    onUpdate({ ...group, items: newItems });
  };

  const deleteItem = (idx) => {
    onUpdate({ ...group, items: group.items.filter((_, i) => i !== idx) });
  };

  const toggleCategory = (cat) => {
    const current = group.targetCategories || [];
    const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
    onUpdate({ ...group, targetCategories: next });
  };

  const toggleDish = (dishId) => {
    const current = group.targetDishes || [];
    const next = current.includes(dishId) ? current.filter(d => d !== dishId) : [...current, dishId];
    onUpdate({ ...group, targetDishes: next });
  };

  const itemCount = (group.items || []).filter(i => i.name).length;
  const targetCount = targetType === 'categories'
    ? (group.targetCategories || []).length
    : (group.targetDishes || []).length;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] overflow-hidden transition-all shadow-sm">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.25)' }}>
          <Sliders size={18} style={{ color: GOLD }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm text-neutral-900 dark:text-white">{group.name || 'Untitled Group'}</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(212,175,55,0.1)', color: GOLD }}>
              {itemCount} option{itemCount !== 1 ? 's' : ''}
            </span>
            {group.isRequired && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400">Required</span>
            )}
            {targetCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400">
                Applied to {targetCount} {targetType === 'categories' ? 'categor' : 'dish'}{targetCount !== 1 ? (targetType === 'categories' ? 'ies' : 'es') : (targetType === 'categories' ? 'y' : '')}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {group.selectionType === 'single' ? 'Single choice' : `Multi-select (max ${group.maxSelections || '∞'})`}
            {group.minSelections > 0 ? ` · Min ${group.minSelections}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400 transition-colors" title="Duplicate">
            <RefreshCw size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>
          {isExpanded ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
        </div>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div className="border-t border-neutral-100 dark:border-white/5 p-4 space-y-5">
          {/* Group settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Group Name</label>
              <input
                type="text"
                value={group.name}
                onChange={e => onUpdate({ ...group, name: e.target.value })}
                placeholder="e.g. Toppings, Add-ons, Crust Type"
                className="w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Selection Type</label>
              <div className="flex gap-2">
                {['single', 'multi'].map(type => (
                  <button key={type} onClick={() => onUpdate({ ...group, selectionType: type })}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all"
                    style={group.selectionType === type
                      ? { background: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.4)', color: GOLD }
                      : { background: 'transparent', borderColor: 'rgba(212,175,55,0.15)', color: '#9ca3af' }
                    }
                  >
                    {type === 'single' ? '⚬ Single' : '☑ Multi'}
                  </button>
                ))}
              </div>
            </div>
            {group.selectionType === 'multi' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Min Selections</label>
                  <input type="number" min="0" value={group.minSelections || 0}
                    onChange={e => onUpdate({ ...group, minSelections: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Max Selections (0 = unlimited)</label>
                  <input type="number" min="0" value={group.maxSelections || 0}
                    onChange={e => onUpdate({ ...group, maxSelections: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white"
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-3 sm:col-span-2">
              <button onClick={() => onUpdate({ ...group, isRequired: !group.isRequired })}
                className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border transition-all"
                style={group.isRequired
                  ? { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }
                  : { background: 'transparent', borderColor: 'rgba(212,175,55,0.15)', color: '#9ca3af' }
                }
              >
                {group.isRequired ? '✓ Required Selection' : 'Make Required'}
              </button>
              <p className="text-[11px] text-neutral-400">Required groups force the diner to make a selection before adding to cart.</p>
            </div>
          </div>

          {/* Options list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Options / Items</label>
              <button onClick={addItem}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(212,175,55,0.1)', color: GOLD, border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <Plus size={12} /> Add Option
              </button>
            </div>
            <div className="space-y-2">
              {(group.items || []).map((item, idx) => (
                <CustomizationItemRow key={item.id || idx} item={item}
                  onUpdate={(updated) => updateItem(idx, updated)}
                  onDelete={() => deleteItem(idx)}
                />
              ))}
              {(group.items || []).length === 0 && (
                <div className="text-center py-6 text-neutral-400 text-sm border border-dashed border-neutral-200 dark:border-white/10 rounded-xl">
                  No options yet. Click "Add Option" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Target: Categories or Dishes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Apply To</label>
              <div className="flex gap-1 bg-neutral-100 dark:bg-white/5 rounded-xl p-0.5">
                {['categories', 'dishes'].map(t => (
                  <button key={t} onClick={() => { setTargetType(t); onUpdate({ ...group, targetType: t }); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={targetType === t
                      ? { background: goldGradient, color: '#000' }
                      : { color: '#9ca3af' }
                    }
                  >
                    {t === 'categories' ? '📁 Categories' : '🍽️ Dishes'}
                  </button>
                ))}
              </div>
            </div>

            {targetType === 'categories' ? (
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const isSelected = (group.targetCategories || []).includes(cat);
                  return (
                    <button key={cat} onClick={() => toggleCategory(cat)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                      style={isSelected
                        ? { background: 'rgba(212,175,55,0.12)', borderColor: 'rgba(212,175,55,0.4)', color: GOLD }
                        : { background: 'transparent', borderColor: 'rgba(212,175,55,0.15)', color: '#9ca3af' }
                      }
                    >
                      {isSelected ? '✓ ' : ''}{cat}
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-xs text-neutral-400">No categories found. Add dishes with categories first.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {dishes.map(dish => {
                  const isSelected = (group.targetDishes || []).includes(dish.id);
                  return (
                    <button key={dish.id} onClick={() => toggleDish(dish.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all"
                      style={isSelected
                        ? { background: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.35)', color: GOLD }
                        : { background: 'transparent', borderColor: 'rgba(212,175,55,0.1)', color: '#9ca3af' }
                      }
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#D4AF37]' : 'bg-neutral-400'}`} />
                      <span className="truncate text-neutral-800 dark:text-neutral-200 font-semibold">{dish.name}</span>
                      {dish.category && <span className="text-neutral-400 shrink-0">· {dish.category}</span>}
                    </button>
                  );
                })}
                {dishes.length === 0 && (
                  <p className="text-xs text-neutral-400">No dishes in your menu yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



// ══════════════════════════════════════════════════════════════════════
export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const [vendorTab, setVendorTab] = React.useState('orders');
  const {
    orders, activeRestId, updateOrderStatus,
    dishes, setDishes, restaurants, addDish, updateDish, deleteDish, user, setUser,
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
    // Don't redirect to onboarding until data has fully loaded from Supabase
    if (!isDataLoaded) return;

    const myRests = restaurants.filter(r => r.vendor_id === supabaseUser.id || r.vendorId === supabaseUser.id);

    // No restaurants at all yet — send to onboard (but only after data is loaded)
    if (myRests.length === 0) { navigate('/vendor-onboard', { replace: true }); return; }

    // If the stored activeRestId already belongs to this user, keep it — don't switch
    if (activeRestId && myRests.some(r => r.id === activeRestId)) return;

    // Otherwise pick the restaurant with the most dishes (oldest as tiebreaker)
    const ranked = [...myRests].sort((a, b) => {
      const aDishes = dishes.filter(d => (d.rest_id || d.restId) === a.id).length;
      const bDishes = dishes.filter(d => (d.rest_id || d.restId) === b.id).length;
      if (bDishes !== aDishes) return bDishes - aDishes; // more dishes first
      return new Date(a.created_at) - new Date(b.created_at); // older first as tiebreaker
    });
    setActiveRestId(ranked[0].id);
  }, [supabaseUser, restaurants, dishes, activeRestId, navigate, setActiveRestId, isInitializing, isDataLoaded]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('3dish_user');
    localStorage.removeItem('3dish_active_rest');
    sessionStorage.removeItem('3dish_active_rest');
    window.location.href = '/vendor-auth';
  };

  const updateOrder = async (orderId, updates) => {
    if (updates.status && updateOrderStatus) {
      await updateOrderStatus(orderId, updates.status);
    }
  };

  const currentRestaurant = restaurants.find(r => r.id === activeRestId);
  // Default variants pre-loaded when creating a new dish
  const DEFAULT_DISH_VARIANTS = [
    { name: 'Half', price: '' },
    { name: 'Full', price: '' },
    { name: 'Regular', price: '' },
  ];

  const [editingDish, setEditingDish] = React.useState(null);
  const [editingEvent, setEditingEvent] = React.useState(null);
  const [viewingRsvpsEvent, setviewingRsvpsEvent] = React.useState(null);
  const [editingCustomization, setEditingCustomization] = React.useState(null);
  const [managingCategories, setManagingCategories] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [selectedEditCategory, setSelectedEditCategory] = React.useState('All');
  const [showVendorSidebar, setShowVendorSidebar] = React.useState(false);
  const [vendorActiveCategory, setVendorActiveCategory] = React.useState('All');
  const [scanState, setScanState]     = React.useState('idle');
  const [isGeneratingDesc, setIsGeneratingDesc] = React.useState(false);
  const [scanStageLabel, setScanStageLabel] = React.useState('');
  const [progress, setProgress]       = React.useState(0);
  const glbInputRef = React.useRef(null);
  const [isStaffMode, setIsStaffMode] = React.useState(false);
  const [aiImportState, setAiImportState] = React.useState('idle'); // 'idle' | 'chooser' | 'analyzing' | 'enriching' | 'reviewing'
  const [extractedDishes, setExtractedDishes] = React.useState([]);
  const [importProgress, setImportProgress] = React.useState(0);
  const [importEnrichProgress, setImportEnrichProgress] = React.useState({ current: 0, total: 0 });
  const [importCaptureMode, setImportCaptureMode] = React.useState('gallery'); // 'gallery' | 'camera'
  const [importMenuPreview, setImportMenuPreview] = React.useState(null); // data URL of uploaded image
  const [importSelectedDishes, setImportSelectedDishes] = React.useState(new Set()); // which dishes to import
  const cameraInputRef = React.useRef(null);
  const galleryInputRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [tableCount, setTableCount]   = React.useState(5);
  const [activePromo, setActivePromo] = React.useState(null);
  const [notifText, setNotifText]     = React.useState('');
  const [promoForm, setPromoForm]     = React.useState({ label: '', discount: 15, type: 'percent', applicableDishes: [] });
  const [happyHourForm, setHappyHourForm] = React.useState({ startTime: '17:00', endTime: '19:00', discount: 20 });
  const [flashDishSearch, setFlashDishSearch] = React.useState('');
  const [flashCategoryFilter, setFlashCategoryFilter] = React.useState('All');
  const [addonDishSearch, setAddonDishSearch] = React.useState('');
  React.useEffect(() => {
    setAddonDishSearch('');
  }, [editingCustomization]);
  const [socialsForm, setSocialsForm] = React.useState({ instagram: '', facebook: '', youtube: '', reddit: '' });

  // ── Vendor Phone Verification OTP State ──────────────────────────────
  const [vendorPendingPhone, setVendorPendingPhone] = React.useState('');
  const [vendorOtpSent, setVendorOtpSent] = React.useState(false);
  const [vendorOtpCode, setVendorOtpCode] = React.useState('');
  const [vendorConfirmResult, setVendorConfirmResult] = React.useState(null);
  const [isSendingVendorOtp, setIsSendingVendorOtp] = React.useState(false);
  const [isVerifyingVendorOtp, setIsVerifyingVendorOtp] = React.useState(false);
  const vendorRecaptchaRef = React.useRef(null);

  const sendVendorOtp = async () => {
    let phone = vendorPendingPhone.trim();
    if (!phone) { showNotification('Enter a phone number first.'); return; }
    if (!phone.startsWith('+')) phone = `+91${phone}`;

    setIsSendingVendorOtp(true);
    try {
      const container = document.getElementById('vendor-recaptcha-container');
      if (container) container.innerHTML = '';
      if (vendorRecaptchaRef.current) {
        try { vendorRecaptchaRef.current.clear(); } catch {}
        vendorRecaptchaRef.current = null;
      }
      vendorRecaptchaRef.current = new RecaptchaVerifier(auth, 'vendor-recaptcha-container', { size: 'invisible' });
      await vendorRecaptchaRef.current.render();
      const result = await signInWithPhoneNumber(auth, phone, vendorRecaptchaRef.current);
      setVendorConfirmResult(result);
      setVendorOtpSent(true);
      setVendorOtpCode('');
      showNotification('📱 OTP sent to ' + phone);
    } catch (err) {
      console.error('Vendor OTP error:', err);
      showNotification(err.message?.includes('reCAPTCHA') ? 'Verification failed. Try again.' : (err.message || 'Failed to send OTP.'));
      if (vendorRecaptchaRef.current) { try { vendorRecaptchaRef.current.clear(); } catch {} vendorRecaptchaRef.current = null; }
    }
    setIsSendingVendorOtp(false);
  };

  const verifyVendorOtp = async () => {
    if (!vendorOtpCode || vendorOtpCode.length < 6) { showNotification('Enter the 6-digit OTP.'); return; }
    setIsVerifyingVendorOtp(true);
    try {
      await vendorConfirmResult.confirm(vendorOtpCode);
      const verifiedPhone = vendorPendingPhone.trim().startsWith('+') ? vendorPendingPhone.trim() : `+91${vendorPendingPhone.trim()}`;
      // Save phone + verified status to settings form AND persist to DB via updateRestaurant
      setSettingsForm(f => ({ ...f, phone: verifiedPhone, phoneVerified: true }));
      await updateRestaurant(activeRestId, { phone: verifiedPhone, phoneVerified: true });
      setVendorOtpSent(false);
      setVendorOtpCode('');
      setVendorPendingPhone('');
      setVendorConfirmResult(null);
      showNotification('✅ Phone number verified and saved!');
    } catch {
      showNotification('❌ Invalid OTP. Please try again.');
    }
    setIsVerifyingVendorOtp(false);
  };

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
  // Delivery detail popup
  const [deliveryDetailOrder, setDeliveryDetailOrder] = React.useState(null);
  // Reject reason popup
  const [rejectReasonOrder, setRejectReasonOrder] = React.useState(null);
  const [rejectReasonText, setRejectReasonText] = React.useState('');

  // ── Combo Builder State ────────────────────────────────────────
  const [showComboDialog, setShowComboDialog] = React.useState(false);
  const [comboParent, setComboParent] = React.useState(null);
  const [comboRecs, setComboRecs] = React.useState([]);
  
  // Custom Combo Creator State
  const [showComboCreator, setShowComboCreator] = React.useState(false);
  const [comboDraft, setComboDraft] = React.useState({ name: '', description: '', price: '', dishes: [] });
  const [comboDishSearch, setComboDishSearch] = React.useState('');

  const [categoryToDelete, setCategoryToDelete] = React.useState(null);
  const [customerFilter, setCustomerFilter] = React.useState('top'); // 'top', 'all', 'repeat'
  const [dishSearch, setDishSearch] = React.useState('');

  // Custom Customer Modal State
  const [showAllCustomersModal, setShowAllCustomersModal] = React.useState(false);
  const [selectedDateOrders, setSelectedDateOrders] = React.useState(null);
  const [customerModalSort, setCustomerModalSort] = React.useState('most-came'); // 'most-came', 'most-spend'
  const [selectedCustomerIds, setSelectedCustomerIds] = React.useState([]);
  const [customerModalCategory, setCustomerModalCategory] = React.useState('all'); // 'all', 'dine_in', 'delivery'
  const [selectedCustomerHistory, setSelectedCustomerHistory] = React.useState(null);

  // Calendar range filter states
  const [dineInStartDate, setDineInStartDate] = React.useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));
  const [dineInEndDate, setDineInEndDate] = React.useState(() => new Date().toLocaleDateString('en-CA'));
  const [tempDineInStartDate, setTempDineInStartDate] = React.useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));
  const [tempDineInEndDate, setTempDineInEndDate] = React.useState(() => new Date().toLocaleDateString('en-CA'));
  const [dineInAnalysisShown, setDineInAnalysisShown] = React.useState(false);
  const [showDineInHistoryModal, setShowDineInHistoryModal] = React.useState(false);

  const [deliveryStartDate, setDeliveryStartDate] = React.useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));
  const [deliveryEndDate, setDeliveryEndDate] = React.useState(() => new Date().toLocaleDateString('en-CA'));
  const [tempDeliveryStartDate, setTempDeliveryStartDate] = React.useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));
  const [tempDeliveryEndDate, setTempDeliveryEndDate] = React.useState(() => new Date().toLocaleDateString('en-CA'));
  const [deliveryAnalysisShown, setDeliveryAnalysisShown] = React.useState(false);
  const [showDeliveryHistoryModal, setShowDeliveryHistoryModal] = React.useState(false);




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
    name: '', cover: '', logo: '', taxRate: 8, acceptCash: true, phone: '', hours: '10:00 - 22:00', requireVerificationCode: true,
    deliveryConfig: { convenienceFee: 0, deliveryFee: 0, otherFees: [] }
  });

  const [offersList, setOffersList] = React.useState([]);
  const [offersInitializedFor, setOffersInitializedFor] = React.useState(null);
  const [expandedOfferId, setExpandedOfferId] = React.useState(null); // which offer card is expanded (editing)

  // Normalize stored offers to always be an array
  React.useEffect(() => {
    if (currentRestaurant && offersInitializedFor !== currentRestaurant.id) {
      const raw = currentRestaurant.macros?.offers;
      let normalized = [];
      if (Array.isArray(raw)) {
        normalized = raw;
      } else if (raw && raw.freeDishId) {
        // migrate old single-object format to array
        normalized = [{ ...raw, id: raw.id || 'offer_legacy' }];
      }
      setOffersList(normalized);
      setOffersInitializedFor(currentRestaurant.id);
      setExpandedOfferId(null);
    }
  }, [currentRestaurant, offersInitializedFor]);

  const handleOffersSave = async (offersArray) => {
    await updateRestaurant(activeRestId, { offers: offersArray });
    showNotification('Offers saved successfully!');
  };

  const handleAddOffer = () => {
    const newId = 'offer_' + Date.now();
    const newOffer = { id: newId, active: true, minOrderValue: 0, freeDishId: '' };
    const updated = [...offersList, newOffer];
    setOffersList(updated);
    setExpandedOfferId(newId); // auto-expand new offer
  };

  const handleUpdateOffer = (id, field, value) => {
    setOffersList(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleDeleteOffer = (id) => {
    const updated = offersList.filter(o => o.id !== id);
    setOffersList(updated);
    handleOffersSave(updated);
  };

  const handleSaveOffer = (id) => {
    handleOffersSave(offersList);
    setExpandedOfferId(null); // collapse after save
  };


  const [isEditingDelivery, setIsEditingDelivery] = React.useState(false);
  const [formInitializedFor, setFormInitializedFor] = React.useState(null);

  React.useEffect(() => {
    if (currentRestaurant && formInitializedFor !== currentRestaurant.id) {
      setSettingsForm({
        name: currentRestaurant.name || '',
        cover: currentRestaurant.cover || '',
        logo: currentRestaurant.macros?.logo || currentRestaurant.logo || '',
        taxRate: currentRestaurant.taxRate !== undefined ? currentRestaurant.taxRate : 8,
        acceptCash: currentRestaurant.acceptCash !== undefined ? currentRestaurant.acceptCash : true,
        requireVerificationCode: currentRestaurant.requireVerificationCode !== undefined ? currentRestaurant.requireVerificationCode : true,
        phone: currentRestaurant.macros?.phone || currentRestaurant.phone || '',
        phoneVerified: currentRestaurant.macros?.phoneVerified || false,
        hours: currentRestaurant.hours || '10:00 - 22:00',
        deliveryConfig: currentRestaurant.macros?.deliveryConfig || { convenienceFee: 0, deliveryFee: 0, otherFees: [] },
      });
      setFormInitializedFor(currentRestaurant.id);
      setIsEditingDelivery(false);
    }
  }, [currentRestaurant, formInitializedFor]);

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    await updateRestaurant(activeRestId, settingsForm);
    setIsEditingDelivery(false);
    showNotification('Settings saved successfully!');
  };

  const handleCancelDeliveryEdit = () => {
    setIsEditingDelivery(false);
    if (currentRestaurant) {
      setSettingsForm(prev => ({
        ...prev,
        deliveryConfig: currentRestaurant.macros?.deliveryConfig || { convenienceFee: 0, deliveryFee: 0, otherFees: [] }
      }));
    }
  };

  const handleOCRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Show image preview
    const reader = new FileReader();
    reader.onload = ev => setImportMenuPreview(ev.target.result);
    reader.readAsDataURL(file);

    setAiImportState('analyzing');
    setImportProgress(0);

    try {
      // Phase 1: OCR + initial extraction
      let fakeP = 0;
      const progressInterval = setInterval(() => {
        fakeP = Math.min(fakeP + 6, 80);
        setImportProgress(fakeP);
      }, 400);

      const dishes = await extractMenuFromImage(file);
      clearInterval(progressInterval);
      setImportProgress(100);

      // Select all dishes by default
      setImportSelectedDishes(new Set(dishes.map(d => d.id)));
      setExtractedDishes(dishes);
      setAiImportState('reviewing');
      showNotification(`✨ AI detected ${dishes.length} dishes from your menu!`);
    } catch (err) {
      console.error('OCR error:', err);
      setAiImportState('chooser');
      setImportMenuPreview(null);
      if (err.message === 'GEMINI_API_KEY_MISSING') {
        showNotification('⚠️ Add VITE_GEMINI_API_KEY to your .env file to enable AI menu import.');
      } else {
        showNotification(`Import failed: ${err.message}`);
      }
    }
  };

  const handleImportSaveAll = async () => {
    const toSave = extractedDishes.filter(d => importSelectedDishes.has(d.id));
    if (toSave.length === 0) {
      showNotification('Please select at least one dish to import.');
      return;
    }
    setAiImportState('enriching');
    setImportEnrichProgress({ current: 0, total: toSave.length });

    let saved = 0;
    for (const d of toSave) {
      const variants = [];
      if (d.halfPrice) variants.push({ label: 'Half', price: d.halfPrice });
      variants.push({ label: 'Full', price: d.price });

      await addDish({
        name: d.name,
        price: d.price,
        description: d.description,
        category: d.category,
        ingredients: d.ingredients,
        allergens: d.allergens,
        macros: {
          calories: d.macros?.calories || '',
          protein: d.macros?.protein || '',
          carbs: d.macros?.carbs || '',
          fat: d.macros?.fat || '',
          dietaryPreference: d.dietaryPreference,
          spiceLevel: d.spiceLevel,
          prepTime: d.prepTime,
          serves: d.serves,
        },
        tags: d.tags || [],
        variants: variants.length > 1 ? variants : [],
        restId: activeRestId,
      });
      saved++;
      setImportEnrichProgress({ current: saved, total: toSave.length });
    }

    setAiImportState('idle');
    setExtractedDishes([]);
    setImportMenuPreview(null);
    showNotification(`🎉 Successfully imported ${saved} dishes to your menu!`);
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
  
  // Kitchen/Live Orders should not include delivery orders. They are managed in the Delivery tab.
  const kitchenOrders = React.useMemo(() => restOrders.filter(o => o.orderType !== 'delivery' && o.order_type !== 'delivery'), [restOrders]);
  
  const pendingVerification = React.useMemo(() => kitchenOrders.filter(o => o.status === 'Pending Verification'), [kitchenOrders]);
  const pending   = React.useMemo(() => kitchenOrders.filter(o => o.status === 'Pending' || o.status === 'Scheduled'), [kitchenOrders]);
  const prep      = React.useMemo(() => kitchenOrders.filter(o => o.status === 'Preparing'), [kitchenOrders]);
  const ready     = React.useMemo(() => kitchenOrders.filter(o => o.status === 'Ready'), [kitchenOrders]);
  const completed = React.useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" in local time
    return kitchenOrders.filter(o => {
      if (o.status !== 'Completed') return false;
      if (!o.timestamp) return false;
      const orderDate = new Date(o.timestamp).toLocaleDateString('en-CA');
      return orderDate === todayStr;
    });
  }, [kitchenOrders]);
  const cancelled = React.useMemo(() => restOrders.filter(o => o.status === 'Cancelled'), [restOrders]);
  const deliveryOrdersMemo = React.useMemo(() => restOrders.filter(o => o.orderType === 'delivery' || o.order_type === 'delivery'), [restOrders]);
  const activeDeliveryOrders = React.useMemo(() => deliveryOrdersMemo.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Completed'), [deliveryOrdersMemo]);

  const rangedDineInOrders = React.useMemo(() => {
    return restOrders.filter(o => {
      const isDineIn = o.orderType === 'dine_in' || o.order_type === 'dine_in';
      if (!isDineIn) return false;
      if (!o.timestamp) return false;
      const orderDate = new Date(o.timestamp).toLocaleDateString('en-CA');
      return orderDate >= dineInStartDate && orderDate <= dineInEndDate;
    });
  }, [restOrders, dineInStartDate, dineInEndDate]);

  const rangedDeliveryOrders = React.useMemo(() => {
    return restOrders.filter(o => {
      const isDelivery = o.orderType === 'delivery' || o.order_type === 'delivery';
      if (!isDelivery) return false;
      if (!o.timestamp) return false;
      const orderDate = new Date(o.timestamp).toLocaleDateString('en-CA');
      return orderDate >= deliveryStartDate && orderDate <= deliveryEndDate;
    });
  }, [restOrders, deliveryStartDate, deliveryEndDate]);

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
      if ((o.status !== 'Completed' && o.status !== 'Delivered') || !o.timestamp) return false;
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
      if (analyticsRange === 'Year') {
        return new Date(o.timestamp).getFullYear() === now.getFullYear();
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
      if (analyticsRange === 'Year') {
        return new Date(o.timestamp).getFullYear() === now.getFullYear();
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

    if (analyticsRange === 'Year') {
      const prevYear = now.getFullYear() - 1;
      const prevCompleted = restOrders.filter(o => {
        if ((o.status !== 'Completed' && o.status !== 'Delivered') || !o.timestamp) return false;
        return new Date(o.timestamp).getFullYear() === prevYear;
      });
      const prevAll = restOrders.filter(o => {
        if (!o.timestamp) return false;
        return new Date(o.timestamp).getFullYear() === prevYear;
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
    if (analyticsRange === 'Year') return [];
    const days = analyticsRange === 'Month' ? 30 : analyticsRange === 'Week' ? 7 : 1;
    return [...Array(days)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dayStr = d.toLocaleDateString('en-CA');
      const dayOrders = restOrders
        .filter(o => (o.status === 'Completed' || o.status === 'Delivered') && o.timestamp && new Date(o.timestamp).toLocaleDateString('en-CA') === dayStr);
      const dayRev = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
      const dineInRev = dayOrders.filter(o => o.orderType === 'dine_in' || o.order_type === 'dine_in').reduce((s, o) => s + (o.total || 0), 0);
      const deliveryRev = dayOrders.filter(o => o.orderType === 'delivery' || o.order_type === 'delivery').reduce((s, o) => s + (o.total || 0), 0);
      
      return {
        label: days === 1 ? `${d.getHours()}h` : d.toLocaleDateString('en-US', { weekday: 'short' })[0],
        value: dayRev,
        dineInValue: dineInRev,
        deliveryValue: deliveryRev,
        orders: dayOrders.length,
        fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        allDayOrders: restOrders.filter(o => o.timestamp && new Date(o.timestamp).toLocaleDateString('en-CA') === dayStr)
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
          orderType: oType || 'dine_in',
          orders: []
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
      map[key].orders.push(o);
      
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

  // Dynamic customer list filtered by category (dine-in / delivery) and sorting for the Customer Database Modal
  const filteredCustomerList = React.useMemo(() => {
    const map = {};
    const filteredOrders = restOrders.filter(o => {
      const oType = o.orderType || o.order_type;
      if (customerModalCategory === 'dine_in') {
        return oType !== 'delivery';
      }
      if (customerModalCategory === 'delivery') {
        return oType === 'delivery';
      }
      return true; // 'all'
    });

    filteredOrders.forEach(o => {
      const cName = o.contactName || o.contact_name;
      const cPhone = o.contactPhone || o.contact_phone;
      const oType = o.orderType || o.order_type;

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
          orderType: oType || 'dine_in',
          orders: []
        };
      } else {
        if (cName && (map[key].name === 'Guest Diner' || map[key].name.startsWith('Member (') || map[key].name.startsWith('Guest ('))) {
          map[key].name = cName;
        }
        if (cPhone && map[key].phone === 'Dine-In Guest') {
          map[key].phone = cPhone;
        }
      }
      
      map[key].totalSpend += Number(o.total || 0);
      map[key].orderCount += 1;
      map[key].orders.push(o);
      
      if (orderDate > new Date(map[key].lastOrder)) {
        map[key].lastOrder = o.timestamp;
        map[key].latestBill = Number(o.total || 0);
        map[key].latestDishes = (o.items || []).map(i => i.name).join(', ');
        map[key].orderType = oType || 'dine_in';
      }
    });

    return Object.values(map);
  }, [restOrders, customerModalCategory]);

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
  const avgLifetimeValue = uniqueCustomers > 0 ? (customerList.reduce((s, c) => s + c.totalSpend, 0) / uniqueCustomers) : 0;

  const reviewOrders = React.useMemo(() => {
    return restOrders
      .filter(o => o.review_rating)
      .map(o => {
        let dinerName = o.review_name || o.contactName || o.contact_name || 'Anonymous Diner';
        let text = o.review_text;
        
        if (o.review_name && o.review_name.startsWith('{')) {
          try {
            const parsed = JSON.parse(o.review_name);
            if (parsed.name) dinerName = parsed.name;
            if (parsed.text) text = parsed.text;
          } catch(e) {}
        }
        
        return {
          id: o.id,
          rating: o.review_rating,
          diner_name: dinerName,
          created_at: o.reviewed_at || o.timestamp,
          text: text
        };
      })
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
  const [customCategories, setCustomCategories] = React.useState(['Starters', 'Mains', 'Desserts', 'Drinks', 'Vegan']);

  React.useEffect(() => {
    if (metadataRecord?.macros?.categories) {
      setCustomCategories(metadataRecord.macros.categories);
    }
  }, [metadataRecord]);

  const handleSaveCategoriesOrder = async (updatedCategories) => {
    const payload = {
      name: "_categories_metadata",
      price: 0,
      description: "Metadata for custom categories",
      tags: ["_categories_metadata"],
      macros: {
        categories: updatedCategories,
        categoryOrders: metadataRecord?.macros?.categoryOrders || {}
      }
    };

    let success = false;
    if (metadataRecord?.id) {
      const res = await updateDish(metadataRecord.id, payload);
      success = res !== null;
    } else {
      const res = await addDish({ ...payload, restId: activeRestId });
      success = res !== null;
    }

    if (success) {
      showNotification("Category position updated successfully!");
    } else {
      showNotification("Failed to update category position.");
    }
  };
  const handleEditCategory = async (oldCat) => {
    const newName = window.prompt(`Enter new name for category "${oldCat}":`, oldCat);
    if (!newName) return;
    const trimmed = newName.trim();
    if (trimmed === oldCat || !trimmed) return;
    
    // Check if new name already exists
    if (customCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      showNotification('A category with this name already exists.');
      return;
    }

    // Update metadata record
    const updatedCategories = customCategories.map(c => c === oldCat ? trimmed : c);
    const newCategoryOrders = { ...(metadataRecord?.macros?.categoryOrders || {}) };
    if (newCategoryOrders[oldCat]) {
      newCategoryOrders[trimmed] = newCategoryOrders[oldCat];
      delete newCategoryOrders[oldCat];
    }

    const payload = {
      name: "_categories_metadata",
      price: 0,
      description: "Metadata for custom categories",
      tags: ["_categories_metadata"],
      macros: { categories: updatedCategories, categoryOrders: newCategoryOrders }
    };

    let metadataSuccess = false;
    if (metadataRecord?.id) {
      const res = await updateDish(metadataRecord.id, payload);
      metadataSuccess = res !== null;
    } else {
      const res = await addDish({ ...payload, restId: activeRestId });
      metadataSuccess = res !== null;
    }

    if (!metadataSuccess) {
      showNotification('Failed to rename category metadata.');
      return;
    }

    // Update dishes that have this category tag
    const dishesToUpdate = vendDishes.filter(d => d.tags?.includes(oldCat));
    let successCount = 0;
    
    for (const d of dishesToUpdate) {
      const updatedTags = d.tags.map(t => t === oldCat ? trimmed : t);
      const res = await updateDish(d.id, { tags: updatedTags });
      if (res !== null) successCount++;
    }

    showNotification(`Renamed category to "${trimmed}". Updated ${successCount} dish(es).`);
  };


   const [localDisplayDishes, setLocalDisplayDishes] = React.useState([]);
 
   React.useEffect(() => {
     let display = [...vendDishes].sort((a, b) => (a.macros?.sort_order || 0) - (b.macros?.sort_order || 0));
     if (selectedEditCategory === '__uncategorised__') {
       display = display.filter(d => !customCategories.some(cat => d.tags?.includes(cat)));
     } else if (selectedEditCategory !== 'All') {
       display = display.filter(d => d.tags?.includes(selectedEditCategory));
     }
     setLocalDisplayDishes(expandDishesWithVariants(display));
   }, [vendDishes, selectedEditCategory, customCategories]);
 
   const handleReorderDishes = (newOrder) => {
     setLocalDisplayDishes(newOrder);
     const updatedParentIds = new Set();
     newOrder.forEach((dish, index) => {
       const parentId = dish.originalId || dish.id;
       if (!updatedParentIds.has(parentId)) {
         updatedParentIds.add(parentId);
         const originalDish = vendDishes.find(d => d.id === parentId);
         if (originalDish && (originalDish.macros?.sort_order || 0) !== index) {
           updateDish(parentId, {
             ...originalDish,
             macros: { ...(originalDish.macros || {}), sort_order: index }
           });
         }
       }
     });
   };

  const FULL_TAB_CONFIG = [
    { key: 'orders',    icon: ListOrdered,  label: 'Kitchen',  badge: pendingVerification.length + pending.length + prep.length },
    { key: 'delivery',  icon: Package,      label: 'Delivery',    badge: activeDeliveryOrders.length },
    { key: 'floor',     icon: Bell,         label: 'Floor',    badge: serviceAlerts.length },
    { key: 'analytics', icon: BarChart2,    label: 'Analytics' },
    { key: 'menu',      icon: Utensils,     label: 'Menu' },
    { key: 'editmenu',  icon: BookOpen,     label: 'Edit Menu' },
    { key: 'customize', icon: Sliders,      label: 'Customize' },
    { key: 'growth',    icon: Zap,          label: 'Growth' },
    { key: 'customers', icon: Users,        label: 'Customers' },
    { key: 'events',    icon: Calendar,     label: 'Events' },
    { key: 'combos',    icon: Gift,         label: 'Combos' },
    { key: 'offers',    icon: Percent,      label: 'Offers' },
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

    const foodItems = (order.items || []).filter(item => item.type !== 'location_meta' && item.type !== 'metadata' && item.id !== '__contact_info' && item.id !== '__location' && item.id !== '__cancel_reason' && item.id !== '__special_instructions');

    const itemsHtml = foodItems.map(item => {
      const variantText = item.selectedVariant?.name || item.variantName ? `<div style="font-size: 10px; color: #666; margin-left: 12px;">(${item.selectedVariant?.name || item.variantName})</div>` : '';
      const customizationsText = item.selectedCustomizations && item.selectedCustomizations.length > 0 ? `<div style="font-size: 10px; color: #666; margin-left: 12px;">+ ${item.selectedCustomizations.map(c => c.name).join(', ')}</div>` : '';
      return `
        <div style="margin-bottom: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span style="flex: 1; font-weight: bold;">${item.quantity || 1} x ${item.name}</span>
            <span>₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(0)}</span>
          </div>
          ${variantText}
          ${customizationsText}
        </div>
      `;
    }).join('');

    const subtotal = foodItems.reduce((acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)), 0);
    const taxRate = currentRestaurant?.taxRate !== undefined ? currentRestaurant.taxRate / 100 : 0.08;
    const taxAmount = subtotal * taxRate;
    const totalAmount = (order.total || (subtotal + taxAmount)).toFixed(0);

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
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <div class="tax-row">
            <span>Tax (${Math.round(taxRate * 100)}%)</span>
            <span>₹{taxAmount.toFixed(0)}</span>
          </div>
          <div class="totals">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
          <div class="due">
            <span>Cash</span>
            <span>₹{totalAmount}</span>
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
          {currentRestaurant?.macros?.logo || currentRestaurant?.logo ? (
            <img
              src={currentRestaurant.macros?.logo || currentRestaurant.logo}
              alt="logo"
              className="w-10 h-10 rounded-2xl object-cover border-2"
              style={{ borderColor: 'rgba(212,175,55,0.4)' }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: goldGradient, boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}
            >
              <Store size={18} className="text-black" />
            </div>
          )}
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
                  <span className="font-display font-black text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2"><Clock size={14} /> Awaiting Approval</span>
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
                        <ul className="text-xs font-semibold space-y-1 mb-2 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-[#0d0d10]/60 p-2 rounded-lg border border-neutral-100 dark:border-white/5">
                          {o.items?.filter(item => item.type !== 'metadata' && item.type !== 'location_meta' && item.id !== '__contact_info' && item.id !== '__location' && item.id !== '__special_instructions').map((item, i) => (
                            <li key={i} className="flex items-center gap-1.5 flex-wrap">
                              <span>· {item.quantity || 1}x {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}</span>
                              {(item.isFree || item.type === 'free_dish') && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                  <Gift size={9} /> free
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                        
                        <div className="flex justify-between items-center mb-3 px-1">
                          <span className="text-xs font-black text-emerald-600">₹{(o.total || 0).toFixed(0)}</span>
                          {o.paymentStatus === 'Unpaid' && <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">COLLECT CASH</span>}
                        </div>
                        {getOrderNote(o) && (
                          <div className="mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-0.5 flex items-center gap-1"><AlertTriangle size={10}/> Order Note</p>
                            <p className="text-xs font-bold text-blue-800 dark:text-blue-300">{getOrderNote(o)}</p>
                          </div>
                        )}
                        
                        <div className="mb-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-xl p-3">
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2">
                            {o.verificationCode ? "Enter Customer Code" : "Action Required"}
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
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500">
                              ✓ Direct Approval Enabled. Review the items and tap Approve to accept the order.
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
                            onClick={() => { setRejectReasonOrder(o); setRejectReasonText(''); }} 
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
                            {o.items?.filter(item => item.type !== 'metadata' && item.type !== 'location_meta' && item.id !== '__contact_info' && item.id !== '__location' && item.id !== '__special_instructions').map((item, i) => (
                              <li key={i} className="flex flex-col">
                                <span className="flex items-center gap-1.5 flex-wrap">
                                  · {item.quantity || 1}x {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}
                                  {(item.isFree || item.type === 'free_dish') && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                      <Gift size={9} /> free
                                    </span>
                                  )}
                                </span>
                                {item.specialInstructions && (
                                  <span className="text-[10px] text-blue-500 font-bold ml-2 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                                    Note: {item.specialInstructions}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                          {getOrderNote(o) && (
                            <div className="mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-0.5 flex items-center gap-1"><AlertTriangle size={10}/> Order Note</p>
                              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">{getOrderNote(o)}</p>
                            </div>
                          )}
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black text-emerald-600">₹{(o.total || 0).toFixed(0)}</span>
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
                <div className="flex justify-between items-center w-full">
                  <p className="font-display font-black text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2"><CheckCircle size={14} /> Completed Today</p>
                  <button 
                    title="View Dine-In History"
                    onClick={() => {
                      setTempDineInStartDate(dineInStartDate);
                      setTempDineInEndDate(dineInEndDate);
                      setDineInAnalysisShown(false);
                      setShowDineInHistoryModal(true);
                    }} 
                    className="p-1.5 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 transition-colors"
                  >
                    <Calendar size={14} />
                  </button>
                </div>
                <p className="font-display font-black text-4xl text-emerald-600 dark:text-emerald-400">{completed.length}</p>
                <p className="text-xs font-bold text-emerald-700/60 dark:text-emerald-500">Revenue: <span className="text-emerald-600 dark:text-emerald-400">₹{todayRevenue.toFixed(0)}</span></p>
                <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/40 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {completed.slice(-10).reverse().map(o => (
                    <div key={o.id} className="flex flex-col gap-1 text-xs text-emerald-700/70 dark:text-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/20 p-2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{getOrderNumber(o)}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">₹{(o.total||0).toFixed(0)}</span>
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

          {/* ════════════════════ DELIVERY & TAKEAWAY ════════════════════ */}
          {vendorTab === 'delivery' && (() => {
            const todayStr = new Date().toLocaleDateString('en-CA');
            const deliveryOrders = restOrders.filter(o => {
              if (o.orderType !== 'delivery' && o.order_type !== 'delivery') return false;
              if (!o.timestamp) return false;
              const orderDate = new Date(o.timestamp).toLocaleDateString('en-CA');
              return orderDate === todayStr;
            });
            const todayDeliveryRevenue = deliveryOrders
              .filter(o => o.status !== 'Cancelled')
              .reduce((sum, o) => sum + Number(o.total || 0), 0);
            
            return (
              <motion.div key="delivery" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute inset-0 overflow-y-auto p-4 sm:p-6 no-scrollbar">
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-display font-black tracking-tight flex items-center gap-3">
                        <Package className="text-blue-500" /> Delivery & Takeaway
                      </h2>
                      <p className="text-sm font-medium text-neutral-500 mt-1">Manage external orders and dispatch delivery agents.</p>
                    </div>
                    {/* Calendar Range Button */}
                    <button 
                      onClick={() => {
                        setTempDeliveryStartDate(deliveryStartDate);
                        setTempDeliveryEndDate(deliveryEndDate);
                        setDeliveryAnalysisShown(false);
                        setShowDeliveryHistoryModal(true);
                      }} 
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
                    >
                      <Calendar size={14} />
                      <span>Delivery History</span>
                    </button>
                  </div>

                  {/* Delivery Stats Bar */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black text-blue-500 tracking-wider">Today's Delivery Orders</span>
                      <span className="text-2xl font-black text-neutral-900 dark:text-white">{deliveryOrders.length}</span>
                    </div>
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black text-emerald-500 tracking-wider">Today's Delivery Revenue</span>
                      <span className="text-2xl font-black text-[#D4AF37]">₹{todayDeliveryRevenue.toFixed(0)}</span>
                    </div>
                  </div>

                  {deliveryOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                        <Package className="text-blue-400" size={32} />
                      </div>
                      <h3 className="font-display font-black text-xl mb-2">No Delivery Orders Yet</h3>
                      <p className="text-sm text-neutral-500 max-w-sm">Share your Delivery QR code to start receiving orders.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {deliveryOrders.map(order => {
                        // 4-layer GPS fallback: metadata > items > specialInstructions > address string [GPS:lat,lng]
                        const _locFromMeta = order.metadata?.location;
                        const _locFromItems = order.items?.find(i => i.type === 'location_meta');
                        const _parseGPS = (str) => {
                          if (!str) return null;
                          const m = String(str).match(/[\[\s]GPS:([\d.\-]+),([\d.\-]+)/);
                          return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null;
                        };
                        const _si = order.metadata?.specialInstructions || order.items?.find(i => i.id === '__special_instructions')?.instructions;
                        const _locFromSI = _parseGPS(_si);
                        const _rawAddr = order.metadata?.address || _locFromItems?.address || '';
                        const _locFromAddr = _parseGPS(_rawAddr);
                        const loc = _locFromMeta || _locFromItems || _locFromSI || _locFromAddr || {};
                        const savedAddress = _rawAddr.replace(/\s*\[GPS:[\d.,\-]+\]/, '').trim();
                        const mapUrl = loc.lat && loc.lng ? `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}` : null;
                        
                        const itemsList = order.items
                          .filter(i => i.type !== 'location_meta' && i.type !== 'metadata' && i.id !== '__contact_info' && i.id !== '__location')
                          .map(i => {
                            const variantStr = i.selectedVariant?.name || i.variantName ? ` (${i.selectedVariant?.name || i.variantName})` : '';
                            const customizationsStr = i.selectedCustomizations && i.selectedCustomizations.length > 0 ? ` [ + ${i.selectedCustomizations.map(c => c.name).join(', ')} ]` : '';
                            return `  • ${i.quantity || 1}x ${i.name}${variantStr}${customizationsStr}`;
                          })
                          .join('\n');

                        const waMessage = [
                          `🛵 *New Delivery Order!*`,
                          ``,
                          `🪪 *Order Code:* ${order.verificationCode || order.id.slice(0,6)}`,
                          `👤 *Customer:* ${order.contactName || 'Guest'}`,
                          order.contactPhone ? `📞 *Phone:* ${order.contactPhone}` : null,
                          ``,
                          `🍽️ *Items:*`,
                          itemsList,
                          ``,
                          `💰 *Total:* ₹${parseFloat(order.total).toFixed(0)}`,
                          savedAddress ? `📍 *Address:* ${savedAddress}` : null,
                          ``,
                          mapUrl ? `🗺️ *Navigate to Customer:*\n${mapUrl}` : `⚠️ No GPS location provided. Call customer for address.`,
                        ].filter(l => l !== null).join('\n');

                        const waUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

                        const isCancelledOrder = order.status === 'Cancelled';

                        return (
                          <div key={order.id} className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] pointer-events-none" />
                            
                            {/* Cancelled overlay */}
                            {isCancelledOrder && (
                              <div className="absolute inset-0 z-30 flex items-center justify-center rounded-3xl" style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0,0,0,0.35)' }}>
                                <div className="rotate-[-20deg] select-none pointer-events-none text-center">
                                  <p className="text-red-500 font-black text-4xl sm:text-5xl tracking-wider drop-shadow-lg" style={{ textShadow: '0 0 30px rgba(239,68,68,0.6)', WebkitTextStroke: '1px rgba(239,68,68,0.5)' }}>ORDER</p>
                                  <p className="text-red-500 font-black text-4xl sm:text-5xl tracking-wider drop-shadow-lg" style={{ textShadow: '0 0 30px rgba(239,68,68,0.6)', WebkitTextStroke: '1px rgba(239,68,68,0.5)' }}>CANCELLED</p>
                                </div>
                              </div>
                            )}

                            {/* View Details button for CANCELLED cards — absolute sibling of overlay so z-40 beats the z-30 overlay */}
                            {isCancelledOrder && (
                              <button
                                onClick={() => setDeliveryDetailOrder(order)}
                                className="absolute top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-lg bg-white dark:bg-white/20 text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/30 transition-colors shadow-lg"
                              >
                                <Eye size={12} /> View Details
                              </button>
                            )}

                            <div className="flex-1 space-y-4 relative z-10">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${isCancelledOrder ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>{isCancelledOrder ? 'Cancelled' : 'Delivery Order'}</span>
                                    <span className="text-xs text-neutral-400 font-bold">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  <h3 className="font-display font-black text-lg text-neutral-900 dark:text-white">{order.contactName || 'Guest'}</h3>
                                  {order.contactPhone && <p className="text-sm font-bold text-neutral-500 flex items-center gap-1.5"><Phone size={12}/> {order.contactPhone}</p>}
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                  <p className="text-2xl font-black text-[#D4AF37]">₹{parseFloat(order.total).toFixed(0)}</p>
                                  {!isCancelledOrder && (
                                    <button
                                      onClick={() => setDeliveryDetailOrder(order)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-lg bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors shadow-sm"
                                    >
                                      <Eye size={12} /> View Details
                                    </button>
                                  )}
                                  {order.verificationCode && (
                                    <p className="text-xs font-bold font-mono text-neutral-400 mt-1">Code: {order.verificationCode}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Delivery Progress Tracker */}
                            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-white/5">
                              <div className="relative flex items-center justify-between px-1">
                                {/* track line */}
                                <div className="absolute top-4 left-4 right-4 h-0.5 rounded-full bg-neutral-200 dark:bg-white/10 z-0" />
                                {[
                                  { id: 'Pending',        label: 'Received',       icon: Clock },
                                  { id: 'Preparing',      label: 'Preparing',      icon: ChefHat },
                                  { id: 'OutForDelivery', label: 'Out for\nDelivery', icon: Package },
                                  { id: 'Delivered',      label: 'Delivered',      icon: CheckCircle },
                                ].map((step, idx, arr) => {
                                  const statusOrder = ['Pending', 'Preparing', 'OutForDelivery', 'Delivered'];
                                  const curIdx = statusOrder.indexOf(order.status);
                                  const stepIdx = statusOrder.indexOf(step.id);
                                  const done = stepIdx <= curIdx;
                                  const active = stepIdx === curIdx;
                                  return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-1 flex-1">
                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                        done
                                          ? 'text-black shadow-md'
                                          : 'bg-neutral-100 dark:bg-white/5 text-neutral-400 dark:text-neutral-600'
                                      } ${active ? 'scale-110' : ''}`}
                                        style={done ? { background: 'linear-gradient(135deg,#D4AF37,#AA8C2C)', boxShadow: '0 3px 10px rgba(212,175,55,0.35)' } : {}}>
                                        <step.icon size={13} />
                                      </div>
                                      <span className="text-[9px] font-bold text-center leading-tight whitespace-pre-line"
                                        style={{ color: active ? '#D4AF37' : done ? 'rgba(212,175,55,0.6)' : 'rgba(150,150,150,0.6)' }}>
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Actions sidebar */}
                            <div className="md:w-52 shrink-0 flex flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-white/5 pt-4 md:pt-0 md:pl-6 relative z-10">
                              <a 
                                href={waUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-[#25D366]/20"
                              >
                                <MessageSquare size={16} /> Share to WhatsApp
                              </a>
                              
                              {order.status === 'Pending' && (
                                <div className="flex flex-col gap-2 w-full">
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'Preparing')}
                                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-sm shadow-sm hover:bg-emerald-600 transition-colors"
                                  >
                                    ✓ Accept Order
                                  </button>
                                  <button
                                    onClick={() => { setRejectReasonOrder(order); setRejectReasonText(''); }}
                                    className="w-full py-3 bg-red-500 text-white rounded-xl font-black text-sm shadow-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
                                  >
                                    ✕ Reject Order
                                  </button>
                                </div>
                              )}
                              
                              {order.status === 'Preparing' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'OutForDelivery')}
                                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-black text-sm shadow-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Package size={15}/> Out for Delivery
                                </button>
                              )}
                              
                              {order.status === 'OutForDelivery' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'Delivered')}
                                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-sm shadow-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle size={15}/> Mark Delivered
                                </button>
                              )}

                              {order.status === 'Delivered' && (
                                <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-sm border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center gap-2">
                                  <CheckCircle size={15}/> Order Delivered
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })()}

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
                    {['Today','Week','Month','Year'].map(r => (
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
                      <KpiCard icon={DollarSign}   label={`${analyticsRange === 'Today' ? "Today's" : analyticsRange === 'Week' ? "This Week's" : analyticsRange === 'Month' ? "This Month's" : "This Year's"} Revenue`}  value={`₹${todayRevenue.toFixed(0)}`}     color="bg-emerald-500" trend={trendRevenue} />
                      <KpiCard icon={ShoppingBag}  label="Orders Completed" value={rangedCompleted.length}                  color="bg-blue-500"    trend={trendOrders} />
                      <KpiCard icon={TrendingUp}   label="Avg Order Value"  value={`₹${avgOrderValue.toFixed(0)}`}   color="bg-purple-500"  trend={trendAvg} />
                      <KpiCard icon={XCircle}      label="Cancellation Rate" value={`${cancelRate}%`}                 color="bg-red-500"     trend={trendCancel} />
                    </>
                  )}
                </div>

                {/* Revenue Chart + Order Split */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm">
                    {analyticsRange === 'Year' ? (
                      <YearlyContributionGrid
                        orders={restOrders}
                        onDayClick={(d) => setSelectedDateOrders({ dateLabel: d.fullDate, orders: d.allDayOrders })}
                      />
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-display font-black text-base">Revenue — {analyticsRange === 'Today' ? 'Today' : analyticsRange === 'Week' ? '7 Days' : '30 Days'}</h3>
                          <span className="text-xs font-semibold text-neutral-400">
                            vs prev. {analyticsRange === 'Today' ? 'day' : analyticsRange === 'Week' ? 'week' : 'month'} <span className={`${trendRevenue >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{trendRevenue >= 0 ? '↑' : '↓'} {Math.abs(trendRevenue)}%</span>
                          </span>
                        </div>
                        <MiniBarChart data={weekData} color="#3B82F6" height={100} onBarClick={(d) => setSelectedDateOrders({ dateLabel: d.fullDate, orders: d.allDayOrders })} />
                        <div className="mt-2 text-center text-[10px] text-neutral-400 font-medium">Total: ₹{todayRevenue.toFixed(0)}</div>
                      </>
                    )}
                  </div>
                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-display font-black text-base mb-6">Order Types</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Dine-In',   count: restOrders.filter(o => o.orderType === 'dine_in').length,  color: 'bg-blue-500' },
                        { label: 'Delivery',  count: restOrders.filter(o => o.orderType === 'delivery').length, color: 'bg-emerald-500' },
                        { label: 'Pre-Order', count: restOrders.filter(o => o.orderType === 'prepaid').length,  color: 'bg-purple-500' },
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
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => handleEditCategory(cat)}
                                  className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 transition-colors"
                                >
                                  <Edit2 size={13} /> Edit Name
                                </button>
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
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="font-display font-black text-2xl">Menu Manager</h2>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {dishSearch
                          ? `${vendDishes.filter(d => d.name.toLowerCase().includes(dishSearch.toLowerCase())).length} result${vendDishes.filter(d => d.name.toLowerCase().includes(dishSearch.toLowerCase())).length !== 1 ? 's' : ''} for "${dishSearch}"`
                          : `${vendDishes.length} dishes · ${vendDishes.filter(d => !d.tags?.includes('hidden')).length} visible`
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setManagingCategories(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-sm font-bold hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors">
                        <Filter size={16} /> Manage Categories
                      </button>
                      <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleOCRUpload} />
                      <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleOCRUpload} />
                      <button onClick={() => setAiImportState('chooser')}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-black hover:bg-[#D4AF37]/20 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                        <Sparkles size={16} /> Import Menu (AI)
                      </button>
                      <button onClick={() => {
                        const defaultTags = (selectedEditCategory && selectedEditCategory !== 'All' && selectedEditCategory !== '__uncategorised__') ? [selectedEditCategory] : [];
                        setEditingDish({ name: '', price: '', description: '', modelUrl: '', chef: '', prepTime: '', origin: '', serves: '', spiceLevel: '', dietaryPreference: '', customizationCategories: [], images: [], tags: defaultTags, variants: DEFAULT_DISH_VARIANTS.map(v => ({ ...v })), macros: { calories: '', protein: '', carbs: '', fat: '' }, allergens: [], ingredients: [] });
                      }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity">
                        <Plus size={16} /> Add Dish
                      </button>
                    </div>
                  </div>

                  {/* 🔍 Dish Search Bar & Filter */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        id="dish-search-input"
                        type="text"
                        value={dishSearch}
                        onChange={e => setDishSearch(e.target.value)}
                        placeholder="Search dishes by name..."
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1A1C23] border border-neutral-200 dark:border-white/8 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      />
                      {dishSearch && (
                        <button
                          onClick={() => setDishSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-200 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors"
                        >
                          <CloseIcon size={12} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowVendorSidebar(!showVendorSidebar)}
                      className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${showVendorSidebar ? 'bg-[#D4AF37] text-white' : 'bg-white dark:bg-[#1A1C23] border border-neutral-200 dark:border-white/8 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                    >
                      <Filter size={18} />
                    </button>
                  </div>

                  <div className="flex gap-6 items-start">
                    {/* Left Sidebar for Categories */}
                    <AnimatePresence>
                      {showVendorSidebar && (
                        <motion.div
                          initial={{ opacity: 0, width: 0, scale: 0.95 }}
                          animate={{ opacity: 1, width: 220, scale: 1 }}
                          exit={{ opacity: 0, width: 0, scale: 0.95 }}
                          className="shrink-0 overflow-hidden flex flex-col gap-2"
                        >
                          <button
                            onClick={() => setVendorActiveCategory('All')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${vendorActiveCategory === 'All' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/5 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-white/20'}`}
                          >
                            All Categories
                          </button>
                          {customCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setVendorActiveCategory(cat)}
                              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${vendorActiveCategory === cat ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/5 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-white/20'}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Right Side: Dishes Grid */}
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vendDishes.filter(d => {
                          if (d.macros?.isCombo) return false;
                          if (dishSearch && !d.name.toLowerCase().includes(dishSearch.toLowerCase())) return false;
                          if (vendorActiveCategory !== 'All') {
                            return d.category === vendorActiveCategory || d.tags?.includes(vendorActiveCategory);
                          }
                          return true;
                        }).map(dish => {
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
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="font-bold text-sm leading-tight flex items-start min-w-0">
                                <span className="mt-0.5 shrink-0"><DietIcon type={dish.dietaryPreference} /></span>
                                <span 
                                  className="break-words" 
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {dish.name}
                                </span>
                              </h3>
                              {dish.chef && <p className="text-xs text-neutral-500 mt-0.5 truncate">{dish.chef}</p>}
                            </div>
                            {dish.variants && dish.variants.length > 0 ? (
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                {dish.variants.map((v, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{v.name}</span>
                                    <span className="font-display font-black text-sm text-[#D4AF37]">₹{Number(v.price || 0).toFixed(0)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="font-display font-black text-base text-[#D4AF37] shrink-0">₹{Number(dish.price).toFixed(0)}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {dish.tags?.filter(t => t !== 'sold_out' && t !== 'hidden').slice(0,3).map(t => (
                              <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500">{t}</span>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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
                            <button onClick={async () => {
                              if(window.confirm('Are you sure you want to delete this dish?')) {
                                await deleteDish(dish.id);
                                const stringDishId = String(dish.id);
                                const thisDishKeys = [stringDishId, ...(dish.variants || []).map(v => `${stringDishId}::${v.name}`)];
                                const updatedCustomizations = (currentRestaurant?.macros?.customizations || []).map(c => {
                                  const nextLinkedDishes = (c.linkedDishes || []).map(String).filter(k => !thisDishKeys.includes(k));
                                  return { ...c, linkedDishes: nextLinkedDishes };
                                });
                                await updateRestaurant(activeRestId, { customizations: updatedCustomizations });
                              }
                            }}
                              className="py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 hover:opacity-80">
                              <Trash2 size={11} /> Delete
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
            </div>
          </div>
        </motion.div>
      )
    )}

          {/* ── EDIT MENU TAB ── */}
          {vendorTab === 'editmenu' && (
            <motion.div key="editmenu" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex overflow-hidden">

              {/* ── LEFT: Category Sidebar ── */}
              <div className="w-[30%] shrink-0 border-r border-neutral-200 dark:border-white/8 bg-white dark:bg-[#0d0d10] overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-neutral-100 dark:border-white/5">
                  <h2 className="font-display font-black text-base">Edit Menu</h2>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{vendDishes.length} dishes</p>
                </div>

                {/* Add Dish shortcut */}
                <button
                  onClick={() => {
                    const defaultTags = (selectedEditCategory && selectedEditCategory !== 'All' && selectedEditCategory !== '__uncategorised__') ? [selectedEditCategory] : [];
                    setEditingDish({ name: '', price: '', description: '', modelUrl: '', chef: '', prepTime: '', origin: '', serves: '', spiceLevel: '', dietaryPreference: '', customizationCategories: [], images: [], tags: defaultTags, variants: DEFAULT_DISH_VARIANTS.map(v => ({ ...v })), macros: { calories: '', protein: '', carbs: '', fat: '' }, allergens: [], ingredients: [] });
                    setVendorTab('menu');
                  }}
                  className="mx-3 mt-3 mb-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} /> Add Dish
                </button>

                <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto no-scrollbar">
                  {/* All category – fixed, not reorderable */}
                  <button
                    onClick={() => setSelectedEditCategory('All')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                      selectedEditCategory === 'All'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">All</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                      selectedEditCategory === 'All'
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                        : 'bg-neutral-100 dark:bg-white/8 text-neutral-400'
                    }`}>{vendDishes.length}</span>
                  </button>

                  {/* Drag-and-drop reorderable custom categories */}
                  <Reorder.Group
                    axis="y"
                    values={customCategories}
                    onReorder={(newOrder) => {
                      setCustomCategories(newOrder);
                      handleSaveCategoriesOrder(newOrder);
                    }}
                    className="flex flex-col gap-0.5"
                  >
                    {customCategories.map((cat) => {
                      const count = vendDishes.filter(d => d.tags?.includes(cat)).length;
                      const isActive = selectedEditCategory === cat;
                      return (
                        <Reorder.Item
                          key={cat}
                          value={cat}
                          className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-semibold transition-colors cursor-grab active:cursor-grabbing ${
                            isActive
                              ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {/* Drag handle */}
                          <GripVertical
                            size={14}
                            className={`shrink-0 ${
                              isActive
                                ? 'text-white/50 dark:text-black/40'
                                : 'text-neutral-400 dark:text-neutral-600'
                            }`}
                          />

                          {/* Label – click to select/filter */}
                          <div
                            onClick={() => setSelectedEditCategory(cat)}
                            className="flex-1 truncate text-left select-none"
                          >
                            {cat}
                          </div>

                          {/* Count badge */}
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                              : 'bg-neutral-100 dark:bg-white/8 text-neutral-400'
                          }`}>{count}</span>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>

                  {/* Uncategorised bucket – fixed, not reorderable */}
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
              <div className="w-[40%] shrink-0 overflow-y-auto">
                {/* Section header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-[#0d0d10] border-b border-neutral-100 dark:border-white/5 px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-black text-base">
                      {selectedEditCategory === 'All' ? 'All Dishes'
                        : selectedEditCategory === '__uncategorised__' ? 'Uncategorised'
                        : selectedEditCategory}
                    </h3>
                     <p className="text-[11px] text-neutral-500">
                       {localDisplayDishes.length} items
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
                        const originalDish = vendDishes.find(d => d.id === (dish.originalId || dish.id)) || dish;
                        const isSoldOut = originalDish.tags?.includes('sold_out');
                        const isHidden  = originalDish.tags?.includes('hidden');
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
                                <span className="font-display font-black text-sm text-[#D4AF37]">₹{Number(dish.price).toFixed(0)}</span>
                                {dish.chef && <span className="text-[11px] text-neutral-400">{dish.chef}</span>}
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
                                onClick={() => { setEditingDish(originalDish); setVendorTab('menu'); }}
                                className="p-2 rounded-lg bg-neutral-100 dark:bg-white/8 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={async () => {
                                  const newTags = isSoldOut
                                    ? (originalDish.tags || []).filter(t => t !== 'sold_out')
                                    : [...(originalDish.tags || []), 'sold_out'];
                                  await updateDish(originalDish.id, { tags: newTags });
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
                                    ? (originalDish.tags || []).filter(t => t !== 'hidden')
                                    : [...(originalDish.tags || []), 'hidden'];
                                  await updateDish(originalDish.id, { tags: newTags });
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
                                  if (confirm(`Delete "${originalDish.name}"? This cannot be undone.`)) {
                                    const { error } = await supabase.from('dishes').delete().eq('id', originalDish.id);
                                    if (!error) { setDishes(prev => prev.filter(d => d.id !== originalDish.id)); showNotification('Dish deleted.'); }
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
              <div className="w-[30%] shrink-0 border-l border-neutral-200 dark:border-white/8 bg-white dark:bg-[#0d0d10] overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-neutral-100 dark:border-white/5">
                  <h2 className="font-display font-black text-sm">Edit Suggestions</h2>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Dish pairing recommendations</p>
                </div>
                  <button
                    onClick={() => { setComboParent(null); setComboRecs([]); setShowComboDialog(true); }}
                    className="mx-3 mt-3 mb-2 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', color: '#000' }}
                  >
                    <Gift size={13} /> Edit Suggestions
                  </button>
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {getSuggestionParents(vendDishes).length === 0 && (
                    <div className="text-center py-8 text-neutral-400">
                      <Gift size={28} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[11px] font-semibold">No suggestions yet</p>
                      <p className="text-[10px] mt-0.5">Click "Edit Suggestions" to pair dishes</p>
                    </div>
                  )}
                  {getSuggestionParents(vendDishes).map(parentDish => {
                    const recIds = parentDish.recommendations || [];
                    const recDishes = recIds.map(rid => resolveDishOrVariant(rid, vendDishes)).filter(Boolean);
                    const parentDisplayName = parentDish.displayName;
                    return (
                      <div key={parentDish.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black text-neutral-900 dark:text-white truncate flex-1 mr-2">{parentDisplayName}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                const pDish = parentDish.isVariant
                                  ? resolveDishOrVariant(`${parentDish.originalId}::${parentDish.variantName}`, vendDishes)
                                  : resolveDishOrVariant(parentDish.id, vendDishes);
                                setComboParent(pDish);
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
                                if (parentDish.isVariant) {
                                  const updatedVariants = (parentDish.macros?.variants || []).map(v =>
                                    v.name === parentDish.variantName
                                      ? { ...v, comboRecommendations: undefined }
                                      : v
                                  );
                                  await updateDish(parentDish.originalId, {
                                    macros: {
                                      ...(parentDish.macros || {}),
                                      variants: updatedVariants
                                    }
                                  });
                                } else {
                                  await updateDish(parentDish.id, {
                                    macros: {
                                      ...(parentDish.macros || {}),
                                      comboRecommendations: undefined
                                    }
                                  });
                                }
                                showNotification('Suggestions deleted.');
                              }}
                              className="p-1 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Delete suggestions"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {recDishes.map(r => (
                            <span key={r.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                              {r.name} - ₹{Number(r.price).toFixed(0)}
                            </span>
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
                      <h2 className="font-display font-black text-xl">Suggestion Builder</h2>
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
                                    <p className="text-xs text-neutral-500">₹{Number(comboParent.price).toFixed(0)}</p>
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
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-200 dark:bg-white/10 shrink-0">
                                      {(rec.cover || rec.images?.[0]) ? <img src={rec.cover || rec.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ChefHat size={12} className="text-neutral-400" /></div>}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="font-bold text-xs truncate block">{rec.name}</span>
                                      <span className="text-[10px] text-neutral-500 block">₹{Number(rec.price || 0).toFixed(0)}</span>
                                    </div>
                                  </div>
                                  <button onClick={() => setComboRecs(prev => prev.filter(r => r.id !== rec.id))} className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"><CloseIcon size={12} /></button>
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
                              const parentId = comboParent.originalId || comboParent.id;
                              const originalParent = vendDishes.find(d => d.id === parentId);
                              if (!originalParent) return;
                              const recsList = comboRecs.map(r => r.isVariant ? `${r.originalId}::${r.variantName}` : r.id);
                              if (comboParent.isVariant) {
                                const updatedVariants = (originalParent.macros?.variants || []).map(v => 
                                  v.name === comboParent.variantName 
                                    ? { ...v, comboRecommendations: recsList }
                                    : v
                                );
                                await updateDish(parentId, {
                                  macros: {
                                    ...(originalParent.macros || {}),
                                    variants: updatedVariants
                                  }
                                });
                              } else {
                                await updateDish(parentId, {
                                  macros: {
                                    ...(originalParent.macros || {}),
                                    comboRecommendations: recsList,
                                    comboParentVariant: undefined
                                  }
                                });
                              }
                              showNotification(`Combo saved for "${originalParent.name}" with ${comboRecs.length} recommendations!`);
                              setShowComboDialog(false);
                              setComboParent(null);
                              setComboRecs([]);
                            }}
                           className="w-full py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                           style={comboParent && comboRecs.length > 0 ? { background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', color: '#000', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' } : { background: 'rgba(212,175,55,0.1)', color: '#AA8C2C' }}
                         >
                           <span className="flex items-center justify-center gap-2"><Save size={15} /> Save Suggestions</span>
                         </button>
                       </div>
 
                       {/* Right: Available Dishes Grid */}
                       <div>
                         <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2">Available Dishes — Click to assign</p>
                         <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                           {expandDishesWithVariants(vendDishes).map(d => {
                             const isParent = comboParent && comboParent.id === d.id;
                             const isRec = comboRecs.some(r => r.id === d.id);
                             const parentId = d.originalId || d.id;
                             const originalD = vendDishes.find(x => x.id === parentId);
                             const isAlreadyParent = !!(
                               originalD?.macros?.comboRecommendations?.length > 0 ||
                               (d.isVariant && originalD?.macros?.variants?.find(v => v.name === d.variantName)?.comboRecommendations?.length > 0)
                             );
                             const isAlreadyParentElsewhere = isAlreadyParent && (comboParent?.id !== d.id);
                             const isUsed = isParent || isRec;
                             return (
                               <button
                                 key={d.id}
                                 disabled={isAlreadyParentElsewhere && !comboParent}
                                 onClick={() => {
                                   if (isParent) { setComboParent(null); return; }
                                   if (isRec) { setComboRecs(prev => prev.filter(r => r.id !== d.id)); return; }
                                   if (!comboParent) {
                                     if (isAlreadyParent) {
                                       showNotification(`${d.name} is already a parent of another suggestion.`);
                                       return;
                                     }
                                     setComboParent(d);
                                   } else {
                                     // Avoid adding duplicate parent recommendations if the dish has variants
                                     const recParentId = d.originalId || d.id;
                                     if (comboRecs.some(r => (r.originalId || r.id) === recParentId)) {
                                       showNotification(`This dish is already in recommendations.`);
                                       return;
                                     }
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
                                   <p className="text-[10px] text-neutral-500">₹{Number(d.price).toFixed(0)}</p>
                                 </div>
                                 {isParent && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">PARENT</span>}
                                 {isRec && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">REC</span>}
                                 {isAlreadyParentElsewhere && !comboParent && (
                                   <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 shrink-0">
                                     Already a parent
                                   </span>
                                 )}
                                 {!isUsed && !isAlreadyParentElsewhere && (
                                   <span className="text-[10px] text-neutral-400">
                                     {!comboParent
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
          {/* ── COMBO CREATOR DIALOG ── */}
          <AnimatePresence>
            {showComboCreator && (
              <motion.div
                key="combo-creator-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowComboCreator(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-white/5">
                    <div>
                      <h2 className="font-display font-black text-xl">Create Combo</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">Bundle dishes together for a discounted price</p>
                    </div>
                    <button onClick={() => setShowComboCreator(false)} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors">
                      <CloseIcon size={16} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Combo Name</label>
                      <input 
                        type="text" 
                        value={comboDraft.name} 
                        onChange={e => setComboDraft(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-neutral-100 dark:bg-[#1A1C23] border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none"
                        placeholder="e.g. Burger Meal"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1">Combo Price (₹)</label>
                        <input 
                          type="number" 
                          value={comboDraft.price} 
                          onChange={e => setComboDraft(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full bg-neutral-100 dark:bg-[#1A1C23] border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none"
                          placeholder="e.g. 299"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                      <textarea 
                        value={comboDraft.description} 
                        onChange={e => setComboDraft(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-neutral-100 dark:bg-[#1A1C23] border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none min-h-[80px]"
                        placeholder="Describe what's included..."
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-bold text-neutral-500">Select Dishes ({comboDraft.dishes.length} selected)</label>
                        <div className="relative w-1/2">
                          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                          <input
                            type="text"
                            value={comboDishSearch}
                            onChange={e => setComboDishSearch(e.target.value)}
                            placeholder="Search dishes..."
                            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#1A1C23] focus:border-[#D4AF37]/50 text-xs outline-none transition-all"
                          />
                          {comboDishSearch && (
                            <button onClick={() => setComboDishSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10">
                              <CloseIcon size={10} className="text-neutral-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 max-h-[30vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                        {vendDishes.filter(d => !d.tags?.includes('combo') && !d.macros?.isCombo && (!comboDishSearch || d.name.toLowerCase().includes(comboDishSearch.toLowerCase()))).flatMap(d => {
                          // If dish has variants, show each variant as a selectable option
                          if (d.variants && d.variants.length > 0) {
                            return d.variants.map((v, idx) => {
                              const uniqueId = `${d.id}::${v.name}`;
                              const isSelected = comboDraft.dishes.includes(uniqueId);
                              return (
                                <button
                                  key={uniqueId}
                                  onClick={() => {
                                    setComboDraft(prev => ({
                                      ...prev,
                                      dishes: isSelected ? prev.dishes.filter(id => id !== uniqueId) : [...prev.dishes, uniqueId]
                                    }));
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/15 border-blue-300 dark:border-blue-700' : 'bg-neutral-50 dark:bg-white/[0.02] border-neutral-100 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/5'
                                  } border`}
                                >
                                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-200 dark:bg-white/10 shrink-0">
                                    {(d.cover || d.images?.[0]) ? <img src={d.cover || d.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ChefHat size={12} className="text-neutral-400" /></div>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs truncate">{d.name} <span className="text-neutral-500 font-normal">({v.name})</span></p>
                                    <p className="text-[10px] text-neutral-500">₹{Number(v.price || 0).toFixed(0)}</p>
                                  </div>
                                  {isSelected && <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600">ADDED</span>}
                                </button>
                              );
                            });
                          }
                          
                          // Regular dish without variants
                          const isSelected = comboDraft.dishes.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              onClick={() => {
                                setComboDraft(prev => ({
                                  ...prev,
                                  dishes: isSelected ? prev.dishes.filter(id => id !== d.id) : [...prev.dishes, d.id]
                                }));
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                                isSelected ? 'bg-blue-50 dark:bg-blue-900/15 border-blue-300 dark:border-blue-700' : 'bg-neutral-50 dark:bg-white/[0.02] border-neutral-100 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/5'
                              } border`}
                            >
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-200 dark:bg-white/10 shrink-0">
                                {(d.cover || d.images?.[0]) ? <img src={d.cover || d.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ChefHat size={12} className="text-neutral-400" /></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs truncate">{d.name}</p>
                                <p className="text-[10px] text-neutral-500">₹{Number(d.price || 0).toFixed(0)}</p>
                              </div>
                              {isSelected && <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600">ADDED</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02]">
                    <button
                      disabled={!comboDraft.name || !comboDraft.price || comboDraft.dishes.length === 0}
                      onClick={async () => {
                        const firstChildId = comboDraft.dishes[0];
                        const firstChild = vendDishes.find(d => d.id === firstChildId);
                        
                        const payload = {
                          name: comboDraft.name,
                          price: parseFloat(comboDraft.price) || 0,
                          description: comboDraft.description,
                          restId: activeRestId,
                          cover: firstChild?.cover || firstChild?.images?.[0] || null,
                          tags: ['combo', 'Combos'],
                          macros: {
                            isCombo: true,
                            comboDishes: comboDraft.dishes
                          }
                        };
                        if (comboDraft.id) {
                          await updateDish(comboDraft.id, payload);
                          showNotification('Combo updated successfully!');
                          setShowComboCreator(false);
                          setComboDraft({ name: '', description: '', price: '', dishes: [] });
                        } else {
                          const res = await addDish(payload);
                          if (res) {
                            showNotification('Combo created successfully!');
                            setShowComboCreator(false);
                            setComboDraft({ name: '', description: '', price: '', dishes: [] });
                          }
                        }
                      }}
                      className="w-full py-3 rounded-xl font-black text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={comboDraft.name && comboDraft.price && comboDraft.dishes.length > 0 ? { background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', color: '#000', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' } : { background: 'rgba(212,175,55,0.1)', color: '#AA8C2C' }}
                    >
                      <span className="flex items-center justify-center gap-2"><Save size={15} /> Save Combo</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CUSTOMIZE TAB ── */}
          {vendorTab === 'customize' && (
            <motion.div key="customize" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 overflow-y-auto p-4 sm:p-6 bg-[#fafafa] dark:bg-[#0a0a0a]">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                      <Layers className="text-emerald-500" /> Add-ons & Toppings
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">Create customization options like extra toppings, crust types, or spice levels.</p>
                  </div>
                  <button
                    onClick={() => setEditingCustomization({ id: Date.now().toString(), name: '', type: 'multiple', options: [] })}
                    className="shrink-0 bg-neutral-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <PlusCircle size={16} /> New Category
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentRestaurant?.macros?.customizations || []).map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-[#12141D] rounded-2xl border border-neutral-200 dark:border-white/10 p-5 cursor-pointer hover:border-emerald-500 transition-colors"
                      onClick={() => setEditingCustomization(JSON.parse(JSON.stringify(cat)))}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-neutral-900 dark:text-white text-lg">{cat.name}</h3>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={cat.type === 'single'
                              ? { background: 'rgba(99,102,241,0.12)', color: '#6366f1' }
                              : { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                            }
                          >
                            {cat.type === 'single' ? '⊙ Single Choice' : '☑ Multi-Choice'}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-400">{cat.options?.length || 0} opts</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {cat.options.map((opt, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">{opt.name}</span>
                            <span className="font-bold text-emerald-600">+{opt.price > 0 ? `₹${Number(opt.price).toFixed(0)}` : 'Free'}</span>
                          </div>
                        ))}
                      </div>
                      {(() => {
                        const linkedNames = [];
                        const linkedKeys = cat.linkedDishes || [];
                        const vendDishes = dishes.filter(d => !d.macros?.isCombo && !d.macros?.isEvent && d.restId === activeRestId);
                        
                        vendDishes.forEach(dish => {
                          const isDirectlyLinked = (dish.customizationCategories || []).includes(cat.id);
                          if (dish.variants && dish.variants.length > 0) {
                            const linkedVariants = dish.variants.filter(v => {
                              const key = `${dish.id}::${v.name}`;
                              return linkedKeys.map(String).includes(String(key)) || isDirectlyLinked;
                            });
                            if (linkedVariants.length === dish.variants.length) {
                              linkedNames.push(dish.name);
                            } else if (linkedVariants.length > 0) {
                              linkedVariants.forEach(v => {
                                linkedNames.push(`${dish.name} (${v.name})`);
                              });
                            }
                          } else {
                            if (isDirectlyLinked || linkedKeys.map(String).includes(String(dish.id))) {
                              linkedNames.push(dish.name);
                            }
                          }
                        });
                        
                        if (linkedNames.length > 0) {
                          return (
                            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-3 pt-3 border-t border-neutral-100 dark:border-white/5 line-clamp-2">
                              Applied to: <span className="font-bold text-neutral-600 dark:text-neutral-300">{linkedNames.join(', ')}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-3 pt-3 border-t border-neutral-100 dark:border-white/5 italic">
                              Not applied to any dishes yet
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ))}
                  {(currentRestaurant?.macros?.customizations || []).length === 0 && (
                     <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-3xl">
                       <Layers size={48} className="text-neutral-300 dark:text-white/20 mb-4" />
                       <h3 className="font-bold text-neutral-700 dark:text-white/80 mb-1">No Add-ons yet</h3>
                       <p className="text-sm text-neutral-500">Create your first customization category above.</p>
                     </div>
                  )}
                </div>
              </div>

              {/* CUSTOMIZATION EDITOR MODAL */}
              <AnimatePresence>
                {editingCustomization && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCustomization(null)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#12141D] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-white/10 max-h-[90vh] overflow-y-auto flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-neutral-900 dark:text-white">{currentRestaurant?.macros?.customizations?.some(c => c.id === editingCustomization.id) ? 'Edit Add-on Category' : 'New Add-on Category'}</h3>
                        <button onClick={() => setEditingCustomization(null)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                          <CloseIcon size={20} className="text-neutral-500" />
                        </button>
                      </div>

                      <div className="space-y-5 flex-1">
                        {/* Category Name */}
                        <div>
                          <label className="text-xs font-bold text-neutral-500 mb-1 block">Category Name (e.g. Toppings, Size)</label>
                          <input type="text" value={editingCustomization.name} onChange={e => setEditingCustomization(p => ({ ...p, name: e.target.value }))} className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" placeholder="Extra Toppings" />
                        </div>

                        {/* Selection Type Toggle */}
                        <div>
                          <label className="text-xs font-bold text-neutral-500 mb-2 block">Selection Type</label>
                          <div className="flex gap-2">
                            {['single', 'multiple'].map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setEditingCustomization(p => ({ ...p, type: t }))}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all"
                                style={(editingCustomization.type || 'multiple') === t
                                  ? t === 'single'
                                    ? { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.5)', color: '#6366f1' }
                                    : { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.5)', color: '#10b981' }
                                  : { background: 'transparent', borderColor: 'rgba(212,175,55,0.15)', color: '#9ca3af' }
                                }
                              >
                                {t === 'single' ? (
                                  <>
                                    <span style={{ fontSize: 16 }}>⊙</span> Single Choice
                                  </>
                                ) : (
                                  <>
                                    <span style={{ fontSize: 16 }}>☑</span> Multiple Choice
                                  </>
                                )}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1.5">
                            {(editingCustomization.type || 'multiple') === 'single'
                              ? 'Customer can pick only one option from this category.'
                              : 'Customer can pick multiple options from this category.'}
                          </p>
                        </div>

                        {/* Options */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-neutral-500 block">Add-on Options</label>
                            <button onClick={() => setEditingCustomization(p => ({ ...p, options: [...p.options, { id: Date.now().toString(), name: '', price: 0 }] }))} className="text-xs font-bold text-emerald-500 flex items-center gap-1"><PlusCircle size={12} /> Add Option</button>
                          </div>
                          <div className="space-y-2">
                            {editingCustomization.options.map((opt, i) => (
                              <div key={opt.id} className="flex gap-2 items-center">
                                <input type="text" value={opt.name} onChange={e => { const newOpts = [...editingCustomization.options]; newOpts[i].name = e.target.value; setEditingCustomization(p => ({ ...p, options: newOpts })); }} className="flex-1 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-white/10 rounded-xl p-2.5 text-sm dark:text-white" placeholder="e.g. Extra Cheese" />
                                <div className="relative w-24">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">₹</span>
                                  <input type="number" min="0" step="1" value={opt.price} onChange={e => { const newOpts = [...editingCustomization.options]; newOpts[i].price = e.target.value; setEditingCustomization(p => ({ ...p, options: newOpts })); }} className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-white/10 rounded-xl p-2.5 pl-7 text-sm dark:text-white" placeholder="0" />
                                </div>
                                <button onClick={() => { const newOpts = [...editingCustomization.options]; newOpts.splice(i, 1); setEditingCustomization(p => ({ ...p, options: newOpts })); }} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                                  <Trash size={16} />
                                </button>
                              </div>
                            ))}
                            {editingCustomization.options.length === 0 && (
                              <div className="text-center py-4 text-xs text-neutral-400">No options added yet. Click "Add Option" to start.</div>
                            )}
                          </div>
                        </div>

                        {/* Link to Dishes */}
                        <div>
                          <label className="text-xs font-bold text-neutral-500 mb-2 block">Apply to Dishes</label>
                          <p className="text-[11px] text-neutral-400 mb-2">Select the exact dish (or variant) where this add-on will appear when a customer adds it to cart.</p>
                          
                          {/* Search Bar for Dishes */}
                          <div className="relative mb-3">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                              <Search size={14} />
                            </span>
                            <input
                              type="text"
                              value={addonDishSearch}
                              onChange={e => setAddonDishSearch(e.target.value)}
                              placeholder="Search dishes..."
                              className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-xs dark:text-white"
                            />
                            {addonDishSearch && (
                              <button onClick={() => setAddonDishSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10">
                                <CloseIcon size={12} className="text-neutral-500" />
                              </button>
                            )}
                          </div>

                          <div className="border border-neutral-200 dark:border-white/10 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                            {(() => {
                              const selectableItems = vendDishes.filter(d => !d.macros?.isCombo && !d.macros?.isEvent).flatMap(dish => {
                                const hasVariants = dish.variants && dish.variants.length > 0;
                                if (hasVariants) {
                                  return dish.variants.map(v => {
                                    const key = `${dish.id}::${v.name}`;
                                    const isLinked = (editingCustomization.linkedDishes || []).map(String).includes(key);
                                    return {
                                      key,
                                      isLinked,
                                      dishName: dish.name,
                                      variantName: v.name,
                                      category: dish.category || null,
                                      price: Number(v.price),
                                      dish,
                                      variant: v
                                    };
                                  });
                                } else {
                                  const key = String(dish.id);
                                  const isLinked = (editingCustomization.linkedDishes || []).map(String).includes(key)
                                    || (dish.customizationCategories || []).includes(editingCustomization.id);
                                  return [{
                                    key,
                                    isLinked,
                                    dishName: dish.name,
                                    variantName: null,
                                    category: dish.category || null,
                                    price: Number(dish.price),
                                    dish,
                                    variant: null
                                  }];
                                }
                              });

                              const filteredItems = selectableItems.filter(item => {
                                if (!addonDishSearch) return true;
                                const q = addonDishSearch.toLowerCase();
                                return item.dishName.toLowerCase().includes(q)
                                  || (item.variantName && item.variantName.toLowerCase().includes(q))
                                  || (item.category && item.category.toLowerCase().includes(q));
                              });

                              const sortedItems = [...filteredItems].sort((a, b) => {
                                if (a.isLinked === b.isLinked) {
                                  return a.dishName.localeCompare(b.dishName);
                                }
                                return a.isLinked ? -1 : 1;
                              });

                              if (sortedItems.length === 0) {
                                return (
                                  <div className="p-4 text-xs text-neutral-400 text-center">
                                    {addonDishSearch ? 'No matching dishes.' : 'No dishes in your menu yet.'}
                                  </div>
                                );
                              }

                              return sortedItems.map(item => {
                                const { key, isLinked, dishName, variantName, price, dish } = item;
                                return (
                                  <label key={key} className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-white/5 cursor-pointer border-b border-neutral-100 dark:border-white/5 last:border-0">
                                    <input
                                      type="checkbox"
                                      checked={isLinked}
                                      onChange={() => {
                                        const prev = editingCustomization.linkedDishes || [];
                                        const next = isLinked 
                                          ? prev.map(String).filter(k => k !== String(key)) 
                                          : [...prev.map(String), String(key)];
                                        setEditingCustomization(p => ({ ...p, linkedDishes: next }));
                                      }}
                                      className="rounded border-neutral-300 dark:border-neutral-700 accent-emerald-500 w-4 h-4 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <span className="text-sm font-bold text-neutral-800 dark:text-white truncate block">{dishName}</span>
                                      {variantName ? (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>{variantName}</span>
                                      ) : (
                                        dish.category && <span className="text-[10px] text-neutral-400">{dish.category}</span>
                                      )}
                                    </div>
                                    <span className="ml-auto text-xs font-bold text-emerald-600 shrink-0">₹{price.toFixed(0)}</span>
                                  </label>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button onClick={async () => {
                          const existing = currentRestaurant?.macros?.customizations || [];
                          const isExisting = existing.some(c => c.id === editingCustomization.id);
                          const cleaned = {
                            ...editingCustomization,
                            type: editingCustomization.type || 'multiple',
                            options: editingCustomization.options.filter(o => o.name.trim() !== '').map(o => ({...o, price: Number(o.price) || 0})),
                            linkedDishes: editingCustomization.linkedDishes || [],
                          };
                          const newArr = isExisting
                            ? existing.map(c => c.id === editingCustomization.id ? cleaned : c)
                            : [...existing, cleaned];
                          await updateRestaurant(activeRestId, { customizations: newArr });

                          // Derive the set of base dish IDs that are linked (strip ::variantName suffix)
                          const linkedBaseDishIds = new Set(
                            (cleaned.linkedDishes || []).map(k => {
                              const s = String(k);
                              return s.includes('::') ? s.split('::')[0] : s;
                            })
                          );

                          // Update customizationCategories on each dish accordingly
                          const allDishes = vendDishes.filter(d => !d.macros?.isCombo && !d.macros?.isEvent);
                          for (const dish of allDishes) {
                            const prevCats = dish.customizationCategories || [];
                            const shouldLink = linkedBaseDishIds.has(String(dish.id));
                            const isCurrentlyLinked = prevCats.includes(cleaned.id);
                            if (shouldLink && !isCurrentlyLinked) {
                              await updateDish(dish.id, { customizationCategories: [...prevCats, cleaned.id] });
                            } else if (!shouldLink && isCurrentlyLinked) {
                              await updateDish(dish.id, { customizationCategories: prevCats.filter(id => id !== cleaned.id) });
                            }
                          }

                          setEditingCustomization(null);
                          showNotification('✅ Add-on category saved!');
                        }} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 transition-colors">Save Add-on</button>

                        {currentRestaurant?.macros?.customizations?.some(c => c.id === editingCustomization.id) && (
                          <button onClick={async () => {
                            if (window.confirm('Delete this customization category?')) {
                              const existing = currentRestaurant?.macros?.customizations || [];
                              await updateRestaurant(activeRestId, { customizations: existing.filter(c => c.id !== editingCustomization.id) });
                              // Unlink from all dishes
                              for (const dish of vendDishes) {
                                const prevCats = dish.customizationCategories || [];
                                if (prevCats.includes(editingCustomization.id)) {
                                  await updateDish(dish.id, { customizationCategories: prevCats.filter(id => id !== editingCustomization.id) });
                                }
                              }
                              setEditingCustomization(null);
                              showNotification('Deleted.');
                            }
                          }} className="px-4 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10">Delete</button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── COMBOS TAB ── */}
          {vendorTab === 'combos' && (
            <motion.div key="combos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 overflow-y-auto p-6 bg-[#fafafa] dark:bg-black">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-display font-black text-2xl text-neutral-900 dark:text-white">Combos</h2>
                  <p className="text-neutral-500 mt-1">Bundle dishes together for a discounted price.</p>
                </div>
                <button
                  onClick={() => { setComboDraft({ name: '', description: '', price: '', dishes: [] }); setShowComboCreator(true); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-black text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', boxShadow: '0 4px 15px rgba(212,175,55,0.2)' }}
                >
                  <Gift size={16} /> Add Combo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vendDishes.filter(d => d.macros?.isCombo).length === 0 ? (
                  <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-3xl">
                    <Gift size={48} className="text-neutral-300 dark:text-white/20 mb-4" />
                    <h3 className="font-bold text-lg text-neutral-700 dark:text-white mb-2">No Combos Yet</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto mb-6">Create combo meals to offer your customers bundled dishes at a discounted price.</p>
                    <button onClick={() => { setComboDraft({ name: '', description: '', price: '', dishes: [] }); setShowComboCreator(true); }} className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm">Create First Combo</button>
                  </div>
                ) : (
                  vendDishes.filter(d => d.macros?.isCombo).map(combo => {
                    const comboChildren = combo.macros?.comboDishes?.map(idStr => {
                      const [dishId, variantName] = (typeof idStr === 'string' ? idStr : '').split('::');
                      const d = vendDishes.find(d => d.id === (dishId || idStr));
                      if (!d) return null;
                      if (variantName) {
                        const v = d.variants?.find(v => v.name === variantName);
                        return { ...d, name: `${d.name} (${variantName})`, price: v?.price || d.price || 0 };
                      }
                      return d;
                    }).filter(Boolean) || [];
                    const originalTotal = comboChildren.reduce((sum, d) => sum + (Number(d.price) || 0), 0);
                    return (
                      <ComboCardItem
                        key={combo.id}
                        combo={combo}
                        comboChildren={comboChildren}
                        originalTotal={originalTotal}
                        updateDish={updateDish}
                        deleteDish={deleteDish}
                        setComboDraft={setComboDraft}
                        setShowComboCreator={setShowComboCreator}
                      />
                    );
                  })
                )}
              </div>
            </motion.div>
          )}


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
                                      <span className="text-emerald-500 font-black text-sm font-sans">₹{Number(event.price).toFixed(0)}</span>
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
                  let savedDishId = editingDish.id;
                  if (editingDish.id) {
                    success = await updateDish(editingDish.id, editingDish) !== null;
                  } else {
                    const resId = await addDish({ ...editingDish, restId: activeRestId });
                    success = resId !== null;
                    savedDishId = resId;
                  }
                  if (success && savedDishId) {
                    // Sync customizations in the restaurant's metadata
                    const stringSavedDishId = String(savedDishId);
                    const thisDishKeys = [stringSavedDishId, ...(editingDish.variants || []).map(v => `${stringSavedDishId}::${v.name}`)];
                    const updatedCustomizations = (currentRestaurant?.macros?.customizations || []).map(cat => {
                      const isChecked = (editingDish.customizationCategories || []).includes(cat.id);
                      // Start with a clean list of keys from other dishes (coerced to String)
                      let nextLinkedDishes = (cat.linkedDishes || []).map(String).filter(k => !thisDishKeys.includes(k));
                      if (isChecked) {
                        if (editingDish.variants && editingDish.variants.length > 0) {
                          editingDish.variants.forEach(v => {
                            nextLinkedDishes.push(`${stringSavedDishId}::${v.name}`);
                          });
                        } else {
                          nextLinkedDishes.push(stringSavedDishId);
                        }
                      }
                      return { ...cat, linkedDishes: nextLinkedDishes };
                    });
                    
                    await updateRestaurant(activeRestId, { customizations: updatedCustomizations });
                    
                    setEditingDish(null); 
                    setScanState('idle'); 
                    setProgress(0); 
                    showNotification(editingDish.id ? 'Dish updated!' : 'Dish published!'); 
                  }
                }} className="space-y-5">

                  <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider">Basic Info</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Dish Name *</label>
                        <input required type="text" value={editingDish.name} onChange={e => setEditingDish({...editingDish, name: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Prep Time (min)</label>
                        <input type="number" value={editingDish.prepTime || ''} onChange={e => setEditingDish({...editingDish, prepTime: e.target.value})}
                          placeholder="18"
                          className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-neutral-100 dark:border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400">Variants & Quantities (Optional)</label>
                        <button type="button" onClick={() => setEditingDish({...editingDish, variants: [...(editingDish.variants || []), {name: '', price: ''}]})} className="text-xs text-[#D4AF37] font-bold hover:underline flex items-center gap-1">
                          <Plus size={12} /> Add Variant
                        </button>
                      </div>
                      {(editingDish.variants || []).map((v, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                          <input required type="text" placeholder="e.g. Half / Full / Cup" value={v.name} onChange={e => {
                            const newV = [...(editingDish.variants || [])];
                            newV[i] = { ...newV[i], name: e.target.value };
                            setEditingDish({...editingDish, variants: newV});
                          }} className="flex-1 bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white" />
                          <input type="number" step="0.01" placeholder="Price (₹)" value={v.price} onChange={e => {
                            const newV = [...(editingDish.variants || [])];
                            newV[i] = { ...newV[i], price: e.target.value };
                            setEditingDish({...editingDish, variants: newV});
                          }} className="w-24 bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white" />
                          <button type="button" onClick={() => {
                            const newV = (editingDish.variants || []).filter((_, idx) => idx !== i);
                            setEditingDish({...editingDish, variants: newV});
                          }} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {editingDish.variants?.length > 0 && (
                        <p className="text-[10px] text-neutral-500 mt-1">When variants are added, customers must choose one. The base price will be ignored.</p>
                      )}
                    </div>
                     <div>
                       <div className="flex justify-between items-center mb-1.5">
                         <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400">Description *</label>
                         <button
                           type="button"
                           disabled={isGeneratingDesc}
                           onClick={async () => {
                             if (!editingDish.name || !editingDish.name.trim()) {
                               showNotification('Please enter the dish name first!');
                               return;
                             }
                             setIsGeneratingDesc(true);
                             try {
                               const desc = await generateAIDescription(editingDish.name);
                               setEditingDish(prev => ({ ...prev, description: desc }));
                               showNotification('AI Description generated!');
                             } catch (err) {
                               console.error(err);
                               if (err.message === 'GEMINI_API_KEY_MISSING') {
                                 showNotification('⚠️ Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
                               } else {
                                 showNotification(err.message || 'Failed to generate description. Please try again.');
                               }
                             } finally {
                               setIsGeneratingDesc(false);
                             }
                           }}
                           className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 disabled:opacity-50"
                         >
                           <Sparkles size={12} className={isGeneratingDesc ? 'animate-spin' : ''} />
                           {isGeneratingDesc ? 'Generating...' : 'AI Description'}
                         </button>
                       </div>
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
                          <option value="Non-Vegetarian">Non-Vegetarian</option>
                          <option value="Eggitarian">Eggitarian</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Customization Categories */}
                  {(currentRestaurant?.macros?.customizations || []).length > 0 && (
                    <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-3">
                      <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider flex items-center gap-2"><Layers size={14} className="text-emerald-500" /> Add-on Categories</h3>
                      <p className="text-[11px] text-neutral-400">Select which add-on categories apply to this dish.</p>
                      <div className="space-y-2">
                        {(currentRestaurant?.macros?.customizations || []).map(cat => {
                          const isChecked = (editingDish.customizationCategories || []).includes(cat.id);
                          return (
                            <label key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'}`}>
                              <input type="checkbox" checked={isChecked} onChange={() => {
                                const prev = editingDish.customizationCategories || [];
                                const next = isChecked ? prev.filter(id => id !== cat.id) : [...prev, cat.id];
                                setEditingDish({...editingDish, customizationCategories: next});
                              }} className="accent-emerald-500 w-4 h-4" />
                              <div className="flex-1">
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">{cat.name}</span>
                                <span className="text-[10px] text-neutral-400 ml-2">({cat.options.length} options)</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                              {/* Header row */}
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-neutral-500 block">Applicable Dishes</label>
                                {(() => {
                                  const expanded = expandDishesWithVariants(dishes.filter(d => d.restId === activeRestId));
                                  const selectedCount = promoForm.applicableDishes.length;
                                  const allSelected = selectedCount === expanded.length && expanded.length > 0;
                                  return (
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] text-neutral-400">{selectedCount} selected</span>
                                      <button
                                        onClick={() => {
                                          if (allSelected) {
                                            setPromoForm(p => ({...p, applicableDishes: []}));
                                          } else {
                                            setPromoForm(p => ({...p, applicableDishes: expanded.map(d => d.id)}));
                                          }
                                        }}
                                        className="text-[10px] font-bold text-[#D4AF37] hover:underline"
                                      >
                                        {allSelected ? 'Deselect All' : 'Select All'}
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Search bar */}
                              <div className="relative mb-2">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                  type="text"
                                  placeholder="Search dishes..."
                                  value={flashDishSearch}
                                  onChange={e => setFlashDishSearch(e.target.value)}
                                  className="w-full pl-8 pr-8 py-2 bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl text-xs dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                                />
                                {flashDishSearch && (
                                  <button onClick={() => setFlashDishSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs">✕</button>
                                )}
                              </div>

                              {/* Category filter tabs */}
                              {(() => {
                                const restDishes = dishes.filter(d => d.restId === activeRestId);
                                const rawCats = [...new Set(restDishes.map(d => d.category).filter(Boolean))];
                                const cats = ['All', ...rawCats];
                                if (cats.length <= 2) return null; // Only show if more than one real category
                                return (
                                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-2">
                                    {cats.map(cat => (
                                      <button
                                        key={cat}
                                        onClick={() => setFlashCategoryFilter(cat)}
                                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                          flashCategoryFilter === cat
                                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                            : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-[#D4AF37]/50'
                                        }`}
                                      >
                                        {cat}
                                      </button>
                                    ))}
                                  </div>
                                );
                              })()}

                              {/* Dish list with search + category filtering */}
                              <div className="bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                                {(() => {
                                  const allExpanded = expandDishesWithVariants(dishes.filter(d => d.restId === activeRestId));
                                  const filtered = allExpanded.filter(dish => {
                                    const matchSearch = !flashDishSearch || dish.name.toLowerCase().includes(flashDishSearch.toLowerCase());
                                    const matchCat = flashCategoryFilter === 'All' || dish.category === flashCategoryFilter;
                                    return matchSearch && matchCat;
                                  });

                                  if (allExpanded.length === 0) {
                                    return <div className="text-xs text-neutral-500 text-center py-4">No dishes available. Add dishes first.</div>;
                                  }
                                  if (filtered.length === 0) {
                                    return <div className="text-xs text-neutral-400 text-center py-4">No dishes match your search.</div>;
                                  }
                                  return filtered.map(dish => (
                                    <label key={dish.id} className="flex items-center gap-2 cursor-pointer group hover:bg-white/5 rounded-lg px-1 py-0.5 transition-colors">
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
                                        className="rounded border-neutral-300 text-[#D4AF37] accent-[#D4AF37] focus:ring-[#D4AF37]"
                                      />
                                      <span className="text-sm dark:text-neutral-200 flex-1 truncate group-hover:text-white transition-colors">{dish.name}</span>
                                      {dish.category && (
                                        <span className="text-[9px] font-bold text-neutral-400 bg-neutral-200 dark:bg-white/5 px-1.5 py-0.5 rounded shrink-0">{dish.category}</span>
                                      )}
                                      <span className="text-xs font-bold text-[#D4AF37] ml-auto shrink-0">₹{Number(dish.price).toFixed(0)}</span>
                                    </label>
                                  ));
                                })()}
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

                  <PromoCard icon={Share2} title="Social Media Handles" badge="Organic Reach" badgeColor="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    desc="Link your restaurant's social media accounts to show them directly on your digital menu."
                    onClick={() => {
                      if (activePromo === 'socials') {
                        setActivePromo(null);
                      } else {
                        const existing = currentRestaurant?.macros?.socials || {};
                        setSocialsForm({
                          instagram: existing.instagram || '',
                          facebook: existing.facebook || '',
                          youtube: existing.youtube || '',
                          reddit: existing.reddit || ''
                        });
                        setActivePromo('socials');
                      }
                    }} />
                  <AnimatePresence>
                    {activePromo === 'socials' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-5 space-y-4">
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-bold text-neutral-500 flex items-center gap-1.5 mb-1.5">
                                <InstagramIcon size={14} className="text-pink-500" /> Instagram URL
                              </label>
                              <input type="text" placeholder="https://instagram.com/your_restaurant" value={socialsForm.instagram}
                                onChange={e => setSocialsForm(s => ({...s, instagram: e.target.value}))}
                                className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-neutral-500 flex items-center gap-1.5 mb-1.5">
                                <FacebookIcon size={14} className="text-blue-600" /> Facebook URL
                              </label>
                              <input type="text" placeholder="https://facebook.com/your_restaurant" value={socialsForm.facebook}
                                onChange={e => setSocialsForm(s => ({...s, facebook: e.target.value}))}
                                className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-neutral-500 flex items-center gap-1.5 mb-1.5">
                                <YoutubeIcon size={14} className="text-red-600" /> YouTube URL
                              </label>
                              <input type="text" placeholder="https://youtube.com/@your_restaurant" value={socialsForm.youtube}
                                onChange={e => setSocialsForm(s => ({...s, youtube: e.target.value}))}
                                className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-neutral-500 flex items-center gap-1.5 mb-1.5">
                                <RedditIcon size={14} className="text-orange-500" /> Reddit URL
                              </label>
                              <input type="text" placeholder="https://reddit.com/r/your_restaurant" value={socialsForm.reddit}
                                onChange={e => setSocialsForm(s => ({...s, reddit: e.target.value}))}
                                className="w-full bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm dark:text-white" />
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={async () => {
                                await updateRestaurant(activeRestId, { socials: socialsForm });
                                setActivePromo(null);
                              }}
                              className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity"
                            >
                              Save Social Handles
                            </button>
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
                      <KpiCard icon={DollarSign} label="Avg Lifetime Value"  value={`₹${avgLifetimeValue.toFixed(0)}`} sub="Avg. spend per customer" color="bg-emerald-500" />
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
                          <p className="font-black text-sm text-emerald-600">₹{Number(c.totalSpend).toFixed(0)}</p>
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
                        <span className="text-xs font-black text-emerald-600">₹{d.revenue.toFixed(0)}</span>
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

                <div className="bg-white dark:bg-[#12141D] border border-neutral-100 dark:border-white/6 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-[100px] pointer-events-none" />
                  <div className="flex-1 text-center sm:text-left relative z-10">
                    <h3 className="font-display font-black text-xl mb-1 text-neutral-900 dark:text-white">Delivery & Takeaway</h3>
                    <p className="text-sm text-neutral-500 mb-4">Print this QR for customers ordering from outside or for pick-up. No table assigned.</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <MapPin size={14} /> Requests Live Location from Diner
                    </div>
                  </div>
                  <div className="shrink-0 bg-white p-3 rounded-xl border border-neutral-200 dark:border-white/10 shadow-sm relative z-10">
                    <QRCodeSVG
                      value={`${window.location.origin}/menu?restId=${activeRestId}&table=delivery`}
                      size={110} level="H" includeMargin={false} fgColor="#111111"
                    />
                    <p className="text-[10px] text-neutral-500 font-bold mt-2 text-center uppercase tracking-widest">Scan to Order</p>
                  </div>
                </div>

                <button onClick={() => window.print()}
                  className="w-full py-4 rounded-2xl font-display font-black flex items-center justify-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-lg">
                  <Printer size={18} /> Print All {tableCount} QR Codes
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ OFFERS ════════════════════ */}
          {vendorTab === 'offers' && (
            <motion.div key="offers" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-6 bg-neutral-50 dark:bg-[#050505]"
            >
              <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-display font-black text-neutral-900 dark:text-white">Free Dish Offers</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">Surprise customers with a free dish when their order exceeds a set value. Multiple tiers supported — the highest qualifying offer is applied.</p>
                  </div>
                  <button
                    onClick={handleAddOffer}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}
                  >
                    <Plus size={14} /> Add Offer
                  </button>
                </div>

                {/* Empty state */}
                {offersList.length === 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center py-16 text-center">
                    <Percent size={36} className="text-neutral-300 dark:text-white/20 mb-3" />
                    <p className="font-bold text-neutral-500 dark:text-neutral-400 text-sm">No offers configured yet</p>
                    <p className="text-xs text-neutral-400 mt-1 mb-4">Click "Add Offer" above to create your first surprise gift offer</p>
                    <button
                      onClick={handleAddOffer}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                      style={{ background: goldGradient, color: '#000' }}
                    >
                      <Plus size={14} /> Create First Offer
                    </button>
                  </div>
                )}

                {/* Offer Cards */}
                <div className="space-y-3">
                  {offersList.map((offer, idx) => {
                    const isExpanded = expandedOfferId === offer.id;
                    const dishOptions = expandDishesWithVariants(vendDishes);
                    const selectedDishDisplay = (() => {
                      if (!offer.freeDishId) return null;
                      const [dId, vName] = offer.freeDishId.split('::');
                      const d = vendDishes.find(x => x.id === dId);
                      if (!d) return offer.freeDishId;
                      return vName ? `${d.name} (${vName})` : d.name;
                    })();

                    return (
                      <div
                        key={offer.id}
                        className="rounded-2xl overflow-hidden border bg-white dark:bg-[#0a0a0a]"
                        style={{ borderColor: offer.active ? 'rgba(212,175,55,0.35)' : 'rgba(212,212,212,0.4)' }}
                      >
                        {/* ── Collapsed summary row ── */}
                        <button
                          type="button"
                          onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
                          className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-white/5"
                        >
                          {/* Active dot */}
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${offer.active ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                              {offer.minOrderValue > 0 ? `Order ≥ ₹${offer.minOrderValue}` : 'New Offer'}
                              {selectedDishDisplay && <span className="text-neutral-400 font-normal"> → 🎁 {selectedDishDisplay} free</span>}
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {offer.active ? 'Active' : 'Inactive'} · Offer {idx + 1}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isExpanded && (
                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider px-2 py-1 rounded-lg bg-neutral-100 dark:bg-white/5">
                                Edit
                              </span>
                            )}
                            <ChevronRight size={16} className={`text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </button>

                        {/* ── Expanded edit form ── */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              key="offer-edit"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 space-y-4 border-t border-neutral-100 dark:border-white/5 pt-4">
                                
                                {/* Toggle Active */}
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 dark:text-white">Enable this offer</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">When enabled, qualifying customers will receive this free dish.</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOffer(offer.id, 'active', !offer.active)}
                                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${offer.active ? '' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                                    style={offer.active ? { background: goldGradient, boxShadow: '0 2px 8px rgba(212,175,55,0.3)' } : {}}
                                  >
                                    <span
                                      className="absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all duration-300"
                                      style={{ left: offer.active ? '26px' : '4px', background: offer.active ? '#000' : '#fff' }}
                                    />
                                  </button>
                                </div>

                                {/* Min Order Value */}
                                <div>
                                  <label className="text-xs font-bold text-neutral-400 block mb-1.5 uppercase tracking-widest">Minimum Order Value (₹) *</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={offer.minOrderValue}
                                    onChange={e => handleUpdateOffer(offer.id, 'minOrderValue', parseFloat(e.target.value) || 0)}
                                    className="w-full rounded-xl p-3 text-sm bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 dark:text-white focus:border-[#D4AF37] focus:outline-none transition-all"
                                    placeholder="e.g. 500"
                                  />
                                </div>

                                {/* Free Dish Dropdown */}
                                <div>
                                  <label className="text-xs font-bold text-neutral-400 block mb-1.5 uppercase tracking-widest">Free Surprise Dish *</label>
                                  <select
                                    value={offer.freeDishId}
                                    onChange={e => handleUpdateOffer(offer.id, 'freeDishId', e.target.value)}
                                    className="w-full rounded-xl p-3 text-sm bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 dark:text-white focus:border-[#D4AF37] focus:outline-none transition-all cursor-pointer"
                                  >
                                    <option value="">-- Choose a dish --</option>
                                    {dishOptions.map(d => (
                                      <option key={d.id + (d.variantName || '')} value={d.isVariant ? `${d.originalId}::${d.variantName}` : d.id}>
                                        {d.name} (₹{Number(d.price).toFixed(0)})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                 {/* Offer Banner Image */}
                                 <div>
                                   <label className="text-xs font-bold text-neutral-400 block mb-1.5 uppercase tracking-widest">
                                     Offer Banner Image <span className="font-normal normal-case tracking-normal">(optional — shown on menu page)</span>
                                   </label>
                                   {offer.offerImage ? (
                                     <div className="relative group h-28 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#1A1A1A]">
                                       <img src={offer.offerImage} className="w-full h-full object-cover" alt="Offer banner" />
                                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                         <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5">
                                           <Upload size={13} /> Change
                                           <input type="file" accept="image/*" className="hidden" onChange={e => {
                                             const file = e.target.files[0];
                                             if (file) { const r = new FileReader(); r.onload = ev => handleUpdateOffer(offer.id, 'offerImage', ev.target.result); r.readAsDataURL(file); }
                                           }} />
                                         </label>
                                         <button type="button" onClick={() => handleUpdateOffer(offer.id, 'offerImage', '')} className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs">Remove</button>
                                       </div>
                                     </div>
                                   ) : (
                                     <label className="cursor-pointer h-24 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-neutral-400 hover:border-neutral-400 transition-colors">
                                       <Upload size={20} className="mb-1.5 opacity-50" />
                                       <span className="text-xs font-bold">Upload Offer Banner</span>
                                       <input type="file" accept="image/*" className="hidden" onChange={e => {
                                         const file = e.target.files[0];
                                         if (file) { const r = new FileReader(); r.onload = ev => handleUpdateOffer(offer.id, 'offerImage', ev.target.result); r.readAsDataURL(file); }
                                       }} />
                                     </label>
                                   )}
                                 </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveOffer(offer.id)}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-black transition-all"
                                    style={{ background: goldGradient }}
                                  >
                                    Save Offer
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOffer(offer.id)}
                                    className="px-4 py-3 rounded-xl font-bold text-sm text-red-500 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Info box */}
                {offersList.length > 1 && (
                  <div className="mt-4 p-4 rounded-2xl text-xs font-medium text-amber-700 dark:text-amber-400" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    💡 When a customer qualifies for multiple offers, the one with the <strong>highest minimum order value</strong> is applied automatically.
                  </div>
                )}
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

                    {/* Restaurant Logo */}
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest flex items-center gap-2">
                        <Store size={12} /> Restaurant Logo
                      </label>
                      <div className="flex items-center gap-4">
                        {/* Logo preview */}
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 overflow-hidden"
                          style={{ borderColor: 'rgba(212,175,55,0.3)', background: settingsForm.logo ? 'transparent' : 'rgba(212,175,55,0.06)' }}
                        >
                          {settingsForm.logo ? (
                            <img src={settingsForm.logo} alt="logo preview" className="w-full h-full object-cover" />
                          ) : (
                            <Store size={22} style={{ color: GOLD, opacity: 0.5 }} />
                          )}
                        </div>

                        {/* Upload / Remove controls */}
                        <div className="flex flex-col gap-2 flex-1">
                          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: GOLD }}
                          >
                            <Upload size={14} />
                            {settingsForm.logo ? 'Replace Logo' : 'Upload Logo'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (evt) => setSettingsForm(f => ({ ...f, logo: evt.target.result }));
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          {settingsForm.logo && (
                            <button
                              type="button"
                              onClick={() => setSettingsForm(f => ({ ...f, logo: '' }))}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <CloseIcon size={13} /> Remove Logo
                            </button>
                          )}
                          <p className="text-[10px] text-neutral-400">Shown in the dashboard header. Square images work best.</p>
                        </div>
                      </div>
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
                    <div className="col-span-full">
                      <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={12} /> Restaurant Phone Number
                      </label>

                      {/* Hidden recaptcha anchor */}
                      <div id="vendor-recaptcha-container" className="hidden" />

                      {/* Already verified — show number with edit option */}
                      {settingsForm.phoneVerified && !vendorOtpSent && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-300 dark:border-emerald-700/40">
                          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex-1">{settingsForm.phone}</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">VERIFIED</span>
                          <button
                            type="button"
                            onClick={() => {
                              setVendorPendingPhone(settingsForm.phone.replace(/^\+91/, ''));
                              setSettingsForm(f => ({ ...f, phoneVerified: false }));
                            }}
                            className="text-[11px] font-bold text-neutral-500 hover:text-[#D4AF37] transition-colors underline underline-offset-2 ml-1"
                          >
                            Change
                          </button>
                        </div>
                      )}

                      {/* Input + Send OTP (shown when not verified or editing) */}
                      {!settingsForm.phoneVerified && !vendorOtpSent && (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">+91</span>
                            <input
                              type="tel"
                              value={vendorPendingPhone}
                              onChange={e => setVendorPendingPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="9876543210"
                              className="w-full pl-10 pr-3 py-3 rounded-xl bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10 text-sm dark:text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={sendVendorOtp}
                            disabled={isSendingVendorOtp || vendorPendingPhone.length < 10}
                            className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-black hover:bg-amber-400 transition-colors disabled:opacity-50 shrink-0"
                          >
                            {isSendingVendorOtp ? 'Sending…' : 'Send OTP'}
                          </button>
                        </div>
                      )}

                      {/* OTP entry screen */}
                      {vendorOtpSent && (
                        <div className="space-y-3 p-4 rounded-xl bg-neutral-50 dark:bg-[#0d0d10] border border-neutral-200 dark:border-white/10">
                          <p className="text-xs text-neutral-500">Enter the 6-digit OTP sent to <span className="font-black text-neutral-700 dark:text-neutral-300">+91 {vendorPendingPhone}</span></p>
                          <div className="flex gap-2">
                            <input
                              autoFocus
                              inputMode="numeric"
                              pattern="[0-9]*"
                              type="tel"
                              maxLength={6}
                              value={vendorOtpCode}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setVendorOtpCode(val);
                              }}
                              placeholder="_ _ _ _ _ _"
                              className="flex-1 text-center tracking-[0.4em] font-display font-black text-xl bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10 rounded-xl py-3 px-2 focus:outline-none focus:border-[#D4AF37] dark:text-white transition-colors"
                            />
                            <button
                              type="button"
                              onClick={verifyVendorOtp}
                              disabled={isVerifyingVendorOtp || vendorOtpCode.length < 6}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                            >
                              <CheckCircle size={14} />
                              {isVerifyingVendorOtp ? 'Verifying…' : 'Verify'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <button type="button" onClick={() => { setVendorOtpSent(false); setVendorOtpCode(''); }} className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                              ← Change number
                            </button>
                            <button type="button" onClick={sendVendorOtp} disabled={isSendingVendorOtp} className="text-[11px] font-bold text-[#D4AF37] hover:text-amber-400 transition-colors underline underline-offset-2 disabled:opacity-50">
                              {isSendingVendorOtp ? 'Sending…' : 'Resend OTP'}
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1">
                        <Phone size={9} className="shrink-0" />
                        Verified number will be displayed to customers on your menu page.
                      </p>
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
                    <div className="col-span-2 mt-4 pt-4 border-t border-neutral-200 dark:border-[rgba(212,175,55,0.15)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-neutral-900 dark:text-white">Customer Verification Code</p>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                              <Store size={9} /> Dine-In Only
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1 max-w-[280px]">
                            When enabled, dine-in customers must show a 4-digit code to confirm pickup. Disable to accept/reject dine-in orders directly without a code.
                          </p>
                        </div>
                        <button 
                          type="button" 
                          onClick={async () => {
                            const isCurrentlyRequired = String(settingsForm.requireVerificationCode) !== 'false';
                            const newValue = !isCurrentlyRequired;
                            setSettingsForm({...settingsForm, requireVerificationCode: newValue});
                            await updateRestaurant(activeRestId, { requireVerificationCode: newValue });
                          }}
                          className={`w-12 h-6 rounded-full transition-all relative shrink-0 mt-0.5 ${String(settingsForm.requireVerificationCode) !== 'false' ? '' : 'bg-neutral-300 dark:bg-neutral-800'}`}
                          style={String(settingsForm.requireVerificationCode) !== 'false' ? { background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', boxShadow: '0 2px 8px rgba(212,175,55,0.3)' } : {}}
                        >
                          <span 
                            className="absolute top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-sm"
                            style={{ 
                              left: String(settingsForm.requireVerificationCode) !== 'false' ? '26px' : '4px',
                              background: String(settingsForm.requireVerificationCode) !== 'false' ? '#000' : '#fff'
                            }}
                          />
                        </button>
                      </div>
                      {/* Always-on delivery note */}
                      <div className="mt-3 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-xl px-3 py-2.5">
                        <Phone size={13} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                          <span className="font-black">Delivery orders always require SMS verification</span> — regardless of this toggle. Customers must verify their phone via OTP before a delivery order is placed.
                        </p>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* ── Delivery & Fees ── */}
                  <div className="rounded-2xl p-5 space-y-5 mt-4 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[rgba(212,175,55,0.15)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
                        <Package size={13}/> Delivery &amp; Fees
                      </h3>
                      {!isEditingDelivery && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border border-neutral-200 dark:border-neutral-800">
                          Read Only
                        </span>
                      )}
                    </div>

                    {/* Convenience Fee */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Convenience Fee (₹)</label>
                        <input
                          type="number" min="0" step="0.5"
                          disabled={!isEditingDelivery}
                          value={settingsForm.deliveryConfig?.convenienceFee ?? 0}
                          onChange={e => setSettingsForm(f => ({ ...f, deliveryConfig: { ...f.deliveryConfig, convenienceFee: parseFloat(e.target.value) || 0 } }))}
                          className={`w-full rounded-xl p-3 text-sm transition-all duration-200 ${
                            !isEditingDelivery
                              ? 'bg-neutral-100 dark:bg-neutral-900/40 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-800'
                              : 'bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10'
                          }`}
                          placeholder="e.g. 15"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-widest">Delivery Fee (₹)</label>
                        <input
                          type="number" min="0" step="0.5"
                          disabled={!isEditingDelivery}
                          value={settingsForm.deliveryConfig?.deliveryFee ?? 0}
                          onChange={e => setSettingsForm(f => ({ ...f, deliveryConfig: { ...f.deliveryConfig, deliveryFee: parseFloat(e.target.value) || 0 } }))}
                          className={`w-full rounded-xl p-3 text-sm transition-all duration-200 ${
                            !isEditingDelivery
                              ? 'bg-neutral-100 dark:bg-neutral-900/40 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-800'
                              : 'bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10'
                          }`}
                          placeholder="e.g. 40"
                        />
                      </div>
                    </div>

                    {/* Other Fees */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Other Fees</label>
                        {isEditingDelivery && (
                          <button
                            type="button"
                            onClick={() => setSettingsForm(f => ({ ...f, deliveryConfig: { ...f.deliveryConfig, otherFees: [...(f.deliveryConfig.otherFees || []), { label: '', amount: 0 }] } }))}
                            className="text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1"
                            style={{ background: 'rgba(212,175,55,0.12)', color: GOLD, border: '1px solid rgba(212,175,55,0.3)' }}
                          >
                            <Plus size={11}/> Add Fee
                          </button>
                        )}
                      </div>
                      {(settingsForm.deliveryConfig?.otherFees || []).length === 0 ? (
                        <p className="text-xs text-neutral-500 py-2">No other fees added (e.g. Packaging ₹5, Platform ₹2).</p>
                      ) : (
                        <div className="space-y-2">
                          {(settingsForm.deliveryConfig.otherFees).map((fee, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="text"
                                disabled={!isEditingDelivery}
                                value={fee.label}
                                onChange={e => setSettingsForm(f => { const ff = [...f.deliveryConfig.otherFees]; ff[i] = { ...ff[i], label: e.target.value }; return { ...f, deliveryConfig: { ...f.deliveryConfig, otherFees: ff } }; })}
                                className={`flex-1 rounded-xl p-2.5 text-xs transition-all duration-200 ${
                                  !isEditingDelivery
                                    ? 'bg-neutral-100 dark:bg-neutral-900/40 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-800'
                                    : 'bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10'
                                }`}
                                placeholder="Fee label (e.g. Packaging)"
                              />
                              <input
                                type="number" min="0" step="0.5"
                                disabled={!isEditingDelivery}
                                value={fee.amount}
                                onChange={e => setSettingsForm(f => { const ff = [...f.deliveryConfig.otherFees]; ff[i] = { ...ff[i], amount: parseFloat(e.target.value) || 0 }; return { ...f, deliveryConfig: { ...f.deliveryConfig, otherFees: ff } }; })}
                                className={`w-24 rounded-xl p-2.5 text-xs text-center transition-all duration-200 ${
                                  !isEditingDelivery
                                    ? 'bg-neutral-100 dark:bg-neutral-900/40 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-800'
                                    : 'bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10'
                                }`}
                                placeholder="₹ Amount"
                              />
                              {isEditingDelivery && (
                                <button
                                  type="button"
                                  onClick={() => setSettingsForm(f => { const ff = f.deliveryConfig.otherFees.filter((_, j) => j !== i); return { ...f, deliveryConfig: { ...f.deliveryConfig, otherFees: ff } }; })}
                                  className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:opacity-80 shrink-0"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dedicated Save/Edit buttons for Delivery & Fees section */}
                    <div className="flex justify-end gap-3 pt-2">
                      {isEditingDelivery ? (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelDeliveryEdit}
                            className="px-5 py-2.5 rounded-xl font-display font-black text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-300 transition-all border border-neutral-300 dark:border-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl font-display font-black text-xs text-black flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all"
                            style={{ background: goldGradient }}
                          >
                            <Save size={13} /> Save Delivery Settings
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditingDelivery(true)}
                          className="px-5 py-2.5 rounded-xl font-display font-black text-xs text-black flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all"
                          style={{ background: goldGradient }}
                        >
                          <Edit2 size={13} /> Edit Delivery Settings
                        </button>
                      )}
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
                        { plan: 'Pro',         desc: 'AR + Analytics + CRM',         price: '₹49/mo' },
                        { plan: 'Enterprise',  desc: 'AI Waiter + 3D + White Label', price: '₹99/mo' },
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
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
              <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
                className="w-full max-w-2xl bg-white dark:bg-[#0E1018] rounded-3xl border border-neutral-200 dark:border-white/8 shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: '92vh' }}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/8 flex justify-between items-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0E1018 0%, #1a1520 100%)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#D4AF37,#AA8C2C)' }}>
                      <Sparkles size={18} className="text-black" />
                    </div>
                    <div>
                      <h2 className="font-display font-black text-lg text-white">AI Menu Import</h2>
                      <p className="text-[11px] text-neutral-400 font-medium">
                        {aiImportState === 'chooser' && 'Upload your paper menu — AI does the rest'}
                        {aiImportState === 'analyzing' && 'Scanning & detecting dishes...'}
                        {aiImportState === 'enriching' && 'Saving dishes to your digital menu...'}
                        {aiImportState === 'reviewing' && `${extractedDishes.length} dishes detected — review & import`}
                      </p>
                    </div>
                  </div>
                  {(aiImportState === 'chooser' || aiImportState === 'reviewing') && (
                    <button onClick={() => { setAiImportState('idle'); setImportMenuPreview(null); setExtractedDishes([]); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors">
                      <CloseIcon size={16} />
                    </button>
                  )}
                </div>

                {/* ── CHOOSER STATE ── */}
                {aiImportState === 'chooser' && (
                  <div className="flex flex-col p-6 gap-5 overflow-y-auto">
                    <div className="text-center mb-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
                        <BrainCircuit size={14} className="text-[#D4AF37]" />
                        <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider">Powered by Gemini AI</span>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                        Take a photo or upload an image of your paper menu. Our AI will automatically detect all categories, dishes, prices, ingredients, nutritional info and more.
                      </p>
                    </div>

                    {/* Upload Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-white/10 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all duration-200 cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-sm text-neutral-900 dark:text-white">Live Camera</p>
                          <p className="text-xs text-neutral-400 mt-0.5">Take photo now</p>
                        </div>
                      </button>

                      <button
                        onClick={() => galleryInputRef.current?.click()}
                        className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-white/10 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all duration-200 cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-sm text-neutral-900 dark:text-white">Upload Photo</p>
                          <p className="text-xs text-neutral-400 mt-0.5">From gallery / files</p>
                        </div>
                      </button>
                    </div>

                    {/* Tips */}
                    <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-2xl p-4">
                      <p className="text-xs font-black text-[#D4AF37] mb-2 flex items-center gap-1.5"><Sparkles size={12} /> Tips for best results</p>
                      <ul className="space-y-1">
                        {['Ensure the full menu is visible and well-lit', 'Flatten the menu to avoid wrinkles/shadows', 'Take close-up shots for multi-page menus', 'Any language works — AI translates automatically'].map(tip => (
                          <li key={tip} className="text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-2">
                            <CheckCircle size={11} className="text-[#D4AF37] mt-0.5 shrink-0" /> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* ── ANALYZING STATE ── */}
                {aiImportState === 'analyzing' && (
                  <div className="flex flex-col items-center justify-center py-16 px-8 gap-6">
                    {importMenuPreview && (
                      <div className="w-40 h-28 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/30 shadow-xl mb-2">
                        <img src={importMenuPreview} alt="Menu" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-[#D4AF37]/15 rounded-full" />
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 border-4 border-t-[#D4AF37] border-r-[#D4AF37]/40 rounded-full" />
                      <BrainCircuit size={32} className="absolute inset-0 m-auto text-[#D4AF37]" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-black text-xl text-white mb-1">Reading Your Menu...</h3>
                      <p className="text-sm text-neutral-400 max-w-[260px]">AI is identifying dishes, prices, categories and writing descriptions</p>
                    </div>
                    <div className="w-full max-w-sm">
                      <div className="flex justify-between text-xs text-neutral-500 mb-2">
                        <span>Analysing image</span>
                        <span className="font-black text-[#D4AF37]">{Math.round(importProgress)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${importProgress}%` }}
                          transition={{ ease: 'easeOut' }} className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg,#D4AF37,#AA8C2C)' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ENRICHING / SAVING STATE ── */}
                {aiImportState === 'enriching' && (
                  <div className="flex flex-col items-center justify-center py-16 px-8 gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-emerald-500/15 rounded-full" />
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 border-4 border-t-emerald-500 border-r-emerald-500/30 rounded-full" />
                      <CheckCircle size={32} className="absolute inset-0 m-auto text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-black text-xl text-white mb-1">Saving to Menu...</h3>
                      <p className="text-sm text-neutral-400">
                        {importEnrichProgress.current} of {importEnrichProgress.total} dishes saved
                      </p>
                    </div>
                    <div className="w-full max-w-sm">
                      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${importEnrichProgress.total > 0 ? (importEnrichProgress.current / importEnrichProgress.total) * 100 : 0}%` }}
                          className="h-full rounded-full bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── REVIEWING STATE ── */}
                {aiImportState === 'reviewing' && (
                  <>
                    {/* Review toolbar */}
                    <div className="px-6 py-3 border-b border-neutral-100 dark:border-white/8 flex items-center justify-between shrink-0 bg-neutral-50 dark:bg-[#0a0c12]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                          <CheckCircle size={12} /> {extractedDishes.length} Dishes Detected
                        </span>
                        {importMenuPreview && (
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10">
                            <img src={importMenuPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setImportSelectedDishes(new Set(extractedDishes.map(d => d.id)))}
                          className="text-xs font-bold text-[#D4AF37] hover:underline">Select All</button>
                        <span className="text-neutral-600">·</span>
                        <button onClick={() => setImportSelectedDishes(new Set())}
                          className="text-xs font-bold text-neutral-500 hover:underline">None</button>
                        <span className="ml-2 text-xs font-black text-neutral-400">{importSelectedDishes.size} selected</span>
                      </div>
                    </div>

                    {/* Dish Cards — Scrollable */}
                    <div className="overflow-y-auto flex-1 p-4 space-y-3">
                      {extractedDishes.map((dish, i) => {
                        const selected = importSelectedDishes.has(dish.id);
                        return (
                          <motion.div key={dish.id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                              selected
                                ? 'border-[#D4AF37]/60 bg-[#D4AF37]/4 dark:bg-[#D4AF37]/5'
                                : 'border-neutral-200 dark:border-white/6 bg-white dark:bg-[#12141D] opacity-50'
                            }`}>

                            {/* Card Header — toggle + name */}
                            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                              <button
                                onClick={() => setImportSelectedDishes(prev => {
                                  const next = new Set(prev);
                                  next.has(dish.id) ? next.delete(dish.id) : next.add(dish.id);
                                  return next;
                                })}
                                className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                  selected ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-neutral-300 dark:border-white/20'
                                }`}>
                                {selected && <CheckCircle size={12} className="text-black" />}
                              </button>
                              <input
                                value={dish.name}
                                onChange={e => { const n = [...extractedDishes]; n[i].name = e.target.value; setExtractedDishes(n); }}
                                className="flex-1 bg-transparent text-base font-black text-neutral-900 dark:text-white border-none focus:ring-0 p-0 placeholder:text-neutral-400"
                                placeholder="Dish name"
                              />
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                dish.dietaryPreference === 'Vegetarian' || dish.dietaryPreference === 'Vegan'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                  : dish.dietaryPreference === 'Eggitarian'
                                    ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                                    : dish.dietaryPreference === 'Non-Vegetarian'
                                      ? 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                                      : 'bg-neutral-100 dark:bg-neutral-900/20 text-neutral-500'
                              }`}>{dish.dietaryPreference || 'N/A'}</span>
                            </div>

                            {/* Price + Category row */}
                            <div className="flex gap-2 px-4 pb-3">
                              <div className="relative w-28 shrink-0">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37] font-black text-xs">₹</span>
                                <input
                                  value={dish.price}
                                  onChange={e => { const n = [...extractedDishes]; n[i].price = e.target.value; setExtractedDishes(n); }}
                                  className="w-full bg-neutral-50 dark:bg-black/40 pl-7 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-white/8 text-sm font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                                  placeholder="Price"
                                />
                              </div>
                              {dish.halfPrice && (
                                <div className="relative w-28 shrink-0">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-black text-xs">½₹</span>
                                  <input
                                    value={dish.halfPrice}
                                    onChange={e => { const n = [...extractedDishes]; n[i].halfPrice = e.target.value; setExtractedDishes(n); }}
                                    className="w-full bg-neutral-50 dark:bg-black/40 pl-8 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-white/8 text-sm font-bold text-neutral-600 dark:text-neutral-400 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                                    placeholder="Half"
                                  />
                                </div>
                              )}
                              <input
                                value={dish.category}
                                onChange={e => { const n = [...extractedDishes]; n[i].category = e.target.value; setExtractedDishes(n); }}
                                className="flex-1 bg-neutral-50 dark:bg-black/40 px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/8 text-xs font-bold text-neutral-600 dark:text-neutral-300 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                                placeholder="Category"
                              />
                            </div>

                            {/* Description */}
                            <div className="px-4 pb-3">
                              <textarea
                                value={dish.description}
                                onChange={e => { const n = [...extractedDishes]; n[i].description = e.target.value; setExtractedDishes(n); }}
                                rows={2}
                                className="w-full bg-neutral-50 dark:bg-black/40 px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/8 text-xs text-neutral-600 dark:text-neutral-400 resize-none focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                                placeholder="Description..."
                              />
                            </div>

                            {/* AI-enriched details pills */}
                            <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                              {dish.macros?.calories && (
                                <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/15 text-orange-600 dark:text-orange-400 text-[10px] font-black">
                                  🔥 {dish.macros.calories} kcal
                                </span>
                              )}
                              {dish.macros?.protein && (
                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                                  💪 {dish.macros.protein}g protein
                                </span>
                              )}
                              {dish.spiceLevel && dish.spiceLevel !== 'Mild' && (
                                <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 text-[10px] font-black">
                                  🌶 {dish.spiceLevel}
                                </span>
                              )}
                              {dish.prepTime && (
                                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-500 text-[10px] font-bold">
                                  ⏱ {dish.prepTime}
                                </span>
                              )}
                              {dish.allergens?.slice(0, 3).map(a => (
                                <span key={a} className="px-2.5 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-900/15 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold">
                                  ⚠ {a}
                                </span>
                              ))}
                              {dish.ingredients?.slice(0, 3).map(ing => (
                                <span key={ing} className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-500 text-[10px]">
                                  {ing}
                                </span>
                              ))}
                              {dish.aiEnriched && (
                                <span className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-black flex items-center gap-1">
                                  <Sparkles size={9} /> AI Enriched
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-neutral-100 dark:border-white/8 bg-neutral-50 dark:bg-[#0a0c12] shrink-0 flex gap-3">
                      <button
                        onClick={() => { setAiImportState('chooser'); setImportMenuPreview(null); setExtractedDishes([]); }}
                        className="px-5 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                        ← Re-scan
                      </button>
                      <button
                        onClick={handleImportSaveAll}
                        disabled={importSelectedDishes.size === 0}
                        className="flex-1 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(212,175,55,0.3)] text-black"
                        style={{ background: goldGradient }}>
                        <CheckCircle size={18} /> Import {importSelectedDishes.size} Dish{importSelectedDishes.size !== 1 ? 'es' : ''} to Menu
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date Orders Detail Modal */}
        <AnimatePresence>
          {selectedDateOrders && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-[#12141D] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-neutral-200 dark:border-white/10 relative">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center bg-neutral-50 dark:bg-black shrink-0 relative z-10">
                  <div>
                    <h2 className="font-display font-black text-xl text-neutral-900 dark:text-white">Orders Breakdown</h2>
                    <p className="text-xs text-neutral-500 mt-1">{selectedDateOrders.dateLabel} • {selectedDateOrders.orders.length} order{selectedDateOrders.orders.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => setSelectedDateOrders(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200/50 dark:bg-white/10 text-neutral-600 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors">
                    <CloseIcon size={18} />
                  </button>
                </div>

                {/* Modal Body / Orders List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {selectedDateOrders.orders.length === 0 ? (
                    <div className="text-center py-10 text-neutral-400">
                      <p className="text-sm font-semibold">No orders recorded on this date.</p>
                    </div>
                  ) : (
                    selectedDateOrders.orders.map((o) => {
                      const cName = o.contactName || o.contact_name || 'Guest Diner';
                      const cPhone = o.contactPhone || o.contact_phone;
                      const orderTime = o.timestamp ? new Date(o.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown Time';
                      
                      // Filter out metadata and location items
                      const foodItems = (o.items || []).filter(item => 
                        item.type !== 'metadata' && 
                        item.type !== 'location_meta' && 
                        item.id !== '__contact_info' && 
                        item.id !== '__location' && 
                        item.id !== '__special_instructions'
                      );

                      // Badges for Status and Order Type
                      const statusColor = 
                        o.status === 'Completed' || o.status === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        o.status === 'Cancelled' || o.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        o.status === 'Preparing' || o.status === 'Ready' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';

                      const typeColor = 
                        o.orderType === 'dine_in' || o.order_type === 'dine_in' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30' :
                        o.orderType === 'delivery' || o.order_type === 'delivery' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' :
                        'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/30';

                      const orderTypeLabel = 
                        o.orderType === 'dine_in' || o.order_type === 'dine_in' ? `Dine-In ${o.table_number || o.tableNumber ? `(Table ${o.table_number || o.tableNumber})` : ''}` :
                        o.orderType === 'delivery' || o.order_type === 'delivery' ? 'Delivery' :
                        'Pre-Order';

                      return (
                        <div key={o.id} className="p-4 bg-neutral-50 dark:bg-[#181a24] border border-neutral-100 dark:border-white/5 rounded-2xl flex flex-col md:flex-row md:items-start gap-4">
                          
                          {/* Left Column: Customer details, Time, Type, Status */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-black text-sm text-neutral-800 dark:text-neutral-200">{getOrderNumber(o)}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${typeColor}`}>
                                {orderTypeLabel}
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor}`}>
                                {o.status}
                              </span>
                            </div>

                            <div>
                              <p className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                                <UserCircle size={14} className="text-neutral-400 shrink-0" />
                                {cName}
                              </p>
                              {cPhone && (
                                <p className="text-xs text-neutral-500 font-mono flex items-center gap-1.5 mt-0.5">
                                  <Phone size={11} className="text-neutral-400 shrink-0" />
                                  {cPhone}
                                </p>
                              )}
                              <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                                <Clock size={11} className="text-neutral-400 shrink-0" />
                                Ordered at {orderTime}
                              </p>
                              {getOrderNote(o) && (
                                <div className="mt-2 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                                  <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1"><AlertTriangle size={9}/> Order Note</p>
                                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">{getOrderNote(o)}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Middle Column: Dishes Ordered */}
                          <div className="md:w-72 shrink-0 bg-white dark:bg-black/20 border border-neutral-200/50 dark:border-white/5 p-3 rounded-xl">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-2">Dishes ({foodItems.length})</p>
                            <ul className="space-y-1.5">
                                                            {foodItems.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-xs">
                                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 flex-wrap">
                                    <span><span className="text-neutral-400 font-bold mr-1.5">{item.quantity || 1}x</span>{item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}</span>
                                    {(item.isFree || item.type === 'free_dish') && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 ml-1">
                                        <Gift size={9} /> free
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-bold text-neutral-500">₹{parseFloat(item.price || 0).toFixed(0)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Right Column: Order Value */}
                          <div className="shrink-0 text-left md:text-right flex md:flex-col justify-between md:justify-start items-center md:items-end gap-1">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Value</span>
                            <span className="font-black text-[#D4AF37] text-lg">₹{(o.total || 0).toFixed(0)}</span>
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

        {/* ══ Order Details Popup ══ */}
        <AnimatePresence>
          {deliveryDetailOrder && (() => {
            const od = deliveryDetailOrder;
            const _locFromItems = od.items?.find(i => i.type === 'location_meta');
            const _parseGPS = (str) => { if (!str) return null; const m = String(str).match(/[\[\s]GPS:([\d.\-]+),([\d.\-]+)/); return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null; };
            const _rawAddr = od.metadata?.address || _locFromItems?.address || '';
            const _loc = od.metadata?.location || _locFromItems || _parseGPS(_rawAddr) || {};
            const displayAddr = _rawAddr.replace(/\s*\[GPS:[\d.,\-]+\]/, '').trim();
            const detailMapUrl = _loc.lat && _loc.lng ? `https://www.google.com/maps/dir/?api=1&destination=${_loc.lat},${_loc.lng}` : null;
            const orderNote = getOrderNote(od);
            const foodItems = (od.items || []).filter(i => i.type !== 'location_meta' && i.type !== 'metadata' && i.id !== '__contact_info' && i.id !== '__location' && i.id !== '__special_instructions');
            
            const isDeliveryOrder = od.order_type === 'delivery' || od.orderType === 'delivery';
            const deliveryConfig = currentRestaurant?.macros?.deliveryConfig || {};
            const deliveryFee = isDeliveryOrder
              ? (od.metadata?.deliveryFee !== undefined ? Number(od.metadata.deliveryFee) : (Number(deliveryConfig.deliveryFee) || 0))
              : 0;
            const convenienceFee = isDeliveryOrder
              ? (od.metadata?.convenienceFee !== undefined ? Number(od.metadata.convenienceFee) : (Number(deliveryConfig.convenienceFee) || 0))
              : 0;
            const otherFees = isDeliveryOrder
              ? (od.metadata?.otherFees || deliveryConfig.otherFees || [])
              : [];
            const taxRate = currentRestaurant?.taxRate !== undefined ? currentRestaurant.taxRate / 100 : 0.08;
            const subtotal = foodItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
            const taxAmount = subtotal * taxRate;
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeliveryDetailOrder(null)}>
                <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}
                  className="bg-white dark:bg-[#12141D] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center shrink-0">
                    <div>
                      <h2 className="font-display font-black text-lg text-neutral-900 dark:text-white">Order Details</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">{od.contactName || 'Guest'} · ₹{parseFloat(od.total).toFixed(0)}</p>
                    </div>
                    <button onClick={() => setDeliveryDetailOrder(null)} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 transition-colors"><CloseIcon size={16} /></button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-5 space-y-4">
                    {/* Customer */}
                    <div className="bg-neutral-50 dark:bg-white/5 rounded-2xl p-4 space-y-2">
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-2">Customer Info</p>
                      <p className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-2"><UserCircle size={14} className="text-neutral-400" /> {od.contactName || 'Guest'}</p>
                      {od.contactPhone && <p className="text-sm font-bold text-neutral-500 flex items-center gap-2"><Phone size={14} className="text-neutral-400" /> {od.contactPhone}</p>}
                      <p className="text-xs text-neutral-400 flex items-center gap-2"><Clock size={12} className="text-neutral-400" /> {new Date(od.timestamp).toLocaleString()}</p>
                    </div>
                    {/* Cancellation Reason if cancelled */}
                    {od.status === 'Cancelled' && (
                      <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 border border-red-100 dark:border-red-900/30">
                        <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <AlertTriangle size={10} /> Cancellation Reason
                        </p>
                        <p className="text-sm font-bold text-red-800 dark:text-red-300">
                          {od.metadata?.cancelReason || od.items?.find(i => i.id === '__cancel_reason')?.reason || 'No cancellation reason specified.'}
                        </p>
                      </div>
                    )}
                    {/* Location */}
                    {(displayAddr || detailMapUrl) && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-2">Delivery Location</p>
                        {displayAddr && <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200 mb-2">{displayAddr}</p>}
                        {detailMapUrl && (
                          <a href={detailMapUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-colors">
                            <MapPin size={12} /> Navigate in Google Maps
                          </a>
                        )}
                      </div>
                    )}
                    {/* Note */}
                    {orderNote && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle size={10} /> Order Note</p>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{orderNote}</p>
                      </div>
                    )}
                    {/* Items */}
                    <div className="bg-neutral-50 dark:bg-white/5 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-3">Items Ordered ({foodItems.length})</p>
                      <ul className="space-y-2">
                        {foodItems.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm">
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex flex-col">
                              <span className="flex items-center gap-1.5 flex-wrap">
                                <span><span className="text-neutral-400 font-bold mr-1">{item.quantity || 1}x</span>{item.name}</span>
                                {(item.isFree || item.type === 'free_dish') && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 ml-1">
                                    <Gift size={9} /> free
                                  </span>
                                )}
                              </span>
                              {(item.selectedVariant?.name || item.variantName) && (
                                <span className="text-xs font-bold text-[#D4AF37] ml-6">{item.selectedVariant?.name || item.variantName}</span>
                              )}
                              {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 ml-6">
                                  + {item.selectedCustomizations.map(c => c.name).join(', ')}
                                </span>
                              )}
                            </span>
                            <span className="font-bold text-neutral-500">₹{parseFloat(item.price || 0).toFixed(0)}</span>
                          </li>
                        ))}
                      </ul>
                      {/* Subtotal & Additional Charges breakdown */}
                      {(isDeliveryOrder || taxAmount > 0) && (
                        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/10 space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(0)}</span>
                          </div>
                          {taxAmount > 0 && (
                            <div className="flex justify-between">
                              <span>Tax ({Math.round(taxRate * 100)}%)</span>
                              <span>₹{taxAmount.toFixed(0)}</span>
                            </div>
                          )}
                          {isDeliveryOrder && deliveryFee > 0 && (
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span>₹{deliveryFee.toFixed(0)}</span>
                            </div>
                          )}
                          {isDeliveryOrder && convenienceFee > 0 && (
                            <div className="flex justify-between">
                              <span>Convenience Fee</span>
                              <span>₹{convenienceFee.toFixed(0)}</span>
                            </div>
                          )}
                          {isDeliveryOrder && otherFees.map((fee, fIdx) => (
                            <div key={fIdx} className="flex justify-between">
                              <span>{fee.name || 'Other Fee'}</span>
                              <span>₹{Number(fee.amount || 0).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/10 flex justify-between">
                        <span className="text-sm font-black text-neutral-800 dark:text-white">Total</span>
                        <span className="text-sm font-black text-[#D4AF37]">₹{parseFloat(od.total).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* ══ Reject Reason Popup ══ */}
        <AnimatePresence>
          {rejectReasonOrder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 20 }}
                className="bg-white dark:bg-[#12141D] w-full max-w-sm rounded-3xl shadow-2xl border border-neutral-200 dark:border-white/10 overflow-hidden">
                <div className="p-5 border-b border-neutral-200 dark:border-white/10">
                  <h2 className="font-display font-black text-lg text-neutral-900 dark:text-white">Reject Order?</h2>
                  <p className="text-xs text-neutral-500 mt-1">Tell the customer why you're rejecting their order. This message will be shown to them.</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-black text-neutral-500 uppercase tracking-wider">Reason (optional)</p>
                    <textarea
                      value={rejectReasonText}
                      onChange={e => setRejectReasonText(e.target.value)}
                      placeholder="e.g. We are too busy right now, item out of stock..."
                      rows={3}
                      className="w-full bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-2xl p-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-red-400 resize-none transition-all"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {['Item not available', 'Too busy right now', 'Closing soon', 'Address out of range'].map(reason => (
                        <button key={reason} onClick={() => setRejectReasonText(reason)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setRejectReasonOrder(null); setRejectReasonText(''); }}
                      className="flex-1 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-sm font-black text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                    <button onClick={() => {
                      updateOrderStatus(rejectReasonOrder.id, 'Cancelled', rejectReasonText.trim() || undefined);
                      setRejectReasonOrder(null);
                      setRejectReasonText('');
                    }}
                      className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
                      ✕ Reject Order
                    </button>
                  </div>
                </div>
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
                    <p className="text-xs text-neutral-500 mt-1">{filteredCustomerList.length} customers in this view</p>
                  </div>
                  <button onClick={() => setShowAllCustomersModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200/50 dark:bg-white/10 text-neutral-600 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors">
                    <CloseIcon size={18} />
                  </button>
                </div>

                {/* Category Navigation tabs */}
                <div className="px-5 pt-3 flex gap-2 border-b border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-black shrink-0">
                  <button onClick={() => setCustomerModalCategory('all')} className={`pb-3 px-4 text-xs font-black border-b-2 transition-colors ${customerModalCategory === 'all' ? 'border-[#D4AF37] text-neutral-900 dark:text-white' : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}>All Customers</button>
                  <button onClick={() => setCustomerModalCategory('dine_in')} className={`pb-3 px-4 text-xs font-black border-b-2 transition-colors ${customerModalCategory === 'dine_in' ? 'border-[#D4AF37] text-neutral-900 dark:text-white' : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}>Dine-In</button>
                  <button onClick={() => setCustomerModalCategory('delivery')} className={`pb-3 px-4 text-xs font-black border-b-2 transition-colors ${customerModalCategory === 'delivery' ? 'border-[#D4AF37] text-neutral-900 dark:text-white' : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}>Delivery</button>
                </div>
                
                <div className="p-4 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#12141D] shrink-0 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex gap-2 bg-neutral-100 dark:bg-black p-1 rounded-xl">
                    <button onClick={() => setCustomerModalSort('most-came')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${customerModalSort === 'most-came' ? 'bg-white dark:bg-[#1a1a1f] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>Most Visits</button>
                    <button onClick={() => setCustomerModalSort('most-spend')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${customerModalSort === 'most-spend' ? 'bg-white dark:bg-[#1a1a1f] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>Most Spent</button>
                  </div>
                  
                  <button onClick={handleExportVCF} className="px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.2)]">
                    <ArrowDown size={14} /> Export Contact{selectedCustomerIds.length > 0 ? `s (${selectedCustomerIds.length})` : 's (All)'}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-1">
                    {[...filteredCustomerList].sort((a, b) => customerModalSort === 'most-came' ? b.orderCount - a.orderCount : b.totalSpend - a.totalSpend).map(c => (
                      <div 
                        key={c.id} 
                        className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer" 
                        onClick={() => setSelectedCustomerHistory(c)}
                      >
                        <div 
                          className="w-8 h-8 rounded-full hover:bg-neutral-200/50 dark:hover:bg-white/10 flex items-center justify-center shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]);
                          }}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCustomerIds.includes(c.id) ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-neutral-300 dark:border-neutral-600'}`}>
                            {selectedCustomerIds.includes(c.id) && <CheckCircle size={14} className="text-black" />}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-white/10 flex items-center justify-center shrink-0">
                          <UserCircle size={18} className="text-neutral-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">{c.name}</p>
                          <p className="text-xs text-neutral-500 font-mono truncate">{c.phone}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-[#D4AF37] text-sm">₹{c.totalSpend.toFixed(0)}</p>
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

        {/* Customer Visit & Order History Modal */}
        <AnimatePresence>
          {selectedCustomerHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#12141D] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-neutral-200 dark:border-white/10"
              >
                {/* Header */}
                <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center bg-neutral-50 dark:bg-black shrink-0">
                  <div>
                    <h3 className="font-display font-black text-lg text-neutral-900 dark:text-white">Visit History</h3>
                    <p className="text-xs text-neutral-500 mt-1">{selectedCustomerHistory.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCustomerHistory(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200/50 dark:bg-white/10 text-neutral-600 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>

                {/* Stats Summary */}
                <div className="p-4 bg-neutral-50/50 dark:bg-black/20 border-b border-neutral-100 dark:border-white/5 grid grid-cols-2 gap-4 text-center shrink-0">
                  <div className="p-3 bg-white dark:bg-[#1e1e24] rounded-2xl border border-neutral-200/60 dark:border-white/5">
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Total Spent</p>
                    <p className="text-xl font-black text-[#D4AF37] mt-1">₹{selectedCustomerHistory.totalSpend.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#1e1e24] rounded-2xl border border-neutral-200/60 dark:border-white/5">
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Visits / Orders</p>
                    <p className="text-xl font-black text-neutral-900 dark:text-white mt-1">{selectedCustomerHistory.orderCount}</p>
                  </div>
                </div>

                {/* Order List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedCustomerHistory.orders && selectedCustomerHistory.orders.length > 0 ? (
                    [...selectedCustomerHistory.orders]
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((order, idx) => {
                        const oType = order.orderType || order.order_type;
                        const isDelivery = oType === 'delivery';
                        return (
                          <div key={order.id || idx} className="p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 rounded-2xl space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                                  {new Date(order.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{new Date(order.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isDelivery ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'}`}>
                                {isDelivery ? 'Delivery' : oType === 'prepaid' ? 'Pre-Order' : 'Dine-In'}
                              </span>
                            </div>

                            {/* Status and Price */}
                            <div className="flex justify-between items-center py-1 border-y border-neutral-200/50 dark:border-white/5">
                              <span className={`text-xs font-bold ${order.status === 'Completed' ? 'text-emerald-500' : order.status === 'Cancelled' ? 'text-red-500' : 'text-[#D4AF37]'}`}>
                                {order.status}
                              </span>
                              <span className="font-black text-neutral-900 dark:text-white">
                                ₹{Number(order.total || 0).toFixed(2)}
                              </span>
                            </div>

                            {/* Items */}
                            <div className="space-y-1 pt-1">
                              {(order.items || []).map((item, itemIdx) => (
                                <div key={itemIdx} className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                  <span className="truncate pr-4">{item.quantity || item.qty || 1}x {item.name}</span>
                                  <span className="font-semibold shrink-0">₹{Number(item.price || 0).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-center text-xs text-neutral-500 py-8">No order details found.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dine-In Date Range History Modal */}
        <AnimatePresence>
          {showDineInHistoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#12141D] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-neutral-200 dark:border-white/10"
              >
                {/* Header */}
                <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center bg-neutral-50 dark:bg-black shrink-0">
                  <div>
                    <h3 className="font-display font-black text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                      <Calendar className="text-[#D4AF37]" size={20} />
                      Dine-In History & Range Reports
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Select date range to view historical Dine-In orders.</p>
                  </div>
                  <button
                    onClick={() => setShowDineInHistoryModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200/50 dark:bg-white/10 text-neutral-600 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>

                {/* Date Selectors & Stats Summary */}
                <div className="p-5 bg-neutral-50/50 dark:bg-black/20 border-b border-neutral-100 dark:border-white/5 space-y-4 shrink-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">Start Date</label>
                      <input 
                        type="date"
                        lang="en-GB"
                        value={tempDineInStartDate}
                        max={tempDineInEndDate}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempDineInStartDate(val);
                          if (val > tempDineInEndDate) {
                            setTempDineInEndDate(val);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#1e1e24] border border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">End Date</label>
                      <input 
                        type="date"
                        lang="en-GB"
                        value={tempDineInEndDate}
                        min={tempDineInStartDate}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempDineInEndDate(val);
                          if (val < tempDineInStartDate) {
                            setTempDineInStartDate(val);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#1e1e24] border border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Red Show Analysis Button */}
                  <button
                    onClick={() => {
                      setDineInStartDate(tempDineInStartDate);
                      setDineInEndDate(tempDineInEndDate);
                      setDineInAnalysisShown(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={14} />
                    Show Analysis
                  </button>

                  {dineInAnalysisShown && (
                    <div className="grid grid-cols-2 gap-4 text-center pt-2 animate-fadeIn">
                      <div className="p-3 bg-white dark:bg-[#1e1e24] rounded-2xl border border-neutral-200/60 dark:border-white/5">
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Range Dine-In Revenue</p>
                        <p className="text-xl font-black text-[#D4AF37] mt-1">
                          ₹{rangedDineInOrders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + Number(o.total || 0), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#1e1e24] rounded-2xl border border-neutral-200/60 dark:border-white/5">
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Range Dine-In Orders</p>
                        <p className="text-xl font-black text-neutral-900 dark:text-white mt-1">{rangedDineInOrders.length}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {dineInAnalysisShown ? (
                    rangedDineInOrders.length > 0 ? (
                      [...rangedDineInOrders]
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((order, idx) => (
                          <div key={order.id || idx} className="p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 rounded-2xl space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                                  {getOrderNumber(order)} ({new Date(order.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})
                                </p>
                                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                  {new Date(order.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                  {order.tableNumber || order.table_number ? ` • Table ${order.tableNumber || order.table_number}` : ''}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : order.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="flex justify-between items-center py-1 border-y border-neutral-200/50 dark:border-white/5">
                              <span className="text-xs font-bold text-neutral-500">Customer: {order.contactName || 'Guest'}</span>
                              <span className="font-black text-neutral-900 dark:text-white">₹{Number(order.total || 0).toFixed(2)}</span>
                            </div>

                            <div className="space-y-1 pt-1">
                              {(order.items || []).map((item, itemIdx) => (
                                <div key={itemIdx} className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                  <span className="truncate pr-4">{item.quantity || item.qty || 1}x {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}</span>
                                  <span className="font-semibold shrink-0">₹{Number(item.price || 0).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-xs text-neutral-500 py-12">No Dine-In orders found in this range.</p>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500">
                      <Calendar size={48} className="text-neutral-300 dark:text-neutral-700 mb-3 animate-pulse" />
                      <p className="font-display font-black text-sm text-neutral-600 dark:text-neutral-400">Analysis Pending</p>
                      <p className="text-xs text-neutral-500 max-w-xs mt-1">Select your preferred date range above and click the red "Show Analysis" button to view reports.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delivery Date Range History Modal */}
        <AnimatePresence>
          {showDeliveryHistoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#12141D] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-neutral-200 dark:border-white/10"
              >
                {/* Header */}
                <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center bg-neutral-50 dark:bg-black shrink-0">
                  <div>
                    <h3 className="font-display font-black text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                      <Calendar className="text-[#D4AF37]" size={20} />
                      Delivery History & Range Reports
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Select date range to view historical Delivery orders.</p>
                  </div>
                  <button
                    onClick={() => setShowDeliveryHistoryModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200/50 dark:bg-white/10 text-neutral-600 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>

                {/* Date Selectors & Stats Summary */}
                <div className="p-5 bg-neutral-50/50 dark:bg-black/20 border-b border-neutral-100 dark:border-white/5 space-y-4 shrink-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">Start Date</label>
                      <input 
                        type="date"
                        lang="en-GB"
                        value={tempDeliveryStartDate}
                        max={tempDeliveryEndDate}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempDeliveryStartDate(val);
                          if (val > tempDeliveryEndDate) {
                            setTempDeliveryEndDate(val);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#1e1e24] border border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">End Date</label>
                      <input 
                        type="date"
                        lang="en-GB"
                        value={tempDeliveryEndDate}
                        min={tempDeliveryStartDate}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempDeliveryEndDate(val);
                          if (val < tempDeliveryStartDate) {
                            setTempDeliveryStartDate(val);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#1e1e24] border border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Red Show Analysis Button */}
                  <button
                    onClick={() => {
                      setDeliveryStartDate(tempDeliveryStartDate);
                      setDeliveryEndDate(tempDeliveryEndDate);
                      setDeliveryAnalysisShown(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={14} />
                    Show Analysis
                  </button>

                  {deliveryAnalysisShown && (
                    <div className="grid grid-cols-2 gap-4 text-center pt-2 animate-fadeIn">
                      <div className="p-3 bg-white dark:bg-[#1e1e24] rounded-2xl border border-neutral-200/60 dark:border-white/5">
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Range Delivery Revenue</p>
                        <p className="text-xl font-black text-[#D4AF37] mt-1">
                          ₹{rangedDeliveryOrders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + Number(o.total || 0), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#1e1e24] rounded-2xl border border-neutral-200/60 dark:border-white/5">
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Range Delivery Orders</p>
                        <p className="text-xl font-black text-neutral-900 dark:text-white mt-1">{rangedDeliveryOrders.length}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {deliveryAnalysisShown ? (
                    rangedDeliveryOrders.length > 0 ? (
                      [...rangedDeliveryOrders]
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((order, idx) => (
                          <div key={order.id || idx} className="p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 rounded-2xl space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                                  {getOrderNumber(order)} ({new Date(order.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})
                                </p>
                                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                  {new Date(order.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : order.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'}`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="flex justify-between items-center py-1 border-y border-neutral-200/50 dark:border-white/5">
                              <div className="text-xs text-neutral-505">
                                <p className="font-bold">Customer: {order.contactName || 'Guest'}</p>
                                {order.metadata?.address && <p className="mt-0.5 line-clamp-1">Addr: {order.metadata.address}</p>}
                              </div>
                              <span className="font-black text-neutral-900 dark:text-white shrink-0">₹{Number(order.total || 0).toFixed(2)}</span>
                            </div>

                            <div className="space-y-1 pt-1">
                              {(order.items || []).map((item, itemIdx) => (
                                <div key={itemIdx} className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                  <span className="truncate pr-4">{item.quantity || item.qty || 1}x {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}</span>
                                  <span className="font-semibold shrink-0">₹{Number(item.price || 0).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-xs text-neutral-500 py-12">No Delivery orders found in this range.</p>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500">
                      <Calendar size={48} className="text-neutral-300 dark:text-neutral-700 mb-3 animate-pulse" />
                      <p className="font-display font-black text-sm text-neutral-600 dark:text-neutral-400">Analysis Pending</p>
                      <p className="text-xs text-neutral-500 max-w-xs mt-1">Select your preferred date range above and click the red "Show Analysis" button to view reports.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </div>
  );
}

