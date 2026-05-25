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
        } else if (url.includes('ids=41817')) {
          mockFilePath = './mock/catalog-search/ids41817.json';
        } else if (url.includes('ids=45531')) {
          mockFilePath = './mock/catalog-search/ids45531.json';
        } else if (url.includes('ids=41826')) {
          mockFilePath = './mock/catalog-search/ids41826.json';
        } else if (url.includes('ids=41827')) {
          mockFilePath = './mock/catalog-search/ids41827.json';
        } else if (url.includes('ids=41828')) {
          mockFilePath = './mock/catalog-search/ids41828.json';
        } else if (url.includes('ids=41829')) {
          mockFilePath = './mock/catalog-search/ids41829.json';
        } else if (url.includes('ids=41831')) {
          mockFilePath = './mock/catalog-search/ids41831.json';
        } else if (url.includes('ids=41832')) {
          mockFilePath = './mock/catalog-search/ids41832.json';
        } else if (url.includes('ids=41834')) {
          mockFilePath = './mock/catalog-search/ids41834.json';
        } else if (url.includes('ids=41838')) {
          mockFilePath = './mock/catalog-search/ids41838.json';
        } else if (url.includes('ids=41819')) {
          mockFilePath = './mock/catalog-search/ids41819.json';
        } else if (url.includes('ids=41820')) {
          mockFilePath = './mock/catalog-search/ids41820.json';
        } else if (url.includes('ids=41835')) {
          mockFilePath = './mock/catalog-search/ids41835.json';
        } else if (url.includes('ids=41836')) {
          mockFilePath = './mock/catalog-search/ids41836.json';
        } else if (url.includes('ids=41822')) {
          mockFilePath = './mock/catalog-search/ids41822.json';
        } else if (url.includes('ids=41824')) {
          mockFilePath = './mock/catalog-search/ids41824.json';
        } else if (url.includes('ids=41805')) {
          mockFilePath = './mock/catalog-search/ids41805.json';


        } else if (url.includes('category_id=8450')) {
          mockFilePath = './mock/catalog-search/category-id-8450.json';

        } else if (url.includes('category_id=9154')) {
          mockFilePath = './mock/catalog-search/category-id-9154.json';
        } else if (url.includes('category_id=9155')) {
          mockFilePath = './mock/catalog-search/category-id-9155.json';
        } else if (url.includes('category_id=9156')) {
          mockFilePath = './mock/catalog-search/category-id-9156.json';
        } else if (url.includes('category_id=9174')) {
          mockFilePath = './mock/catalog-search/category-id-9174.json';
        } else if (url.includes('category_id=9175')) {
          mockFilePath = './mock/catalog-search/category-id-9175.json';
        } else if (url.includes('category_id=9176')) {
          mockFilePath = './mock/catalog-search/category-id-9176.json';
        } else if (url.includes('category_id=9177')) {
          mockFilePath = './mock/catalog-search/category-id-9177.json';
        } else if (url.includes('category_id=9179')) {
          mockFilePath = './mock/catalog-search/category-id-9179.json';
        } else if (url.includes('category_id=9180')) {
          mockFilePath = './mock/catalog-search/category-id-9180.json';
        } else if (url.includes('category_id=9181')) {
          mockFilePath = './mock/catalog-search/category-id-9181.json';
        } else if (url.includes('category_id=9183')) {
          mockFilePath = './mock/catalog-search/category-id-9183.json';
        } else if (url.includes('category_id=9184')) {
          mockFilePath = './mock/catalog-search/category-id-9184.json';
        } else if (url.includes('category_id=9188')) {
          mockFilePath = './mock/catalog-search/category-id-9188.json';
        } else if (url.includes('category_id=9191')) {
          mockFilePath = './mock/catalog-search/category-id-9191.json';
        } else if (url.includes('category_id=9199')) {
          mockFilePath = './mock/catalog-search/category-id-9199.json';
        
        } else if (url.includes('category_id=9201')) {
          mockFilePath = './mock/catalog-search/category-id-9201.json';
        } else if (url.includes('category_id=9202')) {
          mockFilePath = './mock/catalog-search/category-id-9202.json';
        } else if (url.includes('category_id=9203')) {
          mockFilePath = './mock/catalog-search/category-id-9203.json';
        } else if (url.includes('category_id=9204')) {
          mockFilePath = './mock/catalog-search/category-id-9204.json';
        } else if (url.includes('category_id=9206')) {
          mockFilePath = './mock/catalog-search/category-id-9206.json';
        } else if (url.includes('category_id=9207')) {
          mockFilePath = './mock/catalog-search/category-id-9207.json';
        } else if (url.includes('category_id=9210')) {
          mockFilePath = './mock/catalog-search/category-id-9210.json';
        
        } else if (url.includes('category_id=9511')) {
          mockFilePath = './mock/catalog-search/category-id-9511.json';


        } else if (url.includes('category_id=9721')) {
          mockFilePath = './mock/catalog-search/category-id-9721.json';
        } else if (url.includes('category_id=9722')) {
          mockFilePath = './mock/catalog-search/category-id-9722.json';
        } else if (url.includes('category_id=9723')) {
          mockFilePath = './mock/catalog-search/category-id-9723.json';
        } else if (url.includes('category_id=9724')) {
          mockFilePath = './mock/catalog-search/category-id-9724.json';
        } else if (url.includes('category_id=9778')) {
          mockFilePath = './mock/catalog-search/category-id-9778.json';
        
        } else if (url.includes('category_id=9850')) {
          mockFilePath = './mock/catalog-search/category-id-9850.json';
        } else if (url.includes('category_id=9853')) {
          mockFilePath = './mock/catalog-search/category-id-9853.json';
        } else if (url.includes('category_id=9855')) {
          mockFilePath = './mock/catalog-search/category-id-9855.json';
        } else if (url.includes('category_id=9856')) {
          mockFilePath = './mock/catalog-search/category-id-9856.json';
        } else if (url.includes('category_id=9858')) {
          mockFilePath = './mock/catalog-search/category-id-9858.json';
        } else if (url.includes('category_id=9870')) {
          mockFilePath = './mock/catalog-search/category-id-9870.json';
        } else if (url.includes('category_id=9871')) {
          mockFilePath = './mock/catalog-search/category-id-9871.json';
        } else if (url.includes('category_id=9881')) {
          mockFilePath = './mock/catalog-search/category-id-9881.json';
        } else if (url.includes('category_id=9882')) {
          mockFilePath = './mock/catalog-search/category-id-9882.json';
        } else if (url.includes('category_id=9884')) {
          mockFilePath = './mock/catalog-search/category-id-9884.json';
        } else if (url.includes('category_id=9885')) {
          mockFilePath = './mock/catalog-search/category-id-9885.json';
        } else if (url.includes('category_id=9886')) {
          mockFilePath = './mock/catalog-search/category-id-9886.json';
        } else if (url.includes('category_id=9887')) {
          mockFilePath = './mock/catalog-search/category-id-9887.json';
        } else if (url.includes('category_id=9888')) {
          mockFilePath = './mock/catalog-search/category-id-9888.json';
        } else if (url.includes('category_id=9889')) {
          mockFilePath = './mock/catalog-search/category-id-9889.json';
        } else if (url.includes('category_id=9890')) {
          mockFilePath = './mock/catalog-search/category-id-9890.json';
        } else if (url.includes('category_id=9891')) {
          mockFilePath = './mock/catalog-search/category-id-9891.json';
        } else if (url.includes('category_id=9892')) {
          mockFilePath = './mock/catalog-search/category-id-9892.json';
        } else if (url.includes('category_id=9893')) {
          mockFilePath = './mock/catalog-search/category-id-9893.json';
        } else if (url.includes('category_id=9895')) {
          mockFilePath = './mock/catalog-search/category-id-9895.json';
        } else if (url.includes('category_id=9896')) {
          mockFilePath = './mock/catalog-search/category-id-9896.json';
        } else if (url.includes('category_id=9897')) {
          mockFilePath = './mock/catalog-search/category-id-9897.json';
        } else if (url.includes('category_id=9898')) {
          mockFilePath = './mock/catalog-search/category-id-9898.json';
        } else if (url.includes('category_id=9899')) {
          mockFilePath = './mock/catalog-search/category-id-9899.json';

        } else if (url.includes('category_id=9900')) {
          mockFilePath = './mock/catalog-search/category-id-9900.json';
        } else if (url.includes('category_id=9901')) {
          mockFilePath = './mock/catalog-search/category-id-9901.json';
        } else if (url.includes('category_id=9902')) {
          mockFilePath = './mock/catalog-search/category-id-9902.json';
        } else if (url.includes('category_id=9903')) {
          mockFilePath = './mock/catalog-search/category-id-9903.json';
        } else if (url.includes('category_id=9904')) {
          mockFilePath = './mock/catalog-search/category-id-9904.json';
        } else if (url.includes('category_id=9905')) {
          mockFilePath = './mock/catalog-search/category-id-9905.json';
        } else if (url.includes('category_id=9906')) {
          mockFilePath = './mock/catalog-search/category-id-9906.json';
        } else if (url.includes('category_id=9907')) {
          mockFilePath = './mock/catalog-search/category-id-9907.json';
        } else if (url.includes('category_id=9908')) {
          mockFilePath = './mock/catalog-search/category-id-9908.json';
        } else if (url.includes('category_id=9909')) {
          mockFilePath = './mock/catalog-search/category-id-9909.json';
        } else if (url.includes('category_id=9910')) {
          mockFilePath = './mock/catalog-search/category-id-9910.json';
        } else if (url.includes('category_id=9911')) {
          mockFilePath = './mock/catalog-search/category-id-9911.json';
        } else if (url.includes('category_id=9912')) {
          mockFilePath = './mock/catalog-search/category-id-9912.json';
        } else if (url.includes('category_id=9913')) {
          mockFilePath = './mock/catalog-search/category-id-9913.json';
        } else if (url.includes('category_id=9914')) {
          mockFilePath = './mock/catalog-search/category-id-9914.json';
        } else if (url.includes('category_id=9915')) {
          mockFilePath = './mock/catalog-search/category-id-9915.json';
        } else if (url.includes('category_id=9926')) {
          mockFilePath = './mock/catalog-search/category-id-9926.json';
        } else if (url.includes('category_id=9928')) {
          mockFilePath = './mock/catalog-search/category-id-9928.json';
        } else if (url.includes('category_id=9985')) {
          mockFilePath = './mock/catalog-search/category-id-9985.json';
        } else if (url.includes('category_id=9987')) {
          mockFilePath = './mock/catalog-search/category-id-9987.json';
        } else if (url.includes('category_id=9988')) {
          mockFilePath = './mock/catalog-search/category-id-9988.json';
        } else if (url.includes('category_id=9989')) {
          mockFilePath = './mock/catalog-search/category-id-9989.json';
        } else if (url.includes('category_id=9990')) {
          mockFilePath = './mock/catalog-search/category-id-9990.json';
        } else if (url.includes('category_id=9991')) {
          mockFilePath = './mock/catalog-search/category-id-9991.json';
        } else if (url.includes('category_id=9992')) {
          mockFilePath = './mock/catalog-search/category-id-9992.json';
        } else if (url.includes('category_id=9993')) {
          mockFilePath = './mock/catalog-search/category-id-9993.json';
        } else if (url.includes('category_id=9994')) {
          mockFilePath = './mock/catalog-search/category-id-9994.json';
        

        
        } else if (url.includes('category_id=389&')) {
          mockFilePath = './mock/catalog-search/category-id-389.json';
        
        } else if (url.includes('category_id=686&')) {
          mockFilePath = './mock/catalog-search/category-id-686.json';
        } else if (url.includes('category_id=687&')) {
          mockFilePath = './mock/catalog-search/category-id-687.json';
        } else if (url.includes('category_id=688&')) {
          mockFilePath = './mock/catalog-search/category-id-688.json';
        } else if (url.includes('category_id=689&')) {
          mockFilePath = './mock/catalog-search/category-id-689.json';
        } else if (url.includes('category_id=690&')) {
          mockFilePath = './mock/catalog-search/category-id-690.json';
        } else if (url.includes('category_id=691&')) {
          mockFilePath = './mock/catalog-search/category-id-691.json';
        } else if (url.includes('category_id=692&')) {
          mockFilePath = './mock/catalog-search/category-id-692.json';
        } else if (url.includes('category_id=693&')) {
          mockFilePath = './mock/catalog-search/category-id-693.json';
        } else if (url.includes('category_id=694&')) {
          mockFilePath = './mock/catalog-search/category-id-694.json';
        } else if (url.includes('category_id=695&')) {
          mockFilePath = './mock/catalog-search/category-id-695.json';
        } else if (url.includes('category_id=697&')) {
          mockFilePath = './mock/catalog-search/category-id-697.json';
        } else if (url.includes('category_id=698&')) {
          mockFilePath = './mock/catalog-search/category-id-698.json';
        } else if (url.includes('category_id=699&')) {
          mockFilePath = './mock/catalog-search/category-id-699.json';
        
        
        } else if (url.includes('category_id=700&')) {
          mockFilePath = './mock/catalog-search/category-id-700.json';
        } else if (url.includes('category_id=701&')) {
          mockFilePath = './mock/catalog-search/category-id-701.json';
        } else if (url.includes('category_id=702&')) {
          mockFilePath = './mock/catalog-search/category-id-702.json';
        } else if (url.includes('category_id=703&')) {
          mockFilePath = './mock/catalog-search/category-id-703.json';
        } else if (url.includes('category_id=704&')) {
          mockFilePath = './mock/catalog-search/category-id-704.json';
        } else if (url.includes('category_id=705&')) {
          mockFilePath = './mock/catalog-search/category-id-705.json';
        } else if (url.includes('category_id=706&')) {
          mockFilePath = './mock/catalog-search/category-id-706.json';
        } else if (url.includes('category_id=707&')) {
          mockFilePath = './mock/catalog-search/category-id-707.json';
        } else if (url.includes('category_id=708&')) {
          mockFilePath = './mock/catalog-search/category-id-708.json';
        } else if (url.includes('category_id=710&')) {
          mockFilePath = './mock/catalog-search/category-id-710.json';
        } else if (url.includes('category_id=711&')) {
          mockFilePath = './mock/catalog-search/category-id-711.json';
        } else if (url.includes('category_id=712&')) {
          mockFilePath = './mock/catalog-search/category-id-712.json';
        } else if (url.includes('category_id=713&')) {
          mockFilePath = './mock/catalog-search/category-id-713.json';
        } else if (url.includes('category_id=714&')) {
          mockFilePath = './mock/catalog-search/category-id-714.json';
        } else if (url.includes('category_id=719&')) {
          mockFilePath = './mock/catalog-search/category-id-719.json';
        } else if (url.includes('category_id=720&')) {
          mockFilePath = './mock/catalog-search/category-id-720.json';
        
        
        
        } else if (url.includes('category_id=857&')) {
          mockFilePath = './mock/catalog-search/category-id-857.json';


        } else if (url.includes('category_id=920&')) {
          mockFilePath = './mock/catalog-search/category-id-920.json';
        } else if (url.includes('category_id=927&')) {
          mockFilePath = './mock/catalog-search/category-id-927.json';
        } else if (url.includes('category_id=929&')) {
          mockFilePath = './mock/catalog-search/category-id-929.json';
        } else if (url.includes('category_id=933&')) {
          mockFilePath = './mock/catalog-search/category-id-933.json';
        } else if (url.includes('category_id=934&')) {
          mockFilePath = './mock/catalog-search/category-id-934.json';
        } else if (url.includes('category_id=936&')) {
          mockFilePath = './mock/catalog-search/category-id-936.json';
        } else if (url.includes('category_id=937&')) {
          mockFilePath = './mock/catalog-search/category-id-937.json';
        } else if (url.includes('category_id=938&')) {
          mockFilePath = './mock/catalog-search/category-id-938.json';
        } else if (url.includes('category_id=939&')) {
          mockFilePath = './mock/catalog-search/category-id-939.json';
        } else if (url.includes('category_id=940&')) {
          mockFilePath = './mock/catalog-search/category-id-940.json';
        } else if (url.includes('category_id=941&')) {
          mockFilePath = './mock/catalog-search/category-id-941.json';
        } else if (url.includes('category_id=942&')) {
          mockFilePath = './mock/catalog-search/category-id-942.json';
        } else if (url.includes('category_id=943&')) {
          mockFilePath = './mock/catalog-search/category-id-943.json';
        } else if (url.includes('category_id=944&')) {
          mockFilePath = './mock/catalog-search/category-id-944.json';
        } else if (url.includes('category_id=945&')) {
          mockFilePath = './mock/catalog-search/category-id-945.json';
        } else if (url.includes('category_id=946&')) {
          mockFilePath = './mock/catalog-search/category-id-946.json';
        
        
        } else if (url.includes('category_id=7&')) {
          mockFilePath = './mock/catalog-search/category-id-7.json';
        } else if (url.includes('category_id=15&')) {
          mockFilePath = './mock/catalog-search/category-id-15.json';
        } else if (url.includes('category_id=19&')) {
          mockFilePath = './mock/catalog-search/category-id-19.json';
        } else if (url.includes('category_id=24&')) {
          mockFilePath = './mock/catalog-search/category-id-24.json';
        } else if (url.includes('category_id=25&')) {
          mockFilePath = './mock/catalog-search/category-id-25.json';
        } else if (url.includes('category_id=26&')) {
          if (url.includes('category_type=1')) {
            mockFilePath = './mock/catalog-search/category-id-26-1.json';
          } else {
            mockFilePath = './mock/catalog-search/category-id-26.json';
          }
        } else if (url.includes('category_id=27&')) {
          mockFilePath = './mock/catalog-search/category-id-27.json';
        } else if (url.includes('category_id=34&')) {
          mockFilePath = './mock/catalog-search/category-id-34.json';
        } else if (url.includes('category_id=40&')) {
          mockFilePath = './mock/catalog-search/category-id-40.json';
        } else if (url.includes('category_id=42&')) {
          mockFilePath = './mock/catalog-search/category-id-42.json';
        } else if (url.includes('category_id=46&')) {
          mockFilePath = './mock/catalog-search/category-id-46.json';
        } else if (url.includes('category_id=49&')) {
          mockFilePath = './mock/catalog-search/category-id-49.json';
        } else if (url.includes('category_id=50&')) {
          mockFilePath = './mock/catalog-search/category-id-50.json';
        } else if (url.includes('category_id=51&')) {
          mockFilePath = './mock/catalog-search/category-id-51.json';
        } else if (url.includes('category_id=52&')) {
          mockFilePath = './mock/catalog-search/category-id-52.json';
        } else if (url.includes('category_id=54&')) {
          mockFilePath = './mock/catalog-search/category-id-54.json';
        } else if (url.includes('category_id=56&')) {
          mockFilePath = './mock/catalog-search/category-id-56.json';
        } else if (url.includes('category_id=57&')) {
          mockFilePath = './mock/catalog-search/category-id-57.json';
        } else if (url.includes('category_id=59&')) {
          mockFilePath = './mock/catalog-search/category-id-59.json';
        } else if (url.includes('category_id=66&')) {
          mockFilePath = './mock/catalog-search/category-id-66.json';
        } else if (url.includes('category_id=67&')) {
          mockFilePath = './mock/catalog-search/category-id-67.json';
        } else if (url.includes('category_id=69&')) {
          mockFilePath = './mock/catalog-search/category-id-69.json';
        } else if (url.includes('category_id=70&')) {
          mockFilePath = './mock/catalog-search/category-id-70.json';
        } else if (url.includes('category_id=71&')) {
          if (url.includes('category_type=1')) {
            mockFilePath = './mock/catalog-search/category-id-71-1.json';
          } else {
            mockFilePath = './mock/catalog-search/category-id-71.json';
          }
        } else if (url.includes('category_id=72&')) {
          mockFilePath = './mock/catalog-search/category-id-72.json';
        } else if (url.includes('category_id=79&')) {
          mockFilePath = './mock/catalog-search/category-id-79.json';
        } else if (url.includes('category_id=80&')) {
          mockFilePath = './mock/catalog-search/category-id-80.json';
        } else if (url.includes('category_id=82&')) {
          mockFilePath = './mock/catalog-search/category-id-82.json';
        } else if (url.includes('category_id=84&')) {
          mockFilePath = './mock/catalog-search/category-id-84.json';
        } else if (url.includes('category_id=85&')) {
          mockFilePath = './mock/catalog-search/category-id-85.json';
        } else if (url.includes('category_id=90&')) {
          mockFilePath = './mock/catalog-search/category-id-90.json';
        } else if (url.includes('category_id=91&')) {
          mockFilePath = './mock/catalog-search/category-id-91.json';
        } else if (url.includes('category_id=92&')) {
          mockFilePath = './mock/catalog-search/category-id-92.json';
        } else if (url.includes('category_id=93&')) {
          mockFilePath = './mock/catalog-search/category-id-93.json';
        } else if (url.includes('category_id=95&')) {
          mockFilePath = './mock/catalog-search/category-id-95.json';
        } else if (url.includes('category_id=96&')) {
          mockFilePath = './mock/catalog-search/category-id-96.json';
        } else if (url.includes('category_id=97&')) {
          mockFilePath = './mock/catalog-search/category-id-97.json';
        
        
        
        
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
          console.log('Saving planner data to', mockProjectPath);
          
          // fs.writeFileSync(path.resolve(__dirname, mockProjectPath), JSON.stringify(jsonData, null, 2), 'utf-8');

          
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