import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT ?? 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

// --- your routes ---
app.get('/server-api/health', (_req, res) => {
  res.json({ ok: true });
});

// In production, serve the Vite build and handle SPA routing
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '../dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
