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
    updateSW(true); // Tell the service worker to skipWaiting
    
    // We give the service worker a tiny fraction of a second to activate, then reload the page
    setTimeout(() => {
      window.location.reload(true);
    }, 500);
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
