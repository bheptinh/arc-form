import './schema.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import projectsRouter from './routes/projects.js';
import userRouter from './routes/user.js';
import catalogRouter from './routes/catalog.js';

const app = express();
const PORT = process.env.PORT ?? 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.get('/server-api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/server-api/projects', projectsRouter);
app.use('/server-api/user', userRouter);
app.use('/server-api/catalog', catalogRouter);

// In production, serve the Vite build and handle SPA routing
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '../dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
