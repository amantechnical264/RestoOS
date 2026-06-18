import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollDirection } from '../hooks/useScrollDirection';

export default function FullscreenManager() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If the user exits fullscreen (either via Esc key or system gesture),
      // we consider it dismissed so we don't aggressively force it again.
      if (!isCurrentlyFullscreen) {
        setHasDismissed(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // If they are already in fullscreen or have explicitly dismissed it, do not auto-trigger
    if (isFullscreen || hasDismissed) return;

    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
      } catch (err) {
        // Silently fail if browser blocks it or we're already in fullscreen
      }
    };

    // Attach to the first user interaction
    document.addEventListener('click', requestFullscreen, { once: true });
    document.addEventListener('touchstart', requestFullscreen, { once: true });

    return () => {
      document.removeEventListener('click', requestFullscreen);
      document.removeEventListener('touchstart', requestFullscreen);
    };
  }, [isFullscreen, hasDismissed]);

  const exitFullscreen = () => {
    setHasDismissed(true);
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  return (
    <AnimatePresence>
      {isFullscreen && scrollDirection === 'up' && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={exitFullscreen}
          className="fixed top-4 left-4 z-[99999] p-3 rounded-full bg-white dark:bg-black backdrop-blur-xl border border-black/10 dark:border-white/10 text-[#D4AF37] shadow-2xl hover:scale-105 transition-all"
          aria-label="Exit Fullscreen"
        >
          <ArrowLeft size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
