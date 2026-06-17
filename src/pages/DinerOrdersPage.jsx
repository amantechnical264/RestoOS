import React, { useMemo } from 'react';
import { MapPin, CheckCircle2, Clock, ChefHat, ShieldCheck, XCircle, Bell, Crown, Store, Calendar, MoreVertical, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { reviewService } from '../services/ReviewService';

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
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-colors bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10"
              style={isCompleted ? { background: goldGradient, border: 'none', boxShadow: '0 4px 15px rgba(212,175,55,0.3)', color: '#000' } : { color: 'rgba(255,255,255,0.3)' }}
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

// Zomato style Historical Order Card
function ZomatoStyleOrderCard({ order, restaurant, formattedDate, formattedTime, onViewMenu, onSubmitReview }) {
  const isCancelled = order.status === 'Cancelled';
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmitReview = async () => {
    if (rating > 0 && !isSubmitted) {
      await onSubmitReview(order.id, restaurant?.id, rating);
      setIsSubmitted(true);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden mb-4"
    >
      {/* Top Header */}
      <div className="p-4 flex items-start gap-4">
        {/* Restaurant Icon */}
        <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center">
          {restaurant?.cover ? (
            <img src={restaurant.cover} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <Store size={20} className="text-neutral-400" />
          )}
        </div>
        
        {/* Restaurant Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-[15px] font-bold text-neutral-900 dark:text-white truncate mb-1">
            {restaurant?.name || 'Restaurant'}
          </h3>
          <button onClick={() => onViewMenu(restaurant?.id)} className="text-[13px] font-semibold text-left w-fit" style={{ color: '#E23744' }}>
            View menu &rsaquo;
          </button>
        </div>
      </div>

      <div className="mx-4 border-t border-dashed border-neutral-200 dark:border-white/10" />

      {/* Items List */}
      <div className="p-4 space-y-3">
        {order.items.map((item, i) => {
          // Assume veg (green) if tags includes 'veg' or not 'non-veg'. Zomato shows green square with dot inside.
          const isNonVeg = item.tags?.some(t => t.toLowerCase() === 'non-veg' || t.toLowerCase() === 'non veg');
          const iconColor = isNonVeg ? '#E23744' : '#22c55e'; // Red or Green
          
          return (
            <div key={i} className="flex items-start gap-3">
              {/* Veg/Non-veg icon indicator */}
              <div className="shrink-0 mt-1 flex items-center justify-center w-3 h-3 rounded-sm border" style={{ borderColor: iconColor }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: iconColor }} />
              </div>
              <span className="text-[14px] font-medium text-neutral-800 dark:text-neutral-200">
                {item.quantity || item.qty} x {item.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mx-4 border-t border-dashed border-neutral-200 dark:border-white/10" />

      {/* Order Details & Status */}
      <div className="p-4 space-y-2">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
          Order placed on {formattedDate}, {formattedTime}
        </p>
        <div className="flex justify-between items-center">
          <span className={`text-[14px] font-semibold ${isCancelled ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
            {isCancelled ? 'Cancelled' : 'Delivered'}
          </span>
          <span className="text-[14px] font-bold text-neutral-900 dark:text-white">
            ₹{Number(order.total).toFixed(2)} &rsaquo;
          </span>
        </div>
      </div>

      <div className="mx-4 border-t border-dashed border-neutral-200 dark:border-white/10" />

      {/* Footer / Rating */}
      <div className="p-4 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
        {!isSubmitted ? (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-neutral-900 dark:text-white mr-1">Rate Order</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5"
                    >
                      <Star 
                        size={20} 
                        className={`transition-colors ${(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-neutral-200/50 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors">
                Reorder
              </button>
            </div>
            
            <AnimatePresence>
              {rating > 0 && (
                <motion.button 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  onClick={handleSubmitReview}
                  className="w-full py-2 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Submit {rating}-Star Review
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
              <CheckCircle2 size={18} className="fill-green-100 dark:fill-green-900" />
              <span className="text-[14px] font-bold">Review submitted successfully</span>
            </div>
            <button className="px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-neutral-200/50 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors">
              Reorder
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Active Order Card (Legacy UI)
function ActiveOrderCard({ order, restaurantName, getOrderNumber, formattedDate, formattedTime, tableNumber, cardStyleClass, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 shadow-lg mb-4 ${cardStyleClass}`}
    >
      <div className="pb-4 mb-3 border-b border-neutral-100 dark:border-white/5 flex justify-between items-start">
        <div className="space-y-1">
          <span className="font-display font-black text-lg text-neutral-900 dark:text-white block">
            {t('orders.orderNo', 'Order')} #{getOrderNumber(order)}
          </span>
          
          {/* Restaurant Name */}
          <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-800 dark:text-neutral-200">
            <Store size={14} style={{ color: GOLD }} />
            <span>{restaurantName}</span>
          </div>

          {/* Date and Time */}
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 font-sans">
              <Clock size={11} />
              <span>Ordered on {formattedDate} at {formattedTime}</span>
            </div>
          )}
        </div>
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider bg-neutral-100 dark:bg-white/5 px-2.5 py-1 rounded-full">{order.orderType === 'prepaid' ? 'Pre-Order' : 'Dine-In'}</span>
      </div>

      {/* Pending Verification */}
      {order.status === 'Pending Verification' && (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={`mt-4 rounded-3xl p-5 ${cardStyleClass}`}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <ShieldCheck size={24} style={{ color: GOLD }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>Verification Code</p>
            {order.verificationCode && (
              <p className="text-4xl font-black tracking-[0.4em] font-mono mb-2 text-center" style={{ color: GOLD }}>{order.verificationCode}</p>
            )}
            <p className="text-sm text-neutral-500 text-center">Show this code to the waiter to confirm your table.</p>
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
              <span className="text-sm font-bold text-neutral-900 dark:text-white">{(item.quantity || item.qty)}x {item.name}</span>
              <span className="font-bold" style={{ color: GOLD }}>₹{Number(item.price).toFixed(2)}</span>
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
                    payload: { tableNumber: tableNumber || '12', type: 'Waiter via Order Tracking', time: new Date().toISOString() }
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
          Total: <span style={{ color: GOLD }}>₹{Number(order.total).toFixed(2)}</span>
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
  );
}

export default function DinerOrdersPage() {
  const { orders, user, restaurants, tableNumber, setActiveRestId } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewMenu = (restId) => {
    if (restId) {
      setActiveRestId(restId);
      navigate('/menu');
    }
  };

  const handleSubmitReview = async (orderId, restId, rating) => {
    const dinerName = user?.name || 'Anonymous Diner';
    await reviewService.submitReview({
      orderId,
      restId,
      dinerName,
      rating
    });
  };

  const getOrderNumber = (order) => {
    const vendorOrders = orders
      .filter(o => o.restId === (order.restId || order.rest_id) || o.rest_id === (order.restId || order.rest_id))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const index = vendorOrders.findIndex(o => o.id === order.id);
    return index !== -1 ? `${String(index + 1).padStart(3, '0')}` : `${order.id.slice(-3)}`;
  };

  // Identity extracted once, not per-order (avoids N * JSON.parse per render)
  const myIdentity = useMemo(() => {
    const dp = JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}');
    return {
      guestId: user?.uid || user?.id || user?.guestId || dp.guestId,
      phone: user?.phone || dp.phone,
      email: user?.email || dp.email,
    };
  }, [user]);

  const myOrders = useMemo(() => {
    const { guestId, phone, email } = myIdentity;
    return orders.filter(o => {
      const orderUserId = o.user_id || o.userId;
      return (guestId && orderUserId === guestId) || 
             (phone && orderUserId === phone) || 
             (email && orderUserId === email) || 
             (phone && o.contactPhone === phone) ||
             (!guestId && !phone && orderUserId === 'anonymous');
    });
  }, [orders, myIdentity]);

  const cardStyleClass = "bg-white dark:bg-gradient-to-br dark:from-[#111111] dark:to-[#080808] border border-neutral-200 dark:border-[rgba(212,175,55,0.15)] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.8)]";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-neutral-50 dark:bg-[#000000] text-neutral-900 dark:text-white pb-24"
    >
      {/* Header */}
      <div
        className="px-6 py-5 sticky top-0 z-10 bg-white/95 dark:bg-black/95 border-b border-neutral-200 dark:border-[rgba(212,175,55,0.15)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Crown size={16} style={{ color: GOLD }} />
          </div>
          <div>
            <h1 className="text-xl font-display font-black text-neutral-900 dark:text-white">{t('orders.liveTracking', 'Your Orders')}</h1>
            <p className="text-xs text-neutral-500">{myOrders.length} {t('orders.activeOrders', 'Total Orders')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-black">
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
          {myOrders.map((order, index) => {
            const rest = restaurants.find(r => r.id === (order.restId || order.rest_id) || r.id === order.rest_id);
            const restaurantName = rest ? rest.name : 'Restaurant';
            const orderDate = order.timestamp ? new Date(order.timestamp) : null;
            const formattedDate = orderDate 
              ? orderDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : '';
            const formattedTime = orderDate 
              ? orderDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
              : '';

            if (order.status === 'Completed' || order.status === 'Cancelled') {
              return (
                <div key={order.id}>
                  <ZomatoStyleOrderCard
                    order={order}
                    restaurant={rest}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    onViewMenu={handleViewMenu}
                    onSubmitReview={handleSubmitReview}
                  />
                </div>
              );
            }

            return (
              <div key={order.id}>
                <ActiveOrderCard
                  order={order}
                  restaurantName={restaurantName}
                  getOrderNumber={getOrderNumber}
                  formattedDate={formattedDate}
                  formattedTime={formattedTime}
                  tableNumber={tableNumber}
                  cardStyleClass={cardStyleClass}
                  t={t}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      <BottomNav />
    </motion.div>
  );
}
