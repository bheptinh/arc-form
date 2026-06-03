import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getConfig, listProjects, loadProject, saveProject, renameProject, copyProject, deleteProject } from '../services/projects.js';
import { DEV_USER_ID } from '../schema.js';

const router = Router();

function badRequest(res: Response, msg: string) {
  res.status(400).json({ status: 'error', message: msg });
}

// GET /config
router.get('/config', (_req, res) => {
  res.json({ status: 'success', result: JSON.stringify(getConfig()), location: 'UA' });
});

// GET / — list projects
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  res.json(listProjects(DEV_USER_ID, limit, offset));
});

// GET /:id
router.get('/:id', (req, res) => {
  const project = loadProject(req.params.id);
  if (!project) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json(project);
});

// POST / — create new project (no id yet)
const SaveSchema = z.object({
  plan: z.object({ name: z.string().default('') }).passthrough(),
}).passthrough();

router.post('/', (req, res) => {
  const parsed = SaveSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, parsed.error.message); return; }

  const project = saveProject(DEV_USER_ID, parsed.data.plan as Record<string, unknown>);
  res.json(project);
});

// PUT /:id — save/update existing project
const UpdateSchema = z.object({
  plan: z.object({ id: z.string().min(1), name: z.string().default('') }).passthrough(),
}).passthrough();

router.put('/:id', (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, parsed.error.message); return; }

  const plan = { ...parsed.data.plan as Record<string, unknown>, id: req.params.id };
  const project = saveProject(DEV_USER_ID, plan);
  res.json(project);
});

// PATCH /:id — rename
const RenameSchema = z.object({ name: z.string().min(1) });

router.patch('/:id', (req, res) => {
  const parsed = RenameSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, parsed.error.message); return; }

  const result = renameProject(req.params.id, parsed.data.name);
  if (!result) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json(result);
});

// POST /:id/copy
const CopySchema = z.object({ name: z.string().min(1) });

router.post('/:id/copy', (req, res) => {
  const parsed = CopySchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, parsed.error.message); return; }

  const result = copyProject(req.params.id, parsed.data.name);
  if (!result) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json(result);
});

// DELETE /:id
router.delete('/:id', (req, res) => {
  const result = deleteProject(req.params.id);
  if (!result) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json(result);
});

export default router;
