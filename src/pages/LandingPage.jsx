import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play, CheckCircle2, TrendingUp, Users, MapPin, Star, Award, Zap, Camera, BarChart3, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: "easeOut" }
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.2 }
};

const item = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-noir-950 text-white font-sans overflow-x-hidden selection:bg-gold-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-noir-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gold-gradient flex items-center justify-center text-noir-950 font-bold text-xl">R</div>
            <span className="font-display font-bold text-xl tracking-tight">RestorOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            <a href="#product" className="hover:text-gold-400 transition-colors">Product</a>
            <a href="#solutions" className="hover:text-gold-400 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-gold-400 transition-colors">Pricing</a>
            <a href="#company" className="hover:text-gold-400 transition-colors">Company</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/vendor')}
              className="hidden md:block text-sm font-semibold hover:text-gold-400 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/vendor-onboard')}
              className="bg-gold-500 hover:bg-gold-400 text-noir-950 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-gold-sm hover:shadow-gold flex items-center gap-2"
            >
              Book a Demo <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- 01 HERO SECTION --- */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col lg:flex-row items-center gap-12">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div className="flex-1 z-10" {...fadeIn}>
          <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
            01 RestorOS Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            Restaurants <br/>
            don't need <br/>
            another menu. <br/>
            <span className="text-transparent bg-clip-text bg-gold-gradient">
              They need <br/>
              more revenue.
            </span>
          </h1>
          <p className="text-lg text-neutral-400 mb-8 max-w-md">
            AI-Powered Menu. Smarter Orders. Happier Customers. More Revenue.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => navigate('/vendor-onboard')}
              className="bg-gold-500 hover:bg-gold-400 text-noir-950 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-gold hover:shadow-gold-lg flex items-center gap-2"
            >
              Book a Demo <ChevronRight size={20} />
            </button>
            <button className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2">
              <Play size={20} fill="currentColor" /> Watch Video
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 relative z-10 w-full flex justify-center lg:justify-end"
        >
          <img src="/images/landing/landing_hero.jpg" alt="RestorOS AR App Mockup" className="w-full max-w-lg rounded-[3rem] shadow-2xl border-[8px] border-noir-700 shadow-gold-glow object-cover" />
        </motion.div>
      </section>

      {/* --- 02 THE PROBLEM --- */}
      <section className="py-24 bg-noir-900 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn}>
              <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
                02 THE PROBLEM
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                Running a restaurant <br/>is harder than ever.
              </h2>
              <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
                Margins are thin.<br/>
                Expectations are higher.<br/>
                Competition is tougher.<br/>
                Growth feels impossible.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <img src="/images/landing/landing_problem.jpg" alt="Stressed Restaurant Owner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent opacity-80"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 03 AI WAITER --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-b border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
              03 AI WAITER
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              Answers instantly.<br/>Customers happy.
            </h2>
            <p className="text-lg text-neutral-400 mb-8 max-w-md">
              An AI that understands every question and serves the perfect answer.
            </p>

            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="bg-noir-800 border border-white/5 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm">Is this spicy?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gold-500/10 border border-gold-500/30 px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] flex items-center gap-2">
                  <span className="text-sm text-gold-400 font-medium">Yes, it's medium spicy. 🌶️</span>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-noir-800 border border-white/5 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm">Is it enough for 2 people?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gold-500/10 border border-gold-500/30 px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] flex items-center gap-2">
                  <span className="text-sm text-gold-400 font-medium">Yes, it's perfect for 2 people.</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center items-center h-[500px]"
          >
            <div className="relative z-10 w-[80%] max-w-sm aspect-square rounded-full overflow-hidden border border-gold-500/30 shadow-gold-glow">
              <img src="/images/landing/landing_waiter.jpg" alt="AI Robot Waiter" className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gold-500 text-noir-950 px-6 py-2 rounded-full font-bold text-sm shadow-gold flex items-center gap-2 whitespace-nowrap">
                <Zap size={16} fill="currentColor" /> AI Ready
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 04 AI UPSELLING --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-b border-white/5 relative">
        <div className="text-center mb-16">
          <motion.div {...fadeIn}>
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
              04 AI UPSELLING
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-4">
              Increase order value<br/>automatically.
            </h2>
            <p className="text-lg text-neutral-400">
              Smart recommendations at the right time that customers love.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row items-center justify-center gap-8"
        >
          {/* Base Order */}
          <div className="bg-noir-800 border border-white/5 p-6 rounded-3xl w-64 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-700"></div>
            <p className="text-xs text-neutral-400 font-bold tracking-widest uppercase mb-4">Customer Order</p>
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-red-600 rounded-full shadow-2xl mb-4 group-hover:scale-110 transition-transform"></div>
            <h4 className="font-bold text-lg mb-1">Veg Burger</h4>
            <p className="text-gold-400 font-bold">₹199</p>
          </div>

          <ChevronRight size={32} className="text-neutral-600 hidden lg:block" />

          {/* AI Recommendations */}
          <div className="bg-card-gradient border border-gold-500/30 p-8 rounded-3xl flex-1 max-w-2xl relative shadow-gold-glow">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-noir-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-gold">
              <Star size={14} fill="currentColor" /> AI Recommends
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-500 to-orange-400 rounded-2xl shadow-xl mb-3 flex items-center justify-center text-3xl">🍟</div>
                <p className="font-bold text-sm">Fries</p>
                <p className="text-xs text-gold-400">₹99</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-red-800 to-red-600 rounded-2xl shadow-xl mb-3 flex items-center justify-center text-3xl">🥤</div>
                <p className="font-bold text-sm">Coke</p>
                <p className="text-xs text-gold-400">₹69</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-amber-900 to-amber-700 rounded-2xl shadow-xl mb-3 flex items-center justify-center text-3xl">🍰</div>
                <p className="font-bold text-sm">Brownie</p>
                <p className="text-xs text-gold-400">₹129</p>
              </div>
            </div>
          </div>

          <ChevronRight size={32} className="text-gold-500 hidden lg:block" />

          {/* Value Increased */}
          <div className="bg-noir-800 border border-gold-500/50 p-6 rounded-3xl w-64 text-center">
            <p className="text-xs text-gold-400 font-bold tracking-widest uppercase mb-4">Order Value Increased</p>
            <div className="flex items-center justify-center gap-2 text-gold-400 mb-2">
              <TrendingUp size={48} />
            </div>
            <h3 className="text-5xl font-display font-bold text-white">+23%</h3>
          </div>
        </motion.div>
      </section>

      {/* --- 05 RESTAURANT MEMORY --- */}
      <section className="py-24 bg-noir-900 border-y border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div {...fadeIn}>
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
              05 RESTAURANT MEMORY
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              Remember every guest.<br/>Make it personal.
            </h2>
            <p className="text-lg text-neutral-400 mb-8 max-w-md">
              AI remembers what your customers love and brings them back for more.
            </p>

            <div className="space-y-4 mb-12 relative pl-8">
              <div className="absolute top-4 bottom-4 left-3 w-px bg-neutral-800"></div>
              
              <div className="relative">
                <div className="absolute left-[-2rem] top-1 w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                </div>
                <h4 className="font-bold text-white">First Visit</h4>
                <p className="text-sm text-neutral-400">Ordered Butter Chicken</p>
              </div>
              
              <div className="relative">
                <div className="absolute left-[-2rem] top-1 w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                </div>
                <h4 className="font-bold text-white">Second Visit</h4>
                <p className="text-sm text-neutral-400">Preferred Medium Spice</p>
              </div>
              
              <div className="relative">
                <div className="absolute left-[-2rem] top-1 w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                </div>
                <h4 className="font-bold text-white">Third Visit</h4>
                <p className="text-sm text-neutral-400">Birthday Week</p>
              </div>
              
              <div className="relative">
                <div className="absolute left-[-2rem] top-1 w-6 h-6 rounded-full bg-gold-500 border border-gold-400 flex items-center justify-center shadow-gold-glow">
                  <Star size={12} fill="#000" className="text-black" />
                </div>
                <h4 className="font-bold text-gold-400">Fourth Visit</h4>
                <p className="text-sm text-gold-500/80">Recommended Favorite Combo</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-4xl font-display font-bold text-gold-400 mb-1">+35%</p>
                <p className="text-sm text-neutral-400 uppercase tracking-wider font-bold">Repeat Visits</p>
              </div>
              <div>
                <p className="text-4xl font-display font-bold text-gold-400 mb-1">+22%</p>
                <p className="text-sm text-neutral-400 uppercase tracking-wider font-bold">Loyalty Engagement</p>
              </div>
              <div>
                <p className="text-4xl font-display font-bold text-gold-400 mb-1">2.5x</p>
                <p className="text-sm text-neutral-400 uppercase tracking-wider font-bold">More Personal Orders</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-md h-[500px] rounded-[2.5rem] overflow-hidden border-[6px] border-noir-800 shadow-2xl shadow-gold-glow">
              <img src="/images/landing/landing_memory.jpg" alt="Happy Guest using RestorOS" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-900/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                 <div className="bg-noir-900/90 backdrop-blur-md border border-gold-500/30 p-4 rounded-2xl shadow-lg">
                    <h4 className="text-sm font-bold text-gold-400 flex items-center gap-2 mb-1">
                      <Star size={14} fill="currentColor" /> Welcome back, Rohit!
                    </h4>
                    <p className="text-white text-xs font-medium">We saved your favorite Butter Chicken.</p>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 06 EVENT LAYER --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-b border-white/5">
        <div className="text-center mb-16">
          <motion.div {...fadeIn}>
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
              06 EVENT LAYER
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-4">
              Turn restaurants into<br/>communities.
            </h2>
            <p className="text-lg text-neutral-400">
              Discover events. Join. Connect. Bring people together beyond food.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-noir-800/50 border border-white/5 rounded-3xl p-8 lg:p-12 relative overflow-hidden"
        >
          {/* Map abstraction */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="relative z-10 flex flex-wrap justify-center gap-6 mb-16">
            <div className="bg-noir-900 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 hover:border-purple-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
              <div><p className="font-bold">Live Music</p><p className="text-xs text-neutral-400">Tonight, 8 PM</p></div>
            </div>
            <div className="bg-noir-900 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 hover:border-pink-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
              <div><p className="font-bold">Singles Night</p><p className="text-xs text-neutral-400">Fri, 9 PM</p></div>
            </div>
            <div className="bg-noir-900 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 hover:border-blue-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
              <div><p className="font-bold">Startup Meetup</p><p className="text-xs text-neutral-400">Sat, 11 AM</p></div>
            </div>
            <div className="bg-noir-900 border border-gold-500/30 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-gold-glow group">
              <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
              <div><p className="font-bold text-gold-400">Cooking Workshop</p><p className="text-xs text-gold-500/80">Sun, 4 PM</p></div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-12 relative z-10">
            <h4 className="font-bold mb-8 text-center uppercase tracking-widest text-sm text-neutral-400">How it works</h4>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-noir-900 border border-white/10 flex items-center justify-center mb-3">
                  <MapPin className="text-gold-400" />
                </div>
                <p className="font-bold text-sm">Restaurant<br/>Creates Event</p>
              </div>
              <ChevronRight className="text-neutral-600 hidden md:block" />
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-noir-900 border border-white/10 flex items-center justify-center mb-3">
                  <Users className="text-gold-400" />
                </div>
                <p className="font-bold text-sm">Users Discover<br/>Nearby</p>
              </div>
              <ChevronRight className="text-neutral-600 hidden md:block" />
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-noir-900 border border-white/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="text-gold-400" />
                </div>
                <p className="font-bold text-sm">RSVP & Join</p>
              </div>
              <ChevronRight className="text-neutral-600 hidden md:block" />
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-noir-900 border border-white/10 flex items-center justify-center mb-3">
                  <Award className="text-gold-400" />
                </div>
                <p className="font-bold text-sm">Attend & Enjoy</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- 07 GAMIFICATION --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-b border-white/5 relative">
        <div className="absolute right-0 top-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
              07 GAMIFICATION
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              Rewards that feel good.<br/>Not just points.
            </h2>
            <p className="text-lg text-neutral-400 mb-8 max-w-md">
              Earn badges, unlock perks and climb the leaderboard.
            </p>

            <div className="bg-noir-800 border border-white/5 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient p-0.5">
                    <div className="w-full h-full bg-noir-900 rounded-full flex items-center justify-center font-bold text-lg">R</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Rohit Sharma</h4>
                    <p className="text-xs text-gold-400">Food Explorer</p>
                  </div>
                </div>
              </div>
              <div className="mb-2 flex justify-between text-xs font-bold">
                <span className="text-white">Level 12</span>
                <span className="text-gold-400">2540 / 3000 XP</span>
              </div>
              <div className="w-full h-2 bg-noir-950 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-gold-gradient w-[85%] rounded-full shadow-gold-glow"></div>
              </div>
              
              <div className="flex justify-between border-t border-white/5 pt-4 text-center">
                <div>
                  <div className="text-gold-400 font-bold flex justify-center mb-1"><Zap size={20} /></div>
                  <p className="text-white font-bold">7 Days</p>
                  <p className="text-[10px] text-neutral-500 uppercase">Streak</p>
                </div>
                <div>
                  <div className="text-gold-400 font-bold flex justify-center mb-1"><TrendingUp size={20} /></div>
                  <p className="text-white font-bold">#24</p>
                  <p className="text-[10px] text-neutral-500 uppercase">Rank</p>
                </div>
                <div>
                  <div className="text-gold-400 font-bold flex justify-center mb-1"><Award size={20} /></div>
                  <p className="text-white font-bold">18</p>
                  <p className="text-[10px] text-neutral-500 uppercase">Badges</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center relative z-10"
          >
            {/* Achievement Path */}
            <div className="bg-noir-900 border border-white/5 rounded-3xl p-6 w-full sm:w-64">
              <h4 className="text-sm text-neutral-400 uppercase tracking-widest font-bold mb-6 text-center">Achievement Path</h4>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gold-500 before:to-noir-800">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-noir-900 bg-gold-500 text-noir-950 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-gold-glow">
                    <Award size={16} />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-noir-800 p-3 rounded-xl border border-gold-500/30">
                    <h5 className="font-bold text-sm text-white">First Visit</h5>
                    <p className="text-[10px] text-neutral-400">Welcome to RestorOS</p>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-noir-900 bg-gold-500 text-noir-950 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-gold-glow">
                    <Star size={16} />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-noir-800 p-3 rounded-xl border border-white/5">
                    <h5 className="font-bold text-sm text-white">Pizza Lover</h5>
                    <p className="text-[10px] text-neutral-400">Tried 5 Pizzas</p>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-noir-900 bg-noir-800 text-neutral-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Award size={16} />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-noir-950 p-3 rounded-xl border border-white/5 opacity-50">
                    <h5 className="font-bold text-sm text-white">Local Legend</h5>
                    <p className="text-[10px] text-neutral-400">Try 25 Dishes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-noir-900 border border-white/5 rounded-3xl p-6 w-full sm:w-64 flex flex-col">
              <h4 className="text-sm text-neutral-400 uppercase tracking-widest font-bold mb-6 text-center">Leaderboard</h4>
              
              <div className="flex bg-noir-950 rounded-lg p-1 mb-6">
                <button className="flex-1 py-1 text-xs font-bold bg-noir-800 rounded-md text-white shadow">This Week</button>
                <button className="flex-1 py-1 text-xs font-bold text-neutral-500 hover:text-white">All Time</button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gold-400 font-bold w-4">1</span>
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">A</div>
                    <span className="font-bold text-sm">Ankit</span>
                  </div>
                  <span className="text-gold-400 text-xs font-bold">3200 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-300 font-bold w-4">2</span>
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">S</div>
                    <span className="font-bold text-sm">Sneha</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-400">2900 XP</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 -mx-2 px-2 py-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500 font-bold w-4">3</span>
                    <div className="w-8 h-8 rounded-full bg-gold-500 text-noir-950 flex items-center justify-center text-xs font-bold">Y</div>
                    <span className="font-bold text-sm text-gold-400">You</span>
                  </div>
                  <span className="text-xs font-bold text-gold-400">2530 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-600 font-bold w-4">4</span>
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">R</div>
                    <span className="font-bold text-sm text-neutral-500">Rahul</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-600">2100 XP</span>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 text-xs font-bold text-gold-400 hover:text-gold-300 border border-gold-500/30 rounded-lg">View Full Leaderboard</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 08 GROUP ORDERING --- */}
      <section className="py-24 bg-noir-900 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div {...fadeIn}>
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
              08 GROUP ORDERING
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              Order together.<br/>Split effortlessly.
            </h2>
            <p className="text-lg text-neutral-400 mb-8 max-w-md">
              Everyone adds. Bill splits automatically. No confusion. No hassle.
            </p>

            <div className="flex gap-4 items-center">
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-full border-2 border-noir-900 bg-blue-500/50 flex items-center justify-center font-bold">A</div>
                <div className="w-12 h-12 rounded-full border-2 border-noir-900 bg-pink-500/50 flex items-center justify-center font-bold">S</div>
                <div className="w-12 h-12 rounded-full border-2 border-noir-900 bg-green-500/50 flex items-center justify-center font-bold">R</div>
                <div className="w-12 h-12 rounded-full border-2 border-noir-900 bg-purple-500/50 flex items-center justify-center font-bold">K</div>
              </div>
              <div className="bg-gold-500 text-noir-950 font-bold px-4 py-2 rounded-full text-sm shadow-gold flex items-center gap-2">
                <Users size={16} /> 4 at Table
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl ml-auto max-w-lg">
              <img src="/images/landing/landing_group.jpg" alt="Friends group ordering at table" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-noir-900/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl flex justify-between items-center">
                  <div>
                    <p className="text-xs text-neutral-400 font-bold mb-1">Total Bill</p>
                    <p className="text-xl font-bold text-white">₹1497</p>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="text-right">
                    <p className="text-xs text-gold-400 font-bold mb-1">Your Share</p>
                    <p className="text-xl font-bold text-gold-400">₹374</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 09 INSTANT 3D MENU CREATION --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-b border-white/5 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
              09 INSTANT 3D MENU CREATION
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              Upload photos.<br/>Get AR-ready dishes instantly.
            </h2>
            <p className="text-lg text-neutral-400 mb-8 max-w-md">
              AI turns your food photos into stunning 3D models in seconds.
            </p>

            <div className="bg-noir-800 border border-white/5 p-6 rounded-2xl max-w-md">
              <p className="text-xs font-bold mb-4 uppercase tracking-wider text-neutral-400">Your Photos (2-3)</p>
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl shadow-inner border border-white/10"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-inner border border-white/10"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-400 rounded-xl shadow-inner border border-white/10"></div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex-1 bg-noir-900 p-3 rounded-lg border border-red-500/30 text-neutral-400">
                  <p className="text-red-400 mb-1">Traditional 3D Creation</p>
                  <p>❌ 3D Artist</p>
                  <p>❌ 5-10 Days</p>
                  <p>❌ Expensive</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gold-500 text-noir-950 flex items-center justify-center font-bold">VS</div>
                <div className="flex-1 bg-gold-500/10 p-3 rounded-lg border border-gold-500/50 text-gold-400 shadow-gold-glow">
                  <p className="text-gold-300 mb-1">RestorOS AI</p>
                  <p>✅ 3-5 Photos</p>
                  <p>✅ 60 Seconds</p>
                  <p>✅ Fully Automated</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 items-center"
          >
            <div className="bg-noir-900 border border-white/5 rounded-3xl p-6 text-center w-full sm:w-1/2 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-2xl"></div>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-4">AI Processing...</p>
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_0_40px_rgba(249,115,22,0.3)] mb-4 animate-pulse"></div>
              <div className="w-full bg-noir-800 rounded-full h-2 mb-2">
                <div className="bg-blue-500 h-2 rounded-full w-[60%]"></div>
              </div>
              <p className="text-xs text-neutral-500">Generating Geometry</p>
            </div>

            <ChevronRight className="text-neutral-600 hidden sm:block" size={32} />

            <div className="bg-card-gradient border border-gold-500/30 rounded-3xl p-6 text-center w-full sm:w-1/2 shadow-gold-glow relative">
              <p className="text-xs text-gold-400 font-bold uppercase tracking-widest mb-4">3D Model Ready!</p>
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_0_50px_rgba(212,175,55,0.4)] mb-4"></div>
              <div className="flex justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-noir-800 border border-white/10 flex items-center justify-center">🔄</div>
                <div className="w-8 h-8 rounded-full bg-noir-800 border border-white/10 flex items-center justify-center">🔍</div>
              </div>
              <button className="w-full py-2 bg-gold-500 text-noir-950 font-bold text-xs rounded-lg shadow-gold">Publish to Menu</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 10 ANALYTICS --- */}
      <section className="py-24 bg-noir-900 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div {...fadeIn}>
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase">
              10 ANALYTICS
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              See what customers<br/>actually want.
            </h2>
            <p className="text-lg text-neutral-400 mb-8 max-w-md">
              Real insights. Smarter decisions. Higher revenue.
            </p>

            <div className="flex gap-6 mb-8">
              <div className="bg-noir-800 border border-white/5 px-6 py-4 rounded-2xl flex-1">
                <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-2">Conversion Rate</p>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-bold text-white">18.6%</p>
                  <p className="text-sm font-bold text-green-400 mb-1">+2.4%</p>
                </div>
              </div>
              <div className="bg-noir-800 border border-white/5 px-6 py-4 rounded-2xl flex-1">
                <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-2">Revenue Impact</p>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-bold text-gold-400">+₹1.45L</p>
                  <p className="text-sm font-bold text-neutral-500 mb-1">This Month</p>
                </div>
              </div>
            </div>
            
            <div className="bg-noir-800 border border-white/5 px-6 py-4 rounded-2xl inline-block">
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-2">Top Performing Combo</p>
              <div className="flex items-center gap-4">
                <p className="font-bold">Butter Chicken + Naan + Coke</p>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-600 border-2 border-noir-800"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 border-2 border-noir-800"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-800 to-red-600 border-2 border-noir-800"></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-noir-950 border border-white/10 rounded-[2rem] p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-sm text-neutral-300 flex items-center gap-2"><BarChart3 size={16} /> Menu Heatmap</h4>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
            </div>
            
            <div className="flex gap-6">
              {/* Sidebar Menu Items */}
              <div className="w-1/3 space-y-4">
                <div className="bg-noir-800 p-2 rounded text-xs font-bold text-white border-l-2 border-red-500">Butter Chicken</div>
                <div className="bg-noir-900 p-2 rounded text-xs text-neutral-400">Pizza Margherita</div>
                <div className="bg-noir-900 p-2 rounded text-xs text-neutral-400">Veg Burger</div>
                <div className="bg-noir-800 p-2 rounded text-xs font-bold text-white border-l-2 border-yellow-500">Pasta Alfredo</div>
                <div className="bg-noir-900 p-2 rounded text-xs text-neutral-400">Garlic Naan</div>
                <div className="bg-noir-900 p-2 rounded text-xs text-neutral-400">Brownie</div>
                <div className="bg-noir-800 p-2 rounded text-xs font-bold text-white border-l-2 border-green-500">Cold Coffee</div>
              </div>

              {/* Heatmap Area */}
              <div className="w-2/3 bg-noir-900 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
                {/* CSS Heatmap representation */}
                <div className="absolute inset-0 opacity-40">
                  {/* Butter Chicken hot spot */}
                  <div className="absolute top-[10%] left-[20%] w-24 h-24 bg-red-500 rounded-full blur-2xl"></div>
                  <div className="absolute top-[15%] left-[25%] w-12 h-12 bg-yellow-400 rounded-full blur-xl"></div>
                  
                  {/* Pasta hot spot */}
                  <div className="absolute top-[45%] left-[70%] w-20 h-20 bg-yellow-500 rounded-full blur-2xl"></div>
                  <div className="absolute top-[50%] left-[75%] w-10 h-10 bg-green-400 rounded-full blur-xl"></div>

                  {/* Cold Coffee hot spot */}
                  <div className="absolute top-[80%] left-[40%] w-16 h-16 bg-green-500 rounded-full blur-2xl"></div>
                </div>
                
                {/* Overlay Grid */}
                <div className="w-full h-full border border-white/5 rounded-lg grid grid-cols-4 grid-rows-7 opacity-20">
                  {[...Array(28)].map((_, i) => (
                    <div key={i} className="border border-white/5"></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase">
              <span>Less Viewed</span>
              <div className="w-32 h-2 bg-gradient-to-r from-noir-800 via-green-500 via-yellow-500 to-red-500 rounded-full"></div>
              <span>Most Viewed</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-noir-950 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-12">
            <div>
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Trusted by forward-thinking restaurants across India</p>
              <div className="flex flex-wrap items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="font-serif font-bold text-xl">THE SPICE ROOM</span>
                <span className="font-display font-bold tracking-widest">URBAN TADKA</span>
                <span className="font-serif italic text-lg">The Pasta House</span>
                <span className="font-bold text-xl">Biryani Blues</span>
                <span className="font-mono text-lg">Café Central</span>
                <span className="text-xs font-bold text-neutral-500">and 1000+ more</span>
              </div>
            </div>
          </div>
          
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-3xl font-display font-bold mb-2">The Operating System<br/>for Modern Restaurants.</h3>
            </div>
            <div className="text-right">
              <button 
                onClick={() => navigate('/vendor-onboard')}
                className="bg-gold-500 hover:bg-gold-400 text-noir-950 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-gold hover:shadow-gold-lg mb-4 inline-flex items-center gap-2"
              >
                Book a Demo <ChevronRight size={20} />
              </button>
              <p className="text-sm font-bold text-neutral-400">Grow More. Serve Better.</p>
              <div className="flex items-center justify-end gap-2 mt-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-600 border border-noir-950"></div>
                  <div className="w-6 h-6 rounded-full bg-neutral-500 border border-noir-950"></div>
                  <div className="w-6 h-6 rounded-full bg-neutral-400 border border-noir-950"></div>
                  <div className="w-6 h-6 rounded-full bg-neutral-300 border border-noir-950"></div>
                </div>
                <div className="flex text-gold-400 text-xs">
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                </div>
                <span className="text-[10px] text-neutral-500 font-bold">4.8/5 from 1000+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
