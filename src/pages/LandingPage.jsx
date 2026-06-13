import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play, CheckCircle2, TrendingUp, Users, MapPin, Star, Award, Zap, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const SectionBadge = ({ number, title }) => (
  <div className="flex items-center gap-2 mb-6 self-start">
    <span className="bg-[#FFC700] text-black px-1.5 py-0.5 text-[10px] font-black rounded-sm font-mono tracking-tight">{number}</span>
    <span className="text-[#FFC700] text-xs font-bold tracking-wider uppercase">{title}</span>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[#FFC700]/30">
      
      {/* --- BENTO GRID CONTAINER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-l border-white/10 max-w-[1600px] mx-auto bg-black">
        
        {/* --- 01 HERO SECTION (RESTOROS) --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden min-h-[600px]">
          {/* Header/Navbar inside the Hero Cell */}
          <div className="flex items-center justify-between w-full border-b border-white/5 pb-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#FFC700] flex items-center justify-center text-black font-black text-xl">01</div>
              <span className="font-bold text-xl tracking-tight">RestorOS</span>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-neutral-400">
              <a href="#product" className="hover:text-white transition-colors">Product</a>
              <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
              <a href="#resources" className="hover:text-white transition-colors">Resources</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#company" className="hover:text-white transition-colors">Company</a>
            </div>
            <button 
              onClick={() => navigate('/vendor-onboard')}
              className="bg-[#FFC700] hover:bg-[#FFC700]/90 text-black px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1 shadow-sm hover:shadow"
            >
              Book a Demo <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center flex-1">
            <motion.div className="md:col-span-7 z-10" {...fadeIn}>
              <SectionBadge number="01" title="RestorOS Platform" />
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
                Restaurants <br/>
                don't need <br/>
                another menu. <br/>
                <span className="text-[#FFC700]">
                  They need <br/>
                  more revenue.
                </span>
              </h1>
              <p className="text-sm text-neutral-400 mb-8 max-w-sm">
                AI-Powered Menu. Smarter Orders. Happier Customers. More Revenue.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => navigate('/vendor-onboard')}
                  className="bg-[#FFC700] hover:bg-[#FFC700]/95 text-black px-6 py-3 rounded-full font-bold text-sm transition-all shadow hover:shadow-lg flex items-center gap-2"
                >
                  Book a Demo <ChevronRight size={16} />
                </button>
                <button className="px-6 py-3 rounded-full font-bold text-sm text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2">
                  <Play size={16} fill="currentColor" /> Watch Video
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5 flex justify-center items-center w-full"
            >
              <img 
                src="/lp-hero.png" 
                alt="RestorOS AR App Mockup" 
                className="w-full max-w-[280px] h-auto object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* --- 02 THE PROBLEM --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden min-h-[600px]">
          <div className="flex-1 grid md:grid-cols-12 gap-8 items-center">
            <motion.div className="md:col-span-7 z-10" {...fadeIn}>
              <SectionBadge number="02" title="THE PROBLEM" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                Running a restaurant <br/>is harder than ever.
              </h2>
              <p className="text-sm text-neutral-400 mb-8 leading-relaxed max-w-sm">
                Margins are thin.<br/>
                Expectations are higher.<br/>
                Competition is tougher.<br/>
                Growth feels impossible.
              </p>

              {/* Problem Stats/Metrics */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Average Order Value</p>
                  <p className="text-lg font-bold text-red-500 mt-1">Stagnant</p>
                </div>
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Repeat Visits</p>
                  <p className="text-lg font-bold text-red-500 mt-1">Falling</p>
                </div>
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Same Questions</p>
                  <p className="text-lg font-bold text-neutral-300 mt-1">Every Day</p>
                </div>
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Manual 2D / AR Creation</p>
                  <p className="text-lg font-bold text-neutral-300 mt-1">Expensive</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 flex justify-center items-center w-full"
            >
              <img 
                src="/lp-problem.png" 
                alt="Stressed Restaurant Owner" 
                className="w-full max-w-[280px] h-auto object-contain rounded-xl"
              />
            </motion.div>
          </div>
        </div>

        {/* --- 03 AI WAITER --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative min-h-[550px]">
          <div className="flex-1 grid md:grid-cols-12 gap-8 items-center">
            <motion.div className="md:col-span-7 z-10" {...fadeIn}>
              <SectionBadge number="03" title="AI WAITER" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                Answers instantly.<br/>Customers happy.
              </h2>
              <p className="text-sm text-neutral-400 mb-8 max-w-sm">
                An AI that understands every question and serves the perfect answer.
              </p>

              <div className="space-y-4 max-w-sm bg-neutral-900/20 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-start">
                  <div className="bg-neutral-800 text-xs px-3 py-2 rounded-xl rounded-tl-none max-w-[85%] text-neutral-300">
                    Is this spicy?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#FFC700]/10 border border-[#FFC700]/30 text-xs px-3 py-2 rounded-xl rounded-tr-none max-w-[85%] text-[#FFC700] font-medium">
                    Yes, it's medium spicy. 🌶️
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-neutral-800 text-xs px-3 py-2 rounded-xl rounded-tl-none max-w-[85%] text-neutral-300">
                    Is it enough for 2 people?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#FFC700]/10 border border-[#FFC700]/30 text-xs px-3 py-2 rounded-xl rounded-tr-none max-w-[85%] text-[#FFC700] font-medium">
                    Yes, it's perfect for 2 people.
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 flex justify-center items-center w-full"
            >
              <img 
                src="/lp-ai-waiter.png" 
                alt="AI Robot Waiter" 
                className="w-full max-w-[280px] h-auto object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* --- 04 AI UPSELLING --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative min-h-[550px]">
          <div className="flex-1 flex flex-col justify-center">
            <motion.div {...fadeIn}>
              <SectionBadge number="04" title="AI UPSELLING" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4 tracking-tight">
                Increase order value<br/>automatically.
              </h2>
              <p className="text-sm text-neutral-400 mb-8 max-w-md">
                Smart recommendations at the right time that customers love.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-neutral-900/20 p-6 rounded-2xl border border-white/5"
            >
              {/* Customer Order */}
              <div className="flex flex-col items-center text-center">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Customer Order</p>
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/5 mb-2">
                  <img src="/images/landing/landing_upsell_food.jpg" alt="Burger" className="w-full h-full object-cover" />
                </div>
                <p className="font-bold text-xs">Veg Burger</p>
                <p className="text-[#FFC700] text-xs font-bold">₹199</p>
              </div>

              <div className="text-neutral-600 text-lg font-bold">→</div>

              {/* AI Recommendations */}
              <div className="flex-1 bg-black/40 border border-[#FFC700]/20 p-4 rounded-xl text-center relative w-full">
                <p className="text-[9px] text-[#FFC700] font-bold uppercase tracking-wider mb-3">AI Recommends</p>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-lg mb-1">🍟</div>
                    <p className="text-[10px] font-bold">Fries</p>
                    <p className="text-[9px] text-[#FFC700]">₹99</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-lg mb-1">🥤</div>
                    <p className="text-[10px] font-bold">Coke</p>
                    <p className="text-[9px] text-[#FFC700]">₹69</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-lg mb-1">🍰</div>
                    <p className="text-[10px] font-bold">Brownie</p>
                    <p className="text-[9px] text-[#FFC700]">₹129</p>
                  </div>
                </div>
              </div>

              <div className="text-[#FFC700] text-lg font-bold">→</div>

              {/* Order Value Increased */}
              <div className="text-center">
                <p className="text-[10px] text-[#FFC700] font-bold uppercase tracking-wider mb-2">Value Increase</p>
                <div className="flex items-center justify-center gap-1 text-[#FFC700] mb-1">
                  <TrendingUp size={20} />
                  <span className="text-2xl font-bold font-mono">+23%</span>
                </div>
                <p className="text-[9px] text-neutral-500 font-bold uppercase">Revenue boost</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- 05 RESTAURANT MEMORY (labeled 03 to match reference layout) --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative min-h-[550px]">
          <div className="flex-1 grid md:grid-cols-12 gap-8 items-center">
            <motion.div className="md:col-span-7 z-10" {...fadeIn}>
              <SectionBadge number="03" title="RESTAURANT MEMORY" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                Remember every guest.<br/>Make it personal.
              </h2>
              <p className="text-sm text-neutral-400 mb-8 max-w-sm">
                AI remembers what your customers love and brings them back for more.
              </p>

              {/* Timeline visits */}
              <div className="space-y-4 mb-8 pl-4 border-l border-neutral-800">
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-neutral-600"></span>
                  <h4 className="font-bold text-xs text-white">First Visit</h4>
                  <p className="text-[11px] text-neutral-400">Ordered Butter Chicken</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-neutral-600"></span>
                  <h4 className="font-bold text-xs text-white">Second Visit</h4>
                  <p className="text-[11px] text-neutral-400">Preferred Medium Spice</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#FFC700]"></span>
                  <h4 className="font-bold text-xs text-[#FFC700]">Fourth Visit</h4>
                  <p className="text-[11px] text-[#FFC700]/80">Recommended Favorite Combo</p>
                </div>
              </div>

              {/* Memory Metrics */}
              <div className="flex gap-6 mt-6">
                <div>
                  <p className="text-2xl font-bold text-[#FFC700]">+35%</p>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase">Repeat Visits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FFC700]">+22%</p>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase">Loyalty</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FFC700]">2.5x</p>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase">Personal Orders</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 flex justify-center items-center w-full"
            >
              <img 
                src="/lp-memory.png" 
                alt="Happy Guest using RestorOS" 
                className="w-full max-w-[280px] h-auto object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* --- 06 EVENT LAYER --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative min-h-[550px]">
          <div className="flex-1 grid md:grid-cols-12 gap-8 items-center">
            <motion.div className="md:col-span-7 z-10" {...fadeIn}>
              <SectionBadge number="06" title="EVENT LAYER" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                Turn restaurants into<br/>communities.
              </h2>
              <p className="text-sm text-neutral-400 mb-6 max-w-sm">
                Discover events. Join. Connect. Bring people together beyond food.
              </p>

              {/* Event types */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Live Music', 'Singles Night', 'Startup Meetup', 'Board Games', 'Cooking Workshop'].map((evt) => (
                  <span key={evt} className="bg-neutral-900 border border-white/5 px-2.5 py-1 rounded-md text-[10px] font-bold text-neutral-300">
                    {evt}
                  </span>
                ))}
              </div>

              {/* How it works flow */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-3">How it works</p>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold overflow-x-auto whitespace-nowrap pb-2">
                  <span>Create</span>
                  <span>→</span>
                  <span>Discover</span>
                  <span>→</span>
                  <span>RSVP</span>
                  <span>→</span>
                  <span>Attend</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 flex justify-center items-center w-full"
            >
              <img 
                src="/images/landing/landing_event_map.png" 
                alt="Event Map Visualization" 
                className="w-full max-w-[280px] h-auto object-contain rounded-xl"
              />
            </motion.div>
          </div>
        </div>

        {/* --- 07 GAMIFICATION --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative min-h-[550px]">
          <div className="flex-1 grid md:grid-cols-12 gap-8 items-center">
            <motion.div className="md:col-span-6 z-10" {...fadeIn}>
              <SectionBadge number="07" title="GAMIFICATION" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                Rewards that feel good.<br/>Not just points.
              </h2>
              <p className="text-sm text-neutral-400 mb-8 max-w-sm">
                Earn badges, unlock perks and climb the leaderboard.
              </p>

              {/* Mini Profile Card */}
              <div className="bg-neutral-900/40 border border-white/5 p-4 rounded-xl max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFC700] text-black flex items-center justify-center font-bold text-xs">RS</div>
                  <div>
                    <p className="text-xs font-bold">Rohit Sharma</p>
                    <p className="text-[9px] text-[#FFC700] font-bold">Level 12 • Food Explorer</p>
                  </div>
                </div>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden mb-3">
                  <div className="bg-gradient-to-r from-[#FFC700] to-yellow-500 h-full w-[80%]"></div>
                </div>
                <div className="flex justify-between text-[9px] text-neutral-400 font-bold uppercase">
                  <span>Streak: 7 Days</span>
                  <span>Rank: #24</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-6 flex flex-col gap-4 w-full"
            >
              {/* Mini Leaderboard */}
              <div className="bg-neutral-900/20 border border-white/5 p-4 rounded-xl w-full">
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-3 text-center">Leaderboard</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-neutral-300">1. Ankit</span>
                    <span className="text-[#FFC700] font-bold">3200 XP</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-neutral-300">2. Sneha</span>
                    <span className="text-neutral-400 font-bold">2900 XP</span>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-white/5 px-2 py-1.5 rounded">
                    <span className="font-bold text-[#FFC700]">3. You</span>
                    <span className="text-[#FFC700] font-bold">2530 XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- 08 GROUP ORDERING --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative min-h-[550px]">
          <div className="flex-1 grid md:grid-cols-12 gap-8 items-center">
            <motion.div className="md:col-span-7 z-10" {...fadeIn}>
              <SectionBadge number="08" title="GROUP ORDERING" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                Order together.<br/>Split effortlessly.
              </h2>
              <p className="text-sm text-neutral-400 mb-8 max-w-sm">
                Everyone adds. Bill splits automatically. No confusion. No hassle.
              </p>

              {/* Bill split card detail */}
              <div className="bg-neutral-900/40 border border-white/5 p-4 rounded-xl max-w-xs">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5 text-xs">
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase font-bold">Total Bill</p>
                    <p className="font-bold">₹1,497</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-[#FFC700] uppercase font-bold">Your Share</p>
                    <p className="font-bold text-[#FFC700]">₹374</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-[8px] flex items-center justify-center font-bold">A</div>
                    <div className="w-5 h-5 rounded-full bg-pink-500 text-[8px] flex items-center justify-center font-bold">S</div>
                    <div className="w-5 h-5 rounded-full bg-green-500 text-[8px] flex items-center justify-center font-bold">R</div>
                  </div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">4 Split Active</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 flex justify-center items-center w-full"
            >
              <img 
                src="/lp-group.png" 
                alt="Friends eating at table" 
                className="w-full max-w-[280px] h-auto object-contain rounded-xl"
              />
            </motion.div>
          </div>
        </div>

        {/* --- 09 INSTANT 3D MENU CREATION --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative min-h-[550px]">
          <div className="flex-1 grid md:grid-cols-12 gap-8 items-center">
            <motion.div className="md:col-span-7 z-10" {...fadeIn}>
              <SectionBadge number="09" title="INSTANT 3D MENU" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                Upload photos.<br/>Get AR-ready dishes instantly.
              </h2>
              <p className="text-sm text-neutral-400 mb-8 max-w-sm">
                AI turns your food photos into stunning 3D models in seconds.
              </p>

              {/* Photos comparison list */}
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div className="bg-neutral-950 p-3 rounded-lg border border-red-500/10 text-[10px]">
                  <p className="text-red-400 font-bold mb-1">Traditional 3D</p>
                  <p className="text-neutral-500">❌ 3D Artist Required</p>
                  <p className="text-neutral-500">❌ 5-10 Days Delivery</p>
                </div>
                <div className="bg-[#FFC700]/5 p-3 rounded-lg border border-[#FFC700]/20 text-[10px]">
                  <p className="text-[#FFC700] font-bold mb-1">RestorOS AI</p>
                  <p className="text-[#FFC700]/80">✅ 3-5 Photos Only</p>
                  <p className="text-[#FFC700]/80">✅ 60 Sec Auto-Gen</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 flex justify-center items-center w-full"
            >
              <img 
                src="/lp-ar.png" 
                alt="AR 3D Dish View" 
                className="w-full max-w-[280px] h-auto object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* --- 10 ANALYTICS --- */}
        <div className="border-r border-b border-white/10 p-6 md:p-10 flex flex-col justify-between relative min-h-[550px]">
          <div className="flex-1 grid md:grid-cols-12 gap-8 items-center">
            <motion.div className="md:col-span-7 z-10" {...fadeIn}>
              <SectionBadge number="10" title="ANALYTICS" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                See what customers<br/>actually want.
              </h2>
              <p className="text-sm text-neutral-400 mb-8 max-w-sm">
                Real insights. Smarter decisions. Higher revenue.
              </p>

              {/* Small analytics metrics */}
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Conversion Rate</p>
                  <p className="text-lg font-bold text-white mt-1">18.6%</p>
                  <span className="text-[10px] text-green-500 font-bold">+2.4%</span>
                </div>
                <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Revenue Impact</p>
                  <p className="text-lg font-bold text-[#FFC700] mt-1">+₹1.45L</p>
                  <span className="text-[10px] text-neutral-500">This Month</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 flex flex-col gap-3 bg-neutral-900/30 border border-white/5 p-4 rounded-xl"
            >
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest"><BarChart3 size={12} className="inline mr-1" /> Menu Heatmap</h4>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between items-center text-red-400">
                  <span>Butter Chicken</span>
                  <span className="w-16 h-1.5 bg-red-500 rounded-full"></span>
                </div>
                <div className="flex justify-between items-center text-yellow-400">
                  <span>Pasta Alfredo</span>
                  <span className="w-10 h-1.5 bg-yellow-500 rounded-full"></span>
                </div>
                <div className="flex justify-between items-center text-green-400">
                  <span>Cold Coffee</span>
                  <span className="w-6 h-1.5 bg-green-500 rounded-full"></span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- FOOTER (spans 2 columns on large screens) --- */}
        <div className="lg:col-span-2 border-r border-b border-white/10 p-6 md:p-10 bg-black flex flex-col justify-between min-h-[300px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-8 mb-8">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Trusted by forward-thinking restaurants across India</p>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-neutral-400 tracking-wider">
                <span>THE SPICE ROOM</span>
                <span>URBAN TADKA</span>
                <span>THE PASTA HOUSE</span>
                <span>BIRYANI BLUES</span>
                <span>CAFÉ CENTRAL</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">The Operating System<br/>for Modern Restaurants.</h3>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Grow More. Serve Better.</p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <button 
                onClick={() => navigate('/vendor-onboard')}
                className="bg-[#FFC700] hover:bg-[#FFC700]/95 text-black px-6 py-3 rounded-full font-bold text-xs transition-all shadow flex items-center gap-1.5"
              >
                Book a Demo <ChevronRight size={16} />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-neutral-700 border border-black"></div>
                  ))}
                </div>
                <div className="flex text-[#FFC700]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill="currentColor" />
                  ))}
                </div>
                <span className="text-[9px] text-neutral-500 font-bold">4.8/5 (1000+ reviews)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
