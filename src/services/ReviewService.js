import { supabase } from './supabase';

class ReviewService {
  constructor() {
    this.useLocalStorage = false;
    this.init();
  }

  async init() {
    try {
      const { error } = await supabase.from('reviews').select('id').limit(1);
      if (error && error.code === '42P01') {
        console.warn('Reviews table does not exist. Falling back to localStorage.');
        this.useLocalStorage = true;
      }
    } catch (e) {
      this.useLocalStorage = true;
    }
  }

  async submitReview(reviewData) {
    if (this.useLocalStorage) {
      const reviews = JSON.parse(localStorage.getItem('3dish_reviews') || '[]');
      reviews.push({
        ...reviewData,
        id: 'rev_' + Date.now(),
        created_at: new Date().toISOString()
      });
      localStorage.setItem('3dish_reviews', JSON.stringify(reviews));
      return { data: reviewData, error: null };
    } else {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            order_id: reviewData.orderId,
            rest_id: reviewData.restId,
            diner_name: reviewData.dinerName,
            rating: reviewData.rating,
          }
        ]);
      return { data, error };
    }
  }

  async getReviewsForRestaurant(restId) {
    if (this.useLocalStorage) {
      const reviews = JSON.parse(localStorage.getItem('3dish_reviews') || '[]');
      return { data: reviews.filter(r => r.restId === restId || r.rest_id === restId), error: null };
    } else {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('rest_id', restId)
        .order('created_at', { ascending: false });
      return { data, error };
    }
  }
}

export const reviewService = new ReviewService();
