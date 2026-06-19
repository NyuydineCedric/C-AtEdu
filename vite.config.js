import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Locally, forward /api/* to the proxy.mjs server on port 3001
      // On Vercel, /api/* is handled by serverless functions automatically — no proxy needed there
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})