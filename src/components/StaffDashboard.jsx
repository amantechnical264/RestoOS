import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, Utensils, LogOut, Grid, ListOrdered } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function StaffDashboard({
  isStaffMode,
  setIsStaffMode,
  serviceAlerts,
  setServiceAlerts,
  restOrders,
  updateOrder,
  tableCount,
  GOLD,
  goldGradient
}) {
  const [activeTab, setActiveTab] = useState('floor'); // 'floor' or 'kitchen'
  
  // Group orders by table for floor view
  const activeTableOrders = restOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready');
  
  // Kitchen orders
  const prep = restOrders.filter(o => o.status === 'Preparing');
  const ready = restOrders.filter(o => o.status === 'Ready');

  return (
    <div className="flex flex-col h-[100dvh] bg-neutral-100 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white font-sans overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="px-6 py-4 flex justify-between items-center bg-white dark:bg-[#12141D] border-b border-neutral-200 dark:border-white/5 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-gold" style={{ background: goldGradient }}>
            <Utensils size={20} className="text-black" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl">Service Hub</h1>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> Staff Mode Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-neutral-100 dark:bg-black/50 p-1.5 rounded-2xl border border-neutral-200 dark:border-white/10">
          <button onClick={() => setActiveTab('floor')}
            className={`px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${activeTab === 'floor' ? 'bg-white dark:bg-[#222] shadow-sm text-[#D4AF37]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'}`}>
            <Grid size={16}/> Floor
          </button>
          <button onClick={() => setActiveTab('kitchen')}
            className={`px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${activeTab === 'kitchen' ? 'bg-white dark:bg-[#222] shadow-sm text-[#D4AF37]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'}`}>
            <ListOrdered size={16}/> Kitchen ({prep.length + ready.length})
          </button>
        </div>

        <button onClick={() => setIsStaffMode(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-900/50">
          <LogOut size={16} /> Exit Staff Mode
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <AnimatePresence mode="wait">
          
          {/* FLOOR VIEW */}
          {activeTab === 'floor' && (
            <motion.div key="floor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
              
              {serviceAlerts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Bell className="animate-pulse" size={20}/> Active Requests
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {serviceAlerts.map((alert, idx) => (
                      <div key={idx} className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-500/50 p-5 rounded-3xl flex flex-col justify-between shadow-[0_4px_20px_rgba(245,158,11,0.15)]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500 mb-1">Table {alert.tableNumber}</p>
                          <p className="text-xl font-display font-black text-amber-900 dark:text-amber-100">{alert.type}</p>
                        </div>
                        <button onClick={() => setServiceAlerts(prev => prev.filter((_, i) => i !== idx))}
                          className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                          <CheckCircle size={18}/> Resolve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-lg font-black mb-4 text-neutral-500">Live Tables Overview</h2>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {Array.from({ length: tableCount }).map((_, i) => {
                    const tNum = String(i + 1);
                    const alerts = serviceAlerts.filter(a => String(a.tableNumber) === tNum);
                    const orders = activeTableOrders.filter(o => String(o.tableNumber) === tNum);
                    
                    let status = 'available';
                    if (alerts.length > 0) status = 'service';
                    else if (orders.length > 0) status = 'occupied';
                    
                    const sc = {
                      available: 'bg-white dark:bg-[#12141D] border-neutral-200 dark:border-white/5 text-neutral-400',
                      occupied: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/30 text-blue-600 dark:text-blue-400',
                      service: 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-500/50 text-amber-600 dark:text-amber-400'
                    }[status];

                    return (
                      <div key={i} className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${sc}`}>
                        <div className="font-display font-black text-3xl">{tNum}</div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{status === 'service' ? 'Needs Help' : status}</span>
                        {orders.length > 0 && <span className="text-xs font-bold opacity-70">{orders.length} order(s)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* KITCHEN/ORDERS VIEW */}
          {activeTab === 'kitchen' && (
            <motion.div key="kitchen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex gap-6">
              
              <div className="flex-1 bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/5 rounded-3xl p-5 flex flex-col">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Clock className="text-blue-500"/> Preparing ({prep.length})</h2>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {prep.length === 0 ? (
                    <p className="text-neutral-400 text-center py-10 font-bold">No orders preparing</p>
                  ) : prep.map(o => (
                    <div key={o.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/10 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">T{o.tableNumber || '??'}</span>
                          <span className="text-xs font-bold text-neutral-500">Order #{o.id.substring(0,6).toUpperCase()}</span>
                        </div>
                        <ul className="text-sm font-bold space-y-1">
                          {o.items?.map((item, i) => <li key={i}>· {item.quantity}x {item.name}</li>)}
                        </ul>
                      </div>
                      <button onClick={() => updateOrder(o.id, { status: 'Ready' })} className="px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg">
                        Mark Ready
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-white dark:bg-[#12141D] border border-neutral-200 dark:border-white/5 rounded-3xl p-5 flex flex-col">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2"><CheckCircle className="text-emerald-500"/> Ready to Serve ({ready.length})</h2>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {ready.length === 0 ? (
                    <p className="text-neutral-400 text-center py-10 font-bold">No orders ready</p>
                  ) : ready.map(o => (
                    <div key={o.id} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-800/40 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-black bg-emerald-500 text-white px-3 py-1 rounded-xl shadow-sm">Table {o.tableNumber || '??'}</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500">Deliver these items to the table</p>
                      </div>
                      <button onClick={() => updateOrder(o.id, { status: 'Completed' })} className="px-6 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-lg">
                        Mark Delivered
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
