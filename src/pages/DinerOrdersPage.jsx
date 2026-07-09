import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, ChefHat, ShieldCheck, XCircle, Bell, Crown, Store, Star, Sparkles, Truck, Gift, X, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { reviewService } from '../services/ReviewService';
import { OrderCardSkeleton } from '../components/Skeleton';
import DishReviewModal from '../components/DishReviewModal';
import DishRatingBadge from '../components/DishRatingBadge';
import { DishRatingStore } from '../services/AIReviewService';

const GOLD = '#D4AF37';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

const STATUS_STEPS = [
  { id: 'Pending',   icon: Clock,        label: 'Received' },
  { id: 'Preparing', icon: ChefHat,      label: 'Cooking' },
  { id: 'Ready',     icon: CheckCircle2, label: 'Ready' }
];

const DELIVERY_STATUS_STEPS = [
  { id: 'Pending',         icon: Clock,        label: 'Received' },
  { id: 'Preparing',       icon: ChefHat,      label: 'Preparing' },
  { id: 'OutForDelivery',  icon: Truck,        label: 'Out for Delivery' },
  { id: 'Delivered',       icon: CheckCircle2, label: 'Delivered' },
];

function OrderTimeline({ currentStatus, orderType }) {
  if (currentStatus === 'Pending Verification' || currentStatus === 'Cancelled') return null;
  const steps = orderType === 'delivery' ? DELIVERY_STATUS_STEPS : STATUS_STEPS;
  const currentIndex = steps.findIndex(s => s.id === currentStatus);
  const activeIndex  = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="relative flex justify-between items-center mt-6 mb-8 px-2">
      <div className="absolute top-1/2 left-0 right-0 h-1 rounded-full -translate-y-1/2 z-0"
        style={{ background: 'rgba(212,175,55,0.1)' }} />
      <motion.div
        className="absolute top-1/2 left-0 h-1 rounded-full -translate-y-1/2 z-0"
        initial={{ width: '0%' }}
        animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ background: goldGradient, boxShadow: `0 0 10px rgba(212,175,55,0.5)` }}
      />
      {steps.map((step, index) => {
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

/**
 * Zomato-style Historical Order Card with per-dish AI review support
 */
function ZomatoStyleOrderCard({ order, restaurant, formattedDate, formattedTime, onViewMenu, onSubmitReview, dishes, user, onShowBreakdown }) {
  const isCancelled = order.status === 'Cancelled';
  // Resolve cancel reason from metadata OR items array fallback
  const cancelReason = order.metadata?.cancelReason ||
    order.items?.find(i => i.id === '__cancel_reason')?.reason || null;

  // Track which dish has the review modal open
  const [reviewingDish, setReviewingDish] = useState(null);
  // Track which items in this order have been reviewed {itemId: rating}
  const [reviewedItems, setReviewedItems] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('3dish_item_reviews') || '{}');
      return stored[order.id] || {};
    } catch { return {}; }
  });
  // Whether the whole order has been rated (legacy fallback)
  const [orderReviewed, setOrderReviewed] = useState(() => {
    if (order.review_rating) return true;
    try {
      const local = JSON.parse(localStorage.getItem('3dish_submitted_reviews') || '{}');
      return !!local[order.id];
    } catch { return false; }
  });

  // Keep in sync with realtime Supabase pushes
  React.useEffect(() => {
    if (order.review_rating) setOrderReviewed(true);
  }, [order.review_rating]);

  // Look up full dish object from the dishes array
  const getDishObject = (item) => {
    return dishes?.find(d => d.id === item.id) || {
      id: item.id,
      name: item.name,
      description: item.description || '',
      tags: item.tags || [],
      price: item.price,
      spiceLevel: item.spiceLevel,
      dietaryPreference: item.dietaryPreference,
    };
  };

  const handleItemReviewSubmit = async (orderId, restId, rating, reviewText, dishId) => {
    await onSubmitReview(orderId, restId, rating, reviewText, dishId);
    // Track reviewed items
    setReviewedItems(prev => {
      const next = { ...prev, [dishId || 'order']: rating };
      try {
        const allStored = JSON.parse(localStorage.getItem('3dish_item_reviews') || '{}');
        allStored[order.id] = next;
        localStorage.setItem('3dish_item_reviews', JSON.stringify(allStored));
      } catch {}
      return next;
    });
    setOrderReviewed(true);
    setReviewingDish(null);
  };

  const totalReviewed = Object.keys(reviewedItems).length;
  const totalItems = order.items?.length || 0;

  return (
    <>
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

          {/* Review Progress Badge */}
          {orderReviewed && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30">
              <CheckCircle2 size={12} className="text-green-600 dark:text-green-400" />
              <span className="text-[10px] font-bold text-green-700 dark:text-green-400">Reviewed</span>
            </div>
          )}
        </div>

        <div className="mx-4 border-t border-dashed border-neutral-200 dark:border-white/10" />

        {/* Items List with per-dish review buttons */}
        <div className="p-4 space-y-3">
          {order.items.filter(item => item.type !== 'location_meta' && item.type !== 'metadata' && item.id !== '__contact_info' && item.id !== '__location' && item.id !== '__cancel_reason' && item.id !== '__special_instructions').map((item, i) => {
            const isNonVeg = item.tags?.some(t => t.toLowerCase() === 'non-veg' || t.toLowerCase() === 'non veg');
            const iconColor = isNonVeg ? '#E23744' : '#22c55e';
            const itemRating = reviewedItems[item.id] || reviewedItems['order'] || 0;
            const isItemReviewed = itemRating > 0;
            
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="shrink-0 mt-1 flex items-center justify-center w-3 h-3 rounded-sm border" style={{ borderColor: iconColor }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[14px] font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 flex-wrap">
                      <span>{(item.quantity || item.qty || 1)}x {item.name}</span>
                      {item.variantName && <span className="text-neutral-500 font-normal">({item.variantName})</span>}
                      {item.selectedCustomizations && item.selectedCustomizations.length > 0 && <span className="text-neutral-400 font-normal"> + {item.selectedCustomizations.map(c => c.name).join(', ')}</span>}
                      {(item.isFree || item.type === 'free_dish') && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 ml-1.5">
                          <Gift size={9} /> free
                        </span>
                      )}
                    </span>
                    {/* Show average rating for this dish */}
                    {item.id && <DishRatingBadge dishId={item.id} variant="inline" />}
                  </div>
                  {/* Customization tags */}
                  {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedCustomizations.map((c, ci) => (
                        <span key={ci} className="px-1.5 py-0.5 rounded-md text-[9px] font-bold" style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.18)' }}>
                          {c.name}{Number(c.price) > 0 ? ` +₹${Number(c.price).toFixed(0)}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Per-item review button removed per request */}
                </div>
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
            <button
              onClick={() => onShowBreakdown && onShowBreakdown(order)}
              className="text-[14px] font-bold text-neutral-900 dark:text-white flex items-center gap-0.5 hover:text-[#E23744] focus:outline-none transition-colors"
            >
              ₹{Number(order.total).toFixed(2)} &rsaquo;
            </button>
          </div>
          {isCancelled && cancelReason && (
            <div className="mt-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-[12px] font-bold text-red-400">Reason: <span className="font-semibold text-red-500">{cancelReason}</span></p>
            </div>
          )}
        </div>

        {/* Review Summary Footer */}
        {!isCancelled && orderReviewed && totalReviewed > 0 && (
          <div className="mx-4 mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <Sparkles size={13} style={{ color: GOLD }} />
            <span className="text-xs font-bold" style={{ color: GOLD }}>
              {totalReviewed}/{totalItems} {totalReviewed === 1 ? 'dish' : 'dishes'} reviewed — Thank you!
            </span>
          </div>
        )}

        {/* Prompt to review if not yet started */}
        {!isCancelled && !orderReviewed && (
          <div className="px-4 pb-4">
            <button
              onClick={() => setReviewingDish({ id: 'order', name: 'Your Order' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-transform active:scale-[0.98]"
              style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <Sparkles size={14} style={{ color: GOLD }} />
              <div className="flex-1">
                <p className="text-[12px] font-bold" style={{ color: GOLD }}>Rate your dishes with AI!</p>
                <p className="text-[11px] text-neutral-500">Tap here to share your feedback</p>
              </div>
            </button>
          </div>
        )}
      </motion.div>

      {/* AI Dish Review Modal */}
      <AnimatePresence>
        {reviewingDish && (
          <DishReviewModal
            dish={reviewingDish}
            order={order}
            initialRating={reviewedItems[reviewingDish?.id] || 0}
            dinerName={user?.name || 'Anonymous Diner'}
            onClose={() => setReviewingDish(null)}
            onSubmit={handleItemReviewSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
}
// Active Order Card (Legacy UI)
function ActiveOrderCard({ order, restaurantName, getOrderNumber, formattedDate, formattedTime, tableNumber, cardStyleClass, t, onShowBreakdown }) {
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
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider bg-neutral-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
          {order.orderType === 'delivery' ? 'DELIVERY' : order.orderType === 'prepaid' ? 'Pre-Order' : 'Dine-In'}
        </span>
      </div>

      {/* Pending Verification */}
      {order.status === 'Pending Verification' && (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={`mt-4 rounded-3xl p-5 ${cardStyleClass}`}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <ShieldCheck size={24} style={{ color: GOLD }} />
            </div>
            {order.verificationCode ? (
              <>
                <p className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>Verification Code</p>
                <p className="text-4xl font-black tracking-[0.4em] font-mono mb-2 text-center" style={{ color: GOLD }}>{order.verificationCode}</p>
                <p className="text-sm text-neutral-500 text-center">Show this code to the waiter to confirm your table.</p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>Awaiting Confirmation</p>
                <p className="text-sm text-neutral-500 text-center mt-2">The restaurant is reviewing your order. No code is required.</p>
              </>
            )}
        </motion.div>
      )}

      {/* Cancelled */}
      {order.status === 'Cancelled' && (() => {
        const reason = order.metadata?.cancelReason ||
          order.items?.find(i => i.id === '__cancel_reason')?.reason || null;
        return (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="mb-4 mt-4">
            <div className="rounded-2xl p-4 flex items-start gap-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <XCircle size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-400">Order Cancelled</p>
                {reason ? (
                  <p className="text-xs text-neutral-400 mt-1"><span className="font-bold text-neutral-500">Reason: </span>{reason}</p>
                ) : (
                  <p className="text-xs text-neutral-500">This order was cancelled by the restaurant.</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}

      <OrderTimeline currentStatus={order.status} orderType={order.orderType} />

      {/* Items list */}
      <div className="rounded-2xl p-4 mb-4 mt-2" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
        <ul className="text-sm font-medium space-y-2 text-neutral-600 dark:text-neutral-300">
          {order.items.filter(item => item.type !== 'location_meta' && item.type !== 'metadata' && item.id !== '__contact_info' && item.id !== '__location' && item.id !== '__cancel_reason' && item.id !== '__special_instructions').map((item, i) => (
            <li key={i} className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                                <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                  <span>{(item.quantity || item.qty || 1)}x {item.name}</span>
                  {(item.isFree || item.type === 'free_dish') && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 ml-1.5">
                      <Gift size={9} /> free
                    </span>
                  )}
                </span>
                {item.variantName && (
                  <div className="text-xs font-bold text-[#D4AF37]">{item.variantName}</div>
                )}
                {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.selectedCustomizations.map((c, ci) => (
                      <span key={ci} className="px-1.5 py-0.5 rounded-md text-[9px] font-bold" style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.18)' }}>
                        {c.name}{Number(c.price) > 0 ? ` +₹${Number(c.price).toFixed(0)}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="font-bold ml-2 shrink-0" style={{ color: GOLD }}>₹{Number(item.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Call Waiter / Ask Bill — only for dine-in orders */}
      {order.orderType !== 'delivery' && order.orderType === 'dine_in' && order.status !== 'Cancelled' && (
        <div className="flex gap-3 mb-4">
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
            className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.25)', color: GOLD }}
          >
            <Bell size={15}/> Call Waiter
          </button>
          
          {order.paymentStatus === 'Unpaid' && (
            <button
              onClick={async () => {
                try {
                  await import('../services/supabase').then(({ supabase }) => {
                    if (supabase) {
                      supabase.channel('service-requests').send({
                        type: 'broadcast', event: 'bill_request',
                        payload: { tableNumber: tableNumber || '12', type: 'Bill Request', orderId: order.id, time: new Date().toISOString() }
                      });
                    }
                  });
                  const btn = document.getElementById(`ask-bill-${order.id}`);
                  if (btn) {
                    btn.textContent = '✔ Bill Requested!';
                    setTimeout(() => { btn.textContent = 'Ask for Bill'; }, 3000);
                  }
                } catch(e) { console.error(e); }
              }}
              id={`ask-bill-${order.id}`}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            >
              <Store size={15}/> Ask for Bill
            </button>
          )}
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-center pt-3 mt-1" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <button
          onClick={() => onShowBreakdown && onShowBreakdown(order)}
          className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-1 hover:text-[#D4AF37] focus:outline-none transition-colors"
        >
          Total: <span style={{ color: GOLD }}>₹{Number(order.total).toFixed(2)}</span> &rsaquo;
        </button>
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
  const { orders, user, restaurants, dishes, tableNumber, setActiveRestId, isDataLoaded } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [breakdownOrder, setBreakdownOrder] = useState(null);

  // Seed per-dish rating store from all orders with reviews
  React.useEffect(() => {
    if (orders && orders.length > 0) {
      DishRatingStore.computeFromOrders(orders);
    }
  }, [orders]);

  const handleViewMenu = (restId) => {
    if (restId) {
      setActiveRestId(restId);
      navigate('/menu');
    }
  };

  const handleSubmitReview = async (orderId, restId, rating, reviewText, dishId) => {
    const dinerName = user?.name || 'Anonymous Diner';
    // Record per-dish rating for the rating badge system
    if (dishId) {
      DishRatingStore.recordRating(dishId, rating, restId);
    }
    await reviewService.submitReview({
      orderId,
      restId,
      dinerName,
      rating,
      reviewText
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
        {/* Loading skeleton — shown until orders data arrives */}
        {!isDataLoaded && (
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        )}

        {isDataLoaded && myOrders.length === 0 && (
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

            if (order.status === 'Completed' || order.status === 'Cancelled' || order.status === 'Delivered') {
              return (
                <div key={order.id}>
                  <ZomatoStyleOrderCard
                    order={order}
                    restaurant={rest}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    onViewMenu={handleViewMenu}
                    onSubmitReview={handleSubmitReview}
                    dishes={dishes}
                    user={user}
                    onShowBreakdown={setBreakdownOrder}
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
                  onShowBreakdown={setBreakdownOrder}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {breakdownOrder && (() => {
          const rest = restaurants.find(r => r.id === (breakdownOrder.restId || breakdownOrder.rest_id) || r.id === breakdownOrder.rest_id);
          return (
            <OrderBreakdownModal
              order={breakdownOrder}
              restaurant={rest}
              dishes={dishes}
              onClose={() => setBreakdownOrder(null)}
            />
          );
        })()}
      </AnimatePresence>

      <BottomNav />
    </motion.div>
  );
}

/**
 * OrderBreakdownModal
 * Displays detailed cost breakdown for an order: items, subtotals, convenience/delivery fees, taxes.
 */
function OrderBreakdownModal({ order, restaurant, dishes, onClose }) {
  const isDelivery = order.orderType === 'delivery';
  
  // Get food items
  const foodItems = useMemo(() => {
    return (order.items || []).filter(item => 
      item.type !== 'location_meta' && 
      item.type !== 'metadata' && 
      item.id !== '__contact_info' && 
      item.id !== '__location' && 
      item.id !== '__cancel_reason' && 
      item.id !== '__special_instructions'
    );
  }, [order.items]);

  // Group items by unique group ID (id + variantName + customizations)
  const groupedItems = useMemo(() => {
    return Object.values(foodItems.reduce((acc, item) => {
      const variantName = item.variantName || item.selectedVariant?.name || '';
      const custId = item.customizationId || (item.selectedCustomizations ? JSON.stringify(item.selectedCustomizations.map(c => c.id).sort()) : '');
      const groupId = item.id + (variantName ? '-' + variantName : '') + (custId ? '-' + custId : '');
      
      if (!acc[groupId]) {
        acc[groupId] = { 
          ...item, 
          quantity: 0, 
          variantName: variantName,
          price: Number(item.price || 0) 
        };
      }
      acc[groupId].quantity += (Number(item.quantity) || Number(item.qty) || 1);
      return acc;
    }, {}));
  }, [foodItems]);

  // Compute Subtotal
  const subtotal = useMemo(() => {
    return foodItems.reduce((sum, item) => sum + (Number(item.price || 0) * (Number(item.quantity) || Number(item.qty) || 1)), 0);
  }, [foodItems]);

  // Compute Tax Rate & Tax Amount
  const taxRate = useMemo(() => {
    const rate = restaurant?.taxRate !== undefined 
      ? restaurant.taxRate 
      : (restaurant?.tax_rate !== undefined ? restaurant.tax_rate : 8); // default 8%
    return rate / 100;
  }, [restaurant]);

  const taxAmount = subtotal * taxRate;

  // Compute Delivery Fees
  const deliveryConfig = restaurant?.macros?.deliveryConfig || {};
  
  const deliveryFee = isDelivery
    ? (order.metadata?.deliveryFee !== undefined ? Number(order.metadata.deliveryFee) : (Number(deliveryConfig.deliveryFee) || 0))
    : 0;
    
  const convenienceFee = isDelivery
    ? (order.metadata?.convenienceFee !== undefined ? Number(order.metadata.convenienceFee) : (Number(deliveryConfig.convenienceFee) || 0))
    : 0;
    
  const otherFees = useMemo(() => {
    return isDelivery
      ? (order.metadata?.otherFees || deliveryConfig.otherFees || [])
      : [];
  }, [isDelivery, order.metadata?.otherFees, deliveryConfig.otherFees]);


  const total = Number(order.total || 0);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="bg-white dark:bg-[#0f0f14] w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-neutral-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-white/5 shrink-0">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
          
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                  <Receipt size={12} className="text-[#D4AF37]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Payment Summary</span>
              </div>
              <h3 className="font-display font-black text-lg text-neutral-900 dark:text-white leading-tight truncate">
                {restaurant?.name || 'Restaurant'}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Order Total Breakdown</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/8 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors"
            >
              <X size={15} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4 no-scrollbar">
          {/* Grouped Dishes */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Items Ordered</p>
            <div className="bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-2xl p-4 divide-y divide-neutral-100 dark:divide-white/5">
              {groupedItems.map((item, index) => {
                const itemTotal = item.price * item.quantity;
                const isFree = item.isFree || item.type === 'free_dish';
                return (
                  <div key={index} className={`flex justify-between items-start py-2.5 ${index === 0 ? 'pt-0' : ''} ${index === groupedItems.length - 1 ? 'pb-0' : ''}`}>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                          {item.quantity}x {item.name}
                        </span>
                        {isFree && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                            <Gift size={8} /> free
                          </span>
                        )}
                      </div>
                      {item.variantName && (
                        <p className="text-xs font-bold text-[#D4AF37] mt-0.5">{item.variantName}</p>
                      )}
                      {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedCustomizations.map((c, ci) => (
                            <span key={ci} className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#D4AF37]/5 text-[#D4AF37] border border-[#D4AF37]/15">
                              {c.name}{Number(c.price) > 0 ? ` +₹${Number(c.price).toFixed(2)}` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {isFree ? (
                        <span className="font-black text-sm text-emerald-500">FREE</span>
                      ) : (
                        <>
                          <p className="font-bold text-sm text-neutral-900 dark:text-white">₹{itemTotal.toFixed(2)}</p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-neutral-400 mt-0.5">₹{item.price.toFixed(2)} each</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Breakdown Rows */}
          <div className="space-y-2.5 pt-2">
            <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Charges Summary</p>
            <div className="bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-2xl p-4 space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
                <span>Tax ({Math.round(taxRate * 100)}%)</span>
                <span className="font-bold text-neutral-900 dark:text-white">₹{taxAmount.toFixed(2)}</span>
              </div>
              
              {isDelivery && (
                <>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
                      <span className="flex items-center gap-1"><Truck size={13}/>Delivery Fee</span>
                      <span className="font-bold text-neutral-900 dark:text-white">₹{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {convenienceFee > 0 && (
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
                      <span>Convenience Fee</span>
                      <span className="font-bold text-neutral-900 dark:text-white">₹{convenienceFee.toFixed(2)}</span>
                    </div>
                  )}
                  {otherFees.map((f, fi) => Number(f.amount) > 0 && (
                    <div key={fi} className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
                      <span>{f.label || 'Other Fee'}</span>
                      <span className="font-bold text-neutral-900 dark:text-white">₹{Number(f.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}

              <div className="border-t border-neutral-200 dark:border-white/10 pt-3 flex justify-between items-center text-base font-black text-neutral-900 dark:text-white font-display">
                <span>Total Amount Paid</span>
                <span className="text-[#D4AF37] text-lg">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="p-6 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-black/20 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-display font-black text-base text-black transition-opacity hover:opacity-90 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)', boxShadow: '0 8px 24px rgba(212, 175, 87, 0.2)' }}
          >
            Close Breakdown
          </button>
        </div>
      </motion.div>
    </div>
  );
}
