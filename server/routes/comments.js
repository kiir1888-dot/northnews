import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { clean, isBot, isEmail, rateLimit } from '../publicForm.js';

const router = Router();
const STATUSES = ['pending', 'approved', 'rejected'];

// Public: approved comments for one article. Emails are never returned here.
router.get('/', (req, res) => {
  const articleId = Number(req.query.articleId);
  if (!articleId) return res.status(400).json({ message: 'articleId is required.' });
  const rows = db
    .prepare(
      "SELECT id, name, body, created_at FROM comments WHERE article_id = ? AND status = 'approved' ORDER BY created_at ASC, id ASC"
    )
    .all(articleId);
  res.json({ comments: rows.map((r) => ({ id: r.id, name: r.name, body: r.body, createdAt: r.created_at })) });
});

// Public: new comments wait for moderation before they appear.
router.post('/', rateLimit({ max: 6 }), (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });

  const articleId = Number(req.body.articleId);
  const name = clean(req.body.name, 80);
  const email = clean(req.body.email, 254);
  const body = clean(req.body.body, 3000);

  if (!articleId || !db.prepare('SELECT id FROM news WHERE id = ?').get(articleId)) {
    return res.status(404).json({ message: 'This article no longer exists.' });
  }
  if (!name) return res.status(400).json({ message: 'Please enter your name.' });
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (body.length < 10) return res.status(400).json({ message: 'Comments must be at least 10 characters.' });

  db.prepare('INSERT INTO comments (article_id, name, email, body) VALUES (?, ?, ?, ?)').run(articleId, name, email, body);
  return res.status(201).json({ ok: true });
});

// Dashboard (Admins and Editors): moderation.
router.use(requireAuth);

router.get('/all', (req, res) => {
  const rows = db
    .prepare(
      `SELECT comments.*, news.title AS article_title
       FROM comments LEFT JOIN news ON news.id = comments.article_id
       ORDER BY comments.created_at DESC, comments.id DESC`
    )
    .all();
  res.json({
    comments: rows.map((r) => ({
      id: r.id,
      articleId: r.article_id,
      articleTitle: r.article_title,
      name: r.name,
      email: r.email,
      body: r.body,
      status: r.status,
      createdAt: r.created_at,
    })),
  });
});

router.patch('/:id', (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const result = db.prepare('UPDATE comments SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'Comment not found.' });
  return res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM comments WHERE id = ?').run(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'Comment not found.' });
  return res.status(204).end();
});

export default router;
