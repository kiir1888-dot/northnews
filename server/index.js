import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import newsRoutes from './routes/news.js';
import signupsRoutes from './routes/signups.js';
import teamRoutes from './routes/team.js';
import ceoRoutes from './routes/ceo.js';
import { uploadsDir } from './upload.js';
import './db.js'; // ensures the database & tables are initialised

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(
  helmet({
    // Images/uploads are served from this same origin in production; relax
    // the default cross-origin-resource-policy so the SPA can load them.
    crossOriginResourcePolicy: { policy: 'same-site' },
    contentSecurityPolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/signups', signupsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/ceo', ceoRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// In production, serve the built SPA (both the public site and the /admin
// dashboard) directly from this server so everything runs on one origin.
if (isProduction) {
  const distDir = path.join(__dirname, '..', 'dist');
  app.use(express.static(distDir));
  // Express 5 dropped bare "*" wildcard routes — use a path-less middleware
  // as the SPA fallback for any request that didn't match an API/static route.
  app.use((req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Centralised error handler — keeps multer/file-filter errors as clean JSON.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 400;
  res.status(status).json({ message: err.message || 'Unexpected server error.' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[northi] API server listening on http://localhost:${PORT}`);
});
