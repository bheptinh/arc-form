import { Router } from 'express';
import { getNavTree, getMaterialsTree, getCollectionProducts, getProductsByExternalIds, getProductsByTag } from '../services/catalog.js';

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
router.get('/products', (req, res) => {
  const tag = req.query.category_tag as string | undefined;
  if (tag) {
    res.json({ status: 'ok', data: getProductsByTag(tag) });
    return;
  }

  const raw = String(req.query.ids ?? '');
  const ids = raw.split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
  res.json({ status: 'ok', data: getProductsByExternalIds(ids) });
});

router.get('/collections/:id', (req, res) => {
  const data = getCollectionProducts(req.params.id);
  res.json({ status: 'ok', data });
});

export default router;
