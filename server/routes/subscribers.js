import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { clean, isBot, isEmail, rateLimit } from '../publicForm.js';

const router = Router();

function toPublic(row) {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    unsubscribedAt: row.unsubscribed_at,
  };
}

// Public: newsletter sign-up form.
router.post('/', rateLimit({ max: 8 }), (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });

  const email = clean(req.body.email, 254);
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });

  const existing = db.prepare('SELECT * FROM subscribers WHERE email = ?').get(email);
  if (existing) {
    if (existing.status !== 'active') {
      db.prepare("UPDATE subscribers SET status = 'active', unsubscribed_at = NULL WHERE id = ?").run(existing.id);
    }
    return res.status(200).json({ ok: true });
  }

  db.prepare('INSERT INTO subscribers (email, token) VALUES (?, ?)').run(
    email,
    crypto.randomBytes(24).toString('hex')
  );
  return res.status(201).json({ ok: true });
});

// Public: one-click unsubscribe link from newsletter emails.
router.post('/unsubscribe', rateLimit({ max: 20 }), (req, res) => {
  const token = clean(req.body?.token, 100);
  if (!token) return res.status(400).json({ message: 'This unsubscribe link is not valid.' });
  const row = db.prepare('SELECT * FROM subscribers WHERE token = ?').get(token);
  if (!row) return res.status(404).json({ message: 'This unsubscribe link is not valid or has expired.' });
  if (row.status === 'active') {
    db.prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = datetime('now') WHERE id = ?").run(row.id);
  }
  return res.json({ ok: true, email: row.email });
});

// Dashboard: subscriber emails are personal data, so admins only.
router.use(requireAuth, requireAdmin);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM subscribers ORDER BY created_at DESC, id DESC').all();
  res.json({ subscribers: rows.map(toPublic) });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM subscribers WHERE id = ?').run(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'Subscriber not found.' });
  return res.status(204).end();
});

export default router;
