import path from 'path';
import fs from 'fs';

export default {
  name: 'mock-json-endpoint',

  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? '').split('?')[0];
      let mockFilePath;

      if (url.startsWith('/switch_image')) {
        mockFilePath = './mock/js-switch-image.js';
      } else if (url.startsWith('/panoramas_360')) {
        mockFilePath = './mock/js-panoramas-360.js';
      } else if (url.startsWith('/renders_2k_4k')) {
        mockFilePath = './mock/js-renders-2k-4k.js';
      } else if (url.startsWith('/image_with_model_ai')) {
        mockFilePath = './mock/js-image-with-model-ai.js';
      } else {
        next();
        return;
      }

      const filePath = path.resolve(__dirname, mockFilePath);
      const response = fs.readFileSync(filePath, 'utf-8')

      res.setHeader('Content-Type', 'text/javascript')
      res.end(response)
    });
    
    server.middlewares.use('/api2/', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 404;
      res.end(JSON.stringify({ status: 'error', message: 'not_found' }));
    });

    server.middlewares.use('/api/', (req, res) => {
      let mockFilePath = '';

      const url = req.url || '';
      if (url.startsWith('/user/promo')) {
        // TODO: implement POST /server-api/user/promo — validate code, apply benefit (plan upgrade, credits, etc.),
        //       return { status: 'ok', message: '<translation_key>' } or { status: 'error', error: '<translation_key>' }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', message: 'Promo code applied' }));
        return;
      } else if (url.startsWith('/planner/connect')) {
        // TODO: remove entirely — redundant license-key ping for roomtodo.com, response is never used.
        //       Remove this handler, the URL_PLANNER_CONNECT entry in index.html, and the plannerConnect() call in App.tsx.
        res.statusCode = 200;
        res.end();
        return;
      } else {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      

      const filePath = path.resolve(__dirname, mockFilePath);
      const json = fs.readFileSync(filePath, 'utf-8')

      res.setHeader('Content-Type', 'application/json')
      res.end(json)
    });
  },
};