import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import localFirstAssets from './vite-plugins/local-first-assets/index.js';
import viteMockPlugin from './vite-plugins/vite-mock-plugin/vite-mock-plugin.js';



export default defineConfig(({ mode }) => {
  const { DB_DIR } = loadEnv(mode, process.cwd(), '');
  return {
    root: path.resolve('client'),
    plugins: [react(), viteMockPlugin, localFirstAssets(path.resolve(DB_DIR, 'files/products'))],
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
        '/uploads': {
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
