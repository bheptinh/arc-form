import path from 'path';
import fs from 'fs';

export default {
  name: 'mock-json-endpoint',

  configureServer(server) {
    server.middlewares.use('/api/', (req, res) => {
      let mockFilePath = '';

      const url = req.url || '';
      if (url.startsWith('/language/list')) {
        mockFilePath = './mock/language-list.json';
      } else if (url.startsWith('/user/translations')) {
        mockFilePath = './mock/user-translations.json';
      } else if (url.startsWith('/favorites')) {
        mockFilePath = './mock/favorites.json';
      } else if (url.startsWith('/planner/json_config')) {
        mockFilePath = './mock/planner-json-config.json';
      } else if (url.startsWith('/category/public_materials')) {
        mockFilePath = './mock/category-public-materials.json';
      } else if (url.startsWith('/category/tree')) {
        mockFilePath = './mock/category-tree.json';
      
      
      } else if (url.startsWith('/catalog/search')) {
        if (url.includes('category_tag=moldings')) {
          mockFilePath = './mock/catalog-search/moldings.json';
        } else if (url.includes('category_tag=plinths')) {
          mockFilePath = './mock/catalog-search/plinths.json';
        } else if (url.includes('category_tag=skybox')) {
          mockFilePath = './mock/catalog-search/skybox.json';
        
        } else if (url.includes('ids=260,354,707,984,3319,941,2021,2020,54828,1610,774,54836,41818,53097,55344,41833,55338,844,839,55155,2013,1618,3008,41803,2525,41823,2318,3377')) {
          mockFilePath = './mock/catalog-search/ids260-3377.json';
        } else if (url.includes('ids=41804')) {
          mockFilePath = './mock/catalog-search/ids41804.json';
        
        
        } else if (url.includes('category_tag&my=1')) {
          mockFilePath = './mock/catalog-search/my.json';
        
        
        } else {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }
      
      } else if (url.startsWith('/planner/open_shared')) {
        if (url.includes('plan_hash=bi0t3wvqnek')) {
          mockFilePath = './mock/planner/bi0t3wvqnek.json';
        } else {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }


      } else if (url.startsWith('/planner/save')) {
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
          fs.writeFileSync(path.resolve(__dirname, mockProjectPath), JSON.stringify(jsonData, null, 2), 'utf-8');

          
          res.statusCode = 200;
          res.end();
        });
        return;

      } else if (url.startsWith('/planner/connect')) {
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
    
    
    server.middlewares.use('/api2/', (req, res) => {
      let mockFilePath = '';

      const url = req.url || '';
      if (url.startsWith('/user/info')) {
        mockFilePath = './mock/api2-user-info.json';
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