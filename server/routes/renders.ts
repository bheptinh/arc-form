import { Router } from 'express';
import { createRender, listRenders, getRender, deleteRender, restartRender } from '../services/renders.js';

const router = Router();

// GET / — list renders  (GET /server-api/render?limit=20&offset=0)
router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;
  res.json({ status: 'ok', data: listRenders(limit, offset) });
});

// POST / — submit render job  (POST /server-api/render)
// Body: { renderType, renderView, renderOrientation, renderData, projectData, frameData, cameraData }
//
// projectData is a base64 data-URL of a JSZip blob containing content.json.
// content.json shape: { scene: { products[], viewState }, construction, preview (base64 JPEG), ... }
//
// TODO: Implement actual image generation:
//   1. Decode projectData: Buffer.from(projectData.split(',')[1], 'base64')
//   2. Unzip using 'unzipper' or similar and parse content.json
//   3. Extract content.json.preview (base64 JPEG) → save as renders/<id>/preview.jpg
//      (this is the current viewport screenshot; adequate for a fast preview)
//   4. For high-quality 2K/4K/360° output, launch a Puppeteer worker:
//        a. Load the R2D engine in a headless Chromium page
//        b. Call planner.init(), setCatalogProducts(), planner.setSize(w, h)
//        c. Feed content.json into the engine via the /server-api/projects/<id> endpoint
//           (serve content.json temporarily so loadScene() can fetch it)
//        d. Apply cameraData via R2D.Viewers.setCameraData(cameraData)
//        e. renderType 3 → 2560×1440, renderType 4 → 3840×2160
//        f. For renderType 5 (360°): render 6 cube faces via CubeCamera, stitch to
//           equirectangular panorama (4096×2048), save as renders/<id>/output.jpg
//        g. Otherwise: call page.screenshot({ path: 'renders/<id>/output.jpg' })
//   5. UPDATE renders SET status='stored', image_url='/renders/<id>/output.jpg',
//         preview='/renders/<id>/preview.jpg' WHERE id = ?
//   6. Deduct credits from user (renderType 3 = 1 credit, 4 = 2, 5 = 4)
//
// Until the worker is implemented, renders are stored immediately with no image.
router.post('/', (req, res) => {
  const { renderType, renderView = '', renderOrientation = 'landscape' } = req.body ?? {};

  if (typeof renderType !== 'number') {
    res.status(400).json({ status: 'error', error: 'renderType required' });
    return;
  }

  const renderId = createRender(renderType, renderView, renderOrientation);
  res.json({ status: 'ok', data: { renderId } });
});

// PUT /restart/:id — re-queue a failed render  (PUT /server-api/render/restart/:id)
router.put('/restart/:id', (req, res) => {
  const result = restartRender(req.params.id);
  if (!result) { res.status(404).json({ status: 'error', error: 'not found' }); return; }
  if ('error' in result) { res.json({ status: 'error', error: result.error }); return; }
  res.json({ status: 'ok', data: result });
});

// GET /env — render environment presets  (GET /server-api/render/env)
// TODO: return HDRI/skybox environment options once the render worker exists
router.get('/env', (_req, res) => {
  res.json({ status: 'ok', data: { environments: [] } });
});

// GET /:id — get render output URL  (GET /server-api/render/:id)
router.get('/:id', (req, res) => {
  const data = getRender(req.params.id);
  if (!data) { res.status(404).json({ status: 'error', error: 'not found' }); return; }
  res.json({ status: 'ok', data });
});

// DELETE /:id — soft-delete render  (DELETE /server-api/render/:id)
router.delete('/:id', (req, res) => {
  deleteRender(req.params.id);
  res.json({ status: 'ok' });
});

export default router;
