import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Activate new service worker immediately — no waiting for old tabs to close
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Never cache Supabase API calls — always go to network
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.includes('supabase.co'),
            handler: 'NetworkOnly',
          },
        ],
      },
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: '3Dish — AR Dining',
        short_name: '3Dish',
        description: 'Augmented Reality restaurant menus with 3D dish previews and nutrition tracking',
        theme_color: '#2563eb',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 800,
  },
})

