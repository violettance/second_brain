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
