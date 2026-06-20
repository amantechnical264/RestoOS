import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Sparkles, Check, Pencil, Send, ThumbsUp, Loader2 } from 'lucide-react';
import { generateAIReviewSuggestions, getRatingLabel, getRatingEmoji, DishRatingStore } from '../services/AIReviewService';
import { reviewService } from '../services/ReviewService';

const GOLD = '#D4AF37';

/**
 * StarRatingInput — interactive star picker
 */
function StarRatingInput({ rating, setRating, hoverRating, setHoverRating, size = 28 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <motion.button
          key={star}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.2 }}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={`transition-all duration-150 ${
              (hoverRating || rating) >= star
                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

/**
 * AISuggestionChip — a single AI-generated review chip
 */
function AISuggestionChip({ text, isSelected, onSelect }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className={`relative text-left text-xs font-medium px-3.5 py-2.5 rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400/60 text-amber-700 dark:text-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
          : 'bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-amber-400/40 hover:bg-amber-50/50 dark:hover:bg-white/8'
      }`}
    >
      {isSelected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow"
        >
          <Check size={9} strokeWidth={3} className="text-black" />
        </motion.span>
      )}
      <span className="line-clamp-3 leading-relaxed">{text}</span>
    </motion.button>
  );
}

/**
 * DishReviewModal
 * Fully self-contained modal for reviewing a specific dish in an order.
 *
 * Props:
 * - dish: the dish object { id, name, description, tags, price, spiceLevel, dietaryPreference }
 * - order: the order object { id, rest_id, restId }
 * - initialRating: pre-existing rating (0 if none)
 * - onClose: () => void
 * - onSubmit: (orderId, restId, rating, reviewText, dishId) => Promise<void>
 * - dinerName: string
 */
export default function DishReviewModal({
  dish,
  order,
  initialRating = 0,
  onClose,
  onSubmit,
  dinerName = 'Anonymous Diner',
}) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(initialRating > 0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Regenerate AI suggestions when rating changes
  useEffect(() => {
    if (rating > 0) {
      setIsGenerating(true);
      setSelectedSuggestion(null);
      
      // Simulate a brief "AI thinking" delay for UX polish
      const timer = setTimeout(() => {
        const suggestions = generateAIReviewSuggestions(dish, rating);
        setAiSuggestions(suggestions);
        setIsGenerating(false);
      }, 400);
      
      return () => clearTimeout(timer);
    } else {
      setAiSuggestions([]);
    }
  }, [rating, dish]);

  const handleSuggestionSelect = useCallback((suggestion, index) => {
    if (selectedSuggestion === index) {
      setSelectedSuggestion(null);
    } else {
      setSelectedSuggestion(index);
      setShowCustomInput(false);
    }
  }, [selectedSuggestion]);

  const handleWriteOwn = useCallback(() => {
    setShowCustomInput(prev => !prev);
    setSelectedSuggestion(null);
  }, []);

  const getReviewText = () => {
    if (showCustomInput && customText.trim()) return customText.trim();
    if (selectedSuggestion !== null) return aiSuggestions[selectedSuggestion];
    return '';
  };

  const handleSubmit = async () => {
    if (!rating || isSubmitting || isSubmitted) return;
    
    const reviewText = getReviewText();
    setIsSubmitting(true);
    
    try {
      const restId = order?.restId || order?.rest_id;
      
      // Record per-dish rating locally
      if (dish?.id) {
        DishRatingStore.recordRating(dish.id, rating, restId);
      }
      
      await onSubmit(order.id, restId, rating, reviewText, dish?.id);
      setIsSubmitted(true);
    } catch (e) {
      console.error('Review submit failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;
  const ratingLabel = getRatingLabel(displayRating);
  const ratingEmoji = getRatingEmoji(displayRating);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="bg-white dark:bg-[#0f0f14] w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-white/8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-white/5">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
          
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)' }}>
                  <Sparkles size={12} className="text-black" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: GOLD }}>AI-Assisted Review</span>
              </div>
              <h3 className="font-display font-black text-lg text-neutral-900 dark:text-white leading-tight truncate">
                {dish?.name || 'Rate this dish'}
              </h3>
              {dish?.description && (
                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{dish.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/8 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors"
            >
              <X size={15} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 overflow-y-auto max-h-[75vh]">
          {!isSubmitted ? (
            <>
              {/* Star Rating Section */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <StarRatingInput
                  rating={rating}
                  setRating={setRating}
                  hoverRating={hoverRating}
                  setHoverRating={setHoverRating}
                  size={36}
                />
                <AnimatePresence mode="wait">
                  {displayRating > 0 && (
                    <motion.div
                      key={displayRating}
                      initial={{ opacity: 0, y: -8, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-2xl">{ratingEmoji}</span>
                      <span className="text-base font-black text-neutral-900 dark:text-white">{ratingLabel}</span>
                    </motion.div>
                  )}
                  {!displayRating && (
                    <motion.p
                      key="prompt"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-neutral-400 font-medium"
                    >
                      Tap a star to rate
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Suggestions Section */}
              <AnimatePresence>
                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {/* Section label */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                        <Sparkles size={11} style={{ color: GOLD }} />
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: GOLD }}>
                          AI Suggestions
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium">Pick one or write your own</span>
                    </div>

                    {/* AI Chips */}
                    {isGenerating ? (
                      <div className="flex items-center justify-center py-6 gap-2">
                        <Loader2 size={16} className="animate-spin text-amber-400" />
                        <span className="text-xs text-neutral-400 font-medium">Generating suggestions…</span>
                      </div>
                    ) : (
                      <div className="grid gap-2.5 mb-4">
                        <AnimatePresence>
                          {aiSuggestions.map((suggestion, i) => (
                            <AISuggestionChip
                              key={`${rating}-${i}`}
                              text={suggestion}
                              isSelected={selectedSuggestion === i}
                              onSelect={() => handleSuggestionSelect(suggestion, i)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Write Your Own Button */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleWriteOwn}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-bold transition-all mb-3 ${
                        showCustomInput
                          ? 'bg-neutral-100 dark:bg-white/8 border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-white'
                          : 'bg-white dark:bg-transparent border-dashed border-neutral-300 dark:border-white/15 text-neutral-500 hover:border-neutral-400 dark:hover:border-white/25 hover:text-neutral-700 dark:hover:text-neutral-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Pencil size={11} className="text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <span>Write your own review</span>
                      {showCustomInput && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center"
                        >
                          <Check size={9} strokeWidth={3} className="text-black" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Custom Text Area */}
                    <AnimatePresence>
                      {showCustomInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <textarea
                            autoFocus
                            value={customText}
                            onChange={e => setCustomText(e.target.value)}
                            placeholder={`Share what you thought about ${dish?.name || 'this dish'}…`}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-amber-400/50 resize-none transition-all mb-3 leading-relaxed"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmit}
                      disabled={!rating || isSubmitting || (!getReviewText() && !showCustomInput)}
                      className={`w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                        rating && !isSubmitting
                          ? 'text-black shadow-amber-500/20'
                          : 'bg-neutral-200 dark:bg-white/10 text-neutral-400 cursor-not-allowed shadow-none'
                      }`}
                      style={rating && !isSubmitting
                        ? { background: 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)' }
                        : undefined
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Submitting…</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Submit {rating > 0 ? `${rating}-Star ` : ''}Review</span>
                        </>
                      )}
                    </motion.button>

                    {/* Skip review hint */}
                    {!getReviewText() && rating > 0 && !showCustomInput && !isGenerating && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-[11px] text-neutral-400 mt-2"
                      >
                        Select a suggestion above or submit rating only
                      </motion.p>
                    )}

                    {/* Submit with just star rating (no text) */}
                    {rating > 0 && !getReviewText() && !showCustomInput && !isGenerating && (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full mt-1.5 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                      >
                        Submit rating only (no comment)
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '2px solid rgba(212,175,55,0.3)' }}
              >
                <ThumbsUp size={36} style={{ color: GOLD }} />
              </motion.div>
              
              <div>
                <h4 className="font-display font-black text-xl text-neutral-900 dark:text-white mb-1">
                  Thank you! 🎉
                </h4>
                <p className="text-sm text-neutral-500">
                  Your {rating}-star review has been submitted
                </p>
                <div className="flex justify-center gap-0.5 mt-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={18}
                      className={`${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-neutral-400 max-w-[200px]">
                Your review helps other diners discover great dishes!
              </p>
              
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl font-bold text-sm text-black"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)' }}
              >
                Done
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
