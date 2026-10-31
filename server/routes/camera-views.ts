import { Router } from 'express';
import { z } from 'zod';
import { listCameraViews, createCameraView, deleteCameraView } from '../services/camera-views.js';

const router = Router();

// GET /?plan_id=<projectId>
// R2D expects: { status: 'ok', data: [{ id, config, previewUrl }] }
router.get('/', (req, res) => {
  res.json({ status: 'ok', data: listCameraViews(String(req.query.plan_id)) });
});

// POST / — body: { preview (JPEG data-URL), config, plan_entity_id }
// R2D expects: { status: 'ok', data: { id, config, previewUrl } }
const CreateSchema = z.object({
  preview: z.string().startsWith('data:image/jpeg;base64,'),
  config: z.object({}).passthrough(),
  plan_entity_id: z.string().min(1),
});

router.post('/', (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ status: 'error', message: parsed.error.message }); return; }

  const { preview, config, plan_entity_id } = parsed.data;
  const data = createCameraView(plan_entity_id, preview, config);
  if (!data) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json({ status: 'ok', data });
});

// DELETE /:id
// R2D expects: { status: 'ok', data: { success: true } }
router.delete('/:id', (req, res) => {
  if (!deleteCameraView(req.params.id)) { res.status(404).json({ status: 'error', message: 'Not found' }); return; }
  res.json({ status: 'ok', data: { success: true } });
});

export default router;
