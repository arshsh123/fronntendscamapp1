// File: vite.config.ts
// Replace your existing vite.config.ts with this complete version

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Path resolution for @ imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: 'localhost', // Use localhost for camera API compatibility
    
    // Optional: Enable HTTPS for production-like testing
    // Uncomment the lines below if you need HTTPS locally
    // https: {
    //   key: './localhost-key.pem',
    //   cert: './localhost.pem'
    // },
    
    // Proxy API calls to backend (alternative approach)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    
    // Optimize for mobile devices
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          three: ['three']
        }
      }
    }
  },
  
  // Define global constants
  define: {
    // API base URL - use environment variable or fallback
    __API_BASE_URL__: JSON.stringify(
      process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'
    )
  }
})