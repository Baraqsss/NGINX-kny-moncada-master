import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Expose Vite to external networks
    port: 5173,       // Ensure Vite uses port 5173
    strictPort: true, // Don't try other ports if 5173 is in use
    proxy: {
      '/api': {
        target: 'http://172.31.27.2:5000',  // Use the internal EC2 backend IP
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
