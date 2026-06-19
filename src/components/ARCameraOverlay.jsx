import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Camera, Move3D, ZoomIn, Hand } from 'lucide-react';

/**
 * ARCameraOverlay — A full-screen pseudo-AR experience.
 *
 * Opens the rear camera, shows an onboarding animation ("tap to place"),
 * then composites a <model-viewer> element at the tapped position.
 * The user can orbit (drag), pinch-zoom, reset, or take a snapshot.
 *
 * Works on ALL browsers (iOS Safari, Chrome, Firefox) — no WebXR needed.
 */
export default function ARCameraOverlay({ modelUrl, dishName, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);
  const modelContainerRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [modelPosition, setModelPosition] = useState(null);
  const [modelScale, setModelScale] = useState(1);
  const [snapshotFlash, setSnapshotFlash] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  // ── Start camera ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        console.error('Camera access failed:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access and try again.'
            : 'Could not access camera. Please make sure your device has a camera.'
        );
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Ensure model-viewer script is loaded ──────────────────────────
  useEffect(() => {
    if (customElements.get('model-viewer')) return;
    const existing = document.querySelector('script[src*="model-viewer"]');
    if (existing) return;
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
    document.head.appendChild(s);
  }, []);

  // ── Create model-viewer once placed ───────────────────────────────
  useEffect(() => {
    const container = modelContainerRef.current;
    if (!container || !modelPosition || !modelUrl) return;

    // Clear previous
    container.innerHTML = '';

    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', modelUrl);
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('touch-action', 'none');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('camera-orbit', '0deg 65deg 105%');
    mv.setAttribute('min-camera-orbit', 'auto auto 40%');
    mv.setAttribute('max-camera-orbit', 'auto auto 250%');
    mv.setAttribute('shadow-intensity', '0.7');
    mv.setAttribute('shadow-softness', '1');
    mv.setAttribute('exposure', '1.2');
    mv.setAttribute('environment-image', 'neutral');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('auto-rotate-delay', '3000');
    mv.setAttribute('rotation-per-second', '8deg');
    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.background = 'transparent';
    mv.style.setProperty('--poster-color', 'transparent');

    mv.addEventListener('load', () => setModelLoaded(true));

    container.appendChild(mv);

    return () => {
      container.innerHTML = '';
      setModelLoaded(false);
    };
  }, [modelPosition, modelUrl]);

  // ── Handle tap to place ───────────────────────────────────────────
  const handleTapToPlace = useCallback((e) => {
    if (!showOnboarding && modelPosition) return; // Already placed

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get tap coordinates (touch or mouse)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Place model centered on tap, size ~60% of viewport width
    const modelSize = Math.min(rect.width, rect.height) * 0.6 * modelScale;
    setModelPosition({
      x: x - modelSize / 2,
      y: y - modelSize / 2,
      size: modelSize,
      centerX: x,
      centerY: y,
    });
    setShowOnboarding(false);
  }, [showOnboarding, modelPosition, modelScale]);

  // ── Reset ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setModelPosition(null);
    setShowOnboarding(true);
    setModelLoaded(false);
    setModelScale(1);
  };

  // ── Snapshot ──────────────────────────────────────────────────────
  const handleSnapshot = async () => {
    try {
      const container = containerRef.current;
      const video = videoRef.current;
      if (!container || !video) return;

      // Create canvas at video resolution
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Overlay text
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(`${dishName || 'Dish'} — 3Dish AR Preview`, 20, canvas.height - 22);

      // Flash effect
      setSnapshotFlash(true);
      setTimeout(() => setSnapshotFlash(false), 300);

      // Download
      const link = document.createElement('a');
      link.download = `3dish-ar-${dishName?.replace(/\s+/g, '-') || 'preview'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Snapshot failed:', err);
    }
  };

  // ── Close handler ─────────────────────────────────────────────────
  const handleClose = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onClose();
  };

  // ── Camera error state ────────────────────────────────────────────
  if (cameraError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-6">
          <Camera size={36} className="text-red-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-3">Camera Unavailable</h2>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mb-8">{cameraError}</p>
        <button
          onClick={handleClose}
          className="px-8 py-3.5 rounded-2xl font-black text-sm text-black"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)' }}
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black"
      style={{ touchAction: 'none' }}
    >
      {/* ── Camera Feed ───────────────────────────────────────────── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(1)' }}
      />

      {/* ── Vignette overlay for premium feel ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* ── Corner frame guides ───────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left */}
        <div className="absolute top-16 left-6 w-12 h-12 border-l-2 border-t-2 border-white/25 rounded-tl-xl" />
        {/* Top-right */}
        <div className="absolute top-16 right-6 w-12 h-12 border-r-2 border-t-2 border-white/25 rounded-tr-xl" />
        {/* Bottom-left */}
        <div className="absolute bottom-36 left-6 w-12 h-12 border-l-2 border-b-2 border-white/25 rounded-bl-xl" />
        {/* Bottom-right */}
        <div className="absolute bottom-36 right-6 w-12 h-12 border-r-2 border-b-2 border-white/25 rounded-br-xl" />
      </div>

      {/* ── Interactive layer (tap target) ────────────────────────── */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        onClick={handleTapToPlace}
        onTouchEnd={(e) => {
          if (showOnboarding || !modelPosition) {
            handleTapToPlace(e);
          }
        }}
      >
        {/* ── Placed 3D Model ─────────────────────────────────────── */}
        <AnimatePresence>
          {modelPosition && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              ref={modelContainerRef}
              className="absolute"
              style={{
                left: modelPosition.x,
                top: modelPosition.y,
                width: modelPosition.size,
                height: modelPosition.size,
                zIndex: 10,
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
              }}
              onClick={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              {/* Shadow circle beneath the dish */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: '70%',
                  height: '15%',
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Snapshot flash ────────────────────────────────────────── */}
      <AnimatePresence>
        {snapshotFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ── Top header bar ────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-30 px-5 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/40" />
            <span className="text-white/80 text-xs font-black tracking-[0.2em] uppercase">
              AR View
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <X size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* ── Onboarding overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {showOnboarding && cameraReady && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Pulsing ring */}
            <div className="relative mb-8">
              <motion.div
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 w-24 h-24 rounded-full"
                style={{ border: '2px solid rgba(212,175,55,0.5)' }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute inset-0 w-24 h-24 rounded-full"
                style={{ border: '2px solid rgba(212,175,55,0.3)' }}
              />

              {/* Hand icon with tap animation */}
              <motion.div
                animate={{
                  y: [0, 8, 0],
                  scale: [1, 0.92, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(212,175,55,0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  boxShadow: '0 8px 40px rgba(212,175,55,0.2)',
                }}
              >
                <Hand size={36} className="text-[#D4AF37]" />
              </motion.div>
            </div>

            {/* Instruction text */}
            <div
              className="px-8 py-4 rounded-2xl text-center max-w-xs"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-white font-black text-base mb-1">
                Tap to Place Your Dish
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                Tap anywhere on the surface where you'd like to see{' '}
                <span className="text-[#D4AF37] font-bold">{dishName || 'the dish'}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Model placed hints ────────────────────────────────────── */}
      <AnimatePresence>
        {modelPosition && modelLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-28 left-0 right-0 z-20 flex justify-center pointer-events-none"
          >
            <div
              className="flex items-center gap-4 px-5 py-3 rounded-2xl"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <Move3D size={14} className="text-[#D4AF37]" />
                <span className="text-white/70 text-[11px] font-bold">Drag to orbit</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <ZoomIn size={14} className="text-[#D4AF37]" />
                <span className="text-white/70 text-[11px] font-bold">Pinch to zoom</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom toolbar ────────────────────────────────────────── */}
      <AnimatePresence>
        {modelPosition && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-30 px-6 pb-10 pt-6"
          >
            {/* Dish name tag */}
            <div className="flex justify-center mb-4">
              <div
                className="px-5 py-2.5 rounded-2xl"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <span className="text-white font-black text-sm tracking-wide">
                  {dishName || 'Dish Preview'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="flex items-center justify-center gap-4 py-4 px-6 rounded-3xl mx-auto max-w-xs"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Reset */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleReset}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <RotateCcw size={20} className="text-white" />
                </div>
                <span className="text-white/50 text-[10px] font-bold">Reset</span>
              </motion.button>

              {/* Snapshot — Hero button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleSnapshot}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)',
                    boxShadow: '0 4px 25px rgba(212,175,55,0.35)',
                    border: '2px solid rgba(212,175,55,0.5)',
                  }}
                >
                  <Camera size={24} className="text-black" />
                </div>
                <span className="text-[#D4AF37] text-[10px] font-black">Capture</span>
              </motion.button>

              {/* Close */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleClose}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <X size={20} className="text-white" />
                </div>
                <span className="text-white/50 text-[10px] font-bold">Close</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Camera loading state ──────────────────────────────────── */}
      <AnimatePresence>
        {!cameraReady && !cameraError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#D4AF37]"
            />
            <p className="text-white/50 text-xs font-black tracking-[0.2em] uppercase">
              Starting Camera
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
