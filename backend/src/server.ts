// 2025-09-16: Created Express server to expose /api, serve frontend build, and fixed ESM __dirname resolution

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import itemsRouter from './routes/items.js';
import { seedIfEmpty } from './db.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Seed initial data if DB is empty
seedIfEmpty();

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/items', itemsRouter);

// Serve frontend static build if exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(staticDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});
