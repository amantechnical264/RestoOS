import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Sparkles, ChefHat } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function AIWaiter() {
  const { dishes, addToCart } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Welcome! I'm your personal TableAI concierge. Ask me anything — dish recommendations, allergens, or order help." }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let aiResponse = "That's a great question! Let me check with our Chef and get back to you shortly.";
      const lower = userMsg.toLowerCase();

      if (lower.includes('spicy') || lower.includes('hot')) {
        const spicy = dishes.filter(d => d.spiceLevel === 'Hot' || d.spiceLevel === 'Extra Hot');
        aiResponse = spicy.length > 0
          ? `🌶️ If you love heat, our **${spicy[0].name}** is the perfect choice! Want me to add it to your order?`
          : "We can certainly request the kitchen to spice things up for you!";
      } else if (lower.includes('vegan') || lower.includes('vegetarian')) {
        const vegan = dishes.filter(d => d.tags?.includes('Vegan') || d.dietaryPreference === 'Vegan');
        aiResponse = vegan.length > 0
          ? `🌱 Our **${vegan[0].name}** is a beautiful plant-based option our chef personally recommends.`
          : "Please let me check the kitchen for plant-based preparations for you.";
      } else if (lower.includes('recommend') || lower.includes('best') || lower.includes('popular')) {
        const sig = dishes.find(d => d.tags?.includes('Signature') || d.tags?.includes("Chef's Pick"));
        aiResponse = sig
          ? `⭐ Our absolute star dish is the **${sig.name}** — it's the Chef's signature and our most beloved creation!`
          : "Every dish here is crafted with love. Ask our chef for today's special!";
      } else if (lower.includes('allergen') || lower.includes('allergy') || lower.includes('gluten') || lower.includes('nuts')) {
        aiResponse = "Our allergen information is listed on each dish card. Tap any dish to see the full allergen profile. Please also inform your waiter directly for complete safety.";
      } else if (lower.includes('add') || lower.includes('order') || lower.includes('cart')) {
        aiResponse = "Tap the **+ Add** button on any dish card to add it to your order. I can also recommend something specific — just tell me what you're in the mood for!";
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 1200);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser."); return; }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-24 left-5 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-gold overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)',
            boxShadow: '0 4px 20px rgba(212,175,55,0.5), 0 0 0 1px rgba(212,175,55,0.3)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChefHat size={22} className="text-black" />
          </motion.div>
          {/* Gold ring pulse */}
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(212,175,55,0.4)' }}
          />
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 left-5 w-[320px] flex flex-col z-[60] overflow-hidden rounded-3xl"
            style={{
              height: '420px',
              background: '#000000',
              border: '1px solid rgba(212,175,55,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.1), inset 0 1px 0 rgba(212,175,55,0.1)',
            }}
          >
            {/* Header */}
            <div
              className="shrink-0 px-5 py-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                  <ChefHat size={16} className="text-black" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-black">AI Concierge</h3>
                  <p className="text-[10px] text-black/70 font-medium">TableAI · Always here</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-black" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-black rounded-br-sm'
                        : 'text-neutral-200 rounded-bl-sm'
                    }`}
                    style={
                      msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)' }
                        : { background: '#111111', border: '1px solid rgba(212,175,55,0.2)' }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: d, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4AF37' }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="shrink-0 px-3 py-3 flex items-center gap-2"
              style={{ background: '#0a0a0a', borderTop: '1px solid rgba(212,175,55,0.2)' }}
            >
              <button
                onClick={startListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isListening
                    ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                style={!isListening ? { border: '1px solid rgba(212,175,55,0.2)' } : {}}
              >
                <Mic size={15} className={isListening ? 'text-white' : 'text-gold-500'} style={{ color: isListening ? 'white' : '#D4AF37' }} />
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent border-none focus:outline-none text-xs text-white placeholder:text-white/30 font-medium"
              />

              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                style={{
                  background: input.trim() ? 'linear-gradient(135deg, #D4AF37, #AA8C2C)' : '#111',
                  border: '1px solid rgba(212,175,55,0.3)',
                }}
              >
                <Send size={14} className="text-black" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
