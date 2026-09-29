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
router.post('/', rateLimit({ max: 5 }), async (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });

  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 254);
  const subject = clean(req.body.subject, 120);
  const message = clean(req.body.message, 5000);

  if (!name) return res.status(400).json({ message: 'Please tell us your name.' });
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (message.length < 20) return res.status(400).json({ message: 'Please give us at least 20 characters of detail.' });

  await db.run(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
    name,
    email,
    subject || null,
    message
  );

  const emailed = await notifyNewsroom(
    `New message: ${subject || 'Contact form'}`,
    `From: ${name} <${email}>\n\n${message}`,
    email
  );
  return res.status(201).json({ ok: true, emailed });
});

// Dashboard (Admins and Editors): the Support inbox.
router.use(requireAuth);

router.get('/', async (req, res) => {
  const rows = await db.all('SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC');
  res.json({ messages: rows.map(toPublic) });
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const result = await db.run(
    "UPDATE contact_messages SET status = ?, updated_at = datetime('now') WHERE id = ?",
    status,
    id
  );
  if (result.changes === 0) return res.status(404).json({ message: 'Message not found.' });
  const row = await db.get('SELECT * FROM contact_messages WHERE id = ?', id);
  return res.json({ message: toPublic(row) });
});

router.delete('/:id', async (req, res) => {
  const result = await db.run('DELETE FROM contact_messages WHERE id = ?', Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'Message not found.' });
  return res.status(204).end();
});

export default router;
