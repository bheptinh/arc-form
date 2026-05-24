import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteMockPlugin from './roomtodo/mock/vite-mock-plugin.js';

export default defineConfig({
  plugins: [react(), viteMockPlugin],

  // root: 'roomtodo',
  build: {
    sourcemap: true
  },
  server: {
    proxy: {
      '/src_designer/images/': {
        target: 'https://roomtodo.com',
        changeOrigin: true,
      },
      '/Assets/css/': {
        target: 'https://roomtodo.com',
        changeOrigin: true,
      },
      '/files/products/': {
        target: 'https://roomtodo.com',
        changeOrigin: true,
      },
      '/files/categories/product/': {
        target: 'https://roomtodo.com',
        changeOrigin: true,
      },
    }
  }
});
