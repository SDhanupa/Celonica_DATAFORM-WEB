import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend for the dev server. Defaults to the Dockerised nginx→php-fpm cluster
// (:3001), which is concurrent, OPcache-warm and ~3-4× faster than the
// single-threaded `php artisan serve` on :8000. Override with VITE_API_TARGET
// (e.g. http://127.0.0.1:8000) to point at a local artisan serve instead.
const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:3001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/graphql': { target: apiTarget, changeOrigin: true },
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
})
