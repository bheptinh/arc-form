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
    
    server.middlewares.use('/api/', (req, res) => {
      let mockFilePath = '';

      const url = req.url || '';
      if (url.startsWith('/language/list')) {
        // TODO: MOVE TO FE — replace with bundled i18n (react-i18next or similar).
        //       Remove this handler and URL_LANGUAGE_LIST from index.html R2D.URL once i18n is in place.
        mockFilePath = './mock/language-list.json';
      } else if (url.startsWith('/user/translations')) {
        // TODO: MOVE TO FE — translation strings belong in the React i18n bundle, not the backend.
        //       Remove this handler and URL_TRANSLATION from index.html R2D.URL once i18n is in place.
        mockFilePath = './mock/user-translations.json';
      } else if (url.startsWith('/favorites')) {
        // TODO: MIGRATE TO BACKEND → GET /server-api/catalog/favorites
        //       Remove this handler once the Express route is live.
        mockFilePath = './mock/favorites.json';
      } else if (url.startsWith('/category/public_materials')) {
        // TODO: MIGRATE TO BACKEND → GET /server-api/catalog/materials
        //       Remove this handler once the Express route is live.
        mockFilePath = './mock/category-public-materials.json';
      } else if (url.startsWith('/category/tree')) {
        // TODO: MIGRATE TO BACKEND → GET /server-api/catalog/tree
        //       Remove this handler once the Express route is live.
        mockFilePath = './mock/category-tree.json';


      } else if (url.startsWith('/planner/open_shared')) {
        // TODO: MIGRATE TO BACKEND → GET /server-api/planner/open-shared
        //       Remove this handler once the Express route is live.
        if (url.includes('plan_hash=bi0t3wvqnek')) {
          mockFilePath = './mock/planner/bi0t3wvqnek.json';
        } else {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }


      } else if (url.startsWith('/planner/save')) {
        // TODO: MIGRATE TO BACKEND → POST /server-api/planner/save
        //       Remove this handler once the Express route is live.
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          const params = new URLSearchParams(body);


          const data = JSON.parse(params.get('json') || '{}');

          const mockProjectPath = `./mock/planner/${data.plan.hash}.json`;
          const jsonData = {
            status: "success",
            viewOnly: false,
            userPlan: "pro",
            plan: data.plan,
          }
          console.log('Saving planner data to', mockProjectPath);

          // fs.writeFileSync(path.resolve(__dirname, mockProjectPath), JSON.stringify(jsonData, null, 2), 'utf-8');


          res.statusCode = 200;
          res.end();
        });
        return;

      } else if (url.startsWith('/planner/connect')) {
        // TODO: DELETE — this endpoint has no purpose. Remove handler and URL_CONNECT (if any) from R2D.URL.
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