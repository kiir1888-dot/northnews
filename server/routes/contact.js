import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { clean, isBot, isEmail, rateLimit } from '../publicForm.js';
import { notifyNewsroom } from '../mailer.js';

const router = Router();
const STATUSES = ['new', 'read', 'resolved'];

function toPublic(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Public: the Contact Us form on the website.
router.post('/', rateLimit({ max: 5 }), (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });

  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 254);
  const subject = clean(req.body.subject, 120);
  const message = clean(req.body.message, 5000);

  if (!name) return res.status(400).json({ message: 'Please tell us your name.' });
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (message.length < 20) return res.status(400).json({ message: 'Please give us at least 20 characters of detail.' });

  db.prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)').run(
    name,
    email,
    subject || null,
    message
  );

  notifyNewsroom(`New message: ${subject || 'Contact form'}`, `From: ${name} <${email}>\n\n${message}`, email);
  return res.status(201).json({ ok: true });
});

// Dashboard (Admins and Editors): the Support inbox.
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC').all();
  res.json({ messages: rows.map(toPublic) });
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const result = db
    .prepare("UPDATE contact_messages SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, id);
  if (result.changes === 0) return res.status(404).json({ message: 'Message not found.' });
  const row = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
  return res.json({ message: toPublic(row) });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'Message not found.' });
  return res.status(204).end();
});

export default router;
