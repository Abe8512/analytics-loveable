
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Handle the 'module' is not defined error by providing a global module
    'global': {},
    'process.env': {},
  },
  server: {
    port: 8080
  },
  optimizeDeps: {
    exclude: ['webworker-threads', 'natural'],
  },
}));
