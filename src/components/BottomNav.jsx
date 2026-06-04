import React from 'react';
import { NavLink } from 'react-router-dom';
import { Utensils, ShoppingCart, Receipt, Settings, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const { cart } = useAppContext();
  const { t } = useTranslation();

  const navItems = [
    { to: '/menu',     icon: Utensils,     label: t('nav.menu', 'Menu') },
    { to: '/cart',     icon: ShoppingCart, label: t('nav.cart', 'Cart'), badge: cart.length > 0 ? cart.length : null },
    { to: '/orders',   icon: Receipt,      label: t('nav.orders', 'Orders') },
    { to: '/profile',  icon: User,         label: 'Profile' },
    { to: '/settings', icon: Settings,     label: t('nav.settings', 'Settings') },
  ];

  return (
    <div
      className="fixed bottom-0 w-full flex justify-around items-end pt-2 pb-7 z-40 transition-colors"
      style={{
        background: 'var(--nav-bg, rgba(249,250,251,0.95))',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <style>{`
        .dark [data-bottomnav] {
          background: rgba(0,0,0,0.95) !important;
          border-top: 1px solid rgba(212,175,55,0.2) !important;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.9) !important;
        }
      `}</style>
      <div
        data-bottomnav
        className="absolute inset-0 rounded-none"
        style={{ pointerEvents: 'none' }}
      />

      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={() => 'flex flex-col items-center relative transition-all duration-200 px-3 group z-10'}
        >
          {({ isActive }) => (
            <>
              <motion.div whileTap={{ scale: 0.8 }} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute -inset-3 rounded-2xl"
                    style={{
                      background: 'rgba(212,175,55,0.1)',
                      border: '1px solid rgba(212,175,55,0.35)',
                      boxShadow: '0 0 20px rgba(212,175,55,0.2)',
                    }}
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <item.icon
                  size={23}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive
                      ? 'text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                      : 'text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300'
                  }`}
                />
                {item.badge && (
                  <span
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black text-[10px] px-1 text-black"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)',
                      boxShadow: '0 2px 8px rgba(212,175,55,0.5)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[10px] mt-1.5 font-bold tracking-wide uppercase transition-colors duration-300 ${
                  isActive
                    ? 'text-[#D4AF37]'
                    : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-400'
                }`}
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
