import { Router } from 'express';
import { Readable } from 'stream';
import { NoSuchKey } from '@aws-sdk/client-s3';
import { getObject } from '../services/storage.js';

const router = Router();

// GET /files/products/<path> — streams the model file stored in S3 under the same key
router.get('/*path', async (req, res) => {
  const key = `files/products/${(req.params.path as string[]).join('/')}`;
  try {
    const object = await getObject(key);
    res.set({
      'Content-Type': object.ContentType ?? 'application/octet-stream',
      'Content-Length': String(object.ContentLength),
      'Cache-Control': 'public, max-age=31536000, immutable', // file names are content hashes
    });
    (object.Body as Readable).pipe(res);
  } catch (err) {
    if (err instanceof NoSuchKey) { res.sendStatus(404); return; }
    throw err;
  }
});

export default router;
