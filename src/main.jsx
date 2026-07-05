import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './locales/i18n'

// Burst Capsule Logic: Instantly destroy stale customer caches on fresh QR Code scans
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has('table') || searchParams.has('restId')) {
  if (!sessionStorage.getItem('burst_capsule')) {
    localStorage.removeItem('3dish_cart');
    localStorage.removeItem('3dish_diner_profile');
    sessionStorage.setItem('burst_capsule', 'true');
    console.log('💥 Burst Capsule Activated: Cleared stale session data.');
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
