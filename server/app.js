import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import newsRoutes from './routes/news.js';
import signupsRoutes from './routes/signups.js';
import teamRoutes from './routes/team.js';
import ceoRoutes from './routes/ceo.js';
import editorsRoutes from './routes/editors.js';
import contactRoutes from './routes/contact.js';
import subscribersRoutes from './routes/subscribers.js';
import newslettersRoutes from './routes/newsletters.js';
import commentsRoutes from './routes/comments.js';
import submissionsRoutes from './routes/submissions.js';
import settingsRoutes from './routes/settings.js';
import seoRoutes from './routes/seo.js';
import { isMailConfigured } from './mailer.js';

/**
 * The API as an Express app. Used by `server/index.js` locally and by
 * `api/index.js` as a Vercel serverless function.
 */
const app = express();

app.disable('x-powered-by');
// Behind a hosting proxy (Vercel, Render, Nginx...) the spam limiter needs
// each visitor's real IP address. Vercel is detected automatically.
if (process.env.TRUST_PROXY || process.env.VERCEL) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', seoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/signups', signupsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/ceo', ceoRoutes);
app.use('/api/editors', editorsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/newsletters', newslettersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/seo', seoRoutes);

// Reports only whether each email setting is present (never the values).
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    email: {
      ready: isMailConfigured(),
      ...Object.fromEntries(
        ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'NOTIFY_EMAIL'].map((k) => [k, Boolean(process.env[k])])
      ),
    },
  })
);

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found.' }));

// Centralised error handler: clean JSON for validation/upload errors, and a
// generic message for unexpected (e.g. database) failures.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  // eslint-disable-next-line no-console
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'The photo is too large. Please use an image under 4 MB.' });
  }
  if (err.severity || !err.message) {
    return res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
  }
  return res.status(err.status || 400).json({ message: err.message });
});

export default app;
