import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: '0.0.0.0', // accessible sur le réseau local
    port: 3001,
    open: true,
    strictPort: true,
    headers: {
      // Désactive COOP/COEP en développement pour éviter les blocages postMessage
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'https://digital-93tz.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'https://digital-93tz.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
