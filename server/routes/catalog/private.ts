import { Router } from 'express';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import path from 'path';
import multer from 'multer';
import { DEV_USER_ID } from '../../schema.js';
import {
  uploadsRoot,
  saveModelFiles,
  createUserModel,
  updateUserModel,
  getUserModelById,
  getUserModels,
  createUserMaterial,
  deleteUserMaterial,
} from '../../services/catalog-private.js';

const router = Router();

function makeStorage() {
  return multer.diskStorage({
    destination(req, _file, cb) {
      if (!(req as any)._uploadId) (req as any)._uploadId = randomUUID();
      const dir = path.join(uploadsRoot, (req as any)._uploadId);
      mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      cb(null, file.originalname);
    },
  });
}

const modelUpload = multer({ storage: makeStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
const materialUpload = multer({ storage: makeStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post(
  '/products/upload',
  modelUpload.fields([
    { name: 'preview', maxCount: 1 },
    { name: 'source', maxCount: 1 },
    { name: 'svg', maxCount: 1 },
    { name: 'svg_outline', maxCount: 1 },
    { name: 'metaZip', maxCount: 1 },
  ]),
  (req, res) => {
    const uploadId = (req as any)._uploadId as string;
    const data = saveModelFiles(uploadId, req.files as Record<string, Express.Multer.File[]>);
    res.json({ status: 'ok', data });
  },
);

router.post('/products', (req, res) => {
  const result = createUserModel(DEV_USER_ID, req.body);
  res.json({ status: 'ok', data: result });
});

router.put('/products/:id', (req, res) => {
  const result = updateUserModel(req.params.id, DEV_USER_ID, req.body);
  if (!result) { res.status(404).json({ status: 'error', message: 'Not found' }); return; }
  res.json({ status: 'ok', data: result });
});

router.get('/products', (_req, res) => {
  res.json({ status: 'ok', data: getUserModels(DEV_USER_ID) });
});

router.get('/products/:id', (req, res) => {
  const item = getUserModelById(req.params.id, DEV_USER_ID);
  if (!item) { res.status(404).json({ status: 'error', message: 'Not found' }); return; }
  res.json({ status: 'ok', data: item });
});

router.post(
  '/materials/upload',
  materialUpload.fields([
    { name: 'source', maxCount: 1 },
    { name: 'preview', maxCount: 1 },
  ]),
  (req, res) => {
    const data = createUserMaterial(
      DEV_USER_ID,
      req.body,
      req.files as Record<string, Express.Multer.File[]>,
    );
    res.json({ status: 'ok', data });
  },
);

router.delete('/materials/:id', (req, res) => {
  const deleted = deleteUserMaterial(DEV_USER_ID, req.params.id);
  if (!deleted) { res.status(404).json({ status: 'error', message: 'Not found' }); return; }
  res.json({ status: 'ok', data: { success: true } });
});

export default router;
