import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, MapPin, Clock, Smartphone, CreditCard, Flame, Droplets, Leaf, CheckCircle2, User, Phone, Store, Trash2, Plus, Minus, Zap, Box, Sparkles, X, Users, Share2, SplitSquareHorizontal } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { supabase } from '../services/supabase';

const STEPS = ['cart', 'type', 'details', 'pay', 'success'];
const STEP_LABELS = ['Order', 'Dining', 'Details', 'Payment'];

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, setCart, placeOrder, activeRestId, restaurants, planFor, dishes, addToCart, removeOneFromCart } = useAppContext();
  const { t } = useTranslation();

  const currentRestaurant = restaurants.find(r => r.id === activeRestId);
  const taxRate = currentRestaurant?.taxRate !== undefined ? currentRestaurant.taxRate / 100 : 0.08;
  
  useEffect(() => {
    if (!activeRestId) navigate('/scanner', { replace: true });
  }, [activeRestId, navigate]);

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const total = subtotal * (1 + taxRate);
  
  const groupedCart = Object.values(cart.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = { ...item, quantity: 0, cartIds: [] };
    }
    acc[item.id].quantity += 1;
    acc[item.id].cartIds.push(item.cartId);
    if (!acc[item.id].specialInstructions && item.specialInstructions) {
        acc[item.id].specialInstructions = item.specialInstructions;
    }
    return acc;
  }, {}));

  const [step, setStep] = useState(() => sessionStorage.getItem('cart_step') || 'cart');
  const [orderConf, setOrderConf] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('cart_orderConf')) || { type: 'dine_in', time: '19:30', method: 'Card' }; }
    catch { return { type: 'dine_in', time: '19:30', method: 'Card' }; }
  });
  const [contactDetails, setContactDetails] = useState({ name: '', phone: '' });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tipPct, setTipPct] = useState(0.15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showArCombo, setShowArCombo] = useState(false);

  const hasSoldOutItem = cart.some(item => {
    const dbDish = dishes.find(d => d.id === item.id);
    return dbDish?.tags?.includes('sold_out');
  });

  // ── Subscription plan gate ──
  const PLANS = ['Starter', 'Pro', 'Enterprise'];
  const restaurantPlan = planFor ? planFor(activeRestId) : 'Starter';
  const hasEnterprise = PLANS.indexOf(restaurantPlan) >= PLANS.indexOf('Enterprise');

  const cartWithModels = hasEnterprise ? cart.filter(c => c.modelUrl || c.model_url) : [];

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && step === 'auth') {
        sessionStorage.removeItem('cart_step');
        sessionStorage.removeItem('cart_orderConf');
        setStep('details');
      }
    };
    checkSession();
  }, [step]);

  const totalMacros = cart.reduce((acc, item) => {
    if (item.macros) {
      acc.calories += parseInt(item.macros.calories) || 0;
      acc.protein += parseInt(item.macros.protein) || 0;
      acc.carbs += parseInt(item.macros.carbs) || 0;
      acc.fat += parseInt(item.macros.fat) || 0;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center pb-20 bg-white dark:bg-black text-neutral-900 dark:text-pearl font-sans">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-white/5 border border-neutral-200 dark:border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
            <ShoppingCart size={36} className="text-neutral-500" />
          </div>
          <p className="font-display font-black text-2xl text-neutral-900 dark:text-white mb-2">Cart is empty</p>
          <p className="text-neutral-500 text-sm mb-8">Ready to explore the interactive menu?</p>
          <button onClick={() => navigate('/menu')}
            className="font-sans font-bold px-8 py-4 rounded-2xl transition-all bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-neutral-900 dark:text-white shadow-[0_10px_30px_rgba(212,175,55,0.3)] ">
            Browse Menu
          </button>
        </motion.div>
        <BottomNav/>
      </div>
    );
  }

  const finalTotal = total + (total * tipPct);

  const executeCheckout = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const status = orderConf.type === 'dine_in' ? 'Pending Verification' : 'Scheduled';
    const paymentStatus = orderConf.type === 'dine_in' && orderConf.method === 'Cash' ? 'Unpaid' : 'Paid';
    
    const success = await placeOrder({ 
      orderType: orderConf.type, 
      scheduledTime: orderConf.type === 'prepaid' ? orderConf.time : null,
      paymentMethod: orderConf.method,
      paymentStatus: paymentStatus,
      status: status,
      tipAmount: total * tipPct,
      verificationCode: orderConf.type === 'dine_in' ? code : null,
      contactName: contactDetails.name,
      contactPhone: contactDetails.phone,
      specialInstructions: specialInstructions
    });
    
    setIsProcessing(false);
    if (success) {
      sessionStorage.removeItem('cart_step');
      sessionStorage.removeItem('cart_orderConf');
      setCart([]); // Clear cart upon success visually immediately
      if (orderConf.type === 'prepaid') {
        setStep('success');
      } else {
        navigate('/orders');
      }
    }
  };

  const handleNext = async () => {
    if (step === 'cart') setStep('type');
    else if (step === 'type') {
      if (orderConf.type === 'dine_in') setStep('pay');
      else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) setStep('details');
        else setStep('auth');
      }
    } else if (step === 'details') {
      if (!contactDetails.name || !contactDetails.phone) { alert('Please fill in your contact details.'); return; }
      setStep('pay');
    } else if (step === 'pay') {
      executeCheckout();
    }
  };

  const handleBack = () => {
    if (step === 'cart') navigate(-1);
    else if (step === 'type') setStep('cart');
    else if (step === 'auth') setStep('type');
    else if (step === 'details') setStep('type');
    else if (step === 'pay') setStep(orderConf.type === 'dine_in' ? 'type' : 'details');
    else if (step === 'success') navigate('/orders');
  };

  const currentStepIdx = STEPS.indexOf(step);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-[100dvh] bg-white dark:bg-black text-neutral-900 dark:text-pearl font-sans relative">
      
      {/* SaaS Grid Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <div className="p-6 pt-14 sticky top-0 z-20 bg-white dark:bg-black/80 backdrop-blur-xl border-b border-neutral-200 dark:border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-white/10">
            <ChevronLeft size={20} className="text-neutral-900 dark:text-white" />
          </button>
          <h1 className="text-2xl font-display font-black text-neutral-900 dark:text-white tracking-tight">Checkout</h1>
        </div>
        
        {/* Modern Stepper */}
        {step !== 'auth' && step !== 'success' && (
          <div className="flex justify-between items-center px-2">
            {STEP_LABELS.map((label, idx) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    currentStepIdx >= idx ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'bg-white/10 border border-neutral-200 dark:border-white/20'
                  }`} />
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${currentStepIdx >= idx ? 'text-neutral-900 dark:text-white' : 'text-neutral-600'}`}>{label}</span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className="flex-1 h-px bg-white/5 mx-2 relative overflow-hidden">
                    <motion.div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C]"
                      initial={{ width: 0 }}
                      animate={{ width: currentStepIdx > idx ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-36 z-10 no-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* ── STEP: CART ── */}
          {step === 'cart' && (
            <motion.div key="cart" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">Your Order</h2>
              </div>
              
              {groupedCart.map((item) => (
                <motion.div layout key={item.id}
                  drag="x" dragConstraints={{ left: -80, right: 0 }}
                  onDragEnd={(e, info) => { if (info.offset.x < -50) setCart(cart.filter(c => c.id !== item.id)); }}
                  className="relative flex items-center bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-white/5 rounded-3xl p-4 shadow-md cursor-grab active:cursor-grabbing group">
                  
                  {/* Swipe to delete background indicator */}
                  <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-red-500/20 text-red-500 rounded-r-3xl border border-red-500/20 opacity-0 group-active:opacity-100 transition-opacity pointer-events-none">
                    <Trash2 size={20} />
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col bg-neutral-50 dark:bg-[#111] w-full rounded-3xl gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        {(item.cover || item.images?.[0]) ? (
                          <img src={item.cover || item.images[0]} className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 dark:border-white/10" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center"><ShoppingCart size={20} className="text-neutral-600"/></div>
                        )}
                        <div>
                          <h3 className="font-bold text-neutral-900 dark:text-white font-sans max-w-[150px] leading-tight mb-1">{item.name}</h3>
                          <div className="flex items-center gap-2">
                            {dishes.find(d => d.id === item.id)?.tags?.includes('sold_out') && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-[9px] uppercase tracking-wider">
                                Sold Out
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="font-black text-lg text-[#D4AF37]">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                        
                        {/* Stepper */}
                        <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg overflow-hidden">
                          <button onClick={(e) => { e.stopPropagation(); removeOneFromCart(item.id); }} className="px-2.5 py-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors">
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <span className="px-2 text-sm font-bold text-emerald-700 dark:text-emerald-300 w-6 text-center">{item.quantity}</span>
                          <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="px-2.5 py-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors">
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <input 
                      type="text" 
                      placeholder="Add note (e.g. no onions)" 
                      value={item.specialInstructions || ''}
                      onChange={(e) => {
                        const newCart = cart.map(c => c.id === item.id ? {...c, specialInstructions: e.target.value} : c);
                        setCart(newCart);
                      }}
                      className="w-full text-xs bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl p-2.5 focus:outline-none focus:border-[#D4AF37] transition-colors text-neutral-900 dark:text-white placeholder:text-neutral-500"
                    />
                  </div>
                </motion.div>
              ))}

              <p className="text-center text-xs text-neutral-500 py-2">Swipe items left to remove</p>

              <div className="mt-6 mb-6 pt-6 border-t border-neutral-200 dark:border-white/5">
                <h3 className="font-display font-bold text-neutral-900 dark:text-white text-sm mb-3">Special Instructions</h3>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. No onions, allergy to peanuts..."
                  className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-2xl p-4 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D4AF37]/40 transition-all min-h-[100px] resize-none"
                />
              </div>
              
              {/* AR Combo Builder Button */}
              {cartWithModels.length > 0 && (
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowArCombo(true)}
                  className="mt-2 w-full py-3.5 rounded-[2rem] border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex justify-center items-center gap-2 transition-all">
                  <Box size={18} /> View {cartWithModels.length} Item Combo in AR
                </motion.button>
              )}

              {/* Receipt Summary */}
              <div className="mt-4 bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400 text-sm mb-3"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400 text-sm mb-5 border-b border-neutral-200 dark:border-white/10 pb-5"><span>Tax ({Math.round(taxRate * 100)}%)</span><span>₹{(subtotal * taxRate).toFixed(2)}</span></div>
                <div className="text-2xl font-black flex justify-between text-neutral-900 dark:text-white font-display items-center">
                  <span>Total</span>
                  <span className="text-[#D4AF37] text-3xl">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP: TYPE ── */}
          {step === 'type' && (
            <motion.div key="type" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <h2 className="text-xl font-display font-bold mb-6">Dining Method</h2>
              
              <div onClick={() => setOrderConf({...orderConf, type: 'dine_in'})} 
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${orderConf.type === 'dine_in' ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_30px_rgba(212,175,55,0.15)]' : 'border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-[#111] hover:border-neutral-200 dark:border-white/10'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-2xl ${orderConf.type === 'dine_in' ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-neutral-900 dark:text-white shadow-lg' : 'bg-white/5 text-neutral-500'}`}><MapPin size={24} /></div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">Dine-In Now</h3>
                    <p className="text-[10px] text-accent-emerald font-black uppercase tracking-wider mt-1 bg-accent-emerald/10 inline-block px-2 py-0.5 rounded-md border border-accent-emerald/20">Direct to Kitchen</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Submit your order directly to the kitchen. We will generate a verification code for your waiter.</p>
              </div>

              <div onClick={() => setOrderConf({...orderConf, type: 'prepaid'})} 
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${orderConf.type === 'prepaid' ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_30px_rgba(212,175,55,0.15)]' : 'border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-[#111] hover:border-neutral-200 dark:border-white/10'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-2xl ${orderConf.type === 'prepaid' ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-neutral-900 dark:text-white shadow-lg' : 'bg-white/5 text-neutral-500'}`}><Clock size={24} /></div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">Schedule Pre-Order</h3>
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-wider mt-1 bg-orange-400/10 inline-block px-2 py-0.5 rounded-md border border-orange-400/20">Sign-in Required</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">Order ahead of time for pickup or reservation. Sign-in is required to verify identity.</p>
                
                <AnimatePresence>
                  {orderConf.type === 'prepaid' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">Pickup Time</label>
                      <input type="time" value={orderConf.time} onChange={e => setOrderConf({...orderConf, time: e.target.value})} 
                        className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-white/20 rounded-2xl p-4 text-neutral-900 dark:text-white font-bold text-lg focus:outline-none focus:border-[#D4AF37] shadow-inner" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
          
          {/* ── STEP: AUTH ── */}
          {step === 'auth' && (
            <motion.div key="auth" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col items-center justify-center py-10">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-[0_20px_40px_rgba(255,255,255,0.1)] border border-neutral-200 dark:border-white/20">
                <svg className="w-12 h-12" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-black text-center text-neutral-900 dark:text-white mb-2">Secure Verification</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-center text-sm px-4 leading-relaxed mb-10 max-w-[280px]">Please authenticate with Google to confirm your pre-order reservation.</p>
              
              <div className="w-full">
                <motion.button
                  disabled={googleLoading}
                  onClick={async () => {
                    setGoogleLoading(true);
                    sessionStorage.setItem('cart_step', 'details');
                    sessionStorage.setItem('cart_orderConf', JSON.stringify(orderConf));
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: { redirectTo: window.location.origin + '/cart' }
                    });
                    if (error) { alert(error.message); setGoogleLoading(false); }
                  }}
                  whileHover={{ scale: googleLoading ? 1 : 1.02 }} whileTap={{ scale: googleLoading ? 1 : 0.98 }}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-60 transition-all">
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>Continue with Google</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP: DETAILS ── */}
          {step === 'details' && (
            <motion.div key="details" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <h2 className="text-xl font-display font-bold mb-2">Contact Info</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Where should the vendor send your order updates?</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input type="text" value={contactDetails.name} onChange={e => setContactDetails({...contactDetails, name: e.target.value})} placeholder="John Doe" 
                      className="w-full bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#D4AF37] focus:bg-neutral-50 dark:bg-[#111]/50 transition-colors text-neutral-900 dark:text-white font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input type="tel" value={contactDetails.phone} onChange={e => setContactDetails({...contactDetails, phone: e.target.value})} placeholder="+1 (555) 000-0000" 
                      className="w-full bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#D4AF37] focus:bg-neutral-50 dark:bg-[#111]/50 transition-colors text-neutral-900 dark:text-white font-medium" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP: PAY ── */}
          {step === 'pay' && (
            <motion.div key="pay" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-5">
              
              {/* Modern Payment Selector */}
              <h2 className="text-xl font-display font-bold mb-4">Payment Method</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Modern Apple/Google Pay style buttons */}
                <button onClick={() => setOrderConf({...orderConf, method: 'Digital'})}
                  className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${orderConf.method === 'Digital' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#111]'}`}>
                  <Smartphone size={24} className={orderConf.method === 'Digital' ? 'text-[#D4AF37]' : 'text-neutral-500 dark:text-neutral-400'} />
                  <span className={`text-xs font-bold ${orderConf.method === 'Digital' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>Digital Wallet</span>
                </button>
                <button onClick={() => setOrderConf({...orderConf, method: 'Card'})}
                  className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${orderConf.method === 'Card' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#111]'}`}>
                  <CreditCard size={24} className={orderConf.method === 'Card' ? 'text-[#D4AF37]' : 'text-neutral-500 dark:text-neutral-400'} />
                  <span className={`text-xs font-bold ${orderConf.method === 'Card' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>Credit Card</span>
                </button>
              </div>

              <AnimatePresence>
                {orderConf.method === 'Card' && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} 
                      className="p-5 bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-white/10 rounded-[2rem] space-y-4 mb-6">
                      <input type="text" placeholder="Card Number" className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-xl p-4 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-neutral-900 dark:text-white" />
                      <div className="flex gap-4">
                        <input type="text" placeholder="MM/YY" className="w-1/2 bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-xl p-4 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-neutral-900 dark:text-white" />
                        <input type="text" placeholder="CVV" className="w-1/2 bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-xl p-4 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-neutral-900 dark:text-white" />
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>

              {/* Tip Selector */}
              <div className="pt-6 border-t border-neutral-200 dark:border-white/5">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Add a tip for the team?</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 0.15, 0.20, 0.25].map(pct => (
                    <button key={pct} onClick={() => setTipPct(pct)}
                      className={`py-3 rounded-xl font-black text-sm border-2 transition-all ${tipPct === pct ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] border-[#D4AF37] text-neutral-900 dark:text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-neutral-50 dark:bg-[#111] text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-white/5 hover:border-neutral-200 dark:border-white/10'}`}>
                      {pct === 0 ? 'No Tip' : `${pct * 100}%`}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && (
             <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center pt-10">
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                 className="w-24 h-24 rounded-full flex items-center justify-center mb-8 bg-accent-emerald/20 border border-accent-emerald/30 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                 <CheckCircle2 size={48} className="text-accent-emerald" />
               </motion.div>
               <h2 className="text-3xl font-display font-black text-neutral-900 dark:text-white mb-2">Order Confirmed!</h2>
               <p className="text-neutral-500 dark:text-neutral-400 font-sans text-sm mb-10">Your pre-order has been securely transmitted to the kitchen.</p>
               
               <div className="rounded-[2rem] p-6 w-full max-w-sm text-left bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-white/10">
                 <h3 className="font-sans font-bold text-sm mb-5 flex items-center gap-2 text-neutral-900 dark:text-white">
                   <Store size={16} className="text-[#D4AF37]" /> Vendor Contact
                 </h3>
                 <div className="space-y-4">
                   <p className="text-sm font-sans flex items-center gap-3 text-neutral-600 dark:text-neutral-300"><MapPin size={16} className="text-neutral-500" />{currentRestaurant?.name}</p>
                   <p className="text-sm font-sans flex items-center gap-3 text-neutral-600 dark:text-neutral-300"><Phone size={16} className="text-neutral-500" />{currentRestaurant?.phone || '+1 (555) 123-4567'}</p>
                   <p className="text-sm font-sans flex items-center gap-3 text-neutral-600 dark:text-neutral-300"><User size={16} className="text-neutral-500" />contact@vendor.com</p>
                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showArCombo && cartWithModels.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-md">
             <button onClick={() => setShowArCombo(false)} className="absolute top-6 right-6 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors">
               <X size={24}/>
             </button>
             <h2 className="text-white font-display font-black text-2xl mb-2 flex items-center gap-2">
               <Sparkles className="text-purple-400"/> AR Combo View
             </h2>
             <p className="text-neutral-400 text-sm mb-6 text-center max-w-[250px]">Previewing {cartWithModels.length} items from your cart together.</p>
             
             <div className="w-full max-w-md h-[50vh] bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl">
                <model-viewer
                  src={cartWithModels[0].modelUrl || cartWithModels[0].model_url}
                  auto-rotate
                  camera-controls
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl p-3 flex justify-between items-center border border-white/10">
                  <span className="text-white text-xs font-bold truncate max-w-[70%]">{cartWithModels.map(c => c.name).join(', ')}</span>
                  <Box size={16} className="text-purple-400"/>
                </div>
             </div>
             
             <button onClick={() => {
                const mv = document.querySelector('model-viewer');
                if(mv && mv.activateAR) mv.activateAR();
             }}
             className="mt-6 w-full max-w-md py-4 rounded-2xl font-black bg-white text-black shadow-lg">
               Launch AR Mode
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button Footer */}
      {step !== 'auth' && (
        <div className="fixed bottom-0 left-0 w-full p-6 pt-10 pb-8 z-30 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(9,10,15,1) 30%, rgba(9,10,15,0.8) 70%, transparent 100%)' }}>
          
          <div className="pointer-events-auto flex flex-col gap-3">
            {step === 'cart' && (
              <motion.button 
                disabled={hasSoldOutItem}
                whileHover={hasSoldOutItem ? undefined : { scale: 1.02 }} 
                whileTap={hasSoldOutItem ? undefined : { scale: 0.98 }} 
                onClick={handleNext}
                className={`w-full font-sans font-black py-5 rounded-2xl transition-all ${
                  hasSoldOutItem 
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-300 dark:border-neutral-700' 
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-neutral-900 dark:text-white shadow-[0_10px_30px_rgba(212,175,55,0.3)]'
                }`}
              >
                {hasSoldOutItem ? 'Remove Sold Out Items to Proceed' : 'Proceed to Checkout'}
              </motion.button>
            )}
            {step === 'type' && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext}
                className="w-full font-sans font-black py-5 rounded-2xl transition-all bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-neutral-900 dark:text-white shadow-[0_10px_30px_rgba(212,175,55,0.3)]">
                {orderConf.type === 'dine_in' ? 'Continue to Payment' : 'Verify & Continue'}
              </motion.button>
            )}
            {step === 'details' && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext}
                className="w-full font-sans font-black py-5 rounded-2xl transition-all bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-neutral-900 dark:text-white shadow-[0_10px_30px_rgba(212,175,55,0.3)]">
                Continue to Payment
              </motion.button>
            )}
            {step === 'pay' && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isProcessing} onClick={handleNext}
                className="w-full font-sans font-black py-5 rounded-2xl flex justify-center items-center gap-3 transition-all bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-neutral-900 dark:text-white shadow-[0_10px_30px_rgba(212,175,55,0.3)] disabled:opacity-70">
                {isProcessing ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 1 }} className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white" /> Processing...</>
                ) : (
                  <>Authorize ₹{finalTotal.toFixed(2)}</>
                )}
              </motion.button>
            )}
            {step === 'success' && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBack}
                className="w-full font-sans font-black py-5 rounded-2xl transition-all bg-white text-midnight-900 shadow-[0_10px_30px_rgba(255,255,255,0.2)] mt-8">
                View Receipt
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Hide Bottom Nav during checkout steps (only show on Cart/Success or modify as needed) */}
      {step === 'cart' && <BottomNav />}
    </motion.div>
  );
}
