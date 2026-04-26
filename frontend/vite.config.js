import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/product': 'http://localhost:8000',
      '/ocr': 'http://localhost:8000',
      '/verdict': 'http://localhost:8000',
      '/ping': 'http://localhost:8000',
    },
  },
})
