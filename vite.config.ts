import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'FinSmart',
        short_name: 'FinSmart',
        description: 'Your finances at your fingertips',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'style' || request.destination === 'script' || request.destination === 'image' || request.destination === 'font',
            handler: 'StaleWhileRevalidate'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  }
})
