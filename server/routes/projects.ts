import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getConfig, listProjects, loadProject, saveProject, renameProject, copyProject, deleteProject, getProjectViewOnly, setProjectViewOnly, setProjectArchived } from '../services/projects.js';
import { DEV_USER_ID } from '../schema.js';

const router = Router();

function badRequest(res: Response, msg: string) {
  res.status(400).json({ status: 'error', message: msg });
}

// GET /config
router.get('/config', (_req, res) => {
  res.json({ status: 'success', result: JSON.stringify(getConfig()), location: 'UA' });
});

// GET / — list projects (?archived=1 lists the archive)
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  res.json(listProjects(DEV_USER_ID, limit, offset, req.query.archived === '1'));
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

// TODO(auth): sharing has no access control yet. When auth lands, projects must be private by
// default: owner-only on every project route, with /view/:uuid replaced by revocable share
// tokens. See "Project sharing and auth" in CLAUDE.md.

// GET /:id/sharing
// R2D expects: { status: 'ok', data: { viewOnly } }
router.get('/:id/sharing', (req, res) => {
  const viewOnly = getProjectViewOnly(req.params.id);
  if (viewOnly === null) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json({ status: 'ok', data: { viewOnly } });
});

// PUT /:id/sharing — body: { view_only }
// R2D expects: { status: 'ok' }
const SharingSchema = z.object({ view_only: z.boolean() });

router.put('/:id/sharing', (req, res) => {
  const parsed = SharingSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, parsed.error.message); return; }

  if (!setProjectViewOnly(req.params.id, parsed.data.view_only)) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json({ status: 'ok' });
});

// PUT /:id/archive — body: { archived }
const ArchiveSchema = z.object({ archived: z.boolean() });

router.put('/:id/archive', (req, res) => {
  const parsed = ArchiveSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, parsed.error.message); return; }

  if (!setProjectArchived(req.params.id, parsed.data.archived)) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json({ status: 'success' });
});

// DELETE /:id — permanent; the UI only offers this from the archive
router.delete('/:id', (req, res) => {
  const result = deleteProject(req.params.id);
  if (!result) { res.status(404).json({ status: 'error', message: 'Project not found' }); return; }
  res.json(result);
});

export default router;
