import React from 'react';
import { MapPin, CheckCircle2, Clock, ChefHat, ShieldCheck, XCircle, Bell, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const GOLD = '#D4AF37';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

const STATUS_STEPS = [
  { id: 'Pending',   icon: Clock,       label: 'Received' },
  { id: 'Preparing', icon: ChefHat,     label: 'Cooking' },
  { id: 'Ready',     icon: CheckCircle2, label: 'Ready' }
];

function OrderTimeline({ currentStatus }) {
  if (currentStatus === 'Pending Verification' || currentStatus === 'Cancelled') return null;
  const currentIndex = STATUS_STEPS.findIndex(s => s.id === currentStatus);
  const activeIndex  = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="relative flex justify-between items-center mt-6 mb-8 px-2">
      <div className="absolute top-1/2 left-0 right-0 h-1 rounded-full -translate-y-1/2 z-0"
        style={{ background: 'rgba(212,175,55,0.1)' }} />
      <motion.div
        className="absolute top-1/2 left-0 h-1 rounded-full -translate-y-1/2 z-0"
        initial={{ width: '0%' }}
        animate={{ width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ background: goldGradient, boxShadow: `0 0 10px rgba(212,175,55,0.5)` }}
      />
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = index <= activeIndex;
        const isActive    = index === activeIndex;
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <motion.div
              initial={false}
              animate={{ scale: isActive ? 1.25 : 1 }}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500"
              style={{
                background: isCompleted ? goldGradient : '#111',
                borderColor: isCompleted ? GOLD : 'rgba(255,255,255,0.1)',
                boxShadow: isActive ? `0 0 16px rgba(212,175,55,0.6)` : 'none',
                color: isCompleted ? '#000' : 'rgba(255,255,255,0.3)',
              }}
            >
              <step.icon size={14} />
            </motion.div>
            <span className="text-[10px] font-bold absolute -bottom-5 w-20 text-center"
              style={{ color: isActive ? GOLD : isCompleted ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.2)' }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DinerOrdersPage() {
  const { orders, user, restaurants } = useAppContext();
  const { t } = useTranslation();

  const getOrderNumber = (order) => {
    const vendorOrders = orders
      .filter(o => o.restId === (order.restId || order.rest_id) || o.rest_id === (order.restId || order.rest_id))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const index = vendorOrders.findIndex(o => o.id === order.id);
    return index !== -1 ? `Order #${String(index + 1).padStart(3, '0')}` : `#${order.id.slice(-3)}`;
  };

  const myOrders = orders.filter(o => {
    const userId = o.user_id || o.userId;
    return userId === user?.uid || userId === user?.phone || userId === user?.email || userId === 'anonymous';
  });

  const cardStyle = {
    background: 'linear-gradient(145deg, #111111 0%, #080808 100%)',
    border: '1px solid rgba(212,175,55,0.15)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.8)',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white pb-24"
    >
      {/* Header */}
      <div
        className="px-6 py-5 sticky top-0 z-10"
        style={{ background: 'rgba(0,0,0,0.95)', borderBottom: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Crown size={16} style={{ color: GOLD }} />
          </div>
          <div>
            <h1 className="text-xl font-display font-black text-white">{t('orders.liveTracking', 'Live Order Tracking')}</h1>
            <p className="text-xs text-neutral-500">{myOrders.length} order{myOrders.length !== 1 ? 's' : ''} active</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-black">
        {myOrders.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <Crown size={32} style={{ color: 'rgba(212,175,55,0.4)' }} />
            </div>
            <p className="text-neutral-400 font-semibold">{t('orders.noOrders', 'No orders yet')}</p>
            <p className="text-neutral-600 text-sm mt-1">Your order history will appear here</p>
          </motion.div>
        )}

        <AnimatePresence>
          {myOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
              className="rounded-3xl p-6 shadow-lg dark:shadow-none bg-white dark:bg-transparent"
              style={document.documentElement.classList.contains('dark') ? cardStyle : { background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '1.5rem' }}
            >
              {/* Order header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-black text-lg text-neutral-900 dark:text-white">
                    {restaurants.find(r => r.id === (order.restId || order.rest_id))?.name || 'Restaurant'}
                  </span>
                  <span className="block text-xs font-bold mt-0.5 uppercase tracking-wider">
                    <span style={{ color: GOLD }}>{getOrderNumber(order)}</span>
                    <span className="text-neutral-500"> • {order.orderType === 'prepaid' ? `Pre-Order @ ${order.scheduledTime}` : 'Dine-In'}</span>
                  </span>
                </div>
              </div>

              {/* Pending Verification */}
              {order.status === 'Pending Verification' && (
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="mb-6 mt-4">
                  <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(212,175,55,0.1)' }}>
                      <ShieldCheck size={24} style={{ color: GOLD }} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Verification Code</p>
                    {order.verificationCode && (
                      <p className="text-4xl font-black tracking-[0.4em] font-mono mb-2" style={{ color: GOLD }}>{order.verificationCode}</p>
                    )}
                    <p className="text-sm text-neutral-500">Show this code to the waiter to confirm your table.</p>
                  </div>
                </motion.div>
              )}

              {/* Cancelled */}
              {order.status === 'Cancelled' && (
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="mb-4 mt-4">
                  <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}>
                      <XCircle size={20} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-400">Order Rejected</p>
                      <p className="text-xs text-neutral-500">This order was not verified by the restaurant staff.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <OrderTimeline currentStatus={order.status} />

              {/* Items list */}
              <div className="rounded-2xl p-4 mb-4 mt-2" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
                <ul className="text-sm font-medium space-y-2 text-neutral-600 dark:text-neutral-300">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>1× {item.name}</span>
                      <span className="font-bold" style={{ color: GOLD }}>${Number(item.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call Waiter button */}
              {order.orderType === 'dine_in' && order.status !== 'Cancelled' && (
                <button
                  onClick={async () => {
                    try {
                      await import('../services/supabase').then(({ supabase }) => {
                        if (supabase) {
                          supabase.channel('service-requests').send({
                            type: 'broadcast', event: 'waiter_call',
                            payload: { tableNumber: '12', type: 'Waiter via Order Tracking', time: new Date().toISOString() }
                          });
                        }
                      });
                      const btn = document.getElementById(`call-waiter-${order.id}`);
                      if (btn) {
                        btn.textContent = '✔ Waiter Notified!';
                        setTimeout(() => { btn.textContent = '🔔 Call Waiter'; }, 3000);
                      }
                    } catch(e) { console.error(e); }
                  }}
                  id={`call-waiter-${order.id}`}
                  className="w-full mb-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.25)', color: GOLD }}
                >
                  <Bell size={15}/> Call Waiter
                </button>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-3 mt-1" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                <span className="text-lg font-black text-neutral-900 dark:text-white">
                  Total: <span style={{ color: GOLD }}>${Number(order.total).toFixed(2)}</span>
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold`}
                  style={order.paymentStatus === 'Paid'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                  }>
                  {order.paymentStatus} · {order.paymentMethod}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <BottomNav />
    </motion.div>
  );
}
