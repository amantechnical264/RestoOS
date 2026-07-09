import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Store, DollarSign, Activity, LogOut, Search, Star, Zap, Crown, Power, PowerOff } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Security: Check SessionStorage token
    if (sessionStorage.getItem('3dish_sys_admin_token') !== 'secure_granted_session') {
      navigate('/hq-portal', { replace: true });
      return;
    }
    fetchPlatformData();
  }, [navigate]);

  const fetchPlatformData = async () => {
    try {
      // 1. Fetch all restaurants
      const { data: restData, error: restError } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
      if (restError) throw restError;
      
      // 2. Fetch all orders for revenue calculation
      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('total');
      if (ordersError) throw ordersError;
      
      setRestaurants(restData || []);
      setTotalOrders(ordersData?.length || 0);
      
      const rev = (ordersData || []).reduce((sum, order) => sum + (Number(order.total) || 0), 0);
      setTotalRevenue(rev);
      
    } catch (error) {
      console.error("Admin fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('3dish_sys_admin_token');
    navigate('/hq-portal', { replace: true });
  };

  // SaaS Features: Securely modify restaurant configuration inside `macros` JSON
  const updateRestaurantMacro = async (restId, key, value) => {
    const rest = restaurants.find(r => r.id === restId);
    if (!rest) return;

    // Default existing macros or empty object
    const currentMacros = rest.macros || {};
    const newMacros = { ...currentMacros, [key]: value };

    // Optimistic UI Update
    setRestaurants(prev => prev.map(r => r.id === restId ? { ...r, macros: newMacros } : r));

    try {
      const { error } = await supabase.from('restaurants').update({ macros: newMacros }).eq('id', restId);
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Failed to update vendor settings:", err);
      // Revert on failure
      fetchPlatformData();
      alert("Error updating vendor settings: " + err.message);
    }
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.vendor_id || r.vendorId || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05020a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05020a] text-white font-sans selection:bg-purple-500/30">
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 bg-[#0a0514]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Shield size={20} className="text-purple-500" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl leading-tight">System Terminal</h1>
            <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">HQ Access Granted</p>
          </div>
        </div>
        
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-colors">
          <LogOut size={16} /> Terminate Session
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><DollarSign size={64}/></div>
            <p className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-2">Platform Vol.</p>
            <p className="text-3xl font-serif font-bold text-purple-100">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Activity size={64}/></div>
            <p className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-2">Total Orders</p>
            <p className="text-3xl font-serif font-bold text-purple-100">{totalOrders.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Store size={64}/></div>
            <p className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-2">Total Vendors</p>
            <p className="text-3xl font-serif font-bold text-purple-100">{restaurants.length}</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Users size={64}/></div>
            <p className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-2">Active Ratio</p>
            <p className="text-3xl font-serif font-bold text-emerald-400">
              {restaurants.length > 0 ? Math.round((restaurants.filter(r => r.macros?.isActive !== false).length / restaurants.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Vendor Management */}
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Vendor Subscriptions</h2>
              <p className="text-sm text-neutral-500">Manage vendor plans and portal access</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="text" placeholder="Search vendors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 text-white placeholder-neutral-600" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-neutral-500">
                  <th className="pb-3 font-black">Restaurant</th>
                  <th className="pb-3 font-black">Owner / Contact</th>
                  <th className="pb-3 font-black">Joined</th>
                  <th className="pb-3 font-black">Current Plan</th>
                  <th className="pb-3 font-black text-right">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRestaurants.map(r => {
                  // Fallback defaults for backwards compatibility
                  const plan = r.macros?.plan || 'Starter';
                  const isActive = r.macros?.isActive !== false; // defaults to true

                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-neutral-900 border overflow-hidden shrink-0 transition-opacity ${isActive ? 'opacity-100 border-white/10' : 'opacity-40 border-red-500/30 grayscale'}`}>
                            {r.cover ? <img src={r.cover} className="w-full h-full object-cover" /> : <Store className="w-full h-full p-2 text-neutral-600"/>}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-neutral-500 line-through'}`}>{r.name}</span>
                            <span className="text-[10px] text-neutral-500 font-mono tracking-wider">{r.id.substring(0,8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-neutral-400">{r.vendor_id || r.vendorId || 'Unknown'}</span>
                          {r.phone && <span className="text-xs text-neutral-500">{r.phone}</span>}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-neutral-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            plan === 'Pro' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-white/5 text-neutral-400 border border-white/10'
                          }`}>
                            {plan === 'Enterprise' ? <Crown size={12}/> : plan === 'Pro' ? <Star size={12}/> : <Zap size={12}/>}
                            {plan}
                          </span>
                          
                          <select 
                            value={plan}
                            onChange={(e) => updateRestaurantMacro(r.id, 'plan', e.target.value)}
                            className="bg-[#111] border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-1 outline-none focus:border-purple-500 text-neutral-400 hover:text-white cursor-pointer transition-colors hover:bg-[#222]">
                            <option value="Starter">Starter</option>
                            <option value="Pro">Pro</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => updateRestaurantMacro(r.id, 'isActive', !isActive)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isActive 
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isActive ? <PowerOff size={14}/> : <Power size={14}/>}
                          {isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredRestaurants.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-neutral-500 text-sm">No vendors found matching criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
