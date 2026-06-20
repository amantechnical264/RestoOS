import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { DishRatingStore } from '../services/AIReviewService';

/**
 * DishRatingBadge
 * 
 * Displays the aggregate star rating for a dish computed from all customer reviews.
 * Shows average rating (e.g. ★ 4.3 · 12) in a compact badge format.
 *
 * Props:
 * - dishId: string (required)
 * - variant: 'compact' | 'full' | 'inline' (default: 'compact')
 * - className: string (optional)
 * - forceRefresh: any (change to trigger a refresh)
 */
export default function DishRatingBadge({ dishId, variant = 'compact', className = '', forceRefresh }) {
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (!dishId) return;
    const data = DishRatingStore.getDishRating(dishId);
    setRatingData(data);
  }, [dishId, forceRefresh]);

  if (!ratingData || ratingData.count === 0) return null;

  const { average, count } = ratingData;

  if (variant === 'inline') {
    // Minimal: ★ 4.3 (12)
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${className}`}>
        <Star size={10} className="text-amber-400 fill-amber-400" />
        <span className="text-neutral-700 dark:text-neutral-300">{average.toFixed(1)}</span>
        <span className="text-neutral-400">({count})</span>
      </span>
    );
  }

  if (variant === 'full') {
    // Full: shows all 5 stars with partial fill + count
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(star => {
            const filled = average >= star;
            const halfFilled = !filled && average >= star - 0.5;
            return (
              <div key={star} className="relative">
                <Star size={13} className="text-neutral-200 dark:text-neutral-700 fill-current" />
                {(filled || halfFilled) && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: filled ? '100%' : '50%' }}
                  >
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
          {average.toFixed(1)}
        </span>
        <span className="text-[10px] text-neutral-400">
          {count} {count === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    );
  }

  // Compact (default): pill badge
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 ${className}`}>
      <Star size={10} className="text-amber-500 fill-amber-500 flex-shrink-0" />
      <span className="text-[11px] font-black text-amber-700 dark:text-amber-300">
        {average.toFixed(1)}
      </span>
      <span className="text-[10px] text-amber-600/60 dark:text-amber-400/50 font-semibold">
        ({count})
      </span>
    </div>
  );
}
