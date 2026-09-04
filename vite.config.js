import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'node:https'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = (env.VITE_API_URL || 'https://devapi.advitacredit.com').replace(/\/api\/?$/, '');
  const agent = new https.Agent({ keepAlive: false });

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          agent,
          headers: {
            Connection: 'close'
          },
          timeout: 60000,
          proxyTimeout: 60000,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              proxyReq.removeHeader('origin');
              // Strip oversized localhost cookie headers to prevent HTTP header overflow
              if (req.headers && req.headers.cookie && req.headers.cookie.length > 2048) {
                proxyReq.removeHeader('cookie');
              }
            });
            proxy.on('error', (err, req, res) => {
              console.warn('Vite proxy warning:', err.message);
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  statusCode: 502,
                  message: 'The remote backend server (devapi.advitacredit.com) is temporarily unreachable. Please retry.'
                }));
              }
            });
          }
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('axios') || id.includes('zustand') || id.includes('react-toastify')) {
                return 'vendor-utils';
              }
            }
          }
        }
      }
    }
  };
});
