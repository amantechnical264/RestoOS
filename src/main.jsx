import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './locales/i18n'

import { registerSW } from 'virtual:pwa-register'

// Force the PWA to aggressively reload when a new version is pushed to Vercel
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New version available! Force reloading to clear cache...");
    
    // Wait for the new service worker to fully activate and take control
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
    
    // Tell the new service worker to skipWaiting and take over
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App is ready for offline use.')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
