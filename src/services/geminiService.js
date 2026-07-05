import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Use 1.5-flash as it has generous free tier quotas (2.0-flash often has limit: 0 on free tier)
const VISION_MODEL = "gemini-1.5-flash";
const TEXT_MODEL   = "gemini-1.5-flash";

// Utility: Compress and resize image before converting to base64
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimension 1536px to save tokens and speed up OCR
        const MAX_SIZE = 1536;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.8 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl.split(',')[1]); // return just the base64 part
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── 1. Menu OCR — extract ALL dishes with full metadata from image ──────────
export async function extractMenuFromImage(file) {
  if (!genAI) throw new Error('GEMINI_API_KEY_MISSING');

  // Compress image before sending to Gemini
  const base64Data = await compressImage(file);
  const mimeType = 'image/jpeg';

  const prompt = `You are an expert restaurant menu digitizer and culinary AI assistant.
Carefully analyse this menu image and extract EVERY SINGLE dish you can find.

For each dish, also use your culinary knowledge to enrich the data where the menu doesn't provide it.

Return ONLY a valid JSON array (no markdown fences, no explanation) with this exact schema:
[
  {
    "name": "Exact dish name from menu",
    "category": "Category (Starters | Mains | Desserts | Beverages | Soups | Salads | Breads | Rice | Biryani | etc.)",
    "price": 120,
    "halfPrice": null,
    "description": "A single enticing sentence describing the dish flavour, texture and key ingredients.",
    "ingredients": ["Ingredient 1", "Ingredient 2"],
    "allergens": ["Gluten" | "Nuts" | "Dairy" | "Eggs" | "Shellfish" | "Soy" | "Fish"],
    "macros": {
      "calories": 350,
      "protein": 18,
      "carbs": 40,
      "fat": 12
    },
    "dietaryPreference": "Vegetarian" | "Non-Vegetarian" | "Vegan" | "Eggitarian",
    "spiceLevel": "Mild" | "Medium" | "Hot" | "Extra Hot",
    "prepTime": "15 mins",
    "serves": "1-2",
    "tags": []
  }
]

Rules:
- Extract EVERY dish visible — miss nothing.
- price: number in ₹ (use 0 if truly unreadable).
- halfPrice: number if half-plate exists, else null.
- Use your culinary knowledge to fill macros/ingredients/allergens where not shown.
- Estimate macros (calories, protein g, carbs g, fat g) realistically for a restaurant portion.
- dietaryPreference: infer from dish name/ingredients (veg indicator dots, etc.).
- Return ONLY the JSON array, absolutely nothing else.`;

  try {
    const model = genAI.getGenerativeModel({ model: VISION_MODEL });
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return parsed.map((d, i) => ({
      id: `ocr_${Date.now()}_${i}`,
      name: d.name || 'Unknown Dish',
      category: d.category || 'Uncategorized',
      price: Number(d.price) || 0,
      halfPrice: d.halfPrice ? Number(d.halfPrice) : null,
      description: d.description || '',
      ingredients: Array.isArray(d.ingredients) ? d.ingredients : [],
      allergens: Array.isArray(d.allergens) ? d.allergens : [],
      macros: {
        calories: d.macros?.calories || '',
        protein:  d.macros?.protein  || '',
        carbs:    d.macros?.carbs    || '',
        fat:      d.macros?.fat      || '',
      },
      dietaryPreference: d.dietaryPreference || 'None',
      spiceLevel: d.spiceLevel || 'Mild',
      prepTime: d.prepTime || '',
      serves: d.serves || '1',
      tags: Array.isArray(d.tags) ? d.tags : [],
      aiEnriched: true,
    }));
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error(error.message || 'Failed to parse AI response. Please try again with a clearer image.');
  }
}

// ── 2. Enrich a single dish with AI (for manually added or partial entries) ──
export async function enrichDishWithAI(dishName, category = '') {
  if (!genAI) throw new Error('GEMINI_API_KEY_MISSING');

  const prompt = `You are a professional culinary data specialist.
Generate rich, accurate, restaurant-quality metadata for this dish:
Dish: "${dishName}"${category ? `\nCategory: ${category}` : ''}

Return ONLY valid JSON (no markdown, no explanation):
{
  "description": "One enticing sentence (max 20 words) for a restaurant menu.",
  "ingredients": ["key ingredient 1", "key ingredient 2", "...up to 8"],
  "allergens": ["only from: Gluten, Nuts, Dairy, Eggs, Shellfish, Soy, Fish"],
  "macros": { "calories": 350, "protein": 18, "carbs": 40, "fat": 12 },
  "dietaryPreference": "Vegetarian OR Non-Vegetarian OR Vegan OR Eggitarian",
  "spiceLevel": "Mild OR Medium OR Hot OR Extra Hot",
  "prepTime": "e.g. 20 mins",
  "serves": "e.g. 1-2",
  "tags": ["Chef's Pick", "Signature", "Bestseller", "New", "Seasonal"]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini Enrich Error:', err);
    if (err.message.includes('429')) throw new Error('Rate limit exceeded. Please wait a moment.');
    throw new Error(err.message || 'Failed to enrich dish details.');
  }
}

// ── 3. AI Concierge Chat ─────────────────────────────────────────────────────
export async function getConciergeResponse(userMessage, dishes, restaurantName, customPersonality) {
  if (!genAI) {
    return getFallbackResponse(userMessage, dishes);
  }

  const menuContext = dishes.slice(0, 40).map(d =>
    `- ${d.name} (${d.category || 'General'}) ₹${d.price}${d.description ? ` — ${d.description}` : ''}`
  ).join('\n');

  const systemPrompt = customPersonality ||
    `You are a warm, knowledgeable, and enthusiastic dining concierge for ${restaurantName || 'our restaurant'}. 
    You know the menu inside-out. You recommend dishes confidently, handle allergen queries carefully, 
    and make every guest feel special. Be concise (2-3 sentences max). Use an occasional emoji.`;

  const prompt = `${systemPrompt}\n\nMENU:\n${menuContext}\n\nCUSTOMER: ${userMessage}\n\nCONCIERGE:`;

  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim() || "I'd love to help! Could you be a bit more specific about what you're looking for?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return getFallbackResponse(userMessage, dishes);
  }
}

// Fallback logic
function getFallbackResponse(userMessage, dishes) {
  const lower = userMessage.toLowerCase();

  if (lower.includes('spicy') || lower.includes('hot')) {
    const spicy = dishes.filter(d => d.spiceLevel === 'Hot' || d.spiceLevel === 'Extra Hot' || d.tags?.includes('Spicy'));
    return spicy.length > 0
      ? `🌶️ Try our **${spicy[0].name}** — it's one of our spiciest options!`
      : 'We can ask the kitchen to add extra spice to most dishes. Just let your waiter know!';
  }
  if (lower.includes('vegan') || lower.includes('vegetarian') || lower.includes('veg')) {
    const veg = dishes.filter(d => d.dietaryPreference === 'Vegan' || d.dietaryPreference === 'Vegetarian' || d.tags?.includes('Vegan') || d.tags?.includes('Veg'));
    return veg.length > 0
      ? `🌱 We have **${veg.length}** plant-based options! Our **${veg[0].name}** is a favorite.`
      : 'Please check the green 🌿 indicators on each dish card for vegetarian options.';
  }
  if (lower.includes('recommend') || lower.includes('best') || lower.includes('popular') || lower.includes('special')) {
    const sig = dishes.find(d => d.tags?.includes('Signature') || d.tags?.includes("Chef's Pick")) || dishes[0];
    return sig
      ? `⭐ I highly recommend our **${sig.name}** — it's one of the chef's absolute favorites!`
      : 'Every dish on our menu is crafted with love. Ask your waiter for today\'s special!';
  }
  if (lower.includes('allergen') || lower.includes('allergy') || lower.includes('gluten') || lower.includes('nut')) {
    return '⚠️ Allergen details are listed on each individual dish card. Please also inform your waiter directly for complete safety — we take allergies very seriously.';
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive') || lower.includes('cheap')) {
    const prices = dishes.map(d => d.price).filter(Boolean).sort((a, b) => a - b);
    if (prices.length > 0) {
      return `Our dishes range from ₹${prices[0].toFixed(0)} to ₹${prices[prices.length - 1].toFixed(0)}. We have options for every budget! 💰`;
    }
  }
  if (lower.includes('dessert') || lower.includes('sweet')) {
    const desserts = dishes.filter(d => d.category?.toLowerCase().includes('dessert') || d.tags?.includes('Dessert'));
    return desserts.length > 0
      ? `🍰 For dessert, our **${desserts[0].name}** is absolutely divine!`
      : 'Our dessert menu changes seasonally. Ask your waiter about today\'s selection!';
  }

  return "That's a great question! Let me fetch that for you — in the meantime, feel free to browse the menu or ask your waiter for assistance.";
}
