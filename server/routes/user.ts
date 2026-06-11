import { Router } from 'express';
import { UserPatchSchema } from '../../shared/schemas/user.js';
import { getUser, updateUser } from '../services/user.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', data: getUser() });
});

router.patch('/', (req, res) => {
  const result = UserPatchSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  res.json({ status: 'ok', data: updateUser(result.data) });
});

export default router;
