import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BrowserQRCodeReader } from '@zxing/browser';
import { useAppContext } from '../context/AppContext';
import { QrCode, Zap, Sparkles, ChevronRight, CheckCircle2, ScanLine } from 'lucide-react';

export default function ScannerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActiveRestId, showNotification, restaurants } = useAppContext();
  const { t } = useTranslation();
  const videoRef = React.useRef(null);
  const controlsRef = React.useRef(null);
  const [hasCamera, setHasCamera] = React.useState(true);
  const [scanned, setScanned] = React.useState(false);
  const [scannedRest, setScannedRest] = React.useState(null);
  const isRescan = searchParams.get('rescan') === 'true';

  React.useEffect(() => {
    const restId = searchParams.get('restId');
    if (restId) {
      setActiveRestId(restId);
      const rest = restaurants.find(r => r.id === restId);
      if (rest) setScannedRest(rest);
      setScanned(true);
    }
  }, [searchParams, setActiveRestId, restaurants]);

  React.useEffect(() => {
    if (scanned) return;
    const codeReader = new BrowserQRCodeReader();
    const startScan = async () => {
      try {
        const controls = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result && !scanned) {
            const text = result.getText();
            try {
              const url = new URL(text);
              const restId = url.searchParams.get('restId');
              if (restId) {
                if (controlsRef.current) controlsRef.current.stop();
                setActiveRestId(restId);
                const rest = restaurants.find(r => r.id === restId);
                if (rest) setScannedRest(rest);
                setScanned(true);
              } else {
                showNotification('Invalid Table QR Code');
              }
            } catch (e) {
              if (text.startsWith('rest-')) {
                if (controlsRef.current) controlsRef.current.stop();
                setActiveRestId(text);
                const rest = restaurants.find(r => r.id === text);
                if (rest) setScannedRest(rest);
                setScanned(true);
              }
            }
          }
        });
        controlsRef.current = controls;
      } catch (err) {
        console.error(err);
        setHasCamera(false);
      }
    };
    startScan();
    return () => { if (controlsRef.current) controlsRef.current.stop(); };
  }, [scanned, setActiveRestId, showNotification, restaurants]);

  const handleEnterMenu = () => {
    navigate('/menu', { replace: true });
  };

  const simulateScan = () => {
    const rest = restaurants[0];
    if (rest) {
      if (controlsRef.current) controlsRef.current.stop();
      setActiveRestId(rest.id);
      setScannedRest(rest);
      setScanned(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-screen relative overflow-hidden bg-neutral-50 dark:bg-midnight-900 transition-colors"
    >
      {/* SaaS Tech Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20 dark:opacity-10 pointer-events-none blur-[100px]"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-10 pointer-events-none blur-[120px]"
        style={{ background: 'radial-gradient(circle, #AA8C2C 0%, transparent 70%)' }} />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 opacity-0 dark:opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Top bar */}
      {isRescan && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="relative z-20 p-6 pt-14 flex items-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-sm font-sans font-medium hover:text-black dark:hover:text-white transition-colors bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-neutral-200 dark:border-white/10">
            <ChevronRight size={16} className="rotate-180" />
            Back to Menu
          </button>
        </motion.div>
      )}

      {/* Brand header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
        className={`relative z-10 text-center ${isRescan ? 'pt-4' : 'pt-20'} pb-4 px-6`}>
        <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-xs font-sans font-bold tracking-widest uppercase">Smart Dining</span>
        </div>
        <h1 className="text-5xl font-display font-black text-neutral-900 dark:text-white tracking-tight mb-3 transition-colors">3Dish</h1>
        <p className="text-neutral-400 text-sm font-sans max-w-[250px] mx-auto leading-relaxed">
          Align your camera with the table code to launch the augmented reality menu.
        </p>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pb-8 w-full">
        <AnimatePresence mode="wait">
          {!scanned ? (
            <motion.div key="scanning"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full">

              {/* Glowing SaaS Reticle */}
              <div className="relative mb-10 mt-4">
                {/* Spinning outer dash ring */}
                <div className="absolute -inset-8 border-[2px] border-dashed border-[#D4AF37]/30 rounded-full animate-[reticleSpin_12s_linear_infinite]" />
                <div className="absolute -inset-4 border-[1px] border-dashed border-[#AA8C2C]/20 rounded-full animate-[reticleSpin_8s_linear_infinite_reverse]" />

                {/* Main viewfinder */}
                <div className="w-72 h-72 rounded-[2rem] relative overflow-hidden bg-white/80 dark:bg-midnight-800/80 backdrop-blur-xl border border-neutral-200 dark:border-white/10 shadow-[0_0_50px_rgba(212,175,55,0.15)] transition-colors">
                  
                  {/* Scanner Beam */}
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="absolute w-full h-32 z-20 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.2), rgba(212,175,55,0.6))', borderBottom: '2px solid #D4AF37', boxShadow: '0 10px 20px rgba(212,175,55,0.4)' }}
                  />

                  <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover z-10 opacity-90 mix-blend-screen" playsInline muted />

                  {/* Corner reticles */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-[2rem] z-30 m-[-2px]" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-[2rem] z-30 m-[-2px]" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-[2rem] z-30 m-[-2px]" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#D4AF37] rounded-br-[2rem] z-30 m-[-2px]" />

                  {/* Center QR icon placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center z-5 opacity-10">
                    <ScanLine size={100} className="text-[#D4AF37]" />
                  </div>
                </div>
              </div>

              {!hasCamera && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-center text-sm max-w-xs backdrop-blur-md">
                  Camera unavailable. Please use the demo button below.
                </motion.div>
              )}

              {/* Demo/Simulate button */}
              <motion.button onClick={simulateScan}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 font-sans font-bold text-sm px-8 py-4 rounded-full transition-all border bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/10 backdrop-blur-md shadow-sm">
                <Zap size={16} className="text-[#D4AF37]" />
                {t('scanner.simulate', 'Simulate QR Scan')}
              </motion.button>
            </motion.div>

          ) : (
            // ── Success state (Glassmorphic Bottom Sheet simulation) ──────────────────────────────────
            <motion.div key="success"
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 w-full pt-8 pb-10 px-6 rounded-t-[3rem] border-t border-white/10"
              style={{ background: 'rgba(18, 20, 29, 0.85)', backdropFilter: 'blur(40px)', boxShadow: '0 -20px 60px rgba(0,0,0,0.5)' }}>
              
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

              <div className="flex flex-col items-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={40} className="text-accent-emerald" />
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  <p className="text-accent-emerald font-sans font-bold text-sm tracking-widest uppercase mb-2">Connected</p>
                  <h2 className="text-4xl font-display font-black text-white mb-3">{scannedRest?.name || 'Restaurant'}</h2>
                  <p className="text-neutral-300 text-sm font-sans mb-8 max-w-[280px] mx-auto leading-relaxed">
                    Table synchronized. Ready to explore the interactive 3D menu.
                  </p>
                </motion.div>

                <motion.button onClick={handleEnterMenu}
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full font-sans font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg text-black shadow-[0_10px_30px_rgba(212,175,55,0.4)]"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)' }}>
                  Launch Experience <ChevronRight size={22} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Vendor link */}
      {!scanned && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="absolute bottom-10 left-0 right-0 z-30 flex justify-center">
          <button onClick={() => navigate('/vendor-auth')}
            className="font-sans text-xs font-bold px-8 py-4 rounded-full transition-all border border-neutral-200 dark:border-white/20 text-white bg-neutral-900 dark:text-black dark:bg-white hover:scale-105 shadow-xl flex items-center gap-2">
            Restaurant Partner? <span className="text-[#D4AF37] dark:text-[#AA8C2C]">Sign In</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
