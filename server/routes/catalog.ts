import { Router } from 'express';
import { getNavTree, getCollectionProducts } from '../services/catalog.js';

const router = Router();

// R2D expects { status: 'success', tree: NavNode[] }
// NavNode ids are UUIDs; urlList points to /server-api/catalog/collections/:uuid
router.get('/nav', (_req, res) => {
  res.json(getNavTree());
});

// R2D expects { status: 'ok', data: { total, items, offset, limit } }
// or { status: 'ok', products: [...] } — we use the data.items shape
router.get('/collections/:id', (req, res) => {
  const data = getCollectionProducts(req.params.id);
  res.json({ status: 'ok', data });
});

export default router;
