import { Router } from 'express';
import { getNavTree, getMaterialsTree, getCollectionProducts, getProductsByExternalIds, getProductsByTag, getFavorites, addFavorite, removeFavorite } from '../services/catalog.js';
import { DEV_USER_ID } from '../schema.js';

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

router.get('/favorites', (_req, res) => {
  res.json({ status: 'ok', data: getFavorites(DEV_USER_ID) });
});

router.post('/favorites/:id', (req, res) => {
  const externalId = parseInt(req.params.id, 10);
  const product = addFavorite(DEV_USER_ID, externalId);
  if (!product) { res.status(404).json({ status: 'error', message: 'Product not found' }); return; }
  res.json({ status: 'ok', data: product });
});

router.delete('/favorites/:id', (req, res) => {
  const externalId = parseInt(req.params.id, 10);
  removeFavorite(DEV_USER_ID, externalId);
  res.json({ status: 'ok', data: { success: true } });
});

export default router;
