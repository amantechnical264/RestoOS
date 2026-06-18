import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, Target, Flame, Droplets, Leaf, Settings as SettingsIcon, LogOut, User, ShieldCheck, ChefHat, Sun, Moon, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import BottomNav from '../components/BottomNav';
import { supabase } from '../services/supabase';

const GOLD = '#D4AF37';
const goldGradient = 'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 60%, #D4AF37 100%)';

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <h2 className="font-display font-black text-base mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
        <Icon size={16} style={{ color: GOLD }} /> {title}
      </h2>
      <div className="rounded-3xl p-5 space-y-4 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#D4AF37]/15 shadow-sm dark:shadow-none">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { userPreferences, updatePreferences, user, setUser, supabaseUser, theme, toggleTheme } = useAppContext();
  const { i18n, t } = useTranslation();
  const [localGoals, setLocalGoals] = useState(userPreferences.goals);
  const [saved, setSaved] = useState(false);

  const handleLanguageChange = (lang) => {
    updatePreferences({ language: lang });
    i18n.changeLanguage(lang);
  };

  const saveGoals = (e) => {
    e.preventDefault();
    updatePreferences({ goals: localGoals });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    if (supabase && supabaseUser) await supabase.auth.signOut();
    setUser(null);
    navigate('/', { replace: true });
  };

  const inputClass = "w-full rounded-xl p-3 text-sm bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-[#D4AF37]/20 text-neutral-900 dark:text-white focus:outline-none focus:ring-0";
  const inputStyle = {};

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-5 py-4 sticky top-0 z-10 flex items-center gap-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-neutral-200 dark:border-[#D4AF37]/15"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-neutral-100 dark:bg-[#D4AF37]/10 border border-neutral-200 dark:border-[#D4AF37]/20"
        >
          <ChevronLeft size={20} style={{ color: GOLD }} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <SettingsIcon size={18} style={{ color: GOLD }} /> Settings
          </h1>
          <p className="text-xs text-neutral-500">Preferences & account</p>
        </div>
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-neutral-100 dark:bg-[#D4AF37]/10 border border-neutral-200 dark:border-[#D4AF37]/20"
        >
          {theme === 'dark'
            ? <Sun size={18} style={{ color: GOLD }} />
            : <Moon size={18} style={{ color: GOLD }} />
          }
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-6 pt-6 bg-neutral-50 dark:bg-black no-scrollbar">

        {/* Account */}
        {user && (
          <Section title="Account" icon={user.role === 'vendor' ? ChefHat : User}>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-black"
                style={{ background: goldGradient }}
              >
                {(user.email || user.phone || 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-neutral-900 dark:text-white">{user.email || user.phone || 'Anonymous Diner'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Crown size={10} style={{ color: GOLD }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>
                    {user.role === 'vendor' ? 'Restaurant Partner' : 'Gold Member'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-2xl transition-all text-sm"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </Section>
        )}

        {/* Language */}
        <Section title={t('settings.language', 'Language')} icon={Globe}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { code: 'en', label: 'English', flag: '🇬🇧' },
              { code: 'es', label: 'Español', flag: '🇪🇸' },
              { code: 'hi', label: 'हिन्दी',  flag: '🇮🇳' },
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`py-3 rounded-2xl font-bold transition-all text-sm border ${
                  userPreferences.language === lang.code
                    ? 'text-black shadow-[0_4px_15px_rgba(212,175,55,0.3)] border-transparent'
                    : 'bg-neutral-50 dark:bg-[#111] border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/40'
                }`}
                style={userPreferences.language === lang.code ? { background: goldGradient } : {}}
              >
                <div className="text-xl mb-1">{lang.flag}</div>
                <div className="text-xs">{lang.label}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Dietary Goals */}
        <Section title={t('settings.goals', 'Daily Dietary Goals')} icon={Target}>
          <form onSubmit={saveGoals} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">
                <Flame size={13} className="text-orange-400" /> Calories (kcal)
              </label>
              <input
                type="number" required value={localGoals.calories}
                onChange={e => setLocalGoals({...localGoals, calories: Number(e.target.value)})}
                className={inputClass} style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'protein', label: 'Protein (g)', icon: <Droplets size={11} className="text-blue-400" /> },
                { key: 'carbs',   label: 'Carbs (g)',   icon: <Leaf size={11} className="text-emerald-400" /> },
                { key: 'fat',     label: 'Fat (g)',      icon: <span className="text-[10px] font-black" style={{ color: GOLD }}>F</span> },
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                    {icon} {label}
                  </label>
                  <input
                    type="number" required value={localGoals[key]}
                    onChange={e => setLocalGoals({...localGoals, [key]: Number(e.target.value)})}
                    className={`${inputClass} text-center`} style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <AnimatePresence>
              {saved && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-sm font-bold py-2" style={{ color: '#34D399' }}>
                  ✓ Goals saved!
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-black text-sm text-black transition-all"
              style={{ background: goldGradient, boxShadow: '0 4px 15px rgba(212,175,55,0.25)' }}
            >
              {t('settings.saveGoals', 'Save Goals')}
            </button>
          </form>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={Sun}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-neutral-500 mt-0.5">Premium black & gold theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="w-14 h-7 rounded-full relative transition-all"
              style={{
                background: theme === 'dark' ? goldGradient : '#333',
                boxShadow: theme === 'dark' ? '0 2px 10px rgba(212,175,55,0.3)' : 'none',
              }}
            >
              <span className={`absolute top-1 w-5 h-5 bg-black rounded-full transition-all duration-300 ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </Section>

        {/* App Info */}
        <div className="text-center text-xs space-y-1 pb-4">
          <p className="font-bold" style={{ color: GOLD }}>TableAI · Next-Gen AR Dining</p>
          <p className="text-neutral-600">Powered by Supabase · Built with ❤</p>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
