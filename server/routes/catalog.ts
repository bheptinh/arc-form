import { Router } from 'express';
import { getNavTree } from '../services/catalog.js';

const router = Router();

// R2D expects { status: 'success', tree: NavNode[] }
// NavNode ids are UUIDs; urlList points to /server-api/catalog/collections/:uuid
router.get('/nav', (_req, res) => {
  res.json(getNavTree());
});

export default router;
