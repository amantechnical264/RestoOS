import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import i18n from '../locales/i18n';
import { supabase } from '../services/supabase';

const AppContext = createContext();

const mapOrder = (o) => ({
  ...o,
  restId: o.rest_id || o.restId,
  orderType: o.order_type || o.orderType,
  verificationCode: o.verification_code || o.verificationCode,
  contactName: o.contact_name || o.contactName,
  contactPhone: o.contact_phone || o.contactPhone,
  paymentStatus: o.payment_status || o.paymentStatus,
  paymentMethod: o.payment_method || o.paymentMethod,
  scheduledTime: o.scheduled_time || o.scheduledTime,
  tipAmount: o.tip_amount || o.tipAmount,
  tableNumber: o.table_number || o.tableNumber,
});

const mapDish = (d) => ({
  ...d,
  cover: d.macros?.cover || d.cover || '',
  images: d.macros?.images || d.images || [],
  modelUrl: d.model_url || d.modelUrl,
  restId: d.rest_id || d.restId
});

// Fast comparison using IDs + count instead of full JSON serialization
const fastArrayEquals = (prev, next) => {
  if (prev.length !== next.length) return false;
  if (prev.length === 0 && next.length === 0) return true;
  // Compare by IDs and a few key fields rather than full JSON
  for (let i = 0; i < next.length; i++) {
    if (prev[i]?.id !== next[i]?.id) return false;
  }
  // Quick hash: check first, last, and middle item for field changes
  const checkIdx = [0, Math.floor(next.length / 2), next.length - 1];
  for (const idx of checkIdx) {
    const p = prev[idx];
    const n = next[idx];
    if (!p || !n) return false;
    if (p.status !== n.status || p.name !== n.name || p.price !== n.price || p.total !== n.total) return false;
    // Check cover/model_url for dish image changes
    if (p.cover !== n.cover || p.model_url !== n.model_url) return false;
  }
  return true;
};

// Preload images into browser cache for instant rendering
const preloadImages = (urls) => {
  urls.forEach(url => {
    if (url && typeof url === 'string' && url.startsWith('http')) {
      const img = new Image();
      img.src = url;
    }
  });
};

// Timeout wrapper for fetch calls — never hang forever
const withTimeout = (promise, ms = 8000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms))
  ]);
};

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(() => {
    try {
      const cachedRestaurants = JSON.parse(localStorage.getItem('3dish_cached_restaurants') || '[]');
      const cachedDishes = JSON.parse(localStorage.getItem('3dish_cached_dishes') || '[]');
      return cachedRestaurants.length > 0 && cachedDishes.length > 0;
    } catch {
      return false;
    }
  });

  // Theme State
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('3dish_theme') || 'dark'; // Default to dark luxury
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('3dish_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Core State
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('3dish_user');
      if (savedUser) return JSON.parse(savedUser);
      
      const dinerProfile = localStorage.getItem('3dish_diner_profile');
      if (dinerProfile) {
        const parsed = JSON.parse(dinerProfile);
        return { name: parsed.name, phone: parsed.phone, role: 'diner', guestId: parsed.guestId };
      }
      return null;
    } catch {
      return null;
    }
  }); 
  const [activeRestId, setActiveRestIdState] = useState(() => sessionStorage.getItem('3dish_active_rest') || null);
  const [tableNumber, setTableNumberState] = useState(() => sessionStorage.getItem('3dish_table_number') || null);
  const [activeDishId, setActiveDishId] = useState(null);
  
  // Ref to track current user for use in subscription callbacks (avoids stale closures)
  const userRef = useRef(user);

  const setActiveRestId = (id) => {
    if (id) sessionStorage.setItem('3dish_active_rest', id);
    else sessionStorage.removeItem('3dish_active_rest');
    setActiveRestIdState(id);
  };

  const setTableNumber = (num) => {
    if (num) sessionStorage.setItem('3dish_table_number', num);
    else sessionStorage.removeItem('3dish_table_number');
    setTableNumberState(num);
  };
  
  // Persist user state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('3dish_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('3dish_user');
    }
    userRef.current = user; // Keep ref in sync for subscription callbacks
  }, [user]);
  
  // Data State
  const [restaurants, setRestaurants] = useState(() => {
    try { return JSON.parse(localStorage.getItem('3dish_cached_restaurants') || '[]'); } catch { return []; }
  });
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [dishes, setDishes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('3dish_cached_dishes') || '[]'); } catch { return []; }
  }); 
  const [serviceAlerts, setServiceAlerts] = useState([]);
  const [notification, setNotification] = useState(null);

  // ── Promos State ──────────────────────────────────────────────────
  const [promos, setPromos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('3dish_promos') || '{}'); } catch { return {}; }
  });

  const activatePromo = (restId, promo) => {
    setPromos(prev => {
      const next = { ...prev, [restId]: promo };
      localStorage.setItem('3dish_promos', JSON.stringify(next));
      return next;
    });
  };

  const ordersChannelRef = useRef(null);

  // ── Subscription Plan State ────────────────────────────────────────
  // Stored per restaurant: { [restId]: 'Starter' | 'Pro' | 'Enterprise' }
  const [plans, setPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem('3dish_plans') || '{}'); } catch { return {}; }
  });

  // Get plan for a given restaurant (defaults to 'Starter')
  const planFor = (restId) => plans[restId] || 'Starter';

  // Upgrade (or downgrade) a restaurant's plan
  const upgradePlan = (restId, newPlan) => {
    setPlans(prev => {
      const next = { ...prev, [restId]: newPlan };
      localStorage.setItem('3dish_plans', JSON.stringify(next));
      return next;
    });
  };
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('3dish_favorites') || '[]'); } catch { return []; }
  });
  const [nutritionHistory, setNutritionHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('3dish_nutrition_history') || '[]'); } catch { return []; }
  });
  const [userPreferences, setUserPreferences] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('3dish_preferences')) || {
        language: 'en',
        goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 }
      };
    } catch { 
      return { language: 'en', goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 } }; 
    }
  });

  const updatePreferences = (newPrefs) => {
    setUserPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem('3dish_preferences', JSON.stringify(updated));
      return updated;
    });
  };

  // 1. Auth Init
  useEffect(() => {
    if (!supabase) { 
      setIsInitializing(false); 
      return; 
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Session error:', error);
      }
      const session = data?.session;
      const u = session?.user || null;
      setSupabaseUser(u);
      if (u) {
        // Only assign vendor role if user doesn't already have a diner role
        setUser(prev => {
          if (prev?.role === 'diner') {
            // Diner signed in via Google for pre-order — keep diner role, just enrich
            return { ...prev, email: u?.email, uid: u?.id };
          }
          return { ...prev, email: u?.email, uid: u?.id, role: 'vendor' };
        });
      }
      setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setSupabaseUser(u);
      if (u) {
        setUser(prev => {
          if (prev?.role === 'diner') {
            return { ...prev, email: u.email, uid: u.id };
          }
          return { ...prev, email: u.email, uid: u.id, role: 'vendor' };
        });
      } else {
        setUser(prev => (prev?.role === 'vendor' ? null : prev));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync language on mount
  useEffect(() => {
    if (userPreferences?.language) {
      i18n.changeLanguage(userPreferences.language);
    }
  }, [userPreferences.language]);

  const showNotification = React.useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // 2. Real-time Sync — Robust data loading with timeout + error handling
  useEffect(() => {
    if (!supabase) {
      setIsDataLoaded(true); // Don't block UI if supabase is unavailable
      return;
    }
    
    let realtimeConnected = false;

    const fetchOrders = async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.from('orders').select('*').order('timestamp', { ascending: false })
        );
        if (error) { console.warn('Orders fetch error:', error.message); return; }
        if (data) {
          const mappedOrders = data.map(mapOrder);
          setOrders(prev => fastArrayEquals(prev, mappedOrders) ? prev : mappedOrders);
        }
      } catch (err) {
        console.warn('Orders fetch timeout/error:', err.message);
      }
    };
    
    const fetchDishes = async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.from('dishes').select('*')
        );
        if (error) { console.warn('Dishes fetch error:', error.message); return; }
        if (data) {
          const mapped = data.map(mapDish);
          setDishes(prev => {
            if (fastArrayEquals(prev, mapped)) return prev;
            // Cache to localStorage for instant next load
            try { localStorage.setItem('3dish_cached_dishes', JSON.stringify(mapped)); } catch {}
            return mapped;
          });
          // Preload first 10 dish images into browser cache
          const imageUrls = mapped.slice(0, 10).map(d => d.cover || d.images?.[0]).filter(Boolean);
          preloadImages(imageUrls);
        }
      } catch (err) {
        console.warn('Dishes fetch timeout/error:', err.message);
      }
    };

    const fetchRestaurants = async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.from('restaurants').select('id, vendor_id, name, cover, tax_rate, accept_cash, created_at')
        );
        if (error) { console.warn('Restaurants fetch error:', error.message); return; }
        if (data) {
          setRestaurants(prev => {
            const mapped = data.map(r => ({
              ...r,
              vendorId: r.vendor_id || r.vendorId,
              cover: r.cover || ''
            }));
            if (fastArrayEquals(prev, mapped)) return prev;
            // Store without cover to keep cache small; cover comes fresh from DB
            try {
              const cacheData = mapped.map(({ cover, ...rest }) => rest);
              localStorage.setItem('3dish_cached_restaurants', JSON.stringify(cacheData));
            } catch {}
            return mapped;
          });
        }
      } catch (err) {
        console.warn('Restaurants fetch timeout/error:', err.message);
      }
    };

    // Load data with guaranteed isDataLoaded=true (even on failure, show cached or empty)
    const loadAllData = async () => {
      try {
        await Promise.allSettled([fetchDishes(), fetchRestaurants()]);
      } catch {}
      setIsDataLoaded(true); // ALWAYS unblock the UI
      // Orders load in background, don't block UI
      fetchOrders();
    };
    loadAllData();

    // Real-time subscriptions
    const ordersSub = supabase.channel('custom-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        realtimeConnected = true;
        if (payload.eventType === 'INSERT') {
          const mapped = mapOrder(payload.new);
          setOrders(prev => {
            if (prev.some(o => o.id === mapped.id)) return prev;
            return [mapped, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const mapped = mapOrder(payload.new);
          setOrders(prev => prev.map(o => o.id === mapped.id ? mapped : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      }).subscribe((status) => { if (status === 'SUBSCRIBED') realtimeConnected = true; });
      
    const dishesSub = supabase.channel('custom-dishes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, (payload) => {
        realtimeConnected = true;
        if (payload.eventType === 'INSERT') {
          const mapped = mapDish(payload.new);
          setDishes(prev => {
            if (prev.some(d => d.id === mapped.id)) return prev;
            return [...prev, mapped];
          });
          // Preload new dish image
          if (mapped.cover) preloadImages([mapped.cover]);
        } else if (payload.eventType === 'UPDATE') {
          const mapped = mapDish(payload.new);
          setDishes(prev => prev.map(d => d.id === mapped.id ? mapped : d));
          if (mapped.cover) preloadImages([mapped.cover]);
        } else if (payload.eventType === 'DELETE') {
          setDishes(prev => prev.filter(d => d.id !== payload.old.id));
        }
      }).subscribe();

    const restSub = supabase.channel('custom-restaurants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, (payload) => {
        realtimeConnected = true;
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const r = payload.new;
          const mapped = {
            ...r,
            vendorId: r.vendor_id || r.vendorId,
            cover: r.cover || ''
          };
          setRestaurants(prev => {
            const exists = prev.some(item => item.id === mapped.id);
            const next = exists
              ? prev.map(item => item.id === mapped.id ? { ...item, ...mapped } : item)
              : [...prev, mapped];
            return next;
          });
        } else if (payload.eventType === 'DELETE') {
          setRestaurants(prev => prev.filter(r => r.id !== payload.old.id));
        }
      }).subscribe();
    
    // Smart polling: 30s fallback, only runs when page visible AND realtime is disconnected
    const pollInterval = setInterval(() => {
      if (document.hidden) return;
      // Always do a light refresh, but less frequently than before
      fetchOrders();
      // Only re-fetch dishes/restaurants if realtime seems disconnected
      if (!realtimeConnected) {
        fetchDishes();
        fetchRestaurants();
      }
    }, 30000);

    // Immediate re-fetch when user comes back to the tab (instant freshness)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOrders();
        fetchDishes();
        fetchRestaurants();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Broadcast channel for real-time order status updates (Vendor -> Customer)
    const ordersChannel = supabase.channel('orders-realtime', {
      config: { broadcast: { ack: false } }
    });

    ordersChannel
      .on('broadcast', { event: 'status-update' }, (payload) => {
        if (payload?.payload?.orderId && payload?.payload?.newStatus) {
          setOrders(prev => prev.map(o => o.id === payload.payload.orderId ? { ...o, status: payload.payload.newStatus } : o));
        }
      }).subscribe();
    
    ordersChannelRef.current = ordersChannel;

    // Broadcast channel for real-time service requests (Customer -> Vendor)
    const serviceChannel = supabase.channel('service-requests')
      .on('broadcast', { event: 'waiter_call' }, (payload) => {
        if (payload.payload) {
          setServiceAlerts(prev => [payload.payload, ...prev]);
          if (userRef.current?.role === 'vendor') {
            showNotification(`Table ${payload.payload.tableNumber} requested: ${payload.payload.type}`);
          }
        }
      }).subscribe();

    return () => { 
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(dishesSub);
      supabase.removeChannel(restSub);
      supabase.removeChannel(serviceChannel);
      if (ordersChannelRef.current) {
        supabase.removeChannel(ordersChannelRef.current);
      }
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [supabaseUser]);

  // Auto-set activeRestId for logged-in vendor on mount or when restaurants list updates
  useEffect(() => {
    if (supabaseUser && restaurants.length > 0 && !activeRestId) {
      const myRest = restaurants.find(r => r.vendorId === supabaseUser.id || r.vendor_id === supabaseUser.id);
      if (myRest) {
        setActiveRestId(myRest.id);
      }
    }
  }, [restaurants, supabaseUser, activeRestId]);

  // Audio Notification for Vendors
  const [prevOrdersCount, setPrevOrdersCount] = useState(0);
  useEffect(() => {
    if (orders.length > prevOrdersCount && prevOrdersCount > 0 && user?.role === 'vendor') {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log("Audio play blocked by browser:", e));
    }
    setPrevOrdersCount(orders.length);
  }, [orders.length, user, prevOrdersCount]);

  const addToCart = (dish) => {
    setCart(prev => [...prev, { ...dish, cartId: Date.now() }]);
    showNotification('Added to cart');
  };

  const removeOneFromCart = (dishId) => {
    setCart(prev => {
      const idx = prev.findLastIndex(item => item.id === dishId);
      if (idx === -1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  const toggleFavorite = (dishId) => {
    setFavorites(prev => {
      const next = prev.includes(dishId) ? prev.filter(id => id !== dishId) : [...prev, dishId];
      localStorage.setItem('3dish_favorites', JSON.stringify(next));
      return next;
    });
  };

  const saveNutritionRecord = (items, restName) => {
    const macros = items.reduce((acc, item) => {
      if (item.macros) {
        acc.calories += parseInt(item.macros.calories) || 0;
        acc.protein  += parseInt(item.macros.protein)  || 0;
        acc.carbs    += parseInt(item.macros.carbs)    || 0;
        acc.fat      += parseInt(item.macros.fat)      || 0;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const record = {
      date: new Date().toISOString(),
      restName,
      items: items.map(i => i.name),
      macros,
    };
    setNutritionHistory(prev => {
      const next = [record, ...prev].slice(0, 30);
      localStorage.setItem('3dish_nutrition_history', JSON.stringify(next));
      return next;
    });
  };

  const placeOrder = async (orderData) => {
    if (!supabase) {
      showNotification('Cloud connection required.');
      return false;
    }
    
    const rest = restaurants.find(r => r.id === activeRestId);
    const taxRate = rest?.tax_rate !== undefined ? rest.tax_rate / 100 : 0.08;

    const dinerProfile = JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}');
    const guestId = user?.uid || user?.id || user?.guestId || dinerProfile.guestId || user?.phone || dinerProfile.phone || 'anonymous';

    const newOrder = {
      user_id: guestId,
      rest_id: activeRestId,
      items: cart,
      total: cart.reduce((sum, item) => sum + Number(item.price), 0) * (1 + taxRate),
      status: orderData?.status || 'Pending',
      timestamp: new Date().toISOString(),
      table_number: parseInt(tableNumber) || (orderData?.tableNumber ? parseInt(orderData.tableNumber) : null),
    };

    // Merge extra fields from checkout flow (snake_case for Supabase)
    if (orderData?.orderType)         newOrder.order_type        = orderData.orderType;
    if (orderData?.paymentMethod)     newOrder.payment_method    = orderData.paymentMethod;
    if (orderData?.paymentStatus)     newOrder.payment_status    = orderData.paymentStatus;
    if (orderData?.verificationCode)  newOrder.verification_code = orderData.verificationCode;
    if (orderData?.contactName)       newOrder.contact_name      = orderData.contactName;
    if (orderData?.contactPhone)      newOrder.contact_phone     = orderData.contactPhone;
    if (orderData?.scheduledTime)     newOrder.scheduled_time    = orderData.scheduledTime;
    if (orderData?.tipAmount != null) newOrder.tip_amount        = orderData.tipAmount;
    if (orderData?.specialInstructions) newOrder.metadata = { specialInstructions: orderData.specialInstructions };

    try {
      const { error } = await supabase.from('orders').insert([newOrder]);
      if (error) {
        // If insert fails because extra columns don't exist in DB (e.g. metadata), retry without it
        if (error.message && (error.message.includes('column') || error.code === '42703')) {
          console.warn('Full insert failed, retrying without metadata:', error.message);
          const { metadata, ...orderWithoutMetadata } = newOrder;
          
          const { error: retryError } = await supabase.from('orders').insert([orderWithoutMetadata]);
          if (retryError) {
            console.warn('Retry without metadata failed, falling back to core fields only:', retryError.message);
            const coreOrder = {
              user_id: newOrder.user_id,
              rest_id: newOrder.rest_id,
              items: newOrder.items,
              total: newOrder.total,
              status: newOrder.status,
              timestamp: newOrder.timestamp,
            };
            const { error: coreError } = await supabase.from('orders').insert([coreOrder]);
            if (coreError) throw coreError;
          }
        } else {
          throw error;
        }
      }
      
      setCart([]);
      const restName = restaurants.find(r => r.id === activeRestId)?.name || 'Restaurant';
      saveNutritionRecord(cart, restName);
      showNotification('Order placed successfully!');
      return true;
    } catch (error) { 
      console.error('Place order error:', error);
      showNotification(`Failed to place order: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  const addRestaurant = async (restData) => {
    if (!supabaseUser) return null;
    
    const newRest = {
      vendor_id: supabaseUser.id,
      name: restData.name,
      cover: restData.cover
    };

    try {
      const { data, error } = await supabase.from('restaurants').insert([newRest]).select();
      if (error) throw error;
      return data[0].id;
    } catch (error) {
      console.error('Create restaurant error:', error);
      showNotification(`Failed to create restaurant: ${error.message || error.details || 'Unknown error'}`);
      return null;
    }
  };

  const updateRestaurant = async (restId, updateData) => {
    if (!supabaseUser) {
      showNotification('You must be logged in to update settings.');
      return;
    }
    if (!restId) {
      showNotification('No restaurant selected. Please complete onboarding first.');
      return;
    }
    try {
      const updatePayload = {};
      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.cover !== undefined) updatePayload.cover = updateData.cover;
      if (updateData.taxRate !== undefined) updatePayload.tax_rate = updateData.taxRate;
      if (updateData.acceptCash !== undefined) updatePayload.accept_cash = updateData.acceptCash;

      const { error } = await supabase.from('restaurants')
        .update(updatePayload)
        .eq('id', restId);
      if (error) throw error;
      
      // Update local state immediately to avoid waiting for polling
      setRestaurants(prev =>
        prev.map(r => r.id === restId ? { 
          ...r, 
          name: updateData.name !== undefined ? updateData.name : r.name,
          cover: updateData.cover !== undefined ? updateData.cover : r.cover,
          taxRate: updateData.taxRate !== undefined ? updateData.taxRate : r.taxRate,
          acceptCash: updateData.acceptCash !== undefined ? updateData.acceptCash : r.acceptCash,
        } : r)
      );
      
      showNotification('Settings updated successfully!');
    } catch (error) {
      console.error('Update restaurant error:', error);
      showNotification(`Failed to update settings: ${error.message}`);
    }
  };

  const addDish = async (dishData) => {
    if (!supabaseUser) {
      showNotification('You must be logged in to add a dish.');
      return null;
    }
    if (!dishData.restId) {
      showNotification('No restaurant selected. Please complete onboarding first.');
      return null;
    }
    try {
      const formattedDish = { 
        name: dishData.name,
        price: parseFloat(dishData.price) || 0,
        description: dishData.description || '',
        model_url: dishData.modelUrl || '',
        macros: { ...(dishData.macros || {}), cover: dishData.cover || '', images: dishData.images || [] },
        tags: dishData.tags || [],
        allergens: dishData.allergens || [],
        ingredients: dishData.ingredients || [],
        rest_id: dishData.restId
      };
      
      console.log('Inserting dish:', formattedDish);
      const { data, error } = await supabase.from('dishes').insert([formattedDish]).select();
      if (error) throw error;
      
      setDishes(prev => [...prev, {
        ...data[0],
        cover: data[0].macros?.cover || '',
        images: data[0].macros?.images || [],
        modelUrl: data[0].model_url || data[0].modelUrl,
        restId: data[0].rest_id || data[0].restId
      }]);
      showNotification('Dish saved successfully!');
      return data[0].id;
    } catch (error) {
      console.error('Save dish error:', error);
      showNotification(`Failed to save dish: ${error.message || error.details || 'Unknown error'}`);
      return null;
    }
  };

  const updateDish = async (dishId, updates) => {
    if (!supabaseUser) {
      showNotification('You must be logged in to update a dish.');
      return;
    }
    try {
      const dbUpdate = {};
      if (updates.name !== undefined) dbUpdate.name = updates.name;
      if (updates.price !== undefined) dbUpdate.price = parseFloat(updates.price) || 0;
      if (updates.description !== undefined) dbUpdate.description = updates.description;
      if (updates.model_url !== undefined) dbUpdate.model_url = updates.model_url;
      if (updates.modelUrl !== undefined) dbUpdate.model_url = updates.modelUrl;
      
      // Handle macros JSONB column for custom data (like cover, images)
      const currentDish = dishes.find(d => d.id === dishId);
      dbUpdate.macros = { ...(currentDish?.macros || {}) };
      if (updates.macros !== undefined) dbUpdate.macros = { ...dbUpdate.macros, ...updates.macros };
      if (updates.cover !== undefined) dbUpdate.macros.cover = updates.cover;
      if (updates.images !== undefined) dbUpdate.macros.images = updates.images;
      
      if (updates.tags !== undefined) dbUpdate.tags = updates.tags;
      if (updates.allergens !== undefined) dbUpdate.allergens = updates.allergens;
      if (updates.ingredients !== undefined) dbUpdate.ingredients = updates.ingredients;
      if (updates.restId !== undefined) dbUpdate.rest_id = updates.restId;
      if (updates.rest_id !== undefined) dbUpdate.rest_id = updates.rest_id;

      console.log('Updating dish:', dishId, dbUpdate);
      const { data, error } = await supabase.from('dishes').update(dbUpdate).eq('id', dishId).select();
      if (error) throw error;
      
      if (data && data[0]) {
        const mappedDish = {
          ...data[0],
          cover: data[0].macros?.cover || '',
          images: data[0].macros?.images || [],
          modelUrl: data[0].model_url || data[0].modelUrl,
          restId: data[0].rest_id || data[0].restId
        };
        setDishes(prev => prev.map(d => d.id === dishId ? mappedDish : d));
      }
      showNotification('Dish updated successfully.');
      return true;
    } catch (error) {
      console.error('Update dish error:', error);
      showNotification(`Failed to update dish: ${error.message}`);
      return null;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!supabase) return;
    
    // Optimistic UI update: instantly move the order to the new lane
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    // Broadcast status change immediately to all clients (including diner)
    if (ordersChannelRef.current) {
      ordersChannelRef.current.send({
        type: 'broadcast',
        event: 'status-update',
        payload: { orderId, newStatus },
      });
    }
    
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      showNotification(`Order moved to: ${newStatus}`);
    } catch (error) { 
      console.error(error);
      showNotification('Failed to update status.');
      
      // Revert change in case of failure
      const { data } = await supabase.from('orders').select('*').order('timestamp', { ascending: false });
      if (data) {
        const mapped = data.map(o => ({
          ...o,
          restId: o.rest_id || o.restId,
          orderType: o.order_type || o.orderType,
          verificationCode: o.verification_code || o.verificationCode,
          contactName: o.contact_name || o.contactName,
          contactPhone: o.contact_phone || o.contactPhone,
          paymentStatus: o.payment_status || o.paymentStatus,
          paymentMethod: o.payment_method || o.paymentMethod,
          scheduledTime: o.scheduled_time || o.scheduledTime,
          tipAmount: o.tip_amount || o.tipAmount,
          tableNumber: o.table_number || o.tableNumber,
        }));
        setOrders(mapped);
      }
    }
  };

  // Dynamically apply active promos to dishes
  const processedDishes = React.useMemo(() => {
    return dishes.map(dish => {
      const promo = promos[dish.restId];
      if (promo) {
        const isExpired = promo.expires && new Date(promo.expires + 'T23:59:59') < new Date();
        const appliesToDish = !promo.applicableDishes || promo.applicableDishes.length === 0 || promo.applicableDishes.includes(dish.id);
        
        if (!isExpired && appliesToDish && promo.discount > 0 && promo.discount <= 100) {
          const discountAmt = (dish.price * promo.discount) / 100;
          return { ...dish, originalPrice: dish.price, price: dish.price - discountAmt };
        }
      }
      return dish;
    });
  }, [dishes, promos]);

  const value = {
    supabaseUser,
    isInitializing,
    user, setUser,
    activeRestId, setActiveRestId,
    tableNumber, setTableNumber,
    activeDishId, setActiveDishId,
    restaurants, setRestaurants, addRestaurant, updateRestaurant,
    cart, setCart,
    orders, setOrders,
    dishes: processedDishes, setDishes, addDish, updateDish,
    promos, activatePromo,
    notification, showNotification,
    plans, planFor, upgradePlan,
    serviceAlerts, setServiceAlerts,
    addToCart, removeOneFromCart,
    placeOrder,
    updateOrderStatus,
    favorites, toggleFavorite,
    nutritionHistory, saveNutritionRecord,
    userPreferences, updatePreferences,
    theme, toggleTheme,
    isDataLoaded,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
