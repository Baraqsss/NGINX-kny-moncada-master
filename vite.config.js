import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd());
  
  const apiTarget = env.VITE_API_URL || 'https://nginx-kny-moncada-master.onrender.com';
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',  // Expose Vite to external networks
      port: 5173,       // Ensure Vite uses port 5173
      strictPort: true, // Don't try other ports if 5173 is in use
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
