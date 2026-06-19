import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Utility: Convert a File/Blob to base64 string
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 1. Menu OCR
export async function extractMenuFromImage(file) {
  if (!genAI) {
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

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);
    const response = await result.response;
    const text = response.text();

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const dishes = JSON.parse(cleaned);

    return dishes.map((d, i) => ({
      id: `ocr_${Date.now()}_${i}`,
      name: d.name || 'Unknown Dish',
      price: Number(d.price) || 0,
      category: d.category || 'Uncategorized',
      description: d.description || '',
    }));
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error(error.message || 'Failed to parse AI response. Please try again with a clearer image.');
  }
}

// 2. AI Concierge Chat
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
