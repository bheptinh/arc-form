import { Router } from 'express';
import { getNavTree, getMaterialsTree, getCollectionProducts } from '../services/catalog.js';

const router = Router();

// R2D expects { status: 'success', tree: NavNode[] }
router.get('/products/nav', (_req, res) => {
  res.json(getNavTree());
});

// R2D expects { status: 'success', materials: [...] }
router.get('/materials/nav', (_req, res) => {
  res.json(getMaterialsTree());
});

// R2D expects { status: 'ok', data: { total, items, offset, limit } }
// or { status: 'ok', products: [...] } — we use the data.items shape
router.get('/collections/:id', (req, res) => {
  const data = getCollectionProducts(req.params.id);
  res.json({ status: 'ok', data });
});

export default router;
