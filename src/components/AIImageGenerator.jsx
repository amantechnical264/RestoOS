import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, RefreshCw, X, Wand2, ImageIcon, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabase';

/**
 * AIImageGenerator — Inline panel for AI-powered dish image generation.
 *
 * Uses Pollinations.ai (free, no API key) to generate professional food
 * photography based on the dish's metadata (name, description, origin, etc.).
 *
 * Props:
 *   dishName, dishDescription, dishOrigin, dishCategory, dietaryPref
 *   activeRestId  — for Supabase upload path
 *   onImageConfirmed(url) — called with the Supabase public URL on confirm
 *   onClose() — called when user discards / closes the panel
 */
export default function AIImageGenerator({
  dishName = '',
  dishDescription = '',
  dishOrigin = '',
  dishCategory = '',
  dietaryPref = '',
  activeRestId = '',
  onImageConfirmed,
  onClose,
}) {
  const [state, setState] = useState('idle'); // idle | generating | preview | uploading | error
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBlobUrl, setImageBlobUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 999999));
  const abortRef = useRef(null);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl);
    };
  }, [imageBlobUrl]);

  // ── Build the prompt ──────────────────────────────────────────────
  const buildPrompt = useCallback(() => {
    const parts = [
      'Professional food photography',
      dishName && `of ${dishName}`,
      dishDescription && dishDescription.slice(0, 120),
      dishOrigin && `${dishOrigin} cuisine style`,
      dietaryPref && `${dietaryPref} dish`,
      'beautifully plated on a premium ceramic plate',
      'dramatic moody lighting, shallow depth of field',
      'dark elegant restaurant background, garnished',
      'ultra realistic, 8k quality, appetizing food art',
    ]
      .filter(Boolean)
      .join(', ');

    return parts;
  }, [dishName, dishDescription, dishOrigin, dietaryPref]);

  // ── Generate image ────────────────────────────────────────────────
  const generateImage = useCallback(async () => {
    setState('generating');
    setErrorMsg('');
    setImageUrl(null);
    if (imageBlobUrl) {
      URL.revokeObjectURL(imageBlobUrl);
      setImageBlobUrl(null);
    }

    try {
      const prompt = buildPrompt();
      const encodedPrompt = encodeURIComponent(prompt);
      const currentSeed = seed;

      // Pollinations.ai — free, no API key required
      // Returns a generated image directly as image/jpeg
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${currentSeed}&model=flux&nologo=true`;

      // Fetch the image as a blob to get it into memory
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) throw new Error(`Generation failed (${response.status})`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      setImageUrl(url);
      setImageBlobUrl(blobUrl);
      setState('preview');
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('AI image generation failed:', err);
      setErrorMsg('Image generation failed. Please try again.');
      setState('error');
    }
  }, [buildPrompt, seed, imageBlobUrl]);

  // ── Regenerate with new seed ──────────────────────────────────────
  const handleRegenerate = () => {
    setSeed(Math.floor(Math.random() * 999999));
    // Will trigger re-generate due to seed change
    setTimeout(generateImage, 50);
  };

  // ── Confirm: upload to Supabase & pass URL back ───────────────────
  const handleConfirm = async () => {
    if (!imageBlobUrl) return;
    setState('uploading');

    try {
      // Fetch the blob from the blob URL
      const res = await fetch(imageBlobUrl);
      const blob = await res.blob();

      // Upload to Supabase Storage
      const fileName = `ai_${Date.now()}_${dishName.replace(/\s+/g, '_').slice(0, 30)}.jpg`;
      const filePath = `${activeRestId || 'general'}/${fileName}`;

      const { error } = await supabase.storage
        .from('models')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: pub } = supabase.storage.from('models').getPublicUrl(filePath);

      if (onImageConfirmed) onImageConfirmed(pub.publicUrl);
      setState('idle');
      onClose?.();
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMsg('Failed to upload image. Check your Supabase storage settings.');
      setState('error');
    }
  };

  // ── Cancel / close ────────────────────────────────────────────────
  const handleClose = () => {
    abortRef.current?.abort();
    if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl);
    setState('idle');
    onClose?.();
  };

  // ── Auto-generate on mount ────────────────────────────────────────
  useEffect(() => {
    if (state === 'idle' && dishName) {
      generateImage();
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="overflow-hidden"
    >
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{
          background: 'linear-gradient(145deg, #1a1025 0%, #0f0a18 100%)',
          border: '1px solid rgba(168,85,247,0.2)',
          boxShadow: '0 8px 40px rgba(168,85,247,0.1)',
        }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
                border: '1px solid rgba(168,85,247,0.3)',
              }}
            >
              <Wand2 size={16} className="text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">AI Image Generator</h4>
              <p className="text-[10px] text-purple-300/60">Powered by AI • Free generation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={14} className="text-white/60" />
          </button>
        </div>

        {/* ── Context chip ─────────────────────────────────────────── */}
        {dishName && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
            <Sparkles size={12} className="text-purple-400 shrink-0" />
            <p className="text-[11px] text-white/50 leading-snug truncate">
              Generating: <span className="text-white/80 font-bold">{dishName}</span>
              {dishDescription && ` — ${dishDescription.slice(0, 60)}...`}
            </p>
          </div>
        )}

        {/* ── Generating State ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {(state === 'generating' || state === 'uploading') && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: '1', maxHeight: 280 }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-950 to-pink-950" />

              {/* Animated sparkles */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {/* Orbiting dots */}
                <div className="relative w-20 h-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-pink-400" />
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-fuchsia-400" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-2"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-300" />
                    <div className="absolute bottom-0 right-1/4 w-1 h-1 rounded-full bg-pink-300" />
                  </motion.div>

                  {/* Central icon */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {state === 'uploading' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 rounded-full border-2 border-purple-400/30 border-t-purple-400"
                      />
                    ) : (
                      <Sparkles size={28} className="text-purple-300" />
                    )}
                  </motion.div>
                </div>

                <div className="text-center">
                  <p className="text-white/90 text-sm font-black">
                    {state === 'uploading' ? 'Uploading to Cloud...' : 'Creating your dish...'}
                  </p>
                  <p className="text-purple-300/50 text-[11px] mt-1">
                    {state === 'uploading' ? 'Almost done' : 'AI is crafting the perfect shot'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Preview State ──────────────────────────────────────── */}
          {state === 'preview' && imageBlobUrl && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              {/* Generated image */}
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/20" style={{ aspectRatio: '1', maxHeight: 280 }}>
                <img
                  src={imageBlobUrl}
                  alt={`AI generated: ${dishName}`}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-white/60 tracking-wider uppercase">
                    AI Generated
                  </span>
                  <span className="text-[10px] font-bold text-purple-300/70 flex items-center gap-1">
                    <Sparkles size={10} /> Pollinations AI
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {/* Confirm */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    boxShadow: '0 4px 20px rgba(168,85,247,0.3)',
                  }}
                >
                  <Check size={16} />
                  Confirm & Use
                </motion.button>

                {/* Regenerate */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRegenerate}
                  className="px-4 py-3 rounded-xl font-bold text-xs text-purple-300 flex items-center gap-1.5 hover:bg-white/5 transition-colors"
                  style={{ border: '1px solid rgba(168,85,247,0.25)' }}
                >
                  <RefreshCw size={14} />
                  Redo
                </motion.button>

                {/* Discard */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="px-4 py-3 rounded-xl font-bold text-xs text-white/40 flex items-center gap-1.5 hover:bg-white/5 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Error State ────────────────────────────────────────── */}
          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-6 text-center bg-red-950/30 border border-red-900/30"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <p className="text-sm font-bold text-red-300 mb-1">{errorMsg}</p>
              <p className="text-[11px] text-red-400/50 mb-4">The AI service may be temporarily unavailable</p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={generateImage}
                  className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/25 transition-colors"
                >
                  <RefreshCw size={12} /> Retry
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── No dish name warning ────────────────────────────────── */}
        {!dishName && state === 'idle' && (
          <div className="rounded-xl p-4 bg-amber-950/30 border border-amber-900/30 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-300">Enter a dish name first</p>
              <p className="text-[11px] text-amber-400/50 mt-0.5">The AI needs at least a dish name to generate a relevant image</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
