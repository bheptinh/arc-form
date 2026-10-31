import { Router } from 'express';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';
import type { Language, TranslationMap } from '../../shared/types/i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../fixtures');

const router = Router();

const baseLanguages: Language[] = JSON.parse(
  readFileSync(path.join(FIXTURES, 'languages.json'), 'utf-8')
);

function getLanguagesForUser(): Language[] {
  const row = db.prepare('SELECT language_code FROM users WHERE id = ?').get(DEV_USER_ID) as { language_code: string } | undefined;
  const currentCode = row?.language_code ?? 'en';
  return baseLanguages.map((l) => ({ ...l, current: l.code === currentCode ? 1 : 0 }));
}

const translationCache = new Map<string, TranslationMap>();

function getTranslation(langCode: string): TranslationMap {
  if (translationCache.has(langCode)) {
    return translationCache.get(langCode)!;
  }
  
  const filePath = path.join(FIXTURES, 'translations', `${langCode}.json`);
  const fallbackPath = path.join(FIXTURES, 'translations', 'en.json');
  const map: TranslationMap = JSON.parse(
    readFileSync(existsSync(filePath) ? filePath : fallbackPath, 'utf-8')
  );
  translationCache.set(langCode, map);
  return map;
}

router.get('/languages', (_req, res) => {
  res.json(getLanguagesForUser());
});

router.get('/translation', (_req, res) => {
  const row = db.prepare('SELECT language_code FROM users WHERE id = ?').get(DEV_USER_ID) as { language_code: string } | undefined;
  res.json(getTranslation(row?.language_code ?? 'en'));
});

router.get('/pages/:slug', (req, res) => {
  const row = db.prepare('SELECT language_code FROM users WHERE id = ?').get(DEV_USER_ID) as { language_code: string } | undefined;
  const lang = (row?.language_code ?? 'en').replace(/[^a-z]/g, '');
  const slug = req.params.slug.replace(/[^a-z0-9-]/g, '');
  const dir = path.join(FIXTURES, 'pages', slug);
  const candidates = [`${lang}.md`, 'en.md', 'index.md'];
  const file = candidates.map((f) => path.join(dir, f)).find(existsSync);
  if (!file) return res.status(404).end();
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(readFileSync(file, 'utf-8'));
});

export default router;
