import { Router } from 'express';
import { getConfig } from '../services/projects.js';

const router = Router();

// GET /server-api/projects/config
// R2D expects { status: 'success', result: <JSON string> } — result is double-encoded by design.
router.get('/config', (_req, res) => {
  res.json({ status: 'success', result: JSON.stringify(getConfig()) });
});

export default router;
