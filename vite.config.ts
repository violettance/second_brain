import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/ph': {
        target: 'https://us.i.posthog.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ph/, ''),
      },
    },
    headers: {
      // Development CSP: allow Vite HMR and Datadog intake
      'Content-Security-Policy': [
        "default-src 'self'",
        // Vite dev needs inline preamble for React Fast Refresh and 'unsafe-eval' for HMR
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        // allow localhost/ws for HMR + Supabase (wss) + Datadog intake
        "connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in https://browser-intake-us5-datadoghq.com https://*.datadoghq.com https://us.i.posthog.com https://eu.i.posthog.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  esbuild: { drop: ['debugger'] },
  build: {
    sourcemap: true, // Enable source maps for Datadog error tracking
    rollupOptions: {
      output: {
        sourcemap: true,
      },
    },
  },
});
