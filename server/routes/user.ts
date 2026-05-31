import { Router } from 'express';
import { getUser } from '../services/user.js';

const router = Router();

// GET /server-api/user
// R2D expects { status: 'ok', data: { id, email, name, plan, ... } }
router.get('/', (_req, res) => {
  res.json({ status: 'ok', data: getUser() });
});

export default router;
