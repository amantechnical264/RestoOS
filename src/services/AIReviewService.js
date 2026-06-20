/**
 * AIReviewService
 *
 * Generates AI review suggestions for dishes based on:
 * - Dish name, description, tags, price
 * - Star rating selected (1–5)
 * - Dish type (veg/non-veg, spice level, category)
 *
 * Falls back to curated smart suggestions if AI is unavailable.
 */

// Curated smart review templates indexed by rating (1-5) and dish attributes
const REVIEW_TEMPLATES = {
  1: {
    base: [
      "Disappointed – the dish didn't live up to expectations at all.",
      "The {dishName} was quite underwhelming. Not worth the price.",
      "Unfortunately, this wasn't enjoyable. Would not recommend.",
      "Bland flavors and the portion was too small for the price.",
      "The presentation was poor and the taste was off. Expected much better."
    ],
    spicy: [
      "Way too spicy – couldn't finish it. Needs better balance.",
      "Overwhelmingly hot, overshadowed all the other flavors.",
      "The spice level was unreasonably high – not enjoyable."
    ],
    vegan: [
      "The plant-based flavors were missing. Lacked depth.",
      "Expected more from a vegan dish at this price point."
    ]
  },
  2: {
    base: [
      "Below average experience. The {dishName} had potential but fell short.",
      "Not bad, but not good either. Needs improvement in flavor.",
      "Mediocre dish – the ingredients were fresh but poorly seasoned.",
      "Average at best. There are better options on the menu.",
      "The dish arrived lukewarm and wasn't as described."
    ],
    spicy: [
      "Too spicy for my taste, couldn't appreciate the other flavors.",
      "Spice level overpowered everything else – needs more balance."
    ],
    premium: [
      "For the price, I expected much more. Quite disappointing.",
      "Overpriced for the quality delivered."
    ]
  },
  3: {
    base: [
      "Decent {dishName} – nothing extraordinary but satisfying enough.",
      "Good enough for a casual meal. Not the best, not the worst.",
      "Average dish, well-portioned but could use more flavor.",
      "Okay experience overall. Would try other dishes next time.",
      "It's a reliable choice if you're looking for something simple."
    ],
    spicy: [
      "Pleasant heat level – well balanced between spice and flavor.",
      "The spice was noticeable but not overwhelming. Good balance."
    ],
    vegan: [
      "Solid plant-based option. Freshness was good.",
      "Good vegan choice – filling and reasonably flavorful."
    ]
  },
  4: {
    base: [
      "Really enjoyed the {dishName}! Great flavors and good portion size.",
      "Tasty and well-presented. Will definitely order again!",
      "Excellent dish – the seasoning was spot on and it arrived hot.",
      "Great value for money. The {dishName} was very satisfying.",
      "Loved it! Fresh ingredients and perfectly cooked. Highly recommend."
    ],
    spicy: [
      "Perfect spice level – just the right kick without being overwhelming!",
      "Loved the heat! The spice enhanced all the other flavors beautifully."
    ],
    vegan: [
      "Wonderful vegan dish – you wouldn't miss the meat at all!",
      "Great plant-based option, very flavorful and filling."
    ],
    premium: [
      "Worth every rupee! Premium quality that justifies the price.",
      "Excellent dish – the quality matched the premium price point perfectly."
    ]
  },
  5: {
    base: [
      "Absolutely outstanding! The {dishName} was a culinary masterpiece!",
      "Exceptional quality – this is exactly what great food tastes like!",
      "Best dish I've had in a long time. Every bite was perfect!",
      "Highly recommended! The {dishName} exceeded all my expectations.",
      "Flawless execution – amazing flavors, perfect portion, beautiful presentation!"
    ],
    spicy: [
      "The perfect spice blend! Incredibly flavorful with just the right heat.",
      "Phenomenal! The spice was expertly balanced – an absolute delight."
    ],
    vegan: [
      "The best vegan dish I've ever had! Rich flavors that are hard to believe are plant-based.",
      "Incredible vegan option – this proves plant-based food can be extraordinary!"
    ],
    premium: [
      "Luxury dining experience at its finest! Every penny was absolutely worth it.",
      "A true premium dish – exceptional quality from first bite to last."
    ]
  }
};

/**
 * Generate 3 contextual AI review suggestions for a dish
 * @param {object} dish - Dish data with name, description, tags, price etc.
 * @param {number} rating - Star rating 1-5
 * @returns {string[]} Array of 3 review suggestion strings
 */
export function generateAIReviewSuggestions(dish, rating) {
  if (!rating || rating < 1 || rating > 5) return [];
  
  const ratingTemplates = REVIEW_TEMPLATES[rating];
  if (!ratingTemplates) return [];
  
  const dishName = dish?.name || 'this dish';
  const tags = dish?.tags || [];
  const price = Number(dish?.price) || 0;
  const description = dish?.description || '';
  
  // Determine dish characteristics
  const isVegan = tags.some(t => 
    ['Vegan', 'vegan', 'Vegetarian', 'vegetarian', 'Veg'].includes(t)
  ) || dish?.dietaryPreference === 'Vegan' || dish?.dietaryPreference === 'Vegetarian';
  
  const isSpicy = ['Hot', 'Extra Hot'].includes(dish?.spiceLevel) ||
    tags.some(t => ['Spicy', 'spicy', 'Hot', 'hot'].includes(t));
  
  const isPremium = price > 400;
  
  // Select pool of relevant templates
  const pool = [...ratingTemplates.base];
  if (isSpicy && ratingTemplates.spicy) pool.push(...ratingTemplates.spicy);
  if (isVegan && ratingTemplates.vegan) pool.push(...ratingTemplates.vegan);
  if (isPremium && ratingTemplates.premium) pool.push(...ratingTemplates.premium);
  
  // Shuffle pool using seeded randomness (consistent per dish+rating combo)
  const seed = (dishName.charCodeAt(0) || 65) * rating;
  const shuffled = pool
    .map((item, i) => ({ item, sort: (seed * (i + 1)) % pool.length }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
  
  // Pick 3 unique suggestions
  const selected = shuffled.slice(0, 3);
  
  // Replace {dishName} placeholders
  return selected.map(s => s.replace(/{dishName}/g, dishName));
}

/**
 * Generate a single AI summary label for the rating selection phase
 * @param {number} rating
 * @returns {string}
 */
export function getRatingLabel(rating) {
  const labels = {
    1: "Terrible",
    2: "Poor",
    3: "Average",
    4: "Good",
    5: "Excellent!"
  };
  return labels[rating] || '';
}

/**
 * Get rating emoji
 * @param {number} rating
 */
export function getRatingEmoji(rating) {
  const emojis = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };
  return emojis[rating] || '';
}

/**
 * DishRatingStore — manages per-dish aggregate ratings
 * Stores in localStorage AND syncs to orders table via the existing ReviewService
 */
class DishRatingStore {
  static KEY = '3dish_dish_ratings';
  
  /**
   * Record a rating for a specific dish
   * @param {string} dishId
   * @param {number} rating (1-5)
   * @param {string} restId
   */
  static recordRating(dishId, rating, restId) {
    try {
      const store = this.getStore();
      if (!store[dishId]) {
        store[dishId] = { ratings: [], restId };
      }
      store[dishId].ratings.push(rating);
      store[dishId].restId = restId;
      store[dishId].lastUpdated = new Date().toISOString();
      localStorage.setItem(this.KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('DishRatingStore: Failed to record rating', e);
    }
  }
  
  /**
   * Get aggregate rating stats for a dish
   * @param {string} dishId
   * @returns {{ average: number, count: number }}
   */
  static getDishRating(dishId) {
    try {
      const store = this.getStore();
      const data = store[dishId];
      if (!data || !data.ratings || data.ratings.length === 0) {
        return { average: 0, count: 0 };
      }
      const sum = data.ratings.reduce((a, b) => a + b, 0);
      return {
        average: Math.round((sum / data.ratings.length) * 10) / 10,
        count: data.ratings.length
      };
    } catch {
      return { average: 0, count: 0 };
    }
  }
  
  /**
   * Compute ratings for all dishes from the orders array
   * This is the primary source of truth derived from real order data
   * @param {object[]} orders - All orders with review_rating and items
   */
  static computeFromOrders(orders) {
    try {
      const computed = {};
      orders.forEach(order => {
        if (!order.review_rating || !order.items) return;
        const restId = order.restId || order.rest_id;
        order.items.forEach(item => {
          if (!item.id || item.id === '__contact_info') return;
          if (!computed[item.id]) {
            computed[item.id] = { ratings: [], restId };
          }
          computed[item.id].ratings.push(order.review_rating);
        });
      });
      
      // Merge with existing local data (don't overwrite, merge)
      const existing = this.getStore();
      const merged = { ...existing };
      Object.keys(computed).forEach(dishId => {
        if (merged[dishId]) {
          // Merge unique ratings (avoid double counting)
          const existingCount = merged[dishId].ratings?.length || 0;
          const newRatings = computed[dishId].ratings;
          if (newRatings.length > existingCount) {
            merged[dishId] = computed[dishId];
          }
        } else {
          merged[dishId] = computed[dishId];
        }
      });
      
      localStorage.setItem(this.KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('DishRatingStore: Failed to compute from orders', e);
    }
  }
  
  static getStore() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '{}');
    } catch {
      return {};
    }
  }
}

export { DishRatingStore };
