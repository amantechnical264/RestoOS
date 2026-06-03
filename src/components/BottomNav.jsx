import React from 'react';
import { NavLink } from 'react-router-dom';
import { Utensils, ShoppingCart, Receipt, Activity, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const { cart } = useAppContext();
  const { t } = useTranslation();

  const navItems = [
    { to: '/menu',     icon: Utensils,     label: t('nav.menu') },
    { to: '/cart',     icon: ShoppingCart, label: t('nav.cart'), badge: cart.length > 0 ? cart.length : null },
    { to: '/orders',   icon: Receipt,      label: t('nav.orders') },
    { to: '/health',   icon: Activity,     label: t('nav.health', 'Health') },
    { to: '/settings', icon: Settings,     label: t('nav.settings', 'Settings') },
  ];

  return (
    <div
      className="fixed bottom-0 w-full flex justify-around pt-3 pb-8 z-40 bg-[#1a1a1f]/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
    >
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to}
          className={() => 'flex flex-col items-center relative transition-all duration-200 px-2 group'}
        >
          {({ isActive }) => (
            <>
              <motion.div whileTap={{ scale: 0.8 }} className="relative">
                {isActive && (
                  <motion.div layoutId="nav-glow"
                    className="absolute -inset-3 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-neutral-500 group-hover:text-white/80'}`}
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-sans font-black text-[10px] px-1"
                    style={{ background: '#D4AF37', color: '#0B0C10', boxShadow: '0 0 10px rgba(212,175,55,0.5)' }}>
                    {item.badge}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[10px] mt-2 font-display font-bold tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-neutral-500 group-hover:text-white/80'}`}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
