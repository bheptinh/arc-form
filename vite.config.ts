import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteMockPlugin from './roomtodo/mock/vite-mock-plugin.js';
import catalogSearchPlugin from './vite-plugins/catalog-search-fallback/index.js';
import localFirstAssets from './vite-plugins/local-first-assets/index.js';


export default defineConfig(() => {
  return {
    plugins: [react(), catalogSearchPlugin, viteMockPlugin, localFirstAssets],
    define: {
      __APP_VERSION__: JSON.stringify('1.0.0'),
    },

    // root: 'roomtodo',
    build: {
      sourcemap: true
    },
    server: {
      // proxy: {
      //   '/src_designer/images/': {
      //     target: 'https://roomtodo.com',
      //     changeOrigin: true,
      //   },
      //   '/Assets/css/': {
      //     target: 'https://roomtodo.com',
      //     changeOrigin: true,
      //   },
      //   '/files/products/': {
      //     target: 'https://roomtodo.com',
      //     changeOrigin: true,
      //   },
      //   '/files/categories/product/': {
      //     target: 'https://roomtodo.com',
      //     changeOrigin: true,
      //   },
      // }
    }
  }
});
