import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import Notification from './components/Notification';
import FullscreenManager from './components/FullscreenManager';

// Lazy-load all pages for code-splitting (eliminates the chunk size warning)
const MenuPage            = React.lazy(() => import('./pages/MenuPage'));
const Dish3DPage          = React.lazy(() => import('./pages/Dish3DPage'));
const CartPage            = React.lazy(() => import('./pages/CartPage'));
const DinerOrdersPage     = React.lazy(() => import('./pages/DinerOrdersPage'));
const VendorAuthPage      = React.lazy(() => import('./pages/VendorAuthPage'));
const VendorOnboardingPage = React.lazy(() => import('./pages/VendorOnboardingPage'));
const VendorDashboardPage = React.lazy(() => import('./pages/VendorDashboardPage'));
const HealthDashboardPage = React.lazy(() => import('./pages/HealthDashboardPage'));
const SettingsPage        = React.lazy(() => import('./pages/SettingsPage'));
const CustomerProfilePage = React.lazy(() => import('./pages/CustomerProfilePage'));
const LandingPage         = React.lazy(() => import('./pages/LandingPage'));

// Admin Pages
const AdminAuthPage       = React.lazy(() => import('./pages/AdminAuthPage'));
const AdminDashboardPage  = React.lazy(() => import('./pages/AdminDashboardPage'));

// Global Error Boundary to catch PWA stale-cache chunk loading errors
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Global error caught:", error, errorInfo);
    this.setState({ error, errorInfo });

    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Importing a module script failed');

    if (isChunkError) {
      // Only auto-recover ONCE — use sessionStorage to track this.
      // This prevents the infinite reload loop when the chunk is genuinely missing.
      const alreadyRetried = sessionStorage.getItem('chunk_error_retry');
      if (!alreadyRetried) {
        sessionStorage.setItem('chunk_error_retry', '1');
        // Clear all PWA/SW caches then hard-navigate with a cache-buster
        const doRecovery = async () => {
          try {
            // Unregister all service workers so the stale cache is gone
            if ('serviceWorker' in navigator) {
              const regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map(r => r.unregister()));
            }
            // Clear CacheStorage (workbox precache etc.)
            if ('caches' in window) {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
            }
          } catch (e) {
            console.warn('Cache clear failed:', e);
          } finally {
            // Hard-navigate to the same URL with a timestamp to bypass browser cache
            const url = new URL(window.location.href);
            url.searchParams.set('_cb', Date.now());
            window.location.replace(url.toString());
          }
        };
        doRecovery();
        return; // Don't render the error UI yet — we're about to navigate away
      }
    }
    // If it's NOT a chunk error, or we already retried, clear the retry flag so
    // future navigations can still auto-recover if needed.
    sessionStorage.removeItem('chunk_error_retry');
  }
  render() {
    if (this.state.hasError && !sessionStorage.getItem('chunk_error_retry')) {
      return (
        <div className="fixed inset-0 bg-neutral-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 className="text-xl font-bold dark:text-white mb-2">Something went wrong</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-2 max-w-md break-all">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          {this.state.errorInfo && this.state.errorInfo.componentStack && (
            <pre className="text-left bg-neutral-100 dark:bg-neutral-900 text-red-600 dark:text-red-400 p-4 rounded text-xs mb-6 max-w-full overflow-auto max-h-48">
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(true); }} className="px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-full mb-4 w-full">
            Clear Cache &amp; Restart
          </button>
          <button onClick={() => window.location.reload(true)} className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] font-bold rounded-full w-full">
            Just Refresh
          </button>
        </div>
      );
    }
    // While auto-recovery is in progress, render nothing (we're navigating away)
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// Full-screen loading shimmer shown while a lazy chunk loads
function PageLoader() {
  return (
    <div className="fixed inset-0 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-4 z-50">
      <div className="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-800 border-t-[#D4AF37] rounded-full animate-spin" />
      <p className="text-xs text-neutral-400 dark:text-neutral-600 font-bold tracking-widest uppercase">Loading</p>
    </div>
  );
}

function RootRedirect() {
  const { user, isInitializing } = useAppContext();
  if (isInitializing) return <PageLoader />;
  if (user?.role === 'vendor') return <Navigate to="/vendor" replace />;
  // For diner or anonymous (null), go to LandingPage
  return <Navigate to="/" replace />;
}

// Redirects legacy QR codes (which pointed to /scanner?restId=xyz) directly to the menu
function LegacyScannerRedirect() {
  const location = useLocation();
  return <Navigate to={`/menu${location.search}`} replace />;
}

function AnimatedRoutes() {
  return (
    <AnimatePresence>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Legacy QR Code Support */}
        <Route path="/scanner" element={<LegacyScannerRedirect />} />

        {/* Diner Routes */}
        <Route path="/menu"        element={<MenuPage />} />
        <Route path="/dish/:id"    element={<Dish3DPage />} />
        <Route path="/cart"        element={<CartPage />} />
        <Route path="/orders"      element={<DinerOrdersPage />} />
        <Route path="/profile"     element={<CustomerProfilePage />} />

        {/* Vendor Routes */}
        <Route path="/vendor-auth"    element={<VendorAuthPage />} />
        <Route path="/vendor-onboard" element={<VendorOnboardingPage />} />
        <Route path="/vendor"         element={<VendorDashboardPage />} />

        {/* Health & Settings */}
        <Route path="/health"   element={<HealthDashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Admin Routes */}
        <Route path="/admin"          element={<AdminAuthPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="font-sans antialiased selection:bg-blue-500/30">
          <FullscreenManager />
          <Notification />
          <GlobalErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </GlobalErrorBoundary>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
