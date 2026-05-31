import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import catalogSearchPlugin from './vite-plugins/catalog-search-fallback/index.js';
import localFirstAssets from './vite-plugins/local-first-assets/index.js';
import viteMockPlugin from './vite-plugins/vite-mock-plugin/vite-mock-plugin.js';



export default defineConfig(() => {
  return {
    root: path.resolve('client'),
    plugins: [react(), catalogSearchPlugin, viteMockPlugin, localFirstAssets],
    define: {
      __APP_VERSION__: JSON.stringify('1.0.0'),
    },

    build: {
      outDir: path.resolve('dist'),
      emptyOutDir: true,
      sourcemap: true,
    },
    server: {
      proxy: {
        '/server-api': {
          target: 'http://localhost:3015',
          changeOrigin: true,
        },
      },
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
