import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/master-breakdown': {
        target: process.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app',
        changeOrigin: true,
      },
      '/agents': {
        target: process.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app',
        changeOrigin: true,
      },
      '/email-verification': {
        target: process.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app',
        changeOrigin: true,
      },
      '/screenplays': {
        target: process.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app',
        changeOrigin: true,
      },
      '/pdf': {
        target: process.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app',
        changeOrigin: true,
      },
      '/scenes': {
        target: process.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app',
        changeOrigin: true,
      },
      '/production': {
        target: process.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app'),
    'import.meta.env.VITE_MOCK_API': JSON.stringify(process.env.VITE_MOCK_API || 'false'),
  },
})