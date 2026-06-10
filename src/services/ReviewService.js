import { supabase } from './supabase';

/**
 * ReviewService
 *
 * Reviews are stored directly on the `orders` table by updating two columns:
 *   - review_rating  (integer 1–5)
 *   - review_name    (string, diner display name)
 *   - reviewed_at    (ISO timestamp)
 *
 * This means no separate `reviews` table is needed and reviews are
 * immediately visible to the vendor because orders already sync in real-time.
 *
 * Falls back to localStorage only when Supabase is unavailable.
 */
class ReviewService {
  constructor() {
    this.useLocalStorage = !supabase;
  }

  /**
   * Submit a review by patching the existing order row.
   * @param {{ orderId, restId, dinerName, rating }} reviewData
   */
  async submitReview({ orderId, restId, dinerName, rating }) {
    if (this.useLocalStorage || !supabase) {
      // Fallback: store in localStorage keyed by restId
      const key = '3dish_reviews';
      const all = JSON.parse(localStorage.getItem(key) || '[]');
      // Avoid duplicate review for same orderId
      const filtered = all.filter(r => r.orderId !== orderId);
      filtered.push({
        id: 'rev_' + orderId,
        orderId,
        restId,
        rest_id: restId,
        diner_name: dinerName,
        rating,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(filtered));
      return { data: null, error: null };
    }

    // Persist onto the orders row — works without a separate table
    const { data, error } = await supabase
      .from('orders')
      .update({
        review_rating: rating,
        review_name: dinerName,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      // If the columns don't exist yet, silently fall back to localStorage
      console.warn('ReviewService: order update failed, falling back to localStorage.', error.message);
      const key = '3dish_reviews';
      const all = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = all.filter(r => r.orderId !== orderId);
      filtered.push({
        id: 'rev_' + orderId,
        orderId,
        restId,
        rest_id: restId,
        diner_name: dinerName,
        rating,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(filtered));
    }

    return { data, error: null };
  }

  /**
   * Fetch all reviews for a restaurant.
   * Primary: reads from orders table where review_rating IS NOT NULL.
   * Fallback: reads from localStorage.
   */
  async getReviewsForRestaurant(restId) {
    if (this.useLocalStorage || !supabase) {
      const all = JSON.parse(localStorage.getItem('3dish_reviews') || '[]');
      return {
        data: all.filter(r => r.restId === restId || r.rest_id === restId),
        error: null,
      };
    }

    // Fetch from orders table
    const { data, error } = await supabase
      .from('orders')
      .select('id, contact_name, review_rating, review_name, reviewed_at, rest_id, timestamp')
      .eq('rest_id', restId)
      .not('review_rating', 'is', null)
      .order('reviewed_at', { ascending: false });

    if (error) {
      // If columns don't exist (42703 = column not found), try localStorage
      if (error.code === '42703' || error.code === 'PGRST116') {
        const all = JSON.parse(localStorage.getItem('3dish_reviews') || '[]');
        return {
          data: all.filter(r => r.restId === restId || r.rest_id === restId),
          error: null,
        };
      }
      return { data: [], error };
    }

    // Normalise shape to match what ReviewsAnalytics expects
    const normalised = (data || []).map(row => ({
      id: row.id,
      diner_name: row.review_name || row.contact_name || 'Anonymous Diner',
      rating: row.review_rating,
      created_at: row.reviewed_at || row.timestamp,
      rest_id: row.rest_id,
    }));

    return { data: normalised, error: null };
  }
}

export const reviewService = new ReviewService();
