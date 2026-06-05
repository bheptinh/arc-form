import { Router } from 'express';
import { getUser, updateUser } from '../services/user.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', data: getUser() });
});

router.patch('/', (req, res) => {
  updateUser(req.body);
  res.json({ status: 'success' });
});

export default router;
