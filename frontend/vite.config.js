// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Caching strategies
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      // The manifest object for our app
      manifest: {
        name: 'Tour Manager Pro',
        short_name: 'TourManager',
        description: 'A professional application to manage tour itineraries, expenses, and finances.',
        theme_color: '#2D3748', // Dark Gray - Matches our header
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Important for Android icons
          }
        ]
      }
    })
  ],
})