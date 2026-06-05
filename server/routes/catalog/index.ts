import { Router } from 'express';
import { getNavTree, getMaterialsTree, getCollectionProducts, getProductsByExternalIds, getProductsByUuids, getProductsByTag, searchProducts, getFavorites, addFavorite, addFavoriteItem, removeFavorite } from '../../services/catalog.js';
import { getUserModels, getUserModelById, getUserModelFavorites } from '../../services/catalog-private.js';
import { DEV_USER_ID } from '../../schema.js';

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
  if (req.query.my === '1') {
    res.json({ status: 'ok', data: getUserModels(DEV_USER_ID) });
    return;
  }

  const query = req.query.query as string | undefined;
  if (query) {
    res.json({ status: 'ok', data: searchProducts(query) });
    return;
  }

  const tag = req.query.category_tag as string | undefined;
  if (tag) {
    res.json({ status: 'ok', data: getProductsByTag(tag) });
    return;
  }

  const raw = String(req.query.ids ?? '');
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  const uuids = parts.filter(s => isNaN(Number(s)));
  if (uuids.length > 0) {
    res.json({ status: 'ok', data: getProductsByUuids(uuids) });
    return;
  }
  // TODO: DEPRECATE — legacy integer external_id lookup, remove once all clients send UUIDs
  const ids = parts.map(s => parseInt(s, 10)).filter(n => !isNaN(n));
  res.json({ status: 'ok', data: getProductsByExternalIds(ids) });
});

router.get('/collections/:id', (req, res) => {
  const data = getCollectionProducts(req.params.id);
  res.json({ status: 'ok', data });
});

router.get('/favorites', (_req, res) => {
  const catalog = getFavorites(DEV_USER_ID);
  const privateItems = getUserModelFavorites(DEV_USER_ID);
  const items = [...catalog.items, ...privateItems];
  res.json({ status: 'ok', data: { total: String(items.length), items } });
});

router.post('/favorites/:id', (req, res) => {
  const uuid = req.params.id;
  const product = addFavorite(DEV_USER_ID, uuid);
  if (product) { res.json({ status: 'ok', data: product }); return; }
  const userModel = getUserModelById(uuid, DEV_USER_ID);
  if (userModel) {
    addFavoriteItem(DEV_USER_ID, uuid);
    res.json({ status: 'ok', data: { ...userModel, isFavorite: true } });
    return;
  }
  res.status(404).json({ status: 'error', message: 'Product not found' });
});

router.delete('/favorites/:id', (req, res) => {
  removeFavorite(DEV_USER_ID, req.params.id);
  res.json({ status: 'ok', data: { success: true } });
});

export default router;
