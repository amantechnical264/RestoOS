import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Play, TrendingUp, Users, MapPin, 
  Star, Award, Zap, Camera, BarChart3, Menu, X, 
  MessageSquare, Utensils, Sparkles, ChefHat, 
  ShieldCheck, Smartphone, MousePointer2,
  Heart, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-noir-950 text-white font-sans overflow-x-hidden selection:bg-gold-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-noir-950/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center text-noir-950 font-bold text-2xl shadow-gold-glow">R</div>
            <span className="font-display font-bold text-2xl tracking-tight">RestorOS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 bg-noir-900/50 backdrop-blur-md px-8 py-3 rounded-full border border-white/5 shadow-2xl">
            <a href="#features" className="text-sm font-medium text-neutral-300 hover:text-gold-400 transition-colors">Features</a>
            <a href="#snippets" className="text-sm font-medium text-neutral-300 hover:text-gold-400 transition-colors">Experience</a>
            <a href="#solutions" className="text-sm font-medium text-neutral-300 hover:text-gold-400 transition-colors">Solutions</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/vendor')} className="text-sm font-bold text-neutral-300 hover:text-gold-400 transition-colors px-4">
              Login
            </button>
            <button onClick={() => navigate('/vendor-onboard')} className="bg-gold-gradient text-noir-950 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-gold hover:shadow-gold-lg flex items-center gap-2 hover:scale-105 active:scale-95">
              Get Started <ChevronRight size={16} />
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-32 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        {/* Abstract Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-sm font-bold tracking-widest uppercase shadow-gold-glow">
            <Sparkles size={16} /> The Next Generation OS for Restaurants
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-display font-extrabold leading-[1.1] mb-8 tracking-tight">
            Stop managing.<br />
            <span className="text-transparent bg-clip-text bg-gold-gradient">Start growing.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-2xl leading-relaxed">
            An immersive, AI-first ecosystem that turns standard dining into magical, highly-profitable experiences.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-6">
            <button onClick={() => navigate('/vendor-onboard')} className="bg-gold-gradient text-noir-950 px-10 py-5 rounded-full font-bold text-lg transition-all shadow-gold hover:shadow-gold-lg flex items-center gap-2 hover:scale-105 active:scale-95 w-full sm:w-auto justify-center">
              Transform Your Restaurant <ChevronRight size={24} />
            </button>
            <button className="px-10 py-5 rounded-full font-bold text-lg text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 w-full sm:w-auto justify-center group">
              <Play size={20} className="group-hover:text-gold-400 transition-colors" /> View Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 relative w-full max-w-5xl aspect-[16/9] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden bg-noir-900 group"
        >
           <img src="/hero_dashboard.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="absolute inset-0 bg-gradient-to-t from-noir-950/80 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </section>

      {/* --- BENTO GRID: FEATURES & SNIPPETS --- */}
      <section id="snippets" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">A holistic ecosystem.<br/>Powered by AI.</h2>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">Every feature is designed to increase revenue, automate operations, and delight your guests.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
            
            {/* 1. AI WAITER (Span 2 cols, 2 rows) */}
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 rounded-[2rem] bg-noir-900 border border-white/5 overflow-hidden relative group hover:border-gold-500/30 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center"><MessageSquare size={24} /></div>
                  <h3 className="text-2xl font-bold">AI Waiter</h3>
                </div>
                <p className="text-neutral-400 mb-8 max-w-md">Instantly answers questions, recommends pairings, and takes orders with 100% accuracy.</p>
                
                {/* Snippet */}
                <div className="flex-1 bg-noir-950 rounded-xl border border-white/10 p-4 flex flex-col gap-4 overflow-hidden relative">
                  <div className="bg-noir-800 self-start px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-white/5 max-w-[80%]">
                    Does the Truffle Pasta have nuts? I have an allergy.
                  </div>
                  <div className="bg-gold-500/10 text-gold-50 self-end px-4 py-3 rounded-2xl rounded-tr-sm text-sm border border-gold-500/20 max-w-[80%] relative">
                    <Sparkles size={12} className="absolute -top-1 -right-1 text-gold-400" />
                    No nuts! It's completely safe. Would you like to pair it with our house Pinot Noir? It complements the truffle beautifully. 🍷
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. AR 3D MENU (Span 2 cols, 1 row) */}
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="md:col-span-2 rounded-[2rem] bg-noir-900 border border-white/5 overflow-hidden relative group hover:border-white/20 transition-colors"
            >
              <div className="p-8 h-full flex flex-col justify-between z-10 relative">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center"><Camera size={20} /></div>
                    <h3 className="text-xl font-bold">Instant AR Menus</h3>
                  </div>
                  <p className="text-neutral-400 text-sm">Upload a photo. Get a 3D AR model in 60 seconds.</p>
                </div>
                
                {/* Snippet */}
                <div className="flex items-center justify-between bg-noir-950 rounded-xl border border-white/10 p-3">
                   <div className="flex gap-2">
                     <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden"><img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&q=80" alt="Pizza" className="w-full h-full object-cover opacity-50"/></div>
                     <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center"><ChevronRight size={16} className="text-neutral-500"/></div>
                     <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center animate-pulse"><Sparkles size={16} className="text-blue-400"/></div>
                   </div>
                   <div className="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg">View in AR</div>
                </div>
              </div>
            </motion.div>

            {/* 3. ANALYTICS (Span 1 col, 1 row) */}
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-[2rem] bg-noir-900 border border-white/5 overflow-hidden relative group"
            >
              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={20} className="text-purple-400" />
                    <h3 className="text-lg font-bold">Analytics</h3>
                  </div>
                  <p className="text-neutral-400 text-sm leading-tight">Live metrics tracking.</p>
                </div>
                
                {/* Snippet Grid */}
                <div className="grid grid-cols-3 gap-1 h-12">
                   <div className="bg-red-500/20 rounded border border-red-500/50"></div>
                   <div className="bg-yellow-500/20 rounded border border-yellow-500/50"></div>
                   <div className="bg-green-500/20 rounded border border-green-500/50"></div>
                   <div className="bg-white/5 rounded"></div>
                   <div className="bg-red-500/40 rounded border border-red-500/50"></div>
                   <div className="bg-white/5 rounded"></div>
                </div>
              </div>
            </motion.div>

            {/* 4. DIGITAL CART (Span 1 col, 1 row) */}
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-[2rem] bg-card-gradient border border-gold-500/30 overflow-hidden relative group shadow-gold-glow"
            >
              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={20} className="text-gold-400" />
                    <h3 className="text-lg font-bold text-gold-400">Digital Cart</h3>
                  </div>
                  <p className="text-neutral-300 text-sm leading-tight">Quick and easy ordering.</p>
                </div>
                
                <div className="bg-noir-950/50 rounded-xl border border-gold-500/20 p-4 flex items-center justify-between">
                   <p className="text-xs text-neutral-400 mb-1">Total</p>
                   <p className="text-xl font-display font-bold text-white">$42.50</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- GAMIFICATION SHOWCASE (Full Width) --- */}
      <section className="py-24 border-y border-white/5 relative overflow-hidden bg-noir-900/30">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-sm font-bold tracking-widest uppercase">
              <Award size={16} /> Gamification
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              Turn diners into loyal fans.
            </h2>
            <p className="text-lg text-neutral-400 mb-8">
              Keep them coming back with engaging leaderboards, unlockable badges, and an XP system that makes ordering fun.
            </p>
            
            <ul className="space-y-4">
              {[
                "Customizable loyalty tiers",
                "Automated rewards based on order history",
                "Competitive leaderboards for local diners"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300">
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-noir-950 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative z-10 max-w-sm mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto bg-gold-gradient rounded-full p-1 mb-4 shadow-gold-glow">
                  <div className="w-full h-full bg-noir-900 rounded-full flex items-center justify-center text-3xl">👑</div>
                </div>
                <h4 className="font-bold text-xl">Top Foodie</h4>
                <p className="text-gold-400 text-sm">Level 42</p>
              </div>

              <div className="bg-noir-900 rounded-xl p-4 mb-4">
                 <div className="flex justify-between text-xs font-bold mb-2">
                   <span>XP Progress</span>
                   <span className="text-gold-400">8,450 / 10,000</span>
                 </div>
                 <div className="w-full h-2 bg-noir-950 rounded-full overflow-hidden">
                   <div className="h-full bg-gold-gradient w-[84%] rounded-full shadow-gold-glow"></div>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-gold-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gold-500/5" />
                    <div className="flex items-center gap-3 relative z-10">
                      <span className="font-bold text-gold-400 w-4">1</span>
                      <div className="w-8 h-8 rounded-full bg-noir-800 flex items-center justify-center font-bold text-xs">Me</div>
                    </div>
                    <span className="text-xs font-bold text-gold-400 relative z-10">8,450 XP</span>
                 </div>
                 <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-neutral-400 w-4">2</span>
                      <div className="w-8 h-8 rounded-full bg-noir-800 flex items-center justify-center font-bold text-xs">J</div>
                    </div>
                    <span className="text-xs font-bold text-neutral-400">7,200 XP</span>
                 </div>
              </div>
            </div>

            {/* Decorative background card */}
            <div className="absolute top-10 -right-10 w-full h-full bg-noir-800 border border-white/5 rounded-[2rem] -z-10 transform -rotate-6 opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-bold mb-8"
          >
            Ready to redefine dining?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-400 mb-12"
          >
            Join the restaurants already increasing their revenue and customer satisfaction with RestorOS.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button onClick={() => navigate('/vendor-onboard')} className="bg-gold-gradient text-noir-950 px-12 py-5 rounded-full font-bold text-xl transition-all shadow-gold-lg hover:shadow-gold flex items-center gap-2 hover:scale-105 active:scale-95 w-full sm:w-auto justify-center">
              Book Your Demo <ChevronRight size={24} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-noir-950 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded bg-gold-gradient flex items-center justify-center text-noir-950 font-bold text-xl">R</div>
                <span className="font-display font-bold text-xl tracking-tight">RestorOS</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                The AI-powered ecosystem designed to multiply restaurant revenue and automate the dining experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-white">Product</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-gold-400 transition-colors">AI Waiter</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">AR Menus</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Gamification</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-gold-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white">Legal</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <p>© {new Date().getFullYear()} RestorOS. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
