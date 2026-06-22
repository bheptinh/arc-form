import { Router } from 'express';
import { listTours, deleteTour } from '../services/tours.js';

const router = Router();

// GET / — list 360° tours  (GET /server-api/tours)
router.get('/', (_req, res) => {
  res.json({ status: 'ok', data: listTours() });
});

// DELETE /:id — delete a tour  (DELETE /server-api/tours/:id)
router.delete('/:id', (req, res) => {
  const found = deleteTour(req.params.id);
  if (!found) { res.status(404).json({ status: 'error', error: 'not found' }); return; }
  res.json({ status: 'ok' });
});

export default router;
