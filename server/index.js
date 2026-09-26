import path from 'node:path';
import express from 'express';
import { fileURLToPath } from 'node:url';
import app from './app.js';

/**
 * Local / traditional-server entry point. On Vercel the same app runs as a
 * serverless function from `api/index.js` instead.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

// In production, serve the built SPA from this server so everything runs on
// one origin. (The error handler inside `app` only handles /api errors.)
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '..', 'dist');
  const site = express();
  site.use(app);
  site.use(express.static(distDir));
  site.use((req, res) => res.sendFile(path.join(distDir, 'index.html')));
  site.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[northi] Site running on http://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[northi] API server listening on http://localhost:${PORT}`);
  });
}
