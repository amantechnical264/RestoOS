/**
 * geminiService.js
 * 
 * Real AI integrations using Google Gemini API.
 * Requires VITE_GEMINI_API_KEY in your .env file.
 * Get a free key at: https://aistudio.google.com/apikey
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Convert a File/Blob to base64 string
// ─────────────────────────────────────────────────────────────────────────────
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<mimeType>;base64,<data>" — strip prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Menu OCR: Extract dishes from an uploaded menu image/PDF
// ─────────────────────────────────────────────────────────────────────────────
export async function extractMenuFromImage(file) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const base64Data = await fileToBase64(file);
  const mimeType = file.type || 'image/jpeg';

  const prompt = `You are a professional menu digitizer. 
Analyze this restaurant menu image carefully and extract ALL dishes you can see.

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "name": "Dish Name",
    "price": 12.50,
    "category": "Category (e.g. Starters, Mains, Desserts, Beverages)",
    "description": "Brief description of the dish"
  }
]

Rules:
- Extract every single dish you can see
- If price is unclear, use 0
- Guess the category if not explicitly labeled
- Keep descriptions concise (1 sentence max)
- Return ONLY the JSON array, nothing else`;

  const response = await fetch(
    `${GEMINI_BASE}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          maxOutputTokens: 4096,
        }
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

  // Clean up response — strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const dishes = JSON.parse(cleaned);
    // Normalize and add unique IDs
    return dishes.map((d, i) => ({
      id: `ocr_${Date.now()}_${i}`,
      name: d.name || 'Unknown Dish',
      price: Number(d.price) || 0,
      category: d.category || 'Uncategorized',
      description: d.description || '',
    }));
  } catch {
    throw new Error('Failed to parse AI response. Please try again with a clearer image.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. AI Concierge Chat: Intelligent responses using menu context
// ─────────────────────────────────────────────────────────────────────────────
export async function getConciergeResponse(userMessage, dishes, restaurantName, customPersonality) {
  if (!GEMINI_API_KEY) {
    // Fallback to keyword-based smart responses when no API key
    return getFallbackResponse(userMessage, dishes);
  }

  // Build a concise menu summary for context
  const menuContext = dishes.slice(0, 40).map(d =>
    `- ${d.name} (${d.category || 'General'}) ₹${d.price}${d.description ? ` — ${d.description}` : ''}`
  ).join('\n');

  const systemPrompt = customPersonality ||
    `You are a warm, knowledgeable, and enthusiastic dining concierge for ${restaurantName || 'our restaurant'}. 
    You know the menu inside-out. You recommend dishes confidently, handle allergen queries carefully, 
    and make every guest feel special. Be concise (2-3 sentences max). Use an occasional emoji.`;

  const prompt = `${systemPrompt}

MENU:
${menuContext}

CUSTOMER: ${userMessage}

CONCIERGE:`;

  const response = await fetch(
    `${GEMINI_BASE}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          maxOutputTokens: 256,
        }
      }),
    }
  );

  if (!response.ok) throw new Error('Gemini API error');

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "I'd love to help! Could you be a bit more specific about what you're looking for?";
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: Smart keyword-based responses (used when no API key)
// ─────────────────────────────────────────────────────────────────────────────
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
