import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['framer-motion'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  publicDir: 'public',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Vite] Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[Vite] Sending Request:', req.method, req.url);
            const token = req.headers['authorization'];
            if (token) {
              proxyReq.setHeader('authorization', token);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Vite] Received Response:', proxyRes.statusCode, req.url);
          });
        }
      },
    },
    host: true, // Necesario para acceder desde otros dispositivos en la red
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    outDir: 'dist',
  },
});